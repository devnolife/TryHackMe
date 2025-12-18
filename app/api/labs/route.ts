import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/middleware';

// GET /api/labs - Get all lab sessions
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request);

    if (!auth.authenticated || !auth.user) {
      return auth.response;
    }

    const labs = await prisma.labSession.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
      include: {
        scenarios: {
          select: {
            id: true,
            scenarioTitle: true,
            maxPoints: true,
          },
        },
        _count: {
          select: {
            scenarios: true,
          },
        },
      },
    });

    // Get student progress for these labs
    const studentProgress = await prisma.studentProgress.findMany({
      where: {
        studentId: auth.user.userId,
        sessionId: {
          in: labs.map(lab => lab.id),
        },
      },
    });

    // Combine lab data with progress
    const labsWithProgress = labs.map(lab => {
      const progress = studentProgress.filter(p => p.sessionId === lab.id);
      const totalPoints = progress.reduce((sum, p) => sum + p.totalPoints, 0);
      const maxPoints = lab.scenarios.reduce((sum, s) => sum + s.maxPoints, 0);

      return {
        ...lab,
        progress: {
          totalPoints,
          maxPoints,
          percentage: maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0,
          status: progress.length > 0 ? progress[0].status : 'NOT_STARTED',
        },
      };
    });

    return NextResponse.json({
      success: true,
      labs: labsWithProgress,
      total: labs.length,
    });
  } catch (error) {
    console.error('Get labs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
