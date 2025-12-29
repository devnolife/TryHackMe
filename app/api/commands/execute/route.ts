import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/middleware';
import { CommandRouter } from '@/lib/simulation/command-router';
import { ScoringEngine } from '@/lib/scoring/scoring-engine';
import { AntiCheatEngine } from '@/lib/anti-cheat/detection-engine';
import { LinuxSimulator } from '@/lib/simulation/linux-simulator';

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

    // Update attempt count only (points are awarded via ObjectiveCompletion system below)
    if (isValidForScenario && matchedCommand && result.success) {
      await prisma.studentProgress.update({
        where: { id: progress.id },
        data: {
          attempts: {
            increment: 1,
          },
        },
      });
    }

    // Get IP address
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    // Save command history
    await prisma.commandHistory.create({
      data: {
        studentId: auth.user.userId,
        scenarioId: scenarioId,
        commandText: command,
        isValid: result.isValid,
        validationResult: {
          success: result.success,
          output: result.output,
          pointsAwarded: result.pointsAwarded,
          isValidForScenario,
          matchedCommandId: matchedCommand?.id,
        },
        executionTimeMs: result.executionTime,
        ipAddress,
        userAgent,
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
          studentId: auth.user.userId,
          sessionId: scenario.sessionId,
          action: 'IP_ADDRESS_CHANGE',
          actionType: 'COMMAND_EXECUTE',
          details: {
            previousIP: ipCheck.previousIP,
            newIP: ipAddress,
          },
          suspiciousFlag: true,
          ipAddress,
        },
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        studentId: auth.user.userId,
        sessionId: scenario.sessionId,
        action: 'EXECUTE_COMMAND',
        actionType: 'COMMAND_EXECUTE',
        resourceType: 'scenario',
        resourceId: scenarioId,
        details: {
          command: command.substring(0, 100),
          success: result.success,
          pointsAwarded: result.pointsAwarded,
          cheatDetection: cheatDetection.isCheatingSuspected ? {
            suspicionLevel: cheatDetection.suspicionLevel,
            score: cheatDetection.score,
            reasons: cheatDetection.reasons,
          } : null,
        },
        suspiciousFlag: cheatDetection.isCheatingSuspected,
        ipAddress,
      },
    });

    // Check for completed objectives and save to database
    let completedObjectives: { description: string; points: number; objectiveIndex: number }[] = [];
    let allObjectivesCompleted = false;

    // Get already completed objectives from database
    const existingCompletions = await prisma.objectiveCompletion.findMany({
      where: {
        studentId: auth.user.userId,
        scenarioId: scenarioId,
      },
    });
    const completedIndices = new Set(existingCompletions.map(c => c.objectiveIndex));

    // Parse successCriteria from scenario
    const successCriteria = scenario.successCriteria as any[];
    if (successCriteria && Array.isArray(successCriteria)) {
      for (let i = 0; i < successCriteria.length; i++) {
        const criteria = successCriteria[i];

        // Skip if already completed
        if (completedIndices.has(i)) continue;

        let isMatch = false;

        // Check if this command matches the criteria pattern
        if (criteria.command_pattern) {
          const pattern = new RegExp(criteria.command_pattern, 'i');
          if (pattern.test(command) && result.success) {
            isMatch = true;
          }
        }

        // Alternative: Check by keyword matching
        if (!isMatch && criteria.keywords && Array.isArray(criteria.keywords)) {
          const commandLower = command.toLowerCase();
          const matchesKeyword = criteria.keywords.some((kw: string) =>
            commandLower.includes(kw.toLowerCase())
          );
          if (matchesKeyword && result.success) {
            isMatch = true;
          }
        }

        // If matched, save to database
        if (isMatch) {
          try {
            await prisma.objectiveCompletion.create({
              data: {
                studentId: auth.user.userId,
                scenarioId: scenarioId,
                objectiveIndex: i,
                description: criteria.description,
                points: criteria.points || 0,
              },
            });

            // Update student progress points
            await prisma.studentProgress.update({
              where: { id: progress.id },
              data: {
                totalPoints: { increment: criteria.points || 0 },
              },
            });

            completedObjectives.push({
              description: criteria.description,
              points: criteria.points || 0,
              objectiveIndex: i,
            });
          } catch (err) {
            // Ignore duplicate key errors
            console.log('Objective already completed or error:', err);
          }
        }
      }

      // Check if all objectives are now completed
      const totalObjectives = successCriteria.length;
      const totalCompleted = completedIndices.size + completedObjectives.length;

      if (totalCompleted >= totalObjectives) {
        allObjectivesCompleted = true;

        // Update progress status to COMPLETED
        await prisma.studentProgress.update({
          where: { id: progress.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });
      }
    }

    // Calculate total points from all completed objectives
    const allCompletions = await prisma.objectiveCompletion.findMany({
      where: {
        studentId: auth.user.userId,
        scenarioId: scenarioId,
      },
    });
    const totalPointsEarned = allCompletions.reduce((sum, c) => sum + c.points, 0);

    return NextResponse.json({
      success: true,
      output: result.output,
      isValid: result.isValid,
      pointsAwarded: result.pointsAwarded,
      isValidForScenario,
      currentDirectory: LinuxSimulator.getCurrentDir(),
      message: isValidForScenario && result.success
        ? `Correct! +${result.pointsAwarded} points`
        : result.success
          ? 'Command executed successfully'
          : 'Command failed or not recognized',
      // Objective completion info
      completedObjectives,
      allObjectivesCompleted,
      totalPointsEarned,
      completedObjectiveIndices: Array.from(completedIndices).concat(completedObjectives.map(c => c.objectiveIndex)),
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
