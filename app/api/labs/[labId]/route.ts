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
      lab: {
        ...lab,
        totalScenarios: lab.scenarios.length,
        totalCommands: lab.scenarios.reduce((sum, s) => sum + s.commands.length, 0),
      },
      progress: {
        totalPoints,
        maxPoints,
        percentage: maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0,
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
