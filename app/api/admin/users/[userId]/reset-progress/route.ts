import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/middleware';

// POST /api/admin/users/[userId]/reset-progress - Reset student progress
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const auth = await authenticate(request);

    if (!auth.authenticated || !auth.user) {
      return auth.response;
    }

    // Only ADMIN can reset progress
    if (auth.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const { userId } = await params;
    const body = await request.json();
    const { sessionId, resetAll } = body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Can only reset progress for students' },
        { status: 400 }
      );
    }

    if (resetAll) {
      // Reset all progress for this student
      await prisma.studentProgress.deleteMany({
        where: { studentId: userId },
      });

      await prisma.commandHistory.deleteMany({
        where: { studentId: userId },
      });

      await prisma.submission.deleteMany({
        where: { studentId: userId },
      });

      await prisma.auditLog.create({
        data: {
          studentId: auth.user.userId,
          action: 'RESET_ALL_PROGRESS',
          actionType: 'SUBMISSION',
          resourceType: 'user',
          resourceId: userId,
          details: { targetStudentId: userId },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'All progress reset successfully',
      });
    } else if (sessionId) {
      // Reset progress for specific session
      await prisma.studentProgress.deleteMany({
        where: {
          studentId: userId,
          sessionId,
        },
      });

      await prisma.commandHistory.deleteMany({
        where: {
          studentId: userId,
          scenario: {
            sessionId,
          },
        },
      });

      await prisma.submission.deleteMany({
        where: {
          studentId: userId,
          sessionId,
        },
      });

      await prisma.auditLog.create({
        data: {
          studentId: auth.user.userId,
          sessionId: sessionId,
          action: 'RESET_SESSION_PROGRESS',
          actionType: 'SUBMISSION',
          resourceType: 'session',
          resourceId: sessionId,
          details: { targetStudentId: userId, sessionId },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Session progress reset successfully',
      });
    } else {
      return NextResponse.json(
        { error: 'Must specify sessionId or resetAll' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Reset progress error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
