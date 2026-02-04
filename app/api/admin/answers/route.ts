import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request);

    if (!auth.authenticated || !auth.user) {
      return auth.response;
    }

    // Hanya admin yang bisa akses
    if (auth.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all labs with their scenarios and success criteria (kunci jawaban lab)
    const labs = await prisma.labSession.findMany({
      orderBy: { sessionNumber: 'asc' },
      include: {
        scenarios: {
          include: {
            commands: true,
          },
        },
      },
    });

    // Format lab answer keys
    const labAnswerKeys = labs.map(lab => {
      const scenarios = lab.scenarios.map(scenario => {
        // Parse successCriteria from JSON
        const successCriteria = scenario.successCriteria as any[] || [];

        return {
          scenarioId: scenario.id,
          scenarioTitle: scenario.scenarioTitle,
          scenarioDescription: scenario.scenarioDescription,
          objectives: successCriteria.map((criteria: any, index: number) => ({
            id: criteria.id || `objective-${index}`,
            description: criteria.description,
            commandPattern: criteria.command_pattern,
            expectedOutputKeyword: criteria.expected_output_keyword,
            points: criteria.points,
            hint: criteria.hint,
          })),
          validCommands: scenario.commands.map(cmd => ({
            id: cmd.id,
            pattern: cmd.commandPattern,
            description: cmd.commandDescription,
            expectedOutput: cmd.expectedOutput,
            category: cmd.commandCategory,
          })),
          hints: (scenario.hints as any[] || []).map((h: any) => ({
            level: h.level,
            text: h.hint_text,
            pointPenalty: h.point_penalty,
          })),
          maxPoints: scenario.maxPoints,
        };
      });

      return {
        labId: lab.id,
        sessionNumber: lab.sessionNumber,
        title: lab.title,
        description: lab.description,
        difficulty: lab.difficultyLevel,
        scenarios,
      };
    });

    // Get all CTF challenges with flags (kunci jawaban CTF)
    const ctfChallenges = await prisma.cTFChallenge.findMany({
      orderBy: [
        { category: 'asc' },
        { points: 'asc' },
      ],
    });

    // Format CTF answer keys
    // hints adalah JSON field dengan format: Array of { id, text, cost }
    const ctfAnswerKeys = ctfChallenges.map(challenge => {
      const hintsData = (challenge.hints as any[]) || [];
      return {
        id: challenge.id,
        challengeId: challenge.challengeId,
        title: challenge.name, // Field di schema adalah 'name' bukan 'title'
        description: challenge.description,
        category: challenge.category,
        difficulty: challenge.difficulty,
        points: challenge.points,
        flag: challenge.flag, // Kunci jawaban CTF
        hints: hintsData.map((h: any, index: number) => ({
          id: h.id || index,
          content: h.text,
          cost: h.cost,
        })),
        files: challenge.files,
        url: challenge.url,
        author: challenge.author,
        isActive: challenge.isActive,
      };
    });

    // Statistics
    const stats = {
      totalLabs: labs.length,
      totalScenarios: labs.reduce((acc, lab) => acc + lab.scenarios.length, 0),
      totalObjectives: labs.reduce((acc, lab) =>
        acc + lab.scenarios.reduce((sacc, s) =>
          sacc + ((s.successCriteria as any[])?.length || 0), 0), 0),
      totalCtfChallenges: ctfChallenges.length,
      totalCtfPoints: ctfChallenges.reduce((acc, c) => acc + c.points, 0),
    };

    return NextResponse.json({
      success: true,
      stats,
      labAnswerKeys,
      ctfAnswerKeys,
    });
  } catch (error) {
    console.error('Error fetching answer keys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
