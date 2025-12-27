import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyPassword, generateToken, toSessionUser } from '@/lib/auth';

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

    // Find user - support username or email format
    // If input doesn't contain @, treat as username and append domain
    let searchEmail = usernameInput;
    if (!usernameInput.includes('@')) {
      // Handle username format (e.g., "devnolife" -> "devnolife@admin.lab")
      searchEmail = `${usernameInput}@admin.lab`;
    }

    const user = await prisma.user.findUnique({
      where: { email: searchEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive. Please contact administrator.' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Log login activity (audit log)
    await prisma.auditLog.create({
      data: {
        studentId: user.id,
        action: 'User login',
        actionType: 'LOGIN',
        details: {
          email: user.email,
          timestamp: new Date().toISOString(),
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: toSessionUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
