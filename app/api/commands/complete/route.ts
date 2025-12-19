import { NextRequest, NextResponse } from 'next/server';
import { LinuxSimulator } from '@/lib/simulation/linux-simulator';

// POST /api/commands/complete - Get tab completions for a partial path
// This endpoint does not require authentication as it's a UX feature
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partialPath } = body;

    // Get completions from the Linux simulator
    const completions = LinuxSimulator.getCompletions(partialPath || '');

    return NextResponse.json({
      success: true,
      completions,
      currentDirectory: LinuxSimulator.getCurrentDir(),
    });
  } catch (error) {
    console.error('Tab completion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
