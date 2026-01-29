import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/middleware';

<<<<<<< HEAD
// GET /api/search - Global search across labs, CTF, and commands
=======
// GET /api/search - Search across labs, CTF challenges, and commands
>>>>>>> eb0fc38ac38795695636d608377cd3232d5ce0ad
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request);

    if (!auth.authenticated || !auth.user) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
<<<<<<< HEAD
    const query = searchParams.get('q')?.trim().toLowerCase();
    const type = searchParams.get('type') || 'all'; // 'all', 'labs', 'ctf', 'commands'
=======
    const query = searchParams.get('q')?.trim();
>>>>>>> eb0fc38ac38795695636d608377cd3232d5ce0ad
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        results: {
          labs: [],
<<<<<<< HEAD
          ctf: [],
          commands: [],
        },
        total: 0,
      });
    }

    const results: {
      labs: any[];
      ctf: any[];
      commands: any[];
    } = {
      labs: [],
      ctf: [],
      commands: [],
    };

    // Search Labs/Sessions
    if (type === 'all' || type === 'labs') {
      const labs = await prisma.labSession.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { topic: { contains: query, mode: 'insensitive' } },
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
        orderBy: { sessionNumber: 'asc' },
      });

      results.labs = labs.map(lab => ({
        id: lab.id,
        type: 'lab',
        title: `Sesi ${lab.sessionNumber}: ${lab.title}`,
        description: lab.description.substring(0, 100) + (lab.description.length > 100 ? '...' : ''),
        topic: lab.topic,
        difficulty: lab.difficultyLevel,
        url: `/dashboard/labs/${lab.id}`,
        icon: '📚',
      }));
    }

    // Search CTF Challenges
    if (type === 'all' || type === 'ctf') {
      // Build search conditions - category is an enum so we handle it separately
      const categoryMatch = Object.values(['WEB', 'CRYPTO', 'FORENSICS', 'REVERSE_ENGINEERING', 'PWN', 'OSINT', 'MISC', 'STEGANOGRAPHY', 'NETWORK'])
        .find(cat => cat.toLowerCase().includes(query.toLowerCase()));

      const orConditions: any[] = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];

      // Add category filter if query matches a category enum value
      if (categoryMatch) {
        orConditions.push({ category: categoryMatch as any });
      }

      const ctfChallenges = await prisma.cTFChallenge.findMany({
        where: {
          isActive: true,
          OR: orConditions,
        },
        select: {
          id: true,
          challengeId: true,
          name: true,
          description: true,
          category: true,
          difficulty: true,
          points: true,
        },
        take: limit,
        orderBy: { points: 'asc' },
      });

      results.ctf = ctfChallenges.map(ctf => ({
        id: ctf.id,
        type: 'ctf',
        title: ctf.name,
        description: ctf.description.substring(0, 100) + (ctf.description.length > 100 ? '...' : ''),
        category: ctf.category,
        difficulty: ctf.difficulty,
        points: ctf.points,
        url: `/dashboard/ctf`,
        icon: '🏴',
      }));
    }

    // Search Commands (from command database or predefined list)
    if (type === 'all' || type === 'commands') {
      // Search in CommandDatabase
      const commands = await prisma.commandDatabase.findMany({
        where: {
          OR: [
            { commandPattern: { contains: query, mode: 'insensitive' } },
            { commandDescription: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          commandPattern: true,
          commandDescription: true,
          commandCategory: true,
          pointsAwarded: true,
        },
        take: limit,
      });

      results.commands = commands.map(cmd => ({
        id: cmd.id,
        type: 'command',
        title: cmd.commandPattern,
        description: cmd.commandDescription,
        category: cmd.commandCategory,
        points: cmd.pointsAwarded,
        url: null, // Commands don't have a direct URL
        icon: '⌨️',
      }));

      // Also search in predefined commands if database is empty
      if (results.commands.length === 0) {
        const predefinedCommands = [
          { name: 'whois', description: 'Query domain registration information', category: 'OSINT' },
          { name: 'nslookup', description: 'DNS lookup tool', category: 'OSINT' },
          { name: 'dig', description: 'DNS information groper', category: 'OSINT' },
          { name: 'nmap', description: 'Network scanner and port mapper', category: 'SCANNING' },
          { name: 'searchsploit', description: 'Search exploit database', category: 'EXPLOITATION' },
          { name: 'geoip', description: 'IP geolocation lookup', category: 'OSINT' },
          { name: 'hashid', description: 'Identify hash types', category: 'ANALYSIS' },
          { name: 'john', description: 'Password cracker', category: 'EXPLOITATION' },
          { name: 'hashcat', description: 'Advanced password recovery', category: 'EXPLOITATION' },
          { name: 'nikto', description: 'Web server scanner', category: 'SCANNING' },
          { name: 'dirb', description: 'Web content scanner', category: 'ENUMERATION' },
          { name: 'gobuster', description: 'Directory/file brute-forcer', category: 'ENUMERATION' },
          { name: 'sqlmap', description: 'SQL injection tool', category: 'EXPLOITATION' },
          { name: 'hydra', description: 'Password brute-force tool', category: 'EXPLOITATION' },
          { name: 'netcat', description: 'TCP/UDP network tool', category: 'ANALYSIS' },
        ];

        const filtered = predefinedCommands.filter(
          cmd => cmd.name.toLowerCase().includes(query) || 
                 cmd.description.toLowerCase().includes(query) ||
                 cmd.category.toLowerCase().includes(query)
        );

        results.commands = filtered.slice(0, limit).map((cmd, idx) => ({
          id: `predefined-${idx}`,
          type: 'command',
          title: cmd.name,
          description: cmd.description,
          category: cmd.category,
          points: null,
          url: null,
          icon: '⌨️',
        }));
      }
    }

    const total = results.labs.length + results.ctf.length + results.commands.length;
=======
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
>>>>>>> eb0fc38ac38795695636d608377cd3232d5ce0ad

    return NextResponse.json({
      success: true,
      query,
<<<<<<< HEAD
      results,
      total,
=======
      results: {
        labs: labs.map((lab) => ({
          type: 'lab',
          id: lab.id,
          title: lab.title,
          subtitle: `Sesi ${lab.sessionNumber} • ${lab.topic}`,
          description: lab.description.substring(0, 100) + (lab.description.length > 100 ? '...' : ''),
          difficulty: lab.difficultyLevel,
          url: `/dashboard/labs/${lab.id}`,
        })),
        challenges: challenges.map((ch) => ({
          type: 'challenge',
          id: ch.id,
          title: ch.name,
          subtitle: `${ch.category} • ${ch.points} pts`,
          description: ch.description.substring(0, 100) + (ch.description.length > 100 ? '...' : ''),
          difficulty: ch.difficulty,
          url: '/dashboard/ctf',
        })),
        commands: commands.map((cmd) => ({
          type: 'command',
          id: cmd.id,
          title: cmd.commandPattern,
          subtitle: cmd.commandCategory,
          description: cmd.commandDescription,
          url: cmd.scenario?.session ? `/dashboard/labs/${cmd.scenario.session.id}` : '/dashboard/labs',
        })),
      },
      total: labs.length + challenges.length + commands.length,
>>>>>>> eb0fc38ac38795695636d608377cd3232d5ce0ad
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
