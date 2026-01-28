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

      // Get points from ObjectiveCompletion (source of truth)
      const objectivePoints = await prisma.objectiveCompletion.groupBy({
        by: ['studentId'],
        where: { scenarioId: { in: scenarioIds } },
        _sum: { points: true },
        orderBy: { _sum: { points: 'desc' } },
        take: limit,
      });

      const leaderboard = await Promise.all(
        objectivePoints.map(async (progress, index) => {
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
      // Overall platform leaderboard using ObjectiveCompletion for accurate points
      const objectivePoints = await prisma.objectiveCompletion.groupBy({
        by: ['studentId'],
        _sum: { points: true },
        orderBy: { _sum: { points: 'desc' } },
        take: limit,
      });

      const leaderboard = await Promise.all(
        objectivePoints.map(async (progress, index) => {
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
            points: progress._sum.points || 0,
            completedLabs,
            totalLabs,
            completionPercentage,
            commandsExecuted: commandCount,
          };
        })
      );

      // Get current user's rank
      const currentUserProgress = objectivePoints.findIndex(
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
