/**
 * CTF Challenges API Route
 * GET - List all CTF challenges with user progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { CTFSystem } from '@/lib/ctf/ctf-system';

// In-memory storage for user progress (in production, use database)
const userProgress: Map<string, Set<string>> = new Map();
const userHints: Map<string, Map<string, number>> = new Map();

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = auth.user.userId;
    const solvedChallenges = userProgress.get(userId) || new Set();
    const userHintUsage = userHints.get(userId) || new Map();

    // Get all challenges from CTF system
    const allChallenges = CTFSystem.getAllChallenges(false);

    const challenges = allChallenges.map(challenge => ({
      id: challenge.id,
      name: challenge.name,
      category: challenge.category,
      difficulty: challenge.difficulty,
      points: challenge.points,
      description: challenge.description,
      solved: solvedChallenges.has(challenge.id),
      hintsUsed: userHintUsage.get(challenge.id) || 0,
      totalHints: challenge.hints?.length || 2,
    }));

    const solvedPoints = challenges
      .filter(c => c.solved)
      .reduce((sum, c) => sum + c.points, 0);

    const totalPoints = challenges.reduce((sum, c) => sum + c.points, 0);

    return NextResponse.json({
      success: true,
      challenges,
      stats: {
        totalChallenges: challenges.length,
        solvedChallenges: solvedChallenges.size,
        totalPoints,
        earnedPoints: solvedPoints,
        rank: 1, // TODO: Calculate actual rank
      },
    });
  } catch (error) {
    console.error('Get CTF challenges error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
