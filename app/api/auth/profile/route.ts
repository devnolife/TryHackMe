/**
 * User Profile API Route
 * PATCH - Update user profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
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
    const { fullName, studentId, department } = body;

    // Validate required fields
    if (!fullName || fullName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Nama lengkap minimal 2 karakter' },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: auth.user.userId },
      data: {
        fullName: fullName.trim(),
        studentId: studentId?.trim() || null,
        department: department?.trim() || null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        studentId: true,
        department: true,
        role: true,
        enrollmentDate: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Profil berhasil diperbarui',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui profil' },
      { status: 500 }
    );
  }
}
