/**
 * Report Generator
 * Generate professional penetration testing reports
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ReportSection {
  title: string;
  content: string;
  subsections?: ReportSection[];
}

export interface ReportData {
  title: string;
  studentName: string;
  studentId: string;
  labTitle: string;
  sessionNumber: number;
  generatedAt: Date;
  executiveSummary: string;
  methodology: string;
  scope: string;
  findings: Finding[];
  vulnerabilities: Vulnerability[];
  recommendations: Recommendation[];
  conclusion: string;
  appendices: Appendix[];
}

export interface Finding {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  description: string;
  evidence: string;
  impact: string;
  remediation: string;
  cvss?: number;
}

export interface Vulnerability {
  id: string;
  name: string;
  cve?: string;
  severity: string;
  description: string;
  affectedSystem: string;
  recommendation: string;
}

export interface Recommendation {
  id: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  implementation: string;
  timeline: string;
}

export interface Appendix {
  title: string;
  content: string;
}

export class ReportGenerator {
  /**
   * Generate a comprehensive penetration testing report
   */
  static async generateReport(
    studentId: string,
    sessionId: string,
    reportType: 'SESSION_REPORT' | 'FINAL_REPORT'
  ): Promise<ReportData> {
    // Get student info
    const student = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // Get session info
    const session = await prisma.labSession.findUnique({
      where: { id: sessionId },
      include: {
        scenarios: true,
      },
    });

    if (!session) {
      throw new Error('Lab session not found');
    }

    // Get student progress
    const progress = await prisma.studentProgress.findMany({
      where: {
        studentId,
        sessionId,
      },
      include: {
        scenario: true,
      },
    });

    // Get command history
    const commands = await prisma.commandHistory.findMany({
      where: {
        studentId,
        scenario: {
          sessionId,
        },
      },
      orderBy: {
        commandTimestamp: 'asc',
      },
      include: {
        scenario: true,
      },
    });

    // Generate report sections
    const executiveSummary = this.generateExecutiveSummary(session, progress);
    const methodology = this.generateMethodology(session);
    const scope = this.generateScope(session);
    const findings = this.generateFindings(commands, progress);
    const vulnerabilities = this.generateVulnerabilities(session, commands);
    const recommendations = this.generateRecommendations(vulnerabilities);
    const conclusion = this.generateConclusion(progress, findings);
    const appendices = this.generateAppendices(commands);

    return {
      title: `Penetration Testing Report - ${session.title}`,
      studentName: student.fullName,
      studentId: student.studentId || 'N/A',
      labTitle: session.title,
      sessionNumber: session.sessionNumber,
      generatedAt: new Date(),
      executiveSummary,
      methodology,
      scope,
      findings,
      vulnerabilities,
      recommendations,
      conclusion,
      appendices,
    };
  }

  private static generateExecutiveSummary(session: any, progress: any[]): string {
    const totalPoints = progress.reduce((sum, p) => sum + p.totalPoints, 0);
    const maxPoints = progress.reduce((sum, p) => sum + p.maxPoints, 0);
    const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

    return `
This report presents the findings from the ${session.title} penetration testing exercise.
The assessment was conducted as part of the Ethical Hacking and Penetration Testing course.

Key Findings:
- Total scenarios completed: ${progress.filter(p => p.status === 'COMPLETED').length} of ${progress.length}
- Overall score: ${totalPoints} out of ${maxPoints} points (${percentage}%)
- Assessment duration: ${session.estimatedDurationMinutes} minutes
- Difficulty level: ${session.difficultyLevel}

This report outlines the methodology used, findings discovered, vulnerabilities identified,
and recommendations for remediation. The assessment followed industry-standard penetration
testing methodologies and best practices.
    `.trim();
  }

  private static generateMethodology(session: any): string {
    return `
The penetration testing methodology followed for this assessment includes:

1. Information Gathering (Reconnaissance)
   - Open Source Intelligence (OSINT)
   - DNS enumeration
   - Network mapping

2. Scanning and Enumeration
   - Port scanning
   - Service identification
   - Version detection
   - OS fingerprinting

3. Vulnerability Analysis
   - CVE database research
   - Vulnerability scanning
   - Manual testing

4. Exploitation
   - Proof of concept development
   - Exploit execution
   - Access verification

5. Post-Exploitation
   - Privilege escalation attempts
   - Lateral movement assessment
   - Data exfiltration scenarios

6. Reporting
   - Documentation of findings
   - Risk assessment
   - Remediation recommendations

All testing was performed in a controlled, simulated environment following ethical guidelines
and with proper authorization.
    `.trim();
  }

  private static generateScope(session: any): string {
    const targets = session.scenarios.map((s: any) => {
      const info = s.targetInfo;
      return `- ${info.company || info.domain || info.network || 'Target System'}`;
    }).join('\n');

    return `
Testing Scope:

In-Scope Targets:
${targets}

Testing Period: ${session.estimatedDurationMinutes / 60} hours

Rules of Engagement:
- Only approved targets within the lab environment
- No denial of service attacks
- All activities logged and monitored
- Data confidentiality maintained
- Ethical hacking principles followed

Out of Scope:
- Production systems
- Third-party systems
- Social engineering attacks
- Physical security testing
    `.trim();
  }

  private static generateFindings(commands: any[], progress: any[]): Finding[] {
    const findings: Finding[] = [];

    // Analyze commands for findings
    const successfulCommands = commands.filter(cmd => cmd.isValid);

    if (successfulCommands.some(cmd => cmd.commandText.includes('nmap'))) {
      findings.push({
        id: 'F001',
        title: 'Open Ports Discovered',
        severity: 'High',
        description: 'Multiple open ports were discovered on the target system during network scanning.',
        evidence: 'Nmap scan results showing ports 22, 80, 443, 3306, and 5432 open.',
        impact: 'Open ports increase the attack surface and may expose vulnerable services to potential exploitation.',
        remediation: 'Close unnecessary ports, implement firewall rules, and ensure only required services are exposed.',
        cvss: 7.5,
      });
    }

    if (successfulCommands.some(cmd => cmd.commandText.includes('sqlmap'))) {
      findings.push({
        id: 'F002',
        title: 'SQL Injection Vulnerability',
        severity: 'Critical',
        description: 'SQL injection vulnerability discovered in web application input fields.',
        evidence: 'SQLMap successfully exploited parameter "id" with boolean-based blind injection.',
        impact: 'Attacker can extract database contents, modify data, or execute commands on the database server.',
        remediation: 'Implement prepared statements, input validation, and parameterized queries.',
        cvss: 9.8,
      });
    }

    if (successfulCommands.some(cmd => cmd.commandText.includes('john') || cmd.commandText.includes('hashcat'))) {
      findings.push({
        id: 'F003',
        title: 'Weak Password Hashes Cracked',
        severity: 'High',
        description: 'Password hashes were successfully cracked using dictionary attacks.',
        evidence: 'Multiple MD5 hashes cracked within minutes using john the ripper.',
        impact: 'Compromised credentials allow unauthorized access to user accounts and sensitive data.',
        remediation: 'Enforce strong password policies, use bcrypt/argon2, implement MFA.',
        cvss: 8.1,
      });
    }

    return findings;
  }

  private static generateVulnerabilities(session: any, commands: any[]): Vulnerability[] {
    const vulns: Vulnerability[] = [];

    if (session.sessionNumber === 2 || commands.some(cmd => cmd.commandText.includes('nmap'))) {
      vulns.push({
        id: 'VULN-001',
        name: 'Outdated Apache Version',
        cve: 'CVE-2021-41773',
        severity: 'High',
        description: 'Apache HTTP Server 2.4.6 is running with known vulnerabilities.',
        affectedSystem: '192.168.1.100:80',
        recommendation: 'Upgrade Apache to version 2.4.51 or later.',
      });
    }

    if (session.sessionNumber === 3 || commands.some(cmd => cmd.commandText.includes('searchsploit'))) {
      vulns.push({
        id: 'VULN-002',
        name: 'MySQL Denial of Service',
        cve: 'CVE-2021-2194',
        severity: 'Medium',
        description: 'MySQL 5.7.33 is vulnerable to denial of service attacks.',
        affectedSystem: '192.168.1.100:3306',
        recommendation: 'Upgrade MySQL to version 5.7.34 or later.',
      });
    }

    return vulns;
  }

  private static generateRecommendations(vulnerabilities: Vulnerability[]): Recommendation[] {
    const recommendations: Recommendation[] = [
      {
        id: 'REC-001',
        priority: 'Critical',
        title: 'Patch Management Program',
        description: 'Establish a comprehensive patch management program to keep all systems up to date.',
        implementation: 'Schedule monthly security updates, test patches in staging before production deployment.',
        timeline: 'Immediate - Within 1 week',
      },
      {
        id: 'REC-002',
        priority: 'High',
        title: 'Web Application Security',
        description: 'Implement secure coding practices and input validation for all web applications.',
        implementation: 'Use OWASP guidelines, implement WAF, conduct security code reviews.',
        timeline: '2-4 weeks',
      },
      {
        id: 'REC-003',
        priority: 'High',
        title: 'Password Policy Enhancement',
        description: 'Strengthen password policies and implement multi-factor authentication.',
        implementation: 'Enforce minimum 12 characters, complexity requirements, MFA for all accounts.',
        timeline: '1-2 weeks',
      },
      {
        id: 'REC-004',
        priority: 'Medium',
        title: 'Network Segmentation',
        description: 'Implement network segmentation to limit lateral movement.',
        implementation: 'Create VLANs, implement firewall rules between segments.',
        timeline: '4-6 weeks',
      },
    ];

    return recommendations;
  }

  private static generateConclusion(progress: any[], findings: Finding[]): string {
    const completionRate = progress.filter(p => p.status === 'COMPLETED').length / progress.length * 100;
    const criticalFindings = findings.filter(f => f.severity === 'Critical').length;
    const highFindings = findings.filter(f => f.severity === 'High').length;

    return `
This penetration testing assessment has identified ${findings.length} significant findings,
including ${criticalFindings} critical and ${highFindings} high severity issues.
The assessment achieved a ${completionRate.toFixed(0)}% completion rate.

Key Takeaways:
- Security posture requires immediate attention for critical vulnerabilities
- Several common security misconfigurations were identified
- Patch management and secure coding practices need improvement
- Defense-in-depth strategy should be implemented

Recommendations have been prioritized based on risk and impact. Implementation of the
recommended controls will significantly improve the security posture of the assessed systems.

It is recommended to conduct regular security assessments and penetration tests to ensure
continued security and compliance with industry standards.
    `.trim();
  }

  private static generateAppendices(commands: any[]): Appendix[] {
    const appendices: Appendix[] = [];

    // Command history
    const commandList = commands
      .slice(0, 20)
      .map(cmd => `${cmd.commandTimestamp.toLocaleString()}: ${cmd.commandText}`)
      .join('\n');

    appendices.push({
      title: 'Appendix A: Command History',
      content: commandList || 'No commands executed',
    });

    // Tools used
    const toolsUsed = Array.from(new Set(commands.map(cmd => cmd.commandText.split(' ')[0])));

    appendices.push({
      title: 'Appendix B: Tools Used',
      content: toolsUsed.join(', ') || 'N/A',
    });

    return appendices;
  }
}
