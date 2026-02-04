import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/middleware';

// GET /api/admin/session-reviews/[reviewId] - Get single review details
export async function GET(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const auth = await authenticate(request);

    if (!auth.authenticated || !auth.user) {
      return auth.response;
    }

    if (auth.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
    }

    const { reviewId } = params;

    const completion = await prisma.sessionCompletion.findUnique({
      where: { id: reviewId },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            studentId: true,
            department: true,
          },
        },
        session: {
          select: {
            id: true,
            sessionNumber: true,
            title: true,
            topic: true,
            description: true,
            learningObjectives: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!completion) {
      return NextResponse.json(
        { error: 'Review tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get completed objectives for this student in this session
    const session = await prisma.labSession.findUnique({
      where: { id: completion.sessionId },
      include: { scenarios: true },
    });

    const scenarioIds = session?.scenarios.map(s => s.id) || [];
    const completedObjectives = await prisma.objectiveCompletion.findMany({
      where: {
        studentId: completion.studentId,
        scenarioId: { in: scenarioIds },
      },
      orderBy: { completedAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      completion,
      completedObjectives,
    });
  } catch (error) {
    console.error('Get review details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/session-reviews/[reviewId] - Approve or reject a review
export async function PUT(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const auth = await authenticate(request);

    if (!auth.authenticated || !auth.user) {
      return auth.response;
    }

    if (auth.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
    }

    const { reviewId } = params;
    const body = await request.json();
    const { action, feedback } = body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action harus "approve" atau "reject"' },
        { status: 400 }
      );
    }

    if (action === 'reject' && (!feedback || feedback.trim().length < 10)) {
      return NextResponse.json(
        { error: 'Feedback minimal 10 karakter untuk penolakan' },
        { status: 400 }
      );
    }

    const completion = await prisma.sessionCompletion.findUnique({
      where: { id: reviewId },
    });

    if (!completion) {
      return NextResponse.json(
        { error: 'Review tidak ditemukan' },
        { status: 404 }
      );
    }

    // Update the completion status
    const updated = await prisma.sessionCompletion.update({
      where: { id: reviewId },
      data: {
        reviewStatus: action === 'approve' ? 'APPROVED' : 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy: auth.user.userId,
        reviewerFeedback: feedback?.trim() || (action === 'approve' ? 'Disetujui oleh admin' : null),
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        session: {
          select: {
            id: true,
            sessionNumber: true,
            title: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        studentId: completion.studentId,
        sessionId: completion.sessionId,
        action: action === 'approve' ? 'SESSION_COMPLETION_APPROVED' : 'SESSION_COMPLETION_REJECTED',
        actionType: 'SUBMISSION',
        resourceType: 'session_completion',
        resourceId: reviewId,
        details: {
          reviewedBy: auth.user.userId,
          feedback: feedback?.trim(),
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({
      success: true,
      message: action === 'approve'
        ? 'Sesi berhasil disetujui, mahasiswa dapat melanjutkan ke sesi berikutnya'
        : 'Sesi ditolak, mahasiswa perlu memperbaiki dan submit ulang',
      completion: updated,
    });
  } catch (error) {
    console.error('Update review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
