import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/middleware';

// GET /api/admin/session-reviews - Get all pending session reviews
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request);

    if (!auth.authenticated || !auth.user) {
      return auth.response;
    }

    // Check if user is admin or instructor
    if (auth.user.role !== 'ADMIN' && auth.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'PENDING';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    // Get session completions
    const completions = await prisma.sessionCompletion.findMany({
      where: {
        reviewStatus: status as any,
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            studentId: true,
          },
        },
        session: {
          select: {
            id: true,
            sessionNumber: true,
            title: true,
            topic: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.sessionCompletion.count({
      where: {
        reviewStatus: status as any,
      },
    });

    // Get counts by status
    const pendingCount = await prisma.sessionCompletion.count({
      where: { reviewStatus: 'PENDING' },
    });
    const approvedCount = await prisma.sessionCompletion.count({
      where: { reviewStatus: 'APPROVED' },
    });
    const rejectedCount = await prisma.sessionCompletion.count({
      where: { reviewStatus: 'REJECTED' },
    });

    return NextResponse.json({
      success: true,
      completions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
    });
  } catch (error) {
    console.error('Get session reviews error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
