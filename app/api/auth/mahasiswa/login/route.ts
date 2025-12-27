import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword, hashMD5, generateToken, toSessionUser } from '@/lib/auth';
import { getMahasiswaByNim } from '@/lib/graphql-client';

/**
 * Mahasiswa Login Endpoint
 *
 * Flow:
 * 1. Student enters NIM and password
 * 2. Hash password with MD5
 * 3. Query external GraphQL API for student data
 * 4. Compare MD5 hashed password with API response
 * 5. If match, create/update local account
 * 6. Return JWT token for authentication
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

    // Step 1: Hash password with MD5
    const hashedPasswordMD5 = hashMD5(password);

    // Step 2: Query external GraphQL API
    const mahasiswaData = await getMahasiswaByNim(nim);

    if (!mahasiswaData) {
      return NextResponse.json(
        { error: 'NIM tidak ditemukan di sistem akademik' },
        { status: 404 }
      );
    }

    // Step 3: Compare hashed password with external API response
    if (hashedPasswordMD5 !== mahasiswaData.passwd) {
      return NextResponse.json(
        { error: 'Password salah' },
        { status: 401 }
      );
    }

    // Step 4: Password matched! Create or update local account

    // Check if user already exists (by NIM or email)
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { nim: mahasiswaData.nim },
          { email: mahasiswaData.email || undefined },
        ],
      },
    });

    if (user) {
      // User exists, update their information from external API
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          fullName: mahasiswaData.nama,
          nim: mahasiswaData.nim,
          hp: mahasiswaData.hp,
          email: mahasiswaData.email || user.email, // Keep existing email if external API doesn't provide one
          prodi: mahasiswaData.prodi,
          foto: mahasiswaData.foto,
          studentId: mahasiswaData.nim, // Use NIM as studentId
          department: mahasiswaData.prodi,
          isExternalSync: true,
          isActive: true,
          // Hash the password using MD5 for local storage
          password: hashPassword(password),
        },
      });
    } else {
      // Create new user account
      const emailToUse = mahasiswaData.email || `${mahasiswaData.nim}@student.unismuh.ac.id`;

      user = await prisma.user.create({
        data: {
          email: emailToUse,
          password: hashPassword(password), // Hash with MD5 for local storage
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
    }

    // Step 5: Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Log login activity (audit log)
    await prisma.auditLog.create({
      data: {
        studentId: user.id,
        action: 'Mahasiswa login via external sync',
        actionType: 'LOGIN',
        details: {
          nim: mahasiswaData.nim,
          nama: mahasiswaData.nama,
          prodi: mahasiswaData.prodi,
          timestamp: new Date().toISOString(),
          method: 'external_graphql_sync',
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    // Step 6: Return success response
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
