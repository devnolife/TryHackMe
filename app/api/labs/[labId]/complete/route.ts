import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/middleware';

// POST /api/labs/[labId]/complete - Submit session completion with reflection
export async function POST(
  request: NextRequest,
  { params }: { params: { labId: string } }
) {
  try {
    const auth = await authenticate(request);

    if (!auth.authenticated || !auth.user) {
      return auth.response;
    }

    const { labId } = params;
    const body = await request.json();
    const { reflectionText } = body;

    if (!reflectionText || reflectionText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Refleksi pembelajaran minimal 50 karakter' },
        { status: 400 }
      );
    }

    // Get session/lab
    const session = await prisma.labSession.findUnique({
      where: { id: labId },
      include: {
        scenarios: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Lab tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if all objectives in all scenarios are completed
    const scenarioIds = session.scenarios.map(s => s.id);

    const completedObjectives = await prisma.objectiveCompletion.findMany({
      where: {
        studentId: auth.user.userId,
        scenarioId: { in: scenarioIds },
      },
    });

    // Calculate total points earned
    const totalPoints = completedObjectives.reduce((sum, c) => sum + c.points, 0);

    // Check if session completion already exists
    const existingCompletion = await prisma.sessionCompletion.findUnique({
      where: {
        studentId_sessionId: {
          studentId: auth.user.userId,
          sessionId: labId,
        },
      },
    });

    if (existingCompletion) {
      // Update existing completion (allow re-submission if rejected)
      if (existingCompletion.reviewStatus === 'APPROVED') {
        return NextResponse.json(
          { error: 'Sesi ini sudah disetujui oleh admin' },
          { status: 400 }
        );
      }

      const updated = await prisma.sessionCompletion.update({
        where: { id: existingCompletion.id },
        data: {
          reflectionText: reflectionText.trim(),
          totalPoints,
          reviewStatus: 'PENDING',
          submittedAt: new Date(),
          reviewedAt: null,
          reviewedBy: null,
          reviewerFeedback: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Refleksi pembelajaran berhasil diperbarui dan menunggu review admin',
        completion: updated,
      });
    }

    // Create new session completion
    const completion = await prisma.sessionCompletion.create({
      data: {
        studentId: auth.user.userId,
        sessionId: labId,
        reflectionText: reflectionText.trim(),
        totalPoints,
        reviewStatus: 'PENDING',
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        studentId: auth.user.userId,
        sessionId: labId,
        action: 'SESSION_COMPLETION_SUBMITTED',
        actionType: 'SUBMISSION',
        resourceType: 'session_completion',
        resourceId: completion.id,
        details: {
          totalPoints,
          reflectionLength: reflectionText.length,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Refleksi pembelajaran berhasil dikirim dan menunggu review admin',
      completion,
    });
  } catch (error) {
    console.error('Session completion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/labs/[labId]/complete - Get session completion status
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

    // Get session completion
    const completion = await prisma.sessionCompletion.findUnique({
      where: {
        studentId_sessionId: {
          studentId: auth.user.userId,
          sessionId: labId,
        },
      },
    });

    // Get completed objectives for this session
    const session = await prisma.labSession.findUnique({
      where: { id: labId },
      include: { scenarios: true },
    });

    if (!session) {
      return NextResponse.json({ error: 'Lab tidak ditemukan' }, { status: 404 });
    }

    const scenarioIds = session.scenarios.map(s => s.id);
    const completedObjectives = await prisma.objectiveCompletion.findMany({
      where: {
        studentId: auth.user.userId,
        scenarioId: { in: scenarioIds },
      },
    });

    return NextResponse.json({
      success: true,
      completion,
      completedObjectives,
      totalPoints: completedObjectives.reduce((sum, c) => sum + c.points, 0),
    });
  } catch (error) {
    console.error('Get session completion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
