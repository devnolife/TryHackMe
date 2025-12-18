import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/middleware';

// GET /api/admin/analytics - Get platform analytics (admin only)
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request);

    if (!auth.authenticated || !auth.user) {
      return auth.response;
    }

    // Only ADMIN and INSTRUCTOR can access
    if (auth.user.role !== 'ADMIN' && auth.user.role !== 'INSTRUCTOR') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Get user statistics
    const totalUsers = await prisma.user.count();
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    const totalInstructors = await prisma.user.count({ where: { role: 'INSTRUCTOR' } });
    const totalAdmins = await prisma.user.count({ where: { role: 'ADMIN' } });
    const activeUsers = await prisma.user.count({ where: { isActive: true } });

    // Get lab statistics
    const totalLabs = await prisma.labSession.count();
    const activeLabs = await prisma.labSession.count({ where: { isActive: true } });
    const totalScenarios = await prisma.labScenario.count();

    // Get progress statistics
    const totalProgress = await prisma.studentProgress.count();
    const completedProgress = await prisma.studentProgress.count({
      where: { status: 'COMPLETED' },
    });
    const inProgressLabs = await prisma.studentProgress.count({
      where: { status: 'IN_PROGRESS' },
    });

    // Get command statistics
    const totalCommands = await prisma.commandHistory.count();
    const validCommands = await prisma.commandHistory.count({
      where: { isValid: true },
    });

    // Get submission statistics
    const totalSubmissions = await prisma.submission.count();
    const completedSubmissions = await prisma.submission.count({
      where: { status: 'COMPLETED' },
    });
    const pendingSubmissions = await prisma.submission.count({
      where: { status: 'PENDING_REVIEW' },
    });

    // Get reports statistics
    const totalReports = await prisma.report.count();

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers = await prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    const recentCommands = await prisma.commandHistory.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    const recentSubmissions = await prisma.submission.count({
      where: { submittedAt: { gte: thirtyDaysAgo } },
    });

    // Get activity by date (last 14 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const commandsByDate = await prisma.commandHistory.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: fourteenDaysAgo } },
      _count: { id: true },
    });

    // Group by date
    const activityByDate: Record<string, number> = {};
    commandsByDate.forEach((cmd) => {
      const date = cmd.createdAt.toISOString().split('T')[0];
      activityByDate[date] = (activityByDate[date] || 0) + cmd._count.id;
    });

    const activityTimeline = Object.entries(activityByDate).map(([date, count]) => ({
      date,
      commands: count,
    }));

    // Get top students by points
    const studentProgress = await prisma.studentProgress.groupBy({
      by: ['studentId'],
      _sum: { totalPoints: true },
      orderBy: { _sum: { totalPoints: 'desc' } },
      take: 10,
    });

    const topStudents = await Promise.all(
      studentProgress.map(async (progress) => {
        const student = await prisma.user.findUnique({
          where: { id: progress.studentId },
          select: {
            id: true,
            fullName: true,
            studentId: true,
          },
        });

        return {
          ...student,
          totalPoints: progress._sum.totalPoints || 0,
        };
      })
    );

    // Get lab completion rates
    const labs = await prisma.labSession.findMany({
      where: { isActive: true },
      select: {
        id: true,
        sessionNumber: true,
        title: true,
      },
      orderBy: { sessionNumber: 'asc' },
    });

    const labCompletionRates = await Promise.all(
      labs.map(async (lab) => {
        const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
        const completedStudents = await prisma.studentProgress.count({
          where: {
            sessionId: lab.id,
            status: 'COMPLETED',
          },
        });

        return {
          sessionNumber: lab.sessionNumber,
          title: lab.title,
          completionRate: totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0,
          completedStudents,
          totalStudents,
        };
      })
    );

    // Get average points per lab
    const avgPointsByLab = await Promise.all(
      labs.map(async (lab) => {
        const progressData = await prisma.studentProgress.findMany({
          where: { sessionId: lab.id },
          select: { totalPoints: true },
        });

        const totalPoints = progressData.reduce((sum, p) => sum + p.totalPoints, 0);
        const avgPoints = progressData.length > 0 ? Math.round(totalPoints / progressData.length) : 0;

        return {
          sessionNumber: lab.sessionNumber,
          title: lab.title,
          avgPoints,
        };
      })
    );

    return NextResponse.json({
      success: true,
      analytics: {
        users: {
          total: totalUsers,
          students: totalStudents,
          instructors: totalInstructors,
          admins: totalAdmins,
          active: activeUsers,
          newLast30Days: newUsers,
        },
        labs: {
          total: totalLabs,
          active: activeLabs,
          scenarios: totalScenarios,
        },
        progress: {
          total: totalProgress,
          completed: completedProgress,
          inProgress: inProgressLabs,
          completionRate: totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0,
        },
        commands: {
          total: totalCommands,
          valid: validCommands,
          recentLast30Days: recentCommands,
          validityRate: totalCommands > 0 ? Math.round((validCommands / totalCommands) * 100) : 0,
        },
        submissions: {
          total: totalSubmissions,
          completed: completedSubmissions,
          pending: pendingSubmissions,
          recentLast30Days: recentSubmissions,
        },
        reports: {
          total: totalReports,
        },
        activityTimeline,
        topStudents,
        labCompletionRates,
        avgPointsByLab,
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
