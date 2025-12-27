import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword, hashMD5, verifyPassword, generateToken, toSessionUser } from '@/lib/auth';
import { getMahasiswaByNim } from '@/lib/graphql-client';

/**
 * Mahasiswa Login Endpoint
 *
 * Flow (Optimized):
 * 1. Student enters NIM and password
 * 2. Check if user exists in LOCAL database first
 * 3. If exists locally -> verify password from local DB (no GraphQL call)
 * 4. If NOT exists locally -> query GraphQL, verify, then save to local DB
 * 5. Return JWT token for authentication
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nim, password } = body;

    // Validation
    if (!nim || !password) {
      return NextResponse.json(
        { error: 'NIM dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Step 1: Check if user exists in LOCAL database first
    let user = await prisma.user.findFirst({
      where: { nim: nim },
    });

    if (user) {
      // User exists in local DB - verify password locally (no GraphQL needed!)
      const isPasswordValid = verifyPassword(password, user.password);

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Password salah' },
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

      // Generate token and return (skip GraphQL entirely)
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Log login activity
      await prisma.auditLog.create({
        data: {
          studentId: user.id,
          action: 'Mahasiswa login (local)',
          actionType: 'LOGIN',
          details: {
            nim: user.nim,
            nama: user.fullName,
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
          hp: user.hp,
          foto: user.foto,
        },
      });
    }

    // Step 2: User NOT in local DB - need to fetch from GraphQL
    const hashedPasswordMD5 = hashMD5(password);
    const mahasiswaData = await getMahasiswaByNim(nim);

    if (!mahasiswaData) {
      return NextResponse.json(
        { error: 'NIM tidak ditemukan di sistem akademik' },
        { status: 404 }
      );
    }

    // Verify password with GraphQL response
    if (hashedPasswordMD5 !== mahasiswaData.passwd) {
      return NextResponse.json(
        { error: 'Password salah' },
        { status: 401 }
      );
    }

    // Step 3: Password matched! Create new user in local database
    const emailToUse = mahasiswaData.email || `${mahasiswaData.nim}@student.unismuh.ac.id`;

    user = await prisma.user.create({
      data: {
        email: emailToUse,
        password: hashPassword(password), // Save MD5 hash to local DB
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
        action: 'Mahasiswa login (first time - synced from GraphQL)',
        actionType: 'LOGIN',
        details: {
          nim: mahasiswaData.nim,
          nama: mahasiswaData.nama,
          prodi: mahasiswaData.prodi,
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
        hp: user.hp,
        foto: user.foto,
      },
    });
  } catch (error) {
    console.error('Mahasiswa login error:', error);

    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Akun sudah terdaftar dengan email atau NIM tersebut' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan pada sistem. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
