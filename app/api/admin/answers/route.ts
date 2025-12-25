import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Hanya admin dan instructor yang bisa akses
    if (auth.user.role !== 'ADMIN' && auth.user.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // 'all', 'lab', 'ctf'
    const userId = searchParams.get('userId');
    const labId = searchParams.get('labId');

    const result: any = {
      labSubmissions: [],
      ctfSubmissions: [],
    };

    // Get Lab Submissions (from CommandLog - valid commands that completed objectives)
    if (type === 'all' || type === 'lab') {
      const labWhereClause: any = {
        isValid: true,
      };
      
      if (userId) {
        labWhereClause.userId = userId;
      }
      if (labId) {
        labWhereClause.labId = labId;
      }

      const labSubmissions = await prisma.commandLog.findMany({
        where: labWhereClause,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              studentId: true,
              email: true,
            },
          },
          lab: {
            select: {
              id: true,
              title: true,
              sessionNumber: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 500, // Limit for performance
      });

      result.labSubmissions = labSubmissions.map((log: any) => ({
        id: log.id,
        userId: log.userId,
        userName: log.user?.fullName || 'Unknown',
        studentId: log.user?.studentId || '-',
        userEmail: log.user?.email || '-',
        labId: log.labId,
        labTitle: log.lab?.title || 'Unknown Lab',
        labSession: log.lab?.sessionNumber || 0,
        command: log.command,
        output: log.output,
        isValid: log.isValid,
        createdAt: log.createdAt,
      }));
    }

    // Get CTF Submissions
    if (type === 'all' || type === 'ctf') {
      const ctfWhereClause: any = {};
      
      if (userId) {
        ctfWhereClause.userId = userId;
      }

      const ctfSubmissions = await prisma.cTFSubmission.findMany({
        where: ctfWhereClause,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              studentId: true,
              email: true,
            },
          },
          challenge: {
            select: {
              id: true,
              title: true,
              category: true,
              points: true,
              flag: true,
            },
          },
        },
        orderBy: {
          submittedAt: 'desc',
        },
        take: 500,
      });

      result.ctfSubmissions = ctfSubmissions.map((sub: any) => ({
        id: sub.id,
        oderId: sub.userId,
        userName: sub.user?.fullName || 'Unknown',
        studentId: sub.user?.studentId || '-',
        userEmail: sub.user?.email || '-',
        challengeId: sub.challengeId,
        challengeTitle: sub.challenge?.title || 'Unknown Challenge',
        challengeCategory: sub.challenge?.category || '-',
        challengePoints: sub.challenge?.points || 0,
        correctFlag: sub.challenge?.flag || '-',
        submittedFlag: sub.submittedFlag,
        isCorrect: sub.isCorrect,
        pointsAwarded: sub.pointsAwarded,
        submittedAt: sub.submittedAt,
      }));
    }

    // Get summary statistics
    const stats = {
      totalLabCommands: await prisma.commandLog.count({ where: { isValid: true } }),
      totalCtfSubmissions: await prisma.cTFSubmission.count(),
      correctCtfSubmissions: await prisma.cTFSubmission.count({ where: { isCorrect: true } }),
      uniqueLabUsers: await prisma.commandLog.groupBy({
        by: ['userId'],
        where: { isValid: true },
      }).then(r => r.length),
      uniqueCtfUsers: await prisma.cTFSubmission.groupBy({
        by: ['userId'],
      }).then(r => r.length),
    };

    return NextResponse.json({
      success: true,
      stats,
      ...result,
    });
  } catch (error) {
    console.error('Error fetching answers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
