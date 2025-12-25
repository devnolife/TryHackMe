/**
 * CTF Flag Submission API Route
 * POST - Submit a flag for a challenge
 * Now persists to database!
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = auth.user.userId;
    const body = await request.json();
    const { challengeId, flag } = body;

    if (!challengeId || !flag) {
      return NextResponse.json(
        { error: 'Challenge ID and flag are required' },
        { status: 400 }
      );
    }

    // Get challenge from database
    const challenge = await prisma.cTFChallenge.findUnique({
      where: { challengeId: challengeId },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    // Check if already solved correctly
    const existingCorrectSubmission = await prisma.cTFSubmission.findFirst({
      where: {
        challengeId: challenge.id,
        userId: userId,
        isCorrect: true,
      },
    });

    if (existingCorrectSubmission) {
      return NextResponse.json({
        success: true,
        correct: true,
        alreadySolved: true,
        message: 'Challenge sudah diselesaikan sebelumnya',
        pointsAwarded: 0,
      });
    }

    // Count previous attempts
    const attemptCount = await prisma.cTFSubmission.count({
      where: {
        challengeId: challenge.id,
        userId: userId,
      },
    });

    // Normalize and check flag
    const submittedFlag = flag.trim();
    const isCorrect = submittedFlag === challenge.flag;

    // Calculate points (deduct hint costs if any)
    let pointsAwarded = 0;
    if (isCorrect) {
      // Get hint costs used by this user for this challenge
      const hintCosts = await prisma.cTFHintUsage.aggregate({
        where: {
          challengeId: challenge.id,
          userId: userId,
        },
        _sum: {
          pointsCost: true,
        },
      });

      const hintDeduction = hintCosts._sum.pointsCost || 0;
      pointsAwarded = Math.max(0, challenge.points - hintDeduction);
    }

    // Save submission to database
    await prisma.cTFSubmission.create({
      data: {
        challengeId: challenge.id,
        userId: userId,
        submittedFlag: submittedFlag,
        isCorrect: isCorrect,
        pointsAwarded: pointsAwarded,
        attemptNumber: attemptCount + 1,
      },
    });

    // Update user's CTF progress if correct
    if (isCorrect) {
      await prisma.cTFProgress.upsert({
        where: { userId: userId },
        update: {
          totalPoints: { increment: pointsAwarded },
          solvedCount: { increment: 1 },
          totalAttempts: { increment: 1 },
          lastSolvedAt: new Date(),
        },
        create: {
          userId: userId,
          totalPoints: pointsAwarded,
          solvedCount: 1,
          totalAttempts: 1,
          lastSolvedAt: new Date(),
        },
      });

      // Get updated total points
      const progress = await prisma.cTFProgress.findUnique({
        where: { userId: userId },
      });

      return NextResponse.json({
        success: true,
        correct: true,
        message: '🎉 Flag benar! Selamat!',
        pointsAwarded: pointsAwarded,
        totalPoints: progress?.totalPoints || pointsAwarded,
      });
    } else {
      // Update attempt count even for wrong answers
      await prisma.cTFProgress.upsert({
        where: { userId: userId },
        update: {
          totalAttempts: { increment: 1 },
        },
        create: {
          userId: userId,
          totalPoints: 0,
          solvedCount: 0,
          totalAttempts: 1,
        },
      });

      return NextResponse.json({
        success: true,
        correct: false,
        message: 'Flag salah. Coba lagi!',
        attemptNumber: attemptCount + 1,
      });
    }
  } catch (error) {
    console.error('Submit CTF flag error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
