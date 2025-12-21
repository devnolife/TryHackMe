import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/middleware';
import { hashPassword } from '@/lib/auth';

// GET /api/admin/users/[userId] - Get user details
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
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

    const { userId } = params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProgress: {
          include: {
            session: true,
            scenario: true,
          },
          orderBy: { updatedAt: 'desc' },
        },
        commandHistory: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        submissions: {
          include: {
            session: true,
          },
          orderBy: { submittedAt: 'desc' },
        },
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate statistics
    const totalPoints = user.studentProgress.reduce((sum, p) => sum + p.totalPoints, 0);
    const completedLabs = user.studentProgress.filter(p => p.status === 'COMPLETED').length;

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        password: undefined, // Remove password from response
        stats: {
          totalPoints,
          completedLabs,
          totalCommands: user.commandHistory.length,
          totalSubmissions: user.submissions.length,
        },
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[userId] - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const auth = await authenticate(request);

    if (!auth.authenticated || !auth.user) {
      return auth.response;
    }

    // Only ADMIN can update users
    if (auth.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const { userId } = params;
    const body = await request.json();
    const { email, fullName, role, studentId, department, isActive, password } = body;

    // Build update data
    const updateData: any = {};
    if (email) updateData.email = email;
    if (fullName) updateData.fullName = fullName;
    if (role) updateData.role = role;
    if (studentId !== undefined) updateData.studentId = studentId;
    if (department !== undefined) updateData.department = department;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password) {
      updateData.password = await hashPassword(password);
    }

    // Check if email is being changed and already exists
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    // Check if studentId is being changed and already exists
    if (studentId) {
      const existingStudent = await prisma.user.findFirst({
        where: {
          studentId,
          NOT: { id: userId },
        },
      });

      if (existingStudent) {
        return NextResponse.json(
          { error: 'Student ID already in use' },
          { status: 400 }
        );
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        studentId: true,
        department: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        studentId: auth.user.userId,
        action: 'UPDATE_USER',
        actionType: 'SUBMISSION',
        resourceType: 'user',
        resourceId: userId,
        details: { updatedUserId: userId, changes: Object.keys(updateData) },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({
      success: true,
      user,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[userId] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const auth = await authenticate(request);

    if (!auth.authenticated || !auth.user) {
      return auth.response;
    }

    // Only ADMIN can delete users
    if (auth.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const { userId } = params;

    // Cannot delete yourself
    if (userId === auth.user.userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Delete user and all related data (cascade)
    await prisma.user.delete({
      where: { id: userId },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        studentId: auth.user.userId,
        action: 'DELETE_USER',
        actionType: 'SUBMISSION',
        resourceType: 'user',
        resourceId: userId,
        details: { deletedUserId: userId },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
