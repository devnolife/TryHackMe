import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/middleware';

// GET /api/admin/students - Get all students with progress details
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'fullName';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Build where clause - only students
    const where: any = {
      role: 'STUDENT',
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { studentId: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const totalStudents = await prisma.user.count({ where });

    // Get students with progress
    const students = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        fullName: true,
        studentId: true,
        department: true,
        isActive: true,
        createdAt: true,
        studentProgress: {
          select: {
            id: true,
            status: true,
            totalPoints: true,
            session: {
              select: {
                id: true,
                sessionNumber: true,
                title: true,
              },
            },
          },
        },
        objectiveCompletions: {
          select: {
            id: true,
            points: true,
            completedAt: true,
          },
        },
        sessionCompletions: {
          select: {
            id: true,
            reviewStatus: true,
            submittedAt: true,
          },
        },
        commandHistory: {
          select: {
            id: true,
            commandTimestamp: true,
          },
          orderBy: { commandTimestamp: 'desc' },
          take: 1,
        },
      },
      orderBy: sortBy === 'totalPoints'
        ? undefined
        : { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate stats for each student
    const studentsWithStats = students.map((student) => {
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
      const pendingReviews = student.sessionCompletions.filter(
        (s) => s.reviewStatus === 'PENDING'
      ).length;
      const approvedSessions = student.sessionCompletions.filter(
        (s) => s.reviewStatus === 'APPROVED'
      ).length;
      const lastActive = student.commandHistory[0]?.commandTimestamp || null;

      // Get current working lab (most recent in progress)
      const currentLab = student.studentProgress.find(
        (p) => p.status === 'IN_PROGRESS'
      );

      return {
        id: student.id,
        email: student.email,
        fullName: student.fullName,
        studentId: student.studentId,
        department: student.department,
        isActive: student.isActive,
        createdAt: student.createdAt,
        stats: {
          totalPoints,
          completedLabs,
          inProgressLabs,
          pendingReviews,
          approvedSessions,
          totalObjectives: student.objectiveCompletions.length,
        },
        currentLab: currentLab
          ? {
            sessionNumber: currentLab.session.sessionNumber,
            title: currentLab.session.title,
            points: currentLab.totalPoints,
          }
          : null,
        lastActive,
      };
    });

    // Sort by totalPoints if requested (after calculation)
    if (sortBy === 'totalPoints') {
      studentsWithStats.sort((a, b) => {
        if (sortOrder === 'desc') {
          return b.stats.totalPoints - a.stats.totalPoints;
        }
        return a.stats.totalPoints - b.stats.totalPoints;
      });
    }

    return NextResponse.json({
      success: true,
      students: studentsWithStats,
      pagination: {
        page,
        limit,
        total: totalStudents,
        totalPages: Math.ceil(totalStudents / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
