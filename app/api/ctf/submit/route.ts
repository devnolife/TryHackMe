/**
 * CTF Flag Submission API Route
 * POST - Submit a flag for a challenge
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { CTFSystem } from '@/lib/ctf/ctf-system';

// In-memory storage for user progress (in production, use database)
const userProgress: Map<string, Set<string>> = new Map();
const userPoints: Map<string, number> = new Map();

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

    // Check if already solved
    const solvedChallenges = userProgress.get(userId) || new Set();
    if (solvedChallenges.has(challengeId)) {
      return NextResponse.json({
        success: true,
        correct: true,
        alreadySolved: true,
        message: 'Challenge sudah diselesaikan sebelumnya',
        pointsAwarded: 0,
      });
    }

    // Verify flag using CTF system
    const result = CTFSystem.submitFlag(userId, challengeId, flag);

    if (result.correct) {
      // Mark as solved
      solvedChallenges.add(challengeId);
      userProgress.set(userId, solvedChallenges);

      // Update points
      const currentPoints = userPoints.get(userId) || 0;
      userPoints.set(userId, currentPoints + result.pointsAwarded);

      return NextResponse.json({
        success: true,
        correct: true,
        message: result.message,
        pointsAwarded: result.pointsAwarded,
        totalPoints: currentPoints + result.pointsAwarded,
      });
    }

    return NextResponse.json({
      success: true,
      correct: false,
      message: result.message || 'Flag salah. Coba lagi!',
    });
  } catch (error) {
    console.error('Submit CTF flag error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
