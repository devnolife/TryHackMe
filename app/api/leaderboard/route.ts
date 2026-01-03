import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/middleware';

// GET /api/leaderboard - Get leaderboard rankings
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request);

    if (!auth.authenticated || !auth.user) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const scope = searchParams.get('scope') || 'overall'; // 'overall' or 'session'

    if (scope === 'session' && sessionId) {
      // Session-specific leaderboard
      const sessionProgress = await prisma.studentProgress.groupBy({
        by: ['studentId'],
        where: { sessionId },
        _sum: { totalPoints: true },
        orderBy: { _sum: { totalPoints: 'desc' } },
        take: limit,
      });

      const leaderboard = await Promise.all(
        sessionProgress.map(async (progress, index) => {
          const student = await prisma.user.findUnique({
            where: { id: progress.studentId },
            select: {
              id: true,
              fullName: true,
              studentId: true,
              department: true,
            },
          });

          // Get session completion status
          const studentSessionProgress = await prisma.studentProgress.findMany({
            where: {
              studentId: progress.studentId,
              sessionId,
            },
          });

          const completedScenarios = studentSessionProgress.filter(
            (p) => p.status === 'COMPLETED'
          ).length;

          return {
            rank: index + 1,
            student,
            points: progress._sum.totalPoints || 0,
            completedScenarios,
            totalScenarios: studentSessionProgress.length,
          };
        })
      );

      // Get session details
      const session = await prisma.labSession.findUnique({
        where: { id: sessionId },
        select: {
          id: true,
          sessionNumber: true,
          title: true,
        },
      });

      return NextResponse.json({
        success: true,
        scope: 'session',
        session,
        leaderboard,
      });
    } else {
      // Overall platform leaderboard - using ObjectiveCompletion for accurate points
      const objectiveCompletions = await prisma.objectiveCompletion.findMany({
        select: {
          studentId: true,
          points: true,
        },
      });

      // Group by studentId and sum points
      const pointsByStudent = new Map<string, number>();
      objectiveCompletions.forEach(oc => {
        const current = pointsByStudent.get(oc.studentId) || 0;
        pointsByStudent.set(oc.studentId, current + oc.points);
      });

      // Convert to array and sort
      const studentProgress = Array.from(pointsByStudent.entries())
        .map(([studentId, totalPoints]) => ({
          studentId,
          _sum: { totalPoints },
        }))
        .sort((a, b) => (b._sum.totalPoints || 0) - (a._sum.totalPoints || 0))
        .slice(0, limit);

      const leaderboard = await Promise.all(
        studentProgress.map(async (progress, index) => {
          const student = await prisma.user.findUnique({
            where: { id: progress.studentId },
            select: {
              id: true,
              fullName: true,
              studentId: true,
              department: true,
            },
          });

          // Get total labs completed
          const allProgress = await prisma.studentProgress.findMany({
            where: { studentId: progress.studentId },
          });

          const completedLabs = allProgress.filter(
            (p) => p.status === 'COMPLETED'
          ).length;

          // Get total commands executed
          const commandCount = await prisma.commandHistory.count({
            where: { studentId: progress.studentId },
          });

          // Calculate completion percentage
          const totalLabs = await prisma.labSession.count({ where: { isActive: true } });
          const completionPercentage = totalLabs > 0
            ? Math.round((completedLabs / totalLabs) * 100)
            : 0;

          return {
            rank: index + 1,
            student,
            points: progress._sum.totalPoints || 0,
            completedLabs,
            totalLabs,
            completionPercentage,
            commandsExecuted: commandCount,
          };
        })
      );

      // Get current user's rank
      const currentUserProgress = studentProgress.findIndex(
        (p) => p.studentId === auth.user?.userId
      );

      return NextResponse.json({
        success: true,
        scope: 'overall',
        leaderboard,
        currentUserRank: currentUserProgress !== -1 ? currentUserProgress + 1 : null,
      });
    }
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
