/**
 * CTF Challenges API Route
 * GET - List all CTF challenges with user progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/db';
import { CTFSystem } from '@/lib/ctf/ctf-system';

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
    const isAdmin = auth.user.role === 'ADMIN' || auth.user.role === 'INSTRUCTOR';

    // Try to get challenges from database first
    let dbChallenges = await prisma.cTFChallenge.findMany({
      where: { isActive: true },
      orderBy: [
        { category: 'asc' },
        { difficulty: 'asc' },
        { points: 'asc' },
      ],
    });

    // If no challenges in DB, use in-memory CTF system
    if (dbChallenges.length === 0) {
      const allChallenges = CTFSystem.getAllChallenges(isAdmin); // Admin can see flags

      // Get user's submissions from database - need to join with CTFChallenge to get challengeId
      const userSubmissions = await prisma.cTFSubmission.findMany({
        where: {
          userId,
          isCorrect: true
        },
        include: {
          challenge: {
            select: { challengeId: true }
          }
        }
      });
      // Map to in-memory challenge IDs (like 'web-001')
      const solvedChallengeIds = new Set(userSubmissions.map(s => s.challenge?.challengeId).filter(Boolean));

      // Get user's hint usage from database (count hints per challenge)
      const userHintUsage = await prisma.cTFHintUsage.findMany({
        where: { userId },
        include: {
          challenge: {
            select: { challengeId: true }
          }
        }
      });
      // Group by challenge's custom ID
      const hintUsageMap = new Map<string, number>();
      userHintUsage.forEach(h => {
        const cId = h.challenge?.challengeId;
        if (cId) {
          hintUsageMap.set(cId, (hintUsageMap.get(cId) || 0) + 1);
        }
      });

      const challenges = allChallenges.map(challenge => ({
        id: challenge.id,
        name: challenge.name,
        category: challenge.category,
        difficulty: challenge.difficulty,
        points: challenge.points,
        description: challenge.description,
        solved: isAdmin ? true : solvedChallengeIds.has(challenge.id), // Admin sees all as solved
        hintsUsed: hintUsageMap.get(challenge.id) || 0,
        totalHints: challenge.hints?.length || 2,
        // Admin can see the flag
        ...(isAdmin && { flag: challenge.flag, hints: challenge.hints }),
      }));

      const solvedCount = challenges.filter(c => c.solved).length;
      const solvedPoints = challenges
        .filter(c => c.solved)
        .reduce((sum, c) => sum + c.points, 0);
      const totalPoints = challenges.reduce((sum, c) => sum + c.points, 0);

      // Calculate rank based on total points
      const userRanking = await prisma.cTFSubmission.groupBy({
        by: ['userId'],
        where: { isCorrect: true },
        _sum: { pointsAwarded: true },
        orderBy: { _sum: { pointsAwarded: 'desc' } },
      });
      const userRank = userRanking.findIndex(r => r.userId === userId) + 1 || userRanking.length + 1;

      return NextResponse.json({
        success: true,
        challenges,
        isAdmin,
        stats: {
          totalChallenges: challenges.length,
          solvedChallenges: solvedCount,
          totalPoints,
          earnedPoints: solvedPoints,
          rank: userRank,
        },
      });
    }

    // Use database challenges
    const userSubmissions = await prisma.cTFSubmission.findMany({
      where: {
        userId,
        isCorrect: true
      },
    });
    const solvedChallengeIds = new Set(userSubmissions.map(s => s.challengeId));

    // Count hints used per challenge
    const userHintUsage = await prisma.cTFHintUsage.groupBy({
      by: ['challengeId'],
      where: { userId },
      _count: { hintId: true },
    });
    const hintUsageMap = new Map(userHintUsage.map(h => [h.challengeId, h._count.hintId]));

    const challenges = dbChallenges.map(challenge => ({
      id: challenge.challengeId,
      name: challenge.name,
      category: challenge.category,
      difficulty: challenge.difficulty,
      points: challenge.points,
      description: challenge.description,
      solved: isAdmin ? true : solvedChallengeIds.has(challenge.challengeId), // Admin sees all as solved
      hintsUsed: hintUsageMap.get(challenge.challengeId) || 0,
      totalHints: (challenge.hints as any[])?.length || 2,
      // Admin can see the flag and hints
      ...(isAdmin && {
        flag: challenge.flag,
        hints: challenge.hints
      }),
    }));

    const solvedCount = challenges.filter(c => c.solved).length;
    const solvedPoints = challenges
      .filter(c => c.solved)
      .reduce((sum, c) => sum + c.points, 0);
    const totalPoints = challenges.reduce((sum, c) => sum + c.points, 0);

    // Calculate rank
    const userRanking = await prisma.cTFSubmission.groupBy({
      by: ['userId'],
      where: { isCorrect: true },
      _sum: { pointsAwarded: true },
      orderBy: { _sum: { pointsAwarded: 'desc' } },
    });
    const userRank = userRanking.findIndex(r => r.userId === userId) + 1 || userRanking.length + 1;

    return NextResponse.json({
      success: true,
      challenges,
      isAdmin,
      stats: {
        totalChallenges: challenges.length,
        solvedChallenges: solvedCount,
        totalPoints,
        earnedPoints: solvedPoints,
        rank: userRank,
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
