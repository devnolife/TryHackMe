/**
 * Scoring Engine
 * Calculates points for completed tasks and overall progress
 */

export interface ScoringCriteria {
  id: string;
  description: string;
  points: number;
  completed: boolean;
}

export interface LabScore {
  labId: string;
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  completedTasks: number;
  totalTasks: number;
}

export interface StudentScore {
  studentId: string;
  weeklyLabsScore: number;     // 30% of total
  utsScore: number;             // 25% of total
  uasScore: number;             // 35% of total
  attendanceScore: number;      // 10% of total
  finalGrade: number;           // Calculated final grade
  letterGrade: string;          // A, B+, B, C+, C, D, F
}

export class ScoringEngine {
  /**
   * Calculate lab score based on completed tasks
   */
  static calculateLabScore(
    completedPoints: number,
    maxPoints: number
  ): LabScore {
    const percentage = maxPoints > 0 ? (completedPoints / maxPoints) * 100 : 0;

    return {
      labId: '',
      totalPoints: completedPoints,
      maxPoints,
      percentage: Math.round(percentage * 100) / 100,
      completedTasks: 0,
      totalTasks: 0,
    };
  }

  /**
   * Calculate command score based on validation
   */
  static calculateCommandScore(
    isCorrect: boolean,
    basePoints: number,
    hintsUsed: number,
    hintPenalty: number = 2
  ): number {
    if (!isCorrect) return 0;

    const penalty = hintsUsed * hintPenalty;
    const finalPoints = Math.max(0, basePoints - penalty);

    return finalPoints;
  }

  /**
   * Calculate weekly labs average (30% of final grade)
   */
  static calculateWeeklyLabsScore(labScores: number[]): number {
    if (labScores.length === 0) return 0;

    const average = labScores.reduce((sum, score) => sum + score, 0) / labScores.length;
    return Math.round(average * 100) / 100;
  }

  /**
   * Calculate final grade
   * Formula: (10% × Attendance) + (30% × Weekly Labs) + (25% × UTS) + (35% × UAS)
   */
  static calculateFinalGrade(
    attendanceScore: number,
    weeklyLabsScore: number,
    utsScore: number,
    uasScore: number
  ): StudentScore {
    const finalGrade =
      (attendanceScore * 0.1) +
      (weeklyLabsScore * 0.3) +
      (utsScore * 0.25) +
      (uasScore * 0.35);

    const letterGrade = this.getLetterGrade(finalGrade);

    return {
      studentId: '',
      attendanceScore,
      weeklyLabsScore,
      utsScore,
      uasScore,
      finalGrade: Math.round(finalGrade * 100) / 100,
      letterGrade,
    };
  }

  /**
   * Convert numeric grade to letter grade
   */
  static getLetterGrade(score: number): string {
    if (score >= 85) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'C+';
    if (score >= 65) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Calculate bonus points for early completion
   */
  static calculateEarlyCompletionBonus(
    timeSpentMinutes: number,
    estimatedMinutes: number,
    maxBonus: number = 10
  ): number {
    if (timeSpentMinutes >= estimatedMinutes) return 0;

    const timeSavedPercent = (estimatedMinutes - timeSpentMinutes) / estimatedMinutes;
    const bonus = Math.floor(timeSavedPercent * maxBonus);

    return Math.min(bonus, maxBonus);
  }

  /**
   * Calculate penalty for excessive hints usage
   */
  static calculateHintPenalty(hintsUsed: number, maxHints: number = 3): number {
    if (hintsUsed <= maxHints) return hintsUsed * 2;

    // Extra penalty for using more than max hints
    const extraHints = hintsUsed - maxHints;
    return (maxHints * 2) + (extraHints * 5);
  }

  /**
   * Validate if student passes the course
   */
  static validatePassingCriteria(
    finalGrade: number,
    attendancePercent: number,
    assignmentsCompletedPercent: number
  ): { passed: boolean; reasons: string[] } {
    const reasons: string[] = [];

    if (finalGrade < 60) {
      reasons.push('Final grade below 60 (minimum passing grade)');
    }

    if (attendancePercent < 75) {
      reasons.push('Attendance below 75% (minimum requirement)');
    }

    if (assignmentsCompletedPercent < 75) {
      reasons.push('Less than 75% of assignments completed');
    }

    return {
      passed: reasons.length === 0,
      reasons,
    };
  }

  /**
   * Calculate progress percentage for a lab
   */
  static calculateProgress(completedTasks: number, totalTasks: number): number {
    if (totalTasks === 0) return 0;
    return Math.round((completedTasks / totalTasks) * 100);
  }

  /**
   * Calculate time-based score modifier
   * Penalize if completion is too fast (possible cheating)
   */
  static calculateTimingModifier(
    timeSpentMinutes: number,
    minimumExpectedMinutes: number
  ): number {
    if (timeSpentMinutes < minimumExpectedMinutes * 0.1) {
      // Completed in less than 10% of expected time - suspicious
      return 0.5; // 50% penalty
    }

    if (timeSpentMinutes < minimumExpectedMinutes * 0.3) {
      // Completed in less than 30% of expected time - questionable
      return 0.8; // 20% penalty
    }

    return 1.0; // No penalty
  }

  /**
   * Calculate streak bonus for consecutive completions
   */
  static calculateStreakBonus(consecutiveDays: number, maxBonus: number = 20): number {
    if (consecutiveDays < 3) return 0;

    const bonus = Math.min(consecutiveDays * 2, maxBonus);
    return bonus;
  }
}
