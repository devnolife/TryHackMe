import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/middleware';
import { ScoringEngine } from '@/lib/scoring/scoring-engine';

// GET /api/progress/[studentId] - Get student progress
export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const auth = await authenticate(request);

    if (!auth.authenticated || !auth.user) {
      return auth.response;
    }

    const { studentId } = params;

    // Check authorization - students can only view their own progress
    if (auth.user.role === 'STUDENT' && auth.user.userId !== studentId) {
      return NextResponse.json(
        { error: 'Unauthorized to view this progress' },
        { status: 403 }
      );
    }

    // Get all lab sessions
    const labs = await prisma.labSession.findMany({
      where: { isActive: true },
      orderBy: { sessionNumber: 'asc' },
      include: {
        scenarios: true,
      },
    });

    // Get student progress for all labs
    const studentProgress = await prisma.studentProgress.findMany({
      where: { studentId },
      include: {
        session: true,
        scenario: true,
      },
    });

    // Get objective completions for accurate points (avoiding double counting)
    const objectiveCompletions = await prisma.objectiveCompletion.findMany({
      where: { studentId },
    });

    // Calculate lab-by-lab progress
    const labProgress = await Promise.all(labs.map(async (lab) => {
      const labProgressData = studentProgress.filter(p => p.sessionId === lab.id);

      // Calculate points from ObjectiveCompletion only (accurate, no double counting)
      const scenarioIds = lab.scenarios.map(s => s.id);
      const labObjectiveCompletions = objectiveCompletions.filter(oc =>
        scenarioIds.includes(oc.scenarioId)
      );
      const totalPoints = labObjectiveCompletions.reduce((sum, oc) => sum + oc.points, 0);

      const maxPoints = lab.scenarios.reduce((sum, s) => sum + s.maxPoints, 0);
      const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

      const hasProgress = labProgressData.length > 0;
      const allCompleted = labProgressData.length > 0 &&
        labProgressData.every(p => p.status === 'COMPLETED');

      return {
        labId: lab.id,
        sessionNumber: lab.sessionNumber,
        title: lab.title,
        topic: lab.topic,
        difficultyLevel: lab.difficultyLevel,
        progress: percentage,
        earnedPoints: totalPoints,
        maxPoints,
        status: allCompleted ? 'COMPLETED' : hasProgress ? 'IN_PROGRESS' : 'NOT_STARTED',
      };
    }));

    // Calculate total progress
    const totalPoints = labProgress.reduce((sum, lab) => sum + lab.earnedPoints, 0);
    const maxPoints = labProgress.reduce((sum, lab) => sum + lab.maxPoints, 0);
    const overallPercentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

    // Calculate completed labs
    const completedLabs = labProgress.filter(lab => lab.status === 'COMPLETED').length;

    // Calculate scores for grade
    // Weekly labs score (Sessions 1-3, 5-7)
    const weeklyLabSessions = [1, 2, 3, 5, 6, 7];
    const weeklyScores = labProgress
      .filter(lab => weeklyLabSessions.includes(lab.sessionNumber))
      .map(lab => lab.percentage);

    const weeklyLabsScore = weeklyScores.length > 0
      ? weeklyScores.reduce((sum, score) => sum + score, 0) / weeklyScores.length
      : 0;

    // UTS score (Session 4)
    const utsLab = labProgress.find(lab => lab.sessionNumber === 4);
    const utsScore = utsLab ? utsLab.percentage : 0;

    // UAS score (Session 8)
    const uasLab = labProgress.find(lab => lab.sessionNumber === 8);
    const uasScore = uasLab ? uasLab.percentage : 0;

    // Attendance (default 100% for now - can be tracked separately)
    const attendanceScore = 100;

    // Calculate final grade
    const gradeData = ScoringEngine.calculateFinalGrade(
      attendanceScore,
      weeklyLabsScore,
      utsScore,
      uasScore
    );

    // Get activity history (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const commandHistory = await prisma.commandHistory.findMany({
      where: {
        studentId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date
    const activityByDate: Record<string, { points: number; commands: number }> = {};

    commandHistory.forEach(cmd => {
      const date = cmd.createdAt.toISOString().split('T')[0];
      if (!activityByDate[date]) {
        activityByDate[date] = { points: 0, commands: 0 };
      }
      activityByDate[date].commands += 1;
      if (cmd.validationResult && typeof cmd.validationResult === 'object') {
        const result = cmd.validationResult as any;
        activityByDate[date].points += result.pointsAwarded || 0;
      }
    });

    const activityHistory = Object.entries(activityByDate)
      .map(([date, data]) => ({
        date,
        points: data.points,
        commands: data.commands,
      }))
      .slice(-14); // Last 14 days

    return NextResponse.json({
      success: true,
      progress: {
        totalLabs: labs.length,
        completedLabs,
        totalPoints,
        maxPoints,
        overallPercentage,
        weeklyLabsScore: Math.round(weeklyLabsScore * 100) / 100,
        utsScore,
        uasScore,
        attendanceScore,
        finalGrade: gradeData.finalGrade,
        letterGrade: gradeData.letterGrade,
        labs: labProgress, // Use "labs" key for frontend compatibility
        labProgress, // Keep for backward compatibility
        activityHistory,
      },
    });
  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
