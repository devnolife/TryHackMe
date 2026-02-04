import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/middleware';

// GET /api/search - Search across labs, CTF challenges, and commands
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request);

    if (!auth.authenticated || !auth.user) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        results: {
          labs: [],
          challenges: [],
          commands: [],
        },
        message: 'Query too short, minimum 2 characters',
      });
    }

    const searchQuery = query.toLowerCase();

    // Search labs/sessions
    const labs = await prisma.labSession.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } },
          { topic: { contains: searchQuery, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        sessionNumber: true,
        title: true,
        description: true,
        topic: true,
        difficultyLevel: true,
      },
      take: limit,
    });

    // Search CTF challenges
    const challenges = await prisma.cTFChallenge.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } },
          { challengeId: { contains: searchQuery, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        challengeId: true,
        name: true,
        category: true,
        difficulty: true,
        points: true,
        description: true,
      },
      take: limit,
    });

    // Search commands from command database
    const commands = await prisma.commandDatabase.findMany({
      where: {
        OR: [
          { commandPattern: { contains: searchQuery, mode: 'insensitive' } },
          { commandDescription: { contains: searchQuery, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        commandPattern: true,
        commandDescription: true,
        commandCategory: true,
        scenario: {
          select: {
            session: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      query,
      results: {
        labs: labs.map((lab) => ({
          type: 'lab',
          id: lab.id,
          title: lab.title,
          description: `Sesi ${lab.sessionNumber} • ${lab.topic}`,
          difficulty: lab.difficultyLevel,
          topic: lab.topic,
          url: `/dashboard/labs/${lab.id}`,
          icon: '📚',
        })),
        ctf: challenges.map((ch) => ({
          type: 'ctf',
          id: ch.id,
          title: ch.name,
          description: ch.description.substring(0, 100) + (ch.description.length > 100 ? '...' : ''),
          category: ch.category,
          difficulty: ch.difficulty,
          points: ch.points,
          url: '/dashboard/ctf',
          icon: '🏴',
        })),
        commands: commands.map((cmd) => ({
          type: 'command',
          id: cmd.id,
          title: cmd.commandPattern,
          description: cmd.commandDescription,
          category: cmd.commandCategory,
          url: cmd.scenario?.session ? `/dashboard/labs/${cmd.scenario.session.id}` : '/dashboard/labs',
          icon: '⌨️',
        })),
      },
      total: labs.length + challenges.length + commands.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
