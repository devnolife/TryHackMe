import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/middleware';

// GET /api/labs/[labId] - Get specific lab details
export async function GET(
  request: NextRequest,
  { params }: { params: { labId: string } }
) {
  try {
    const auth = await authenticate(request);

    if (!auth.authenticated || !auth.user) {
      return auth.response;
    }

    const { labId } = params;
    const isAdmin = auth.user.role === 'ADMIN';

    // Get lab details
    const lab = await prisma.labSession.findUnique({
      where: { id: labId },
      include: {
        scenarios: {
          include: {
            commands: {
              select: {
                id: true,
                commandCategory: true,
                pointsAwarded: true,
                // Include answer details for admin
                ...(isAdmin && {
                  commandPattern: true,
                  expectedOutputKeyword: true,
                  helpText: true,
                }),
              },
            },
          },
        },
      },
    });

    if (!lab) {
      return NextResponse.json(
        { error: 'Lab not found' },
        { status: 404 }
      );
    }

    // Get student progress for this lab
    const studentProgress = await prisma.studentProgress.findMany({
      where: {
        studentId: auth.user.userId,
        sessionId: labId,
      },
      include: {
        scenario: {
          select: {
            scenarioTitle: true,
            maxPoints: true,
          },
        },
      },
    });

    // Calculate total progress
    const totalPoints = studentProgress.reduce((sum, p) => sum + p.totalPoints, 0);
    const maxPoints = lab.scenarios.reduce((sum, s) => sum + s.maxPoints, 0);

    return NextResponse.json({
      success: true,
      isAdmin,
      lab: {
        ...lab,
        totalScenarios: lab.scenarios.length,
        totalCommands: lab.scenarios.reduce((sum, s) => sum + s.commands.length, 0),
      },
      progress: {
        totalPoints: isAdmin ? maxPoints : totalPoints, // Admin sees full points
        maxPoints,
        percentage: isAdmin ? 100 : (maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0),
        scenarios: studentProgress,
      },
    });
  } catch (error) {
    console.error('Get lab details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
