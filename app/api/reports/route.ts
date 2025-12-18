import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/middleware';

// GET /api/reports - Get all reports for current user
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request);

    if (!auth.authenticated || !auth.user) {
      return auth.response;
    }

    const reports = await prisma.report.findMany({
      where: {
        studentId: auth.user.userId,
      },
      include: {
        session: {
          select: {
            title: true,
            sessionNumber: true,
          },
        },
      },
      orderBy: {
        generatedAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      reports,
      total: reports.length,
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
