import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/middleware';

// GET /api/reports/[reportId] - Get specific report
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const auth = await authenticate(request);

    if (!auth.authenticated || !auth.user) {
      return auth.response;
    }

    const { reportId } = await params;

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        student: {
          select: {
            fullName: true,
            studentId: true,
            email: true,
          },
        },
        session: {
          select: {
            title: true,
            sessionNumber: true,
            topic: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (auth.user.role === 'STUDENT' && report.studentId !== auth.user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized to view this report' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('Get report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
