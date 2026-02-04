import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/middleware';

// GET /api/labs/[labId] - Get specific lab details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ labId: string }> }
) {
  try {
    const auth = await authenticate(request);

    if (!auth.authenticated || !auth.user) {
      return auth.response;
    }

    const { labId } = await params;
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

    // Filter sensitive data from scenarios for non-admin users
    const sanitizedScenarios = lab.scenarios.map(scenario => {
      if (isAdmin) {
        // Admin gets full data
        return scenario;
      }

      // For students, remove answer-revealing fields from successCriteria
      const sanitizedCriteria = (scenario.successCriteria as any[] || []).map((criteria: any) => ({
        id: criteria.id,
        description: criteria.description,
        points: criteria.points,
        // Remove: command_pattern, expected_output_keyword, hint (contains answers)
      }));

      // For students, don't send hints upfront - they must request them
      return {
        ...scenario,
        successCriteria: sanitizedCriteria,
        hints: [], // Hints are requested separately via API with point penalty
      };
    });

    return NextResponse.json({
      success: true,
      isAdmin,
      lab: {
        ...lab,
        scenarios: sanitizedScenarios,
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
