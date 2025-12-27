import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyPassword, hashPassword, hashMD5, generateToken, toSessionUser } from '@/lib/auth';
import { getMahasiswaByNim } from '@/lib/graphql-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password } = body;

    // Support both 'email' and 'username' field names
    const usernameInput = username || email;

    // Validation
    if (!usernameInput || !password) {
      return NextResponse.json(
        { error: 'Username dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Step 1: Try to find user in local DB
    // Check by email, username@admin.lab, or NIM
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: usernameInput },
          { email: `${usernameInput}@admin.lab` },
          { nim: usernameInput },
        ],
      },
    });

    if (user) {
      // User found in local DB - verify password locally
      const isPasswordValid = verifyPassword(password, user.password);

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Username atau password salah' },
          { status: 401 }
        );
      }

      // Check if user is active
      if (!user.isActive) {
        return NextResponse.json(
          { error: 'Akun tidak aktif. Hubungi administrator.' },
          { status: 403 }
        );
      }

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Log login activity
      await prisma.auditLog.create({
        data: {
          studentId: user.id,
          action: 'User login',
          actionType: 'LOGIN',
          details: {
            method: 'local_db',
            timestamp: new Date().toISOString(),
          },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Login berhasil',
        token,
        user: {
          ...toSessionUser(user),
          nim: user.nim,
          prodi: user.prodi,
          foto: user.foto,
        },
      });
    }

    // Step 2: User not in local DB - try GraphQL (assume input is NIM)
    const hashedPasswordMD5 = hashMD5(password);
    const mahasiswaData = await getMahasiswaByNim(usernameInput);

    if (!mahasiswaData) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Verify password with GraphQL response
    if (hashedPasswordMD5 !== mahasiswaData.passwd) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Step 3: Password matched! Create new user in local database
    const emailToUse = mahasiswaData.email || `${mahasiswaData.nim}@student.unismuh.ac.id`;

    user = await prisma.user.create({
      data: {
        email: emailToUse,
        password: hashPassword(password),
        fullName: mahasiswaData.nama,
        role: 'STUDENT',
        studentId: mahasiswaData.nim,
        nim: mahasiswaData.nim,
        hp: mahasiswaData.hp,
        prodi: mahasiswaData.prodi,
        foto: mahasiswaData.foto,
        department: mahasiswaData.prodi,
        isExternalSync: true,
        isActive: true,
      },
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Log login activity
    await prisma.auditLog.create({
      data: {
        studentId: user.id,
        action: 'User login (first time)',
        actionType: 'LOGIN',
        details: {
          method: 'graphql_sync',
          timestamp: new Date().toISOString(),
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Login berhasil',
      token,
      user: {
        ...toSessionUser(user),
        nim: user.nim,
        prodi: user.prodi,
        foto: user.foto,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
