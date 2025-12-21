/**
 * CTF (Capture The Flag) Challenge System
 * Manages CTF challenges, flag validation, and scoring
 */

export interface CTFChallenge {
  id: string;
  name: string;
  description: string;
  category: CTFCategory;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  points: number;
  flag: string;
  hints: CTFHint[];
  files?: string[];
  url?: string;
  author?: string;
  solves?: number;
  maxAttempts?: number;
  timeLimit?: number; // in minutes
}

export interface CTFHint {
  id: number;
  text: string;
  cost: number; // Points deducted for using this hint
  unlocked?: boolean;
}

export type CTFCategory =
  | 'Web'
  | 'Crypto'
  | 'Forensics'
  | 'Reverse Engineering'
  | 'Pwn'
  | 'OSINT'
  | 'Misc'
  | 'Steganography'
  | 'Network';

export interface CTFSubmission {
  challengeId: string;
  userId: string;
  submittedFlag: string;
  isCorrect: boolean;
  pointsAwarded: number;
  hintsUsed: number[];
  attemptNumber: number;
  submittedAt: Date;
}

export interface CTFUserProgress {
  userId: string;
  totalPoints: number;
  solvedChallenges: string[];
  hintsUnlocked: Record<string, number[]>;
  attempts: Record<string, number>;
  startedAt?: Date;
  completedAt?: Date;
}

export class CTFSystem {
  private static challenges: Map<string, CTFChallenge> = new Map();
  private static userProgress: Map<string, CTFUserProgress> = new Map();
  private static submissions: CTFSubmission[] = [];

  // Initialize with default challenges
  static {
    this.initializeChallenges();
  }

