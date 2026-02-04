import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/middleware';
import { AntiCheatEngine } from '@/lib/anti-cheat/detection-engine';

// GET /api/admin/anti-cheat - Get anti-cheat statistics and alerts
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request);

    if (!auth.authenticated || !auth.user) {
      return auth.response;
    }

    // Only ADMIN and INSTRUCTOR can access
    if (auth.user.role !== 'ADMIN' && auth.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'stats' or 'alerts'
    const studentId = searchParams.get('studentId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (type === 'stats') {
      // Get platform-wide cheat statistics
      const stats = await AntiCheatEngine.getCheatStatistics();

      return NextResponse.json({
        success: true,
        stats,
      });
    } else if (type === 'alerts') {
      // Get cheat alerts
      const where: any = {
        action: 'ANTI_CHEAT_ALERT',
      };

      if (studentId) {
        where.userId = studentId;
      }

      const totalAlerts = await prisma.auditLog.count({ where });

      const alerts = await prisma.auditLog.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
              studentId: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      return NextResponse.json({
        success: true,
        alerts: alerts.map((alert) => ({
          id: alert.id,
          timestamp: alert.createdAt,
          student: alert.student,
          sessionId: (alert.details as any).sessionId,
          suspicionLevel: (alert.details as any).suspicionLevel,
          score: (alert.details as any).score,
          reasons: (alert.details as any).reasons,
          ipAddress: alert.ipAddress,
        })),
        pagination: {
          total: totalAlerts,
          page,
          limit,
          totalPages: Math.ceil(totalAlerts / limit),
        },
      });
    } else if (studentId) {
      // Get student-specific cheat history
      const history = await AntiCheatEngine.getCheatHistory(studentId);

      return NextResponse.json({
        success: true,
        history,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid request: specify type=stats or type=alerts, or provide studentId' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Get anti-cheat data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
