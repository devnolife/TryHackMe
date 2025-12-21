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

    // Get session completions to check lock status
    const sessionCompletions = await prisma.sessionCompletion.findMany({
      where: {
        studentId: auth.user.userId,
        sessionId: {
          in: labs.map(lab => lab.id),
        },
      },
    });

    // Create a map of session completions by sessionId
    const completionMap = new Map(
      sessionCompletions.map(c => [c.sessionId, c])
    );

    // Combine lab data with progress and lock status
    const labsWithProgress = labs.map((lab, index) => {
      const progress = studentProgress.filter(p => p.sessionId === lab.id);
      const totalPoints = progress.reduce((sum, p) => sum + p.totalPoints, 0);
      const maxPoints = lab.scenarios.reduce((sum, s) => sum + s.maxPoints, 0);
      
      // Check if this lab is locked
      // Session 1 is always unlocked
      // Other sessions require previous session to be APPROVED
      let isLocked = false;
      let lockReason = '';
      
      if (lab.sessionNumber > 1) {
        // Find previous session
        const prevSession = labs.find(l => l.sessionNumber === lab.sessionNumber - 1);
        if (prevSession) {
          const prevCompletion = completionMap.get(prevSession.id);
          if (!prevCompletion) {
            isLocked = true;
            lockReason = `Selesaikan Sesi ${prevSession.sessionNumber} terlebih dahulu`;
          } else if (prevCompletion.reviewStatus !== 'APPROVED') {
            isLocked = true;
            if (prevCompletion.reviewStatus === 'PENDING') {
              lockReason = `Menunggu review admin untuk Sesi ${prevSession.sessionNumber}`;
            } else {
              lockReason = `Sesi ${prevSession.sessionNumber} perlu diperbaiki`;
            }
          }
        }
      }
      
      // Get current session completion status
      const currentCompletion = completionMap.get(lab.id);

      return {
        ...lab,
        progress: {
          totalPoints,
          maxPoints,
          percentage: maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0,
          status: progress.length > 0 ? progress[0].status : 'NOT_STARTED',
        },
        isLocked,
        lockReason,
        completionStatus: currentCompletion?.reviewStatus || null,
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
