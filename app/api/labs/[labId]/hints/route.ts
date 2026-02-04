import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/middleware';

// POST /api/labs/[labId]/hints - Request a hint (with point penalty)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ labId: string }> }
) {
  try {
    const auth = await authenticate(request);

    if (!auth.authenticated || !auth.user) {
      return auth.response;
    }

    const { labId } = await params;
    const body = await request.json();
    const { scenarioId, hintLevel } = body;

    if (!scenarioId || hintLevel === undefined) {
      return NextResponse.json(
        { error: 'scenarioId and hintLevel are required' },
        { status: 400 }
      );
    }

    // Get the scenario with hints
    const scenario = await prisma.labScenario.findUnique({
      where: { id: scenarioId },
      select: {
        id: true,
        sessionId: true,
        hints: true,
      },
    });

    if (!scenario || scenario.sessionId !== labId) {
      return NextResponse.json(
        { error: 'Scenario not found' },
        { status: 404 }
      );
    }

    const hints = scenario.hints as any[] || [];
    const requestedHint = hints.find((h: any) => h.level === hintLevel);

    if (!requestedHint) {
      return NextResponse.json(
        { error: 'Hint not found' },
        { status: 404 }
      );
    }

    // Check if student already used this hint
    const existingHintUsage = await prisma.hintUsage.findFirst({
      where: {
        studentId: auth.user.userId,
        scenarioId: scenarioId,
        hintLevel: hintLevel,
      },
    });

    if (existingHintUsage) {
      // Already used, return the hint without additional penalty
      return NextResponse.json({
        success: true,
        hint: {
          level: requestedHint.level,
          text: requestedHint.hint_text,
          penalty: 0, // Already paid
        },
        alreadyUsed: true,
      });
    }

    // Record hint usage and apply penalty
    await prisma.hintUsage.create({
      data: {
        studentId: auth.user.userId,
        scenarioId: scenarioId,
        hintLevel: hintLevel,
        pointPenalty: requestedHint.point_penalty || 0,
      },
    });

    return NextResponse.json({
      success: true,
      hint: {
        level: requestedHint.level,
        text: requestedHint.hint_text,
        penalty: requestedHint.point_penalty || 0,
      },
      alreadyUsed: false,
    });
  } catch (error) {
    console.error('Get hint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/labs/[labId]/hints - Get available hints for a scenario
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ labId: string }> }
) {
  try {
    const auth = await authenticate(request);

    if (!auth.authenticated || !auth.user) {
      return auth.response;
    }

    const { labId } = await params;
    const { searchParams } = new URL(request.url);
    const scenarioId = searchParams.get('scenarioId');

    if (!scenarioId) {
      return NextResponse.json(
        { error: 'scenarioId is required' },
        { status: 400 }
      );
    }

    const isAdmin = auth.user.role === 'ADMIN';

    // Get the scenario with hints
    const scenario = await prisma.labScenario.findUnique({
      where: { id: scenarioId },
      select: {
        id: true,
        sessionId: true,
        hints: true,
      },
    });

    if (!scenario || scenario.sessionId !== labId) {
      return NextResponse.json(
        { error: 'Scenario not found' },
        { status: 404 }
      );
    }

    const hints = scenario.hints as any[] || [];

    // Get student's used hints
    const usedHints = await prisma.hintUsage.findMany({
      where: {
        studentId: auth.user.userId,
        scenarioId: scenarioId,
      },
    });

    const usedHintLevels = new Set(usedHints.map(h => h.hintLevel));

    // For non-admin, only return hint metadata (level, penalty) and text for used hints
    const sanitizedHints = hints.map((hint: any) => {
      const isUsed = usedHintLevels.has(hint.level);

      if (isAdmin) {
        return {
          level: hint.level,
          text: hint.hint_text,
          penalty: hint.point_penalty,
          isUsed: true, // Admin sees all
        };
      }

      return {
        level: hint.level,
        text: isUsed ? hint.hint_text : null, // Only show text if already used
        penalty: hint.point_penalty,
        isUsed,
      };
    });

    return NextResponse.json({
      success: true,
      hints: sanitizedHints,
      totalPenalty: usedHints.reduce((sum, h) => sum + h.pointPenalty, 0),
    });
  } catch (error) {
    console.error('Get hints error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
