/**
 * Password Change API Route
 * PATCH - Change user password
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, hashPassword, verifyPassword } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Kata sandi saat ini dan kata sandi baru diperlukan' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Kata sandi baru minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: auth.user.userId },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Verify current password
    const isValidPassword = verifyPassword(currentPassword, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Kata sandi saat ini salah' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: auth.user.userId },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    // Log password change
    await prisma.auditLog.create({
      data: {
        studentId: auth.user.userId,
        action: 'Password changed',
        actionType: 'SUBMISSION',
        details: { action: 'password_change' },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Kata sandi berhasil diubah',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Gagal mengubah kata sandi' },
      { status: 500 }
    );
  }
}
