import prisma from '@/lib/db';

interface CommandPattern {
  command: string;
  timestamp: Date;
  executionTime: number;
}

interface CheatDetectionResult {
  isCheatingSuspected: boolean;
  suspicionLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reasons: string[];
  score: number; // 0-100, higher = more suspicious
}

export class AntiCheatEngine {
  // Thresholds for detection
  private static readonly RAPID_EXECUTION_THRESHOLD = 500; // ms between commands
  private static readonly RAPID_COMMANDS_COUNT = 5; // consecutive rapid commands
  private static readonly TOO_FAST_LAB_COMPLETION = 300000; // 5 minutes in ms
  private static readonly MIN_LAB_TIME = 600000; // 10 minutes in ms
  private static readonly DUPLICATE_COMMAND_THRESHOLD = 10; // same command repeated
  private static readonly PASTE_PATTERN_LENGTH = 50; // command length suggesting paste
  private static readonly SUSPICION_SCORE_THRESHOLD = 50; // flag if score > 50

  /**
   * Analyze command execution for suspicious patterns
   */
  static async analyzeCommandExecution(
    studentId: string,
    sessionId: string,
    command: string,
    executionTime: number
  ): Promise<CheatDetectionResult> {
    const reasons: string[] = [];
    let score = 0;

    // Get recent command history (last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const recentCommands = await prisma.commandHistory.findMany({
      where: {
        studentId,
        scenario: {
          sessionId,
        },
        createdAt: { gte: thirtyMinutesAgo },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // 1. Rapid command execution detection
    if (recentCommands.length >= this.RAPID_COMMANDS_COUNT) {
      const lastFiveCommands = recentCommands.slice(0, this.RAPID_COMMANDS_COUNT);
      const timeDiffs: number[] = [];

      for (let i = 0; i < lastFiveCommands.length - 1; i++) {
        const diff = lastFiveCommands[i].createdAt.getTime() - lastFiveCommands[i + 1].createdAt.getTime();
        timeDiffs.push(diff);
      }

      const avgTimeDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;

      if (avgTimeDiff < this.RAPID_EXECUTION_THRESHOLD) {
        reasons.push('Rapid command execution detected (possible automation)');
        score += 25;
      }
    }

    // 2. Detect very long commands (possible paste)
    if (command.length > this.PASTE_PATTERN_LENGTH) {
      reasons.push('Long command detected (possible copy-paste)');
      score += 15;
    }

    // 3. Detect duplicate commands
    const duplicateCount = recentCommands.filter(
      (cmd) => cmd.commandText === command
    ).length;

    if (duplicateCount > this.DUPLICATE_COMMAND_THRESHOLD) {
      reasons.push(`Same command executed ${duplicateCount} times (possible brute force)`);
      score += 20;
    }

    // 4. Detect unrealistic execution time (too fast)
    if (executionTime < 100) {
      reasons.push('Command executed too quickly (possible automation)');
      score += 10;
    }

    // 5. Detect sequential valid commands pattern (all commands valid, no errors)
    const recentValidCount = recentCommands
      .slice(0, 10)
      .filter((cmd) => cmd.isValid).length;

    if (recentValidCount === 10 && recentCommands.length >= 10) {
      reasons.push('Perfect command execution (no trial and error, suspicious)');
      score += 30;
    }

    // 6. Check for command pattern matching (commands in exact order from solution)
    const commandSequence = recentCommands
      .slice(0, 5)
      .map((cmd) => cmd.commandText)
      .reverse();

    if (this.detectSolutionPattern(commandSequence)) {
      reasons.push('Commands match known solution pattern (possible cheating)');
      score += 40;
    }

    // Determine suspicion level
    let suspicionLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (score >= 80) {
      suspicionLevel = 'CRITICAL';
    } else if (score >= 60) {
      suspicionLevel = 'HIGH';
    } else if (score >= 40) {
      suspicionLevel = 'MEDIUM';
    } else {
      suspicionLevel = 'LOW';
    }

    return {
      isCheatingSuspected: score >= this.SUSPICION_SCORE_THRESHOLD,
      suspicionLevel,
      reasons,
      score,
    };
  }

  /**
   * Analyze lab completion time for suspicious patterns
   */
  static async analyzeLabCompletion(
    studentId: string,
    sessionId: string
  ): Promise<CheatDetectionResult> {
    const reasons: string[] = [];
    let score = 0;

    // Get student progress for this session
    const progress = await prisma.studentProgress.findFirst({
      where: { studentId, sessionId },
      include: { scenario: true },
    });

    if (!progress) {
      return {
        isCheatingSuspected: false,
        suspicionLevel: 'LOW',
        reasons: [],
        score: 0,
      };
    }

    // Calculate time taken
    const timeTaken = progress.updatedAt.getTime() - progress.createdAt.getTime();

    // 1. Check if completed too fast
    if (timeTaken < this.TOO_FAST_LAB_COMPLETION && progress.status === 'COMPLETED') {
      reasons.push(`Lab completed in ${Math.round(timeTaken / 1000 / 60)} minutes (expected minimum: 10 minutes)`);
      score += 50;
    }

    // 2. Check if no failed commands (suspicious)
    const commands = await prisma.commandHistory.findMany({
      where: {
        studentId,
        scenario: {
          sessionId,
        },
      },
    });

    const failedCommandsCount = commands.filter((cmd) => !cmd.isValid).length;
    const totalCommands = commands.length;

    if (totalCommands > 10 && failedCommandsCount === 0) {
      reasons.push('No failed commands detected (no trial and error)');
      score += 30;
    }

    // 3. Check if hints were used (less suspicious if hints used)
    if (progress.hintsUsed === 0 && progress.status === 'COMPLETED' && timeTaken < this.MIN_LAB_TIME) {
      reasons.push('Lab completed quickly without using hints');
      score += 20;
    }

    // 4. Check command count (too few commands is suspicious)
    const minExpectedCommands = progress.scenario?.successCriteria
      ? (progress.scenario.successCriteria as any[]).length * 2
      : 10;

    if (totalCommands < minExpectedCommands && progress.status === 'COMPLETED') {
      reasons.push(`Too few commands executed (${totalCommands}, expected ~${minExpectedCommands})`);
      score += 25;
    }

    // Determine suspicion level
    let suspicionLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (score >= 80) {
      suspicionLevel = 'CRITICAL';
    } else if (score >= 60) {
      suspicionLevel = 'HIGH';
    } else if (score >= 40) {
      suspicionLevel = 'MEDIUM';
    } else {
      suspicionLevel = 'LOW';
    }

    return {
      isCheatingSuspected: score >= this.SUSPICION_SCORE_THRESHOLD,
      suspicionLevel,
      reasons,
      score,
    };
  }

  /**
   * Check for IP address changes during session
   */
  static async detectIPChange(
    studentId: string,
    sessionId: string,
    currentIP: string
  ): Promise<{ ipChanged: boolean; previousIP: string | null }> {
    const recentCommands = await prisma.commandHistory.findFirst({
      where: {
        studentId,
        scenario: {
          sessionId,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!recentCommands) {
      return { ipChanged: false, previousIP: null };
    }

    const previousIP = recentCommands.ipAddress;
    return {
      ipChanged: previousIP !== currentIP,
      previousIP,
    };
  }

  /**
   * Detect known solution patterns
   */
  private static detectSolutionPattern(commandSequence: string[]): boolean {
    // Define known solution patterns for sessions
    const knownPatterns = [
      // Session 1 OSINT pattern
      ['whois example-company.com', 'nslookup example-company.com', 'geoip 192.168.1.100'],
      ['whois', 'nslookup', 'geoip', 'dig', 'host'],

      // Session 2 Nmap pattern
      ['nmap -sS 192.168.1.100', 'nmap -sV 192.168.1.100', 'nmap -O 192.168.1.100'],

      // Add more patterns as needed
    ];

    // Check if command sequence matches any known pattern
    for (const pattern of knownPatterns) {
      let matchCount = 0;
      for (const cmd of commandSequence) {
        for (const patternCmd of pattern) {
          if (cmd.includes(patternCmd)) {
            matchCount++;
            break;
          }
        }
      }

      // If 80% or more commands match a pattern, flag it
      if (matchCount / pattern.length >= 0.8) {
        return true;
      }
    }

    return false;
  }

  /**
   * Create anti-cheat alert in database
   */
  static async createCheatAlert(
    studentId: string,
    sessionId: string,
    detectionResult: CheatDetectionResult,
    ipAddress: string
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        studentId: studentId,
        sessionId: sessionId,
        action: 'ANTI_CHEAT_ALERT',
        actionType: 'COMMAND_EXECUTE',
        details: {
          suspicionLevel: detectionResult.suspicionLevel,
          score: detectionResult.score,
          reasons: detectionResult.reasons,
        },
        suspiciousFlag: true,
        ipAddress,
      },
    });
  }

  /**
   * Get student's cheat detection history
   */
  static async getCheatHistory(studentId: string): Promise<any[]> {
    const alerts = await prisma.auditLog.findMany({
      where: {
        studentId: studentId,
        action: 'ANTI_CHEAT_ALERT',
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return alerts.map((alert) => ({
      timestamp: alert.createdAt,
      sessionId: alert.sessionId,
      suspicionLevel: (alert.details as any).suspicionLevel,
      score: (alert.details as any).score,
      reasons: (alert.details as any).reasons,
    }));
  }

  /**
   * Get platform-wide cheat statistics
   */
  static async getCheatStatistics(): Promise<{
    totalAlerts: number;
    criticalAlerts: number;
    highAlerts: number;
    mediumAlerts: number;
    lowAlerts: number;
    affectedStudents: number;
  }> {
    const alerts = await prisma.auditLog.findMany({
      where: { action: 'ANTI_CHEAT_ALERT' },
    });

    const criticalAlerts = alerts.filter(
      (a) => (a.details as any).suspicionLevel === 'CRITICAL'
    ).length;
    const highAlerts = alerts.filter(
      (a) => (a.details as any).suspicionLevel === 'HIGH'
    ).length;
    const mediumAlerts = alerts.filter(
      (a) => (a.details as any).suspicionLevel === 'MEDIUM'
    ).length;
    const lowAlerts = alerts.filter(
      (a) => (a.details as any).suspicionLevel === 'LOW'
    ).length;

    const affectedStudents = new Set(alerts.map((a) => a.studentId)).size;

    return {
      totalAlerts: alerts.length,
      criticalAlerts,
      highAlerts,
      mediumAlerts,
      lowAlerts,
      affectedStudents,
    };
  }
}
