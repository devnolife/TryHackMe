import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/middleware';

// GET /api/admin/students/[studentId] - Get student detail with full progress
export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
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

    const { studentId } = params;

    // Get student with all details
    const student = await prisma.user.findUnique({
      where: { id: studentId, role: 'STUDENT' },
      select: {
        id: true,
        email: true,
        fullName: true,
        studentId: true,
        department: true,
        isActive: true,
        createdAt: true,
        enrollmentDate: true,
        studentProgress: {
          select: {
            id: true,
            status: true,
            totalPoints: true,
            startedAt: true,
            completedAt: true,
            session: {
              select: {
                id: true,
                sessionNumber: true,
                title: true,
                topic: true,
                difficultyLevel: true,
              },
            },
            scenario: {
              select: {
                id: true,
                scenarioTitle: true,
                maxPoints: true,
              },
            },
          },
          orderBy: {
            session: {
              sessionNumber: 'asc',
            },
          },
        },
        objectiveCompletions: {
          select: {
            id: true,
            objectiveIndex: true,
            description: true,
            points: true,
            completedAt: true,
            scenario: {
              select: {
                id: true,
                scenarioTitle: true,
                session: {
                  select: {
                    sessionNumber: true,
                    title: true,
                  },
                },
              },
            },
          },
          orderBy: { completedAt: 'desc' },
        },
        sessionCompletions: {
          select: {
            id: true,
            reflectionText: true,
            reviewStatus: true,
            reviewerFeedback: true,
            submittedAt: true,
            reviewedAt: true,
            totalPoints: true,
            session: {
              select: {
                sessionNumber: true,
                title: true,
              },
            },
            reviewer: {
              select: {
                fullName: true,
              },
            },
          },
          orderBy: { submittedAt: 'desc' },
        },
        commandHistory: {
          select: {
            id: true,
            commandText: true,
            isValid: true,
            commandTimestamp: true,
            scenario: {
              select: {
                scenarioTitle: true,
                session: {
                  select: {
                    sessionNumber: true,
                    title: true,
                  },
                },
              },
            },
          },
          orderBy: { commandTimestamp: 'desc' },
          take: 50, // Last 50 commands
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Mahasiswa tidak ditemukan' },
        { status: 404 }
      );
    }

    // Calculate summary stats
    const totalPoints = student.objectiveCompletions.reduce(
      (sum, obj) => sum + obj.points,
      0
    );
    const completedLabs = student.studentProgress.filter(
      (p) => p.status === 'COMPLETED'
    ).length;
    const inProgressLabs = student.studentProgress.filter(
      (p) => p.status === 'IN_PROGRESS'
    ).length;
    const totalCommands = await prisma.commandHistory.count({
      where: { studentId: student.id },
    });
    const validCommands = await prisma.commandHistory.count({
      where: { studentId: student.id, isValid: true },
    });

    // Get all lab sessions to show which ones are locked/unlocked
    const allLabSessions = await prisma.labSession.findMany({
      where: { isActive: true },
      select: {
        id: true,
        sessionNumber: true,
        title: true,
        topic: true,
        difficultyLevel: true,
        scenarios: {
          select: {
            id: true,
            maxPoints: true,
            successCriteria: true,
          },
        },
      },
      orderBy: { sessionNumber: 'asc' },
    });

    // Build progress map with lock status
    const progressMap = new Map(
      student.studentProgress.map((p) => [p.session.id, p])
    );
    const sessionCompletionsMap = new Map(
      student.sessionCompletions.map((s) => [s.session.sessionNumber, s])
    );

    const labProgress = allLabSessions.map((lab, index) => {
      const progress = progressMap.get(lab.id);
      const sessionCompletion = sessionCompletionsMap.get(lab.sessionNumber);

      // Calculate max points for this lab
      const maxPoints = lab.scenarios.reduce((sum, s) => {
        const criteria = s.successCriteria as any;
        if (criteria?.objectives) {
          return sum + criteria.objectives.reduce((oSum: number, o: any) => oSum + (o.points || 0), 0);
        }
        return sum + s.maxPoints;
      }, 0);

      // Check if previous session is approved
      let isLocked = false;
      if (lab.sessionNumber > 1) {
        const prevSessionCompletion = sessionCompletionsMap.get(lab.sessionNumber - 1);
        isLocked = !prevSessionCompletion || prevSessionCompletion.reviewStatus !== 'APPROVED';
      }

      return {
        labId: lab.id,
        sessionNumber: lab.sessionNumber,
        title: lab.title,
        topic: lab.topic,
        difficultyLevel: lab.difficultyLevel,
        maxPoints,
        isLocked,
        status: progress?.status || 'NOT_STARTED',
        earnedPoints: progress?.totalPoints || 0,
        startedAt: progress?.startedAt || null,
        completedAt: progress?.completedAt || null,
        sessionCompletion: sessionCompletion
          ? {
            reviewStatus: sessionCompletion.reviewStatus,
            submittedAt: sessionCompletion.submittedAt,
            reviewedAt: sessionCompletion.reviewedAt,
            totalPoints: sessionCompletion.totalPoints,
          }
          : null,
      };
    });

    // Get activity by day (last 14 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const recentCommandsForTimeline = await prisma.commandHistory.findMany({
      where: {
        studentId: student.id,
        commandTimestamp: { gte: fourteenDaysAgo },
      },
      select: {
        commandTimestamp: true,
      },
    });

    // Group by date
    const activityByDay: { [key: string]: number } = {};
    recentCommandsForTimeline.forEach((cmd) => {
      const date = cmd.commandTimestamp.toISOString().split('T')[0];
      activityByDay[date] = (activityByDay[date] || 0) + 1;
    });

    const activityTimeline = Object.entries(activityByDay)
      .map(([date, count]) => ({ date, commands: count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        email: student.email,
        fullName: student.fullName,
        studentId: student.studentId,
        department: student.department,
        isActive: student.isActive,
        createdAt: student.createdAt,
        enrollmentDate: student.enrollmentDate,
      },
      stats: {
        totalPoints,
        completedLabs,
        inProgressLabs,
        totalLabs: allLabSessions.length,
        totalCommands,
        validCommands,
        commandAccuracy: totalCommands > 0
          ? Math.round((validCommands / totalCommands) * 100)
          : 0,
        totalObjectives: student.objectiveCompletions.length,
        pendingReviews: student.sessionCompletions.filter(
          (s) => s.reviewStatus === 'PENDING'
        ).length,
        approvedSessions: student.sessionCompletions.filter(
          (s) => s.reviewStatus === 'APPROVED'
        ).length,
      },
      labProgress,
      recentObjectives: student.objectiveCompletions.slice(0, 10),
      recentCommands: student.commandHistory,
      sessionCompletions: student.sessionCompletions,
      activityTimeline,
    });
  } catch (error) {
    console.error('Error fetching student detail:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
