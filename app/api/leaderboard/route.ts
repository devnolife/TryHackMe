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
      // Session-specific leaderboard using ObjectiveCompletion for accurate points
      // First get all scenarios for this session
      const sessionScenarios = await prisma.labScenario.findMany({
        where: { sessionId },
        select: { id: true },
      });

      const scenarioIds = sessionScenarios.map(s => s.id);

      // Get objective completions grouped by student for this session's scenarios
      const sessionProgress = await prisma.objectiveCompletion.groupBy({
        by: ['studentId'],
        where: {
          scenarioId: { in: scenarioIds },
        },
        _sum: { points: true },
        orderBy: { _sum: { points: 'desc' } },
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
            points: progress._sum.points || 0,
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
      // Overall platform leaderboard - Using ObjectiveCompletion for accurate points (no double counting)

      // Get all objective completions grouped by student
      const objectiveCompletions = await prisma.objectiveCompletion.groupBy({
        by: ['studentId'],
        _sum: { points: true },
        orderBy: { _sum: { points: 'desc' } },
        take: limit,
      });

      // Also get CTF points for complete scoring
      const ctfPoints = await prisma.cTFSubmission.groupBy({
        by: ['userId'],
        where: { isCorrect: true },
        _sum: { pointsAwarded: true },
      });

      // Create a map of CTF points by userId
      const ctfPointsMap = new Map<string, number>();
      ctfPoints.forEach((cp: { userId: string; _sum: { pointsAwarded: number | null } }) => {
        ctfPointsMap.set(cp.userId, cp._sum.pointsAwarded || 0);
      });

      const leaderboard = await Promise.all(
        objectiveCompletions.map(async (progress, index) => {
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

          // Calculate total points (Lab objectives from ObjectiveCompletion + CTF)
          const labPoints = progress._sum?.points || 0;
          const userCtfPoints = ctfPointsMap.get(progress.studentId) || 0;
          const totalPoints = labPoints + userCtfPoints;

          return {
            rank: index + 1,
            student,
            points: totalPoints,
            completedLabs,
            totalLabs,
            completionPercentage,
            commandsExecuted: commandCount,
          };
        })
      );

      // Sort by total points (in case CTF points changed the order)
      leaderboard.sort((a, b) => b.points - a.points);

      // Re-assign ranks after sorting
      leaderboard.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      // Get current user's rank
      const currentUserRank = objectiveCompletions.findIndex(
        (p) => p.studentId === auth.user?.userId
      );

      return NextResponse.json({
        success: true,
        scope: 'overall',
        leaderboard,
        currentUserRank: currentUserRank !== -1 ? currentUserRank + 1 : null,
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