  /**
   * Initialize default CTF challenges
   */
  private static initializeChallenges(): void {
    const defaultChallenges: CTFChallenge[] = [
      // Web Challenges
      {
        id: 'web-001',
        name: 'Hidden in Plain Sight',
        description: 'The flag is hidden somewhere on this page. Can you find it? Check the source carefully.',
        category: 'Web',
        difficulty: 'Easy',
        points: 50,
        flag: 'flag{h1dd3n_1n_pl41n_s1ght}',
        hints: [
          { id: 1, text: 'Have you checked the HTML comments?', cost: 10 },
          { id: 2, text: 'Look at the page source with Ctrl+U', cost: 15 },
        ],
        url: '/ctf/challenges/web-001',
      },
      {
        id: 'web-002',
        name: 'Cookie Monster',
        description: 'Cookies are delicious, but some contain secrets. Can you find the hidden cookie?',
        category: 'Web',
        difficulty: 'Easy',
        points: 75,
        flag: 'flag{c00k13_m0nst3r_l0v3s_s3cr3ts}',
        hints: [
          { id: 1, text: 'Use browser developer tools to inspect cookies', cost: 15 },
          { id: 2, text: 'The flag is base64 encoded in a cookie', cost: 20 },
        ],
        url: '/ctf/challenges/web-002',
      },
      {
        id: 'web-003',
        name: 'SQL Injection 101',
        description: 'This login form seems vulnerable. Can you bypass the authentication?',
        category: 'Web',
        difficulty: 'Medium',
        points: 100,
        flag: 'flag{sql1_1s_st1ll_d4ng3r0us}',
        hints: [
          { id: 1, text: "Try entering a single quote (') in the username field", cost: 20 },
          { id: 2, text: "Classic payload: ' OR '1'='1", cost: 30 },
        ],
        url: '/ctf/challenges/web-003',
      },
      {
        id: 'web-004',
        name: 'XSS Adventure',
        description: 'This search feature reflects user input. Can you make it execute JavaScript?',
        category: 'Web',
        difficulty: 'Medium',
        points: 100,
        flag: 'flag{xss_1s_3v3rywh3r3}',
        hints: [
          { id: 1, text: 'Try injecting script tags', cost: 20 },
          { id: 2, text: '<script>alert(document.cookie)</script>', cost: 35 },
        ],
        url: '/ctf/challenges/web-004',
      },
      {
        id: 'web-005',
        name: 'API Explorer',
        description: 'This API has some hidden endpoints. Can you find and exploit them?',
        category: 'Web',
        difficulty: 'Hard',
        points: 150,
        flag: 'flag{4p1_s3cur1ty_m4tt3rs}',
        hints: [
          { id: 1, text: 'Try accessing /api/admin endpoints', cost: 30 },
          { id: 2, text: 'Check for IDOR vulnerabilities in user endpoints', cost: 40 },
        ],
        url: '/ctf/challenges/web-005',
      },

      // Crypto Challenges
      {
        id: 'crypto-001',
        name: 'Base64 Basics',
        description: 'This message is encoded. Decode it to find the flag: ZmxhZ3tiNHMzNjRfMXNfbjB0XzNuY3J5cHQxMG59',
        category: 'Crypto',
        difficulty: 'Easy',
        points: 50,
        flag: 'flag{b4s364_1s_n0t_3ncrypt10n}',
        hints: [
          { id: 1, text: 'This is not encryption, just encoding', cost: 10 },
          { id: 2, text: 'Use an online Base64 decoder', cost: 15 },
        ],
      },
      {
        id: 'crypto-002',
        name: 'ROT13 Rotation',
        description: 'Julius Caesar would be proud. Decode: synt{e0g13_1f_abg_frpher}',
        category: 'Crypto',
        difficulty: 'Easy',
        points: 50,
        flag: 'flag{r0t13_1s_not_secure}',
        hints: [
          { id: 1, text: 'This is a substitution cipher with rotation', cost: 10 },
          { id: 2, text: 'Each letter is shifted by 13 positions', cost: 15 },
        ],
      },
      {
        id: 'crypto-003',
        name: 'Hash Cracker',
        description: 'Crack this MD5 hash to find the flag: 5f4dcc3b5aa765d61d8327deb882cf99',
        category: 'Crypto',
        difficulty: 'Medium',
        points: 100,
        flag: 'flag{password}',
        hints: [
          { id: 1, text: 'This is an MD5 hash of a common password', cost: 20 },
          { id: 2, text: 'Try using an online hash lookup service', cost: 30 },
        ],
      },
      {
        id: 'crypto-004',
        name: 'RSA Challenge',
        description: 'We intercepted this RSA-encrypted message. The public key seems weak... n=323, e=5, c=256',
        category: 'Crypto',
        difficulty: 'Hard',
        points: 150,
        flag: 'flag{sm4ll_pr1m3s_4r3_b4d}',
        hints: [
          { id: 1, text: 'n is small enough to factor manually', cost: 30 },
          { id: 2, text: 'n = 17 × 19, now calculate φ(n) and d', cost: 50 },
        ],
      },

      // Forensics Challenges
      {
        id: 'forensics-001',
        name: 'Strings Attached',
        description: 'This binary file contains a hidden flag. Can you find it?',
        category: 'Forensics',
        difficulty: 'Easy',
        points: 50,
        flag: 'flag{str1ngs_r3v34l_s3cr3ts}',
        hints: [
          { id: 1, text: 'Use the strings command on Linux', cost: 10 },
          { id: 2, text: 'strings file.bin | grep flag', cost: 15 },
        ],
        files: ['challenge.bin'],
      },
      {
        id: 'forensics-002',
        name: 'PCAP Analysis',
        description: 'We captured some network traffic. Find the exfiltrated data.',
        category: 'Forensics',
        difficulty: 'Medium',
        points: 100,
        flag: 'flag{p4ck3t_c4ptur3_pr0}',
        hints: [
          { id: 1, text: 'Use Wireshark to analyze the PCAP file', cost: 20 },
          { id: 2, text: 'Look for HTTP POST requests with form data', cost: 30 },
        ],
        files: ['capture.pcap'],
      },

      // OSINT Challenges
      {
        id: 'osint-001',
        name: 'Photo Location',
        description: 'Where was this photo taken? The flag format is flag{city_name}',
        category: 'OSINT',
        difficulty: 'Easy',
        points: 75,
        flag: 'flag{jakarta}',
        hints: [
          { id: 1, text: 'Check the image metadata (EXIF data)', cost: 15 },
          { id: 2, text: 'Use exiftool or an online EXIF viewer', cost: 20 },
        ],
        files: ['location.jpg'],
      },
      {
        id: 'osint-002',
        name: 'Social Engineering',
        description: 'Find the email address of the CEO of "Example Corporation".',
        category: 'OSINT',
        difficulty: 'Medium',
        points: 100,
        flag: 'flag{ceo@example-corporation.com}',
        hints: [
          { id: 1, text: 'Check LinkedIn and company website', cost: 25 },
          { id: 2, text: 'Use email enumeration tools like hunter.io', cost: 35 },
        ],
      },

      // Privilege Escalation
      {
        id: 'privesc-001',
        name: 'SUID Exploitation',
        description: 'You have a low-privilege shell. Find and exploit a misconfigured SUID binary.',
        category: 'Misc',
        difficulty: 'Medium',
        points: 100,
        flag: 'flag{pr1v_3sc_m4st3r}',
        hints: [
          { id: 1, text: 'Use "find / -perm -4000 2>/dev/null" to find SUID binaries', cost: 20 },
          { id: 2, text: 'Check GTFOBins for exploitation techniques', cost: 30 },
        ],
      },
      {
        id: 'privesc-002',
        name: 'Sudo Misconfiguration',
        description: 'Check your sudo privileges. There might be something exploitable.',
        category: 'Misc',
        difficulty: 'Medium',
        points: 100,
        flag: 'flag{sud0_1s_p0w3rful}',
        hints: [
          { id: 1, text: 'Run "sudo -l" to see your sudo privileges', cost: 20 },
          { id: 2, text: 'Can you run any commands as root?', cost: 25 },
        ],
      },

      // Final Challenge
      {
        id: 'final-001',
        name: 'The Final Boss',
        description: 'Combine all your skills to solve this ultimate challenge. Good luck!',
        category: 'Misc',
        difficulty: 'Expert',
        points: 200,
        flag: 'flag{y0u_4r3_4_h4ck3r_n0w}',
        hints: [
          { id: 1, text: 'This challenge combines web, crypto, and forensics', cost: 40 },
          { id: 2, text: 'Start with reconnaissance, then exploit', cost: 50 },
          { id: 3, text: 'The flag is in multiple parts across different services', cost: 60 },
        ],
        maxAttempts: 10,
      },
    ];

    for (const challenge of defaultChallenges) {
      this.challenges.set(challenge.id, challenge);
    }
  }

