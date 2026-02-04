import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/middleware';

// POST /api/labs/[labId]/materi-read - Mark material as read
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

        // Get session/lab
        const session = await prisma.labSession.findUnique({
            where: { id: labId },
            include: {
                scenarios: true,
            },
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Lab tidak ditemukan' },
                { status: 404 }
            );
        }

        // Ensure at least one scenario exists
        if (session.scenarios.length === 0) {
            return NextResponse.json(
                { error: 'Lab tidak memiliki skenario' },
                { status: 400 }
            );
        }

        const scenario = session.scenarios[0];

        // Upsert student progress with materiRead = true
        const progress = await prisma.studentProgress.upsert({
            where: {
                studentId_scenarioId: {
                    studentId: auth.user.userId,
                    scenarioId: scenario.id,
                },
            },
            update: {
                materiRead: true,
                startedAt: new Date(),
            },
            create: {
                studentId: auth.user.userId,
                sessionId: labId,
                scenarioId: scenario.id,
                materiRead: true,
                maxPoints: scenario.maxPoints,
                startedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Materi berhasil ditandai sebagai sudah dibaca',
            materiRead: true,
        });
    } catch (error) {
        console.error('Mark materi read error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET /api/labs/[labId]/materi-read - Get material read status
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

        // Get session/lab
        const session = await prisma.labSession.findUnique({
            where: { id: labId },
            include: {
                scenarios: true,
            },
        });

        if (!session) {
            return NextResponse.json({ error: 'Lab tidak ditemukan' }, { status: 404 });
        }

        if (session.scenarios.length === 0) {
            return NextResponse.json({
                success: true,
                materiRead: false,
            });
        }

        const scenario = session.scenarios[0];

        // Check if student has progress with materiRead
        const progress = await prisma.studentProgress.findUnique({
            where: {
                studentId_scenarioId: {
                    studentId: auth.user.userId,
                    scenarioId: scenario.id,
                },
            },
        });

        return NextResponse.json({
            success: true,
            materiRead: progress?.materiRead || false,
        });
    } catch (error) {
        console.error('Get materi read status error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
