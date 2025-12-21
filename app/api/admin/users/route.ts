import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/middleware';
import { hashPassword } from '@/lib/auth';

// GET /api/admin/users - Get all users (admin only)
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
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const where: any = {};
    if (role && role !== 'ALL') {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { studentId: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const totalUsers = await prisma.user.count({ where });

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        studentId: true,
        department: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            studentProgress: true,
            commandHistory: true,
            submissions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get progress summary for each student
    const usersWithProgress = await Promise.all(
      users.map(async (user) => {
        if (user.role === 'STUDENT') {
          const progress = await prisma.studentProgress.findMany({
            where: { studentId: user.id },
          });

          const totalPoints = progress.reduce((sum, p) => sum + p.totalPoints, 0);
          const completedLabs = progress.filter(p => p.status === 'COMPLETED').length;

          return {
            ...user,
            stats: {
              totalPoints,
              completedLabs,
              totalCommands: user._count.commandHistory,
              totalSubmissions: user._count.submissions,
            },
          };
        }

        return {
          ...user,
          stats: null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      users: usersWithProgress,
      pagination: {
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request);

    if (!auth.authenticated || !auth.user) {
      return auth.response;
    }

    // Only ADMIN can create users
    if (auth.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, fullName, role, studentId, department } = body;

    // Validation
    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Check if studentId already exists
    if (studentId) {
      const existingStudent = await prisma.user.findUnique({
        where: { studentId },
      });

      if (existingStudent) {
        return NextResponse.json(
          { error: 'Student ID already registered' },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role,
        studentId,
        department,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        studentId: true,
        department: true,
        createdAt: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        studentId: auth.user.userId,
        action: 'CREATE_USER',
        actionType: 'SUBMISSION',
        resourceType: 'user',
        resourceId: user.id,
        details: { createdUserId: user.id, role: user.role },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({
      success: true,
      user,
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