  /**
   * Get all challenges
   */
  static getAllChallenges(includeFlags: boolean = false): CTFChallenge[] {
    const challenges = Array.from(this.challenges.values());

    if (!includeFlags) {
      return challenges.map(c => ({
        ...c,
        flag: '***HIDDEN***',
        hints: c.hints.map(h => ({
          ...h,
          text: h.unlocked ? h.text : '🔒 Locked - Use points to unlock',
        })),
      }));
    }

    return challenges;
  }

  /**
   * Get challenges by category
   */
  static getChallengesByCategory(category: CTFCategory): CTFChallenge[] {
    return Array.from(this.challenges.values())
      .filter(c => c.category === category)
      .map(c => ({ ...c, flag: '***HIDDEN***' }));
  }

  /**
   * Get a single challenge
   */
  static getChallenge(challengeId: string, includeFlag: boolean = false): CTFChallenge | null {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) return null;

    if (!includeFlag) {
      return { ...challenge, flag: '***HIDDEN***' };
    }

    return challenge;
  }

  /**
   * Submit a flag
   */
  static submitFlag(
    userId: string,
    challengeId: string,
    submittedFlag: string
  ): { correct: boolean; message: string; pointsAwarded: number } {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) {
      return { correct: false, message: 'Challenge not found', pointsAwarded: 0 };
    }

    // Get or create user progress
    let progress = this.userProgress.get(userId);
    if (!progress) {
      progress = {
        userId,
        totalPoints: 0,
        solvedChallenges: [],
        hintsUnlocked: {},
        attempts: {},
        startedAt: new Date(),
      };
      this.userProgress.set(userId, progress);
    }

    // Check if already solved
    if (progress.solvedChallenges.includes(challengeId)) {
      return { correct: false, message: 'You have already solved this challenge', pointsAwarded: 0 };
    }

    // Check attempt limit
    const currentAttempts = progress.attempts[challengeId] || 0;
    if (challenge.maxAttempts && currentAttempts >= challenge.maxAttempts) {
      return {
        correct: false,
        message: `Maximum attempts (${challenge.maxAttempts}) exceeded for this challenge`,
        pointsAwarded: 0
      };
    }

    // Increment attempts
    progress.attempts[challengeId] = currentAttempts + 1;

    // Normalize flags for comparison
    const normalizedSubmitted = submittedFlag.trim().toLowerCase();
    const normalizedFlag = challenge.flag.trim().toLowerCase();

    // Check if correct
    const isCorrect = normalizedSubmitted === normalizedFlag;

    // Record submission
    const submission: CTFSubmission = {
      challengeId,
      userId,
      submittedFlag,
      isCorrect,
      pointsAwarded: 0,
      hintsUsed: progress.hintsUnlocked[challengeId] || [],
      attemptNumber: progress.attempts[challengeId],
      submittedAt: new Date(),
    };

    if (isCorrect) {
      // Calculate points (subtract hint costs)
      const hintCost = (progress.hintsUnlocked[challengeId] || [])
        .reduce((total, hintId) => {
          const hint = challenge.hints.find(h => h.id === hintId);
          return total + (hint?.cost || 0);
        }, 0);

      const pointsAwarded = Math.max(0, challenge.points - hintCost);
      submission.pointsAwarded = pointsAwarded;

      // Update progress
      progress.solvedChallenges.push(challengeId);
      progress.totalPoints += pointsAwarded;

      // Check if all challenges completed
      if (progress.solvedChallenges.length === this.challenges.size) {
        progress.completedAt = new Date();
      }

      this.submissions.push(submission);

      // Update challenge solve count
      challenge.solves = (challenge.solves || 0) + 1;

      return {
        correct: true,
        message: `🎉 Correct! You earned ${pointsAwarded} points!`,
        pointsAwarded,
      };
    }

    this.submissions.push(submission);

    return {
      correct: false,
      message: `❌ Incorrect flag. Attempts: ${progress.attempts[challengeId]}${challenge.maxAttempts ? `/${challenge.maxAttempts}` : ''
        }`,
      pointsAwarded: 0,
    };
  }

  /**
   * Unlock a hint
   */
  static unlockHint(
    userId: string,
    challengeId: string,
    hintId: number
  ): { success: boolean; message: string; hint?: string; cost?: number } {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) {
      return { success: false, message: 'Challenge not found' };
    }

    const hint = challenge.hints.find(h => h.id === hintId);
    if (!hint) {
      return { success: false, message: 'Hint not found' };
    }

    // Get user progress
    let progress = this.userProgress.get(userId);
    if (!progress) {
      progress = {
        userId,
        totalPoints: 0,
        solvedChallenges: [],
        hintsUnlocked: {},
        attempts: {},
        startedAt: new Date(),
      };
      this.userProgress.set(userId, progress);
    }

    // Check if hint already unlocked
    const unlockedHints = progress.hintsUnlocked[challengeId] || [];
    if (unlockedHints.includes(hintId)) {
      return { success: true, message: 'Hint already unlocked', hint: hint.text, cost: 0 };
    }

    // Unlock hint
    if (!progress.hintsUnlocked[challengeId]) {
      progress.hintsUnlocked[challengeId] = [];
    }
    progress.hintsUnlocked[challengeId].push(hintId);

    return {
      success: true,
      message: `Hint unlocked! (-${hint.cost} points when you solve this challenge)`,
      hint: hint.text,
      cost: hint.cost,
    };
  }

  /**
   * Get user progress
   */
  static getUserProgress(userId: string): CTFUserProgress | null {
    return this.userProgress.get(userId) || null;
  }

  /**
   * Get leaderboard
   */
  static getLeaderboard(limit: number = 10): Array<{
    rank: number;
    userId: string;
    totalPoints: number;
    solvedCount: number;
    completedAt?: Date;
  }> {
    const users = Array.from(this.userProgress.values())
      .sort((a, b) => {
        // Sort by points (descending)
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        // If same points, sort by solve count
        if (b.solvedChallenges.length !== a.solvedChallenges.length) {
          return b.solvedChallenges.length - a.solvedChallenges.length;
        }
        // If same, sort by completion time
        if (a.completedAt && b.completedAt) {
          return a.completedAt.getTime() - b.completedAt.getTime();
        }
        return 0;
      })
      .slice(0, limit);

    return users.map((user, index) => ({
      rank: index + 1,
      userId: user.userId,
      totalPoints: user.totalPoints,
      solvedCount: user.solvedChallenges.length,
      completedAt: user.completedAt,
    }));
  }

  /**
   * Get statistics
   */
  static getStatistics(): {
    totalChallenges: number;
    totalParticipants: number;
    totalSubmissions: number;
    categoryCounts: Record<CTFCategory, number>;
    difficultyDistribution: Record<string, number>;
  } {
    const challenges = Array.from(this.challenges.values());
    const categoryCounts: Record<string, number> = {};
    const difficultyDistribution: Record<string, number> = {};

    for (const challenge of challenges) {
      categoryCounts[challenge.category] = (categoryCounts[challenge.category] || 0) + 1;
      difficultyDistribution[challenge.difficulty] = (difficultyDistribution[challenge.difficulty] || 0) + 1;
    }

    return {
      totalChallenges: challenges.length,
      totalParticipants: this.userProgress.size,
      totalSubmissions: this.submissions.length,
      categoryCounts: categoryCounts as Record<CTFCategory, number>,
      difficultyDistribution,
    };
  }

  /**
   * Add a custom challenge
   */
  static addChallenge(challenge: CTFChallenge): boolean {
    if (this.challenges.has(challenge.id)) {
      return false;
    }
    this.challenges.set(challenge.id, challenge);
    return true;
  }

  /**
   * Execute CTF command in terminal
   */
  static executeCommand(command: string, userId: string): string {
    const args = command.trim().split(/\s+/);
    const cmd = args[0].toLowerCase();

    switch (cmd) {
      case 'ctf':
        return this.ctfHelp();

      case 'ctf-list':
        return this.listChallenges(args[1]);

      case 'ctf-info':
        return this.challengeInfo(args[1]);

      case 'ctf-progress':
        return this.showProgress(userId);

      case 'ctf-leaderboard':
        return this.showLeaderboard();

      case 'submit-flag':
        if (args.length < 2) {
          return '❌ Usage: submit-flag <flag>';
        }
        // For terminal, assume current challenge context
        return '❌ Please use the web interface to submit flags, or specify challenge: submit-flag <challenge-id> <flag>';

      default:
        return `Unknown CTF command: ${cmd}. Type 'ctf' for help.`;
    }
  }

  private static ctfHelp(): string {
    return `
╔═══════════════════════════════════════════════════════════════╗
║              CTF Challenge System - Help                      ║
╠═══════════════════════════════════════════════════════════════╣
║  Commands:                                                    ║
║  ─────────                                                    ║
║  ctf              - Show this help message                    ║
║  ctf-list [cat]   - List all challenges (optionally by cat)  ║
║  ctf-info <id>    - Show challenge details                    ║
║  ctf-progress     - Show your progress                        ║
║  ctf-leaderboard  - Show top players                          ║
║  submit-flag <id> <flag> - Submit a flag                      ║
║                                                               ║
║  Categories: Web, Crypto, Forensics, OSINT, Misc              ║
╚═══════════════════════════════════════════════════════════════╝
`;
  }

  private static listChallenges(category?: string): string {
    let challenges = Array.from(this.challenges.values());

    if (category) {
      challenges = challenges.filter(
        c => c.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (challenges.length === 0) {
      return `No challenges found${category ? ` in category: ${category}` : ''}.`;
    }

    let output = `\n📋 CTF Challenges${category ? ` - ${category}` : ''}\n`;
    output += '═'.repeat(60) + '\n\n';
    output += 'ID              | Difficulty | Points | Name\n';
    output += '-'.repeat(60) + '\n';

    for (const c of challenges) {
      const diffColor = {
        Easy: '\x1b[32m',
        Medium: '\x1b[33m',
        Hard: '\x1b[31m',
        Expert: '\x1b[35m',
      }[c.difficulty] || '';

      output += `${c.id.padEnd(16)}| ${diffColor}${c.difficulty.padEnd(11)}\x1b[0m| ${String(c.points).padEnd(7)}| ${c.name}\n`;
    }

    output += '\n' + '═'.repeat(60) + '\n';
    output += `Total: ${challenges.length} challenges\n`;

    return output;
  }

  private static challengeInfo(challengeId: string): string {
    if (!challengeId) {
      return '❌ Usage: ctf-info <challenge-id>';
    }

    const challenge = this.challenges.get(challengeId);
    if (!challenge) {
      return `❌ Challenge not found: ${challengeId}`;
    }

    const diffColor = {
      Easy: '\x1b[32m',
      Medium: '\x1b[33m',
      Hard: '\x1b[31m',
      Expert: '\x1b[35m',
    }[challenge.difficulty] || '';

    let output = `
╔═══════════════════════════════════════════════════════════════╗
║  ${challenge.name.padEnd(59)}║
╠═══════════════════════════════════════════════════════════════╣
║  Category:    ${challenge.category.padEnd(46)}║
║  Difficulty:  ${diffColor}${challenge.difficulty}\x1b[0m${' '.repeat(46 - challenge.difficulty.length)}║
║  Points:      ${String(challenge.points).padEnd(46)}║
║  Solves:      ${String(challenge.solves || 0).padEnd(46)}║
╠═══════════════════════════════════════════════════════════════╣
║  Description:                                                 ║
`;

    // Word wrap description
    const desc = challenge.description;
    const lines = [];
    let line = '';
    for (const word of desc.split(' ')) {
      if (line.length + word.length + 1 > 57) {
        lines.push(line);
        line = word;
      } else {
        line = line ? `${line} ${word}` : word;
      }
    }
    if (line) lines.push(line);

    for (const l of lines) {
      output += `║  ${l.padEnd(59)}║\n`;
    }

    output += `╠═══════════════════════════════════════════════════════════════╣\n`;
    output += `║  Hints: ${challenge.hints.length} available (use points to unlock)               ║\n`;
    output += `╚═══════════════════════════════════════════════════════════════╝\n`;

    return output;
  }

  private static showProgress(userId: string): string {
    const progress = this.userProgress.get(userId);

    if (!progress) {
      return `
📊 Your CTF Progress
═══════════════════════════════════════
No progress yet. Start solving challenges!

Use 'ctf-list' to see available challenges.
`;
    }

    const totalChallenges = this.challenges.size;
    const percentage = Math.round((progress.solvedChallenges.length / totalChallenges) * 100);

    return `
📊 Your CTF Progress
═══════════════════════════════════════
Total Points:    ${progress.totalPoints}
Challenges:      ${progress.solvedChallenges.length}/${totalChallenges} (${percentage}%)
Started:         ${progress.startedAt?.toLocaleDateString() || 'N/A'}
${progress.completedAt ? `Completed:       ${progress.completedAt.toLocaleDateString()}` : ''}

Solved Challenges:
${progress.solvedChallenges.length > 0
        ? progress.solvedChallenges.map(id => `  ✅ ${id}`).join('\n')
        : '  (none yet)'}
═══════════════════════════════════════
`;
  }

  private static showLeaderboard(): string {
    const leaderboard = this.getLeaderboard(10);

    if (leaderboard.length === 0) {
      return 'No participants yet. Be the first to solve a challenge!';
    }

    let output = `
🏆 CTF Leaderboard
═══════════════════════════════════════
Rank  | Points | Solved | Player
------|--------|--------|------------------
`;

    for (const entry of leaderboard) {
      const medal = ['🥇', '🥈', '🥉'][entry.rank - 1] || '  ';
      output += `${medal} ${String(entry.rank).padEnd(4)}| ${String(entry.totalPoints).padEnd(7)}| ${String(entry.solvedCount).padEnd(7)}| ${entry.userId}\n`;
    }

    output += '═══════════════════════════════════════\n';

    return output;
  }
}

export default CTFSystem;
