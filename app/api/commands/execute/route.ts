import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/middleware';
import { CommandRouter } from '@/lib/simulation/command-router';
import { ScoringEngine } from '@/lib/scoring/scoring-engine';
import { AntiCheatEngine } from '@/lib/anti-cheat/detection-engine';

// POST /api/commands/execute - Execute a command
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request);

    if (!auth.authenticated || !auth.user) {
      return auth.response;
    }

    const body = await request.json();
    const { command, scenarioId } = body;

    if (!command || !scenarioId) {
      return NextResponse.json(
        { error: 'Missing required fields: command, scenarioId' },
        { status: 400 }
      );
    }

    // Execute command through simulator
    const result = CommandRouter.execute(command);

    // Get scenario details
    const scenario = await prisma.labScenario.findUnique({
      where: { id: scenarioId },
      include: {
        commands: true,
      },
    });

    if (!scenario) {
      return NextResponse.json(
        { error: 'Scenario not found' },
        { status: 404 }
      );
    }

    // Validate command against expected commands
    let isValidForScenario = false;
    let matchedCommand = null;

    for (const cmd of scenario.commands) {
      const regex = new RegExp(cmd.commandPattern);
      if (regex.test(command)) {
        isValidForScenario = true;
        matchedCommand = cmd;
        break;
      }
    }

    // Get or create student progress
    let progress = await prisma.studentProgress.findUnique({
      where: {
        studentId_scenarioId: {
          studentId: auth.user.userId,
          scenarioId: scenarioId,
        },
      },
    });

    if (!progress) {
      progress = await prisma.studentProgress.create({
        data: {
          studentId: auth.user.userId,
          sessionId: scenario.sessionId,
          scenarioId: scenarioId,
          status: 'IN_PROGRESS',
          maxPoints: scenario.maxPoints,
          startedAt: new Date(),
        },
      });
    }

    // Update progress if command is valid
    if (isValidForScenario && matchedCommand && result.success) {
      const pointsToAdd = matchedCommand.pointsAwarded;

      await prisma.studentProgress.update({
        where: { id: progress.id },
        data: {
          totalPoints: {
            increment: pointsToAdd,
          },
          attempts: {
            increment: 1,
          },
        },
      });
    }

    // Get IP address
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Save command history
    await prisma.commandHistory.create({
      data: {
        studentId: auth.user.userId,
        scenarioId: scenarioId,
        sessionId: scenario.sessionId,
        command: command,
        isValid: result.isValid,
        validationResult: {
          success: result.success,
          output: result.output,
          pointsAwarded: result.pointsAwarded,
          isValidForScenario,
          matchedCommandId: matchedCommand?.id,
        },
        executionTime: result.executionTime,
        ipAddress,
      },
    });

    // Anti-Cheat Detection
    const cheatDetection = await AntiCheatEngine.analyzeCommandExecution(
      auth.user.userId,
      scenario.sessionId,
      command,
      result.executionTime
    );

    // If cheating is suspected, create an alert
    if (cheatDetection.isCheatingSuspected) {
      await AntiCheatEngine.createCheatAlert(
        auth.user.userId,
        scenario.sessionId,
        cheatDetection,
        ipAddress
      );
    }

    // Check for IP address changes
    const ipCheck = await AntiCheatEngine.detectIPChange(
      auth.user.userId,
      scenario.sessionId,
      ipAddress
    );

    if (ipCheck.ipChanged && ipCheck.previousIP) {
      await prisma.auditLog.create({
        data: {
          userId: auth.user.userId,
          action: 'IP_ADDRESS_CHANGE',
          details: {
            sessionId: scenario.sessionId,
            previousIP: ipCheck.previousIP,
            newIP: ipAddress,
          },
          ipAddress,
        },
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: auth.user.userId,
        action: 'EXECUTE_COMMAND',
        details: {
          sessionId: scenario.sessionId,
          scenarioId,
          command: command.substring(0, 100),
          success: result.success,
          pointsAwarded: result.pointsAwarded,
          cheatDetection: cheatDetection.isCheatingSuspected ? {
            suspicionLevel: cheatDetection.suspicionLevel,
            score: cheatDetection.score,
            reasons: cheatDetection.reasons,
          } : null,
        },
        ipAddress,
      },
    });

    return NextResponse.json({
      success: true,
      output: result.output,
      isValid: result.isValid,
      pointsAwarded: result.pointsAwarded,
      isValidForScenario,
      message: isValidForScenario && result.success
        ? `Correct! +${result.pointsAwarded} points`
        : result.success
        ? 'Command executed successfully'
        : 'Command failed or not recognized',
      antiCheat: cheatDetection.isCheatingSuspected ? {
        warning: true,
        suspicionLevel: cheatDetection.suspicionLevel,
        message: 'Suspicious activity detected. Your activity is being monitored.',
      } : null,
    });
  } catch (error) {
    console.error('Command execution error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
