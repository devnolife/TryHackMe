import { PrismaClient, DifficultyLevel, ValidationType, CommandCategory } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ethicalhacking.lab' },
    update: {},
    create: {
      email: 'admin@ethicalhacking.lab',
      password: adminPassword,
      fullName: 'System Administrator',
      role: 'ADMIN',
      department: 'IT Department',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create instructor user
  const instructorPassword = await bcrypt.hash('instructor123', 10);
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@ethicalhacking.lab' },
    update: {},
    create: {
      email: 'instructor@ethicalhacking.lab',
      password: instructorPassword,
      fullName: 'Dr. Instructor',
      role: 'INSTRUCTOR',
      department: 'Computer Science',
    },
  });
  console.log('✅ Instructor user created:', instructor.email);

  // Create demo student
  const studentPassword = await bcrypt.hash('student123', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student@ethicalhacking.lab' },
    update: {},
    create: {
      email: 'student@ethicalhacking.lab',
      password: studentPassword,
      fullName: 'Demo Student',
      role: 'STUDENT',
      studentId: 'STU001',
      department: 'Computer Science',
    },
  });
  console.log('✅ Demo student created:', student.email);

  // Create Lab Sessions
  const sessions = [
    {
      sessionNumber: 1,
      title: 'Introduction to Ethical Hacking & Reconnaissance',
      description: 'Learn the fundamentals of ethical hacking methodology, information gathering (OSINT) techniques, and understand the legal and ethical framework.',
      topic: 'OSINT & Reconnaissance',
      learningObjectives: [
        'Understand ethical hacking methodology',
        'Learn information gathering (OSINT) techniques',
        'Understand legal and ethical framework',
        'Practice reconnaissance tools',
      ],
      estimatedDurationMinutes: 1200, // 2 weeks
      difficultyLevel: DifficultyLevel.BEGINNER,
      displayOrder: 1,
    },
    {
      sessionNumber: 2,
      title: 'Network Scanning with Nmap',
      description: 'Master network scanning techniques, port scanning methodologies, identify services running on target, and understand scanning evasion concepts.',
      topic: 'Network Scanning',
      learningObjectives: [
        'Master network scanning techniques',
        'Learn port scanning methodologies',
        'Identify services running on target',
        'Understand scanning evasion concepts',
      ],
      estimatedDurationMinutes: 1200,
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      displayOrder: 2,
    },
    {
      sessionNumber: 3,
      title: 'Vulnerability Assessment & Password Cracking',
      description: 'Learn vulnerability assessment methodology, search and interpret CVE databases, understand password cracking techniques.',
      topic: 'Vulnerability Assessment',
      learningObjectives: [
        'Learn vulnerability assessment methodology',
        'Search and interpret CVE databases',
        'Understand password cracking techniques',
        'Learn hash types and cracking methods',
      ],
      estimatedDurationMinutes: 1200,
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      displayOrder: 3,
    },
    {
      sessionNumber: 4,
      title: 'UTS - Reconnaissance & Scanning Project',
      description: 'Apply all skills from Sessions 1-3, conduct end-to-end reconnaissance, and create professional penetration testing report.',
      topic: 'Mid-Term Assessment',
      learningObjectives: [
        'Apply all skills from Sessions 1-3',
        'Conduct end-to-end reconnaissance',
        'Create professional penetration testing report',
        'Demonstrate understanding of methodology',
      ],
      estimatedDurationMinutes: 1200,
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      displayOrder: 4,
    },
    {
      sessionNumber: 5,
      title: 'Web Application Security & SQL Injection',
      description: 'Understand web application vulnerabilities, learn SQL injection attack techniques, practice exploitation methodology.',
      topic: 'Web Application Security',
      learningObjectives: [
        'Understand web application vulnerabilities',
        'Learn SQL injection attack techniques',
        'Practice exploitation methodology',
        'Understand mitigation strategies',
      ],
      estimatedDurationMinutes: 1200,
      difficultyLevel: DifficultyLevel.ADVANCED,
      displayOrder: 5,
    },
    {
      sessionNumber: 6,
      title: 'Metasploit Framework & Privilege Escalation',
      description: 'Learn Metasploit framework basics, practice privilege escalation techniques, understand post-exploitation activities.',
      topic: 'Exploitation & Privilege Escalation',
      learningObjectives: [
        'Learn Metasploit framework basics',
        'Practice privilege escalation techniques',
        'Understand post-exploitation activities',
        'Learn lateral movement concepts',
      ],
      estimatedDurationMinutes: 1200,
      difficultyLevel: DifficultyLevel.ADVANCED,
      displayOrder: 6,
    },
    {
      sessionNumber: 7,
      title: 'Report Writing, Social Engineering & CTF',
      description: 'Master professional penetration testing report writing, understand social engineering attack vectors, practice CTF challenges.',
      topic: 'Professional Skills',
      learningObjectives: [
        'Master professional penetration testing report writing',
        'Understand social engineering attack vectors',
        'Practice CTF (Capture The Flag) challenges',
        'Develop critical thinking skills',
      ],
      estimatedDurationMinutes: 1200,
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      displayOrder: 7,
    },
    {
      sessionNumber: 8,
      title: 'UAS - Full Penetration Test Simulation',
      description: 'Conduct end-to-end penetration test, demonstrate all learned skills, create professional final report.',
      topic: 'Final Assessment',
      learningObjectives: [
        'Conduct end-to-end penetration test',
        'Demonstrate all learned skills',
        'Create professional final report',
        'Comprehensive assessment',
      ],
      estimatedDurationMinutes: 1200,
      difficultyLevel: DifficultyLevel.ADVANCED,
      displayOrder: 8,
    },
  ];

  for (const session of sessions) {
    const createdSession = await prisma.labSession.upsert({
      where: { sessionNumber: session.sessionNumber },
      update: {},
      create: session,
    });
    console.log(`✅ Lab Session ${session.sessionNumber} created: ${session.title}`);
  }

  // Create Session 1 Scenario
  const session1 = await prisma.labSession.findUnique({
    where: { sessionNumber: 1 },
  });

  if (session1) {
    const scenario1 = await prisma.labScenario.create({
      data: {
        sessionId: session1.id,
        scenarioTitle: 'OSINT Intelligence Gathering - ABC Corporation',
        scenarioDescription: 'Perform initial reconnaissance and gather intelligence on ABC Corporation (example-company.com). Your mission is to collect as much information as possible using OSINT techniques without directly interacting with the target systems.',
        targetInfo: {
          company: 'ABC Corporation',
          domain: 'example-company.com',
          ip_address: '192.168.1.100',
          services: ['HTTP', 'HTTPS', 'SSH', 'FTP'],
        },
        successCriteria: [
          {
            id: 'whois_lookup',
            description: 'Perform WHOIS lookup on target domain',
            command_pattern: '^whois\\s+example-company\\.com$',
            expected_output_keyword: 'Registrant',
            points: 10,
            hint: 'Use whois command followed by the domain name',
          },
          {
            id: 'dns_lookup',
            description: 'Perform DNS enumeration',
            command_pattern: '^nslookup\\s+example-company\\.com$',
            expected_output_keyword: 'Address',
            points: 10,
            hint: 'Use nslookup to query DNS records',
          },
          {
            id: 'ip_geolocation',
            description: 'Identify IP geolocation',
            command_pattern: '^geoip\\s+192\\.168\\.1\\.100$',
            expected_output_keyword: 'Location',
            points: 10,
            hint: 'Use geoip command with the IP address',
          },
        ],
        hints: [
          {
            level: 1,
            hint_text: 'Start with basic WHOIS lookup to gather domain registration information',
            point_penalty: 2,
          },
          {
            level: 2,
            hint_text: 'Use nslookup or dig to enumerate DNS records',
            point_penalty: 3,
          },
          {
            level: 3,
            hint_text: 'Try using geoip or similar tools to locate the IP address geographically',
            point_penalty: 5,
          },
        ],
        deliverables: {
          report_required: true,
          report_format: 'PDF',
          sections: ['Executive Summary', 'Findings', 'Recommendations'],
        },
        maxPoints: 100,
      },
    });

    console.log('✅ Session 1 scenario created');

    // Create command database for Session 1
    const commands = [
      {
        scenarioId: scenario1.id,
        commandPattern: '^whois\\s+example-company\\.com$',
        commandDescription: 'WHOIS lookup for domain registration information',
        expectedOutput: `Domain Name: EXAMPLE-COMPANY.COM
Registrant Organization: ABC Corporation
Registrant Email: admin@example-company.com
Name Server: ns1.example-company.com
Name Server: ns2.example-company.com
Creation Date: 2020-01-15
Expiration Date: 2025-01-15`,
        successKeywords: ['Registrant', 'ABC Corporation', 'Name Server'],
        failureMessages: ['Invalid domain', 'Connection failed'],
        pointsAwarded: 10,
        validationType: ValidationType.REGEX,
        commandCategory: CommandCategory.OSINT,
      },
      {
        scenarioId: scenario1.id,
        commandPattern: '^nslookup\\s+example-company\\.com$',
        commandDescription: 'DNS lookup for domain resolution',
        expectedOutput: `Server: 8.8.8.8
Address: 8.8.8.8#53

Non-authoritative answer:
Name: example-company.com
Address: 192.168.1.100`,
        successKeywords: ['Address', '192.168.1.100'],
        failureMessages: ['Domain not found', 'DNS query failed'],
        pointsAwarded: 10,
        validationType: ValidationType.REGEX,
        commandCategory: CommandCategory.OSINT,
      },
      {
        scenarioId: scenario1.id,
        commandPattern: '^geoip\\s+192\\.168\\.1\\.100$',
        commandDescription: 'IP geolocation lookup',
        expectedOutput: `IP Address: 192.168.1.100
Location: Jakarta, Indonesia
ISP: Indonesia Telecommunication
ASN: AS12345
Latitude: -6.2088
Longitude: 106.8456`,
        successKeywords: ['Location', 'Jakarta', 'Indonesia'],
        failureMessages: ['Invalid IP', 'Geolocation service unavailable'],
        pointsAwarded: 10,
        validationType: ValidationType.REGEX,
        commandCategory: CommandCategory.OSINT,
      },
    ];

    for (const cmd of commands) {
      await prisma.commandDatabase.create({ data: cmd });
    }

    console.log('✅ Command database populated for Session 1');
  }

  // Create Session 2 Scenario (Network Scanning)
  const session2 = await prisma.labSession.findUnique({
    where: { sessionNumber: 2 },
  });

  if (session2) {
    const scenario2 = await prisma.labScenario.create({
      data: {
        sessionId: session2.id,
        scenarioTitle: 'Network Scanning - Target Network Assessment',
        scenarioDescription: 'Perform comprehensive network scanning on target network 192.168.1.0/24. Identify active hosts, open ports, running services, and operating systems.',
        targetInfo: {
          network: '192.168.1.0/24',
          primary_target: '192.168.1.100',
          secondary_target: '192.168.1.101',
        },
        successCriteria: [
          {
            id: 'host_discovery',
            description: 'Perform host discovery scan on network',
            command_pattern: '^nmap\\s+-sn\\s+192\\.168\\.1\\.0/24$',
            expected_output_keyword: 'Host is up',
            points: 15,
            hint: 'Use nmap with -sn flag for ping scan',
          },
          {
            id: 'port_scanning',
            description: 'Scan TCP ports on primary target',
            command_pattern: '^nmap\\s+-sS\\s+192\\.168\\.1\\.100$',
            expected_output_keyword: 'open',
            points: 20,
            hint: 'Use nmap -sS for SYN scan',
          },
          {
            id: 'version_detection',
            description: 'Detect service versions',
            command_pattern: '^nmap\\s+-sV\\s+192\\.168\\.1\\.100$',
            expected_output_keyword: 'VERSION',
            points: 20,
            hint: 'Use -sV flag for version detection',
          },
          {
            id: 'os_detection',
            description: 'Identify operating system',
            command_pattern: '^nmap\\s+-O\\s+192\\.168\\.1\\.100$',
            expected_output_keyword: 'OS',
            points: 25,
            hint: 'Use -O flag for OS detection',
          },
        ],
        hints: [
          { level: 1, hint_text: 'Start with ping scan to discover active hosts', point_penalty: 3 },
          { level: 2, hint_text: 'Use SYN scan (-sS) for faster port scanning', point_penalty: 5 },
          { level: 3, hint_text: 'Combine -sV and -O for comprehensive scan', point_penalty: 7 },
        ],
        deliverables: {
          report_required: true,
          report_format: 'PDF',
          sections: ['Network Map', 'Port Inventory', 'Service Analysis'],
        },
        maxPoints: 100,
      },
    });
    console.log('✅ Session 2 scenario created');
  }

  // Create Session 3 Scenario (Vulnerability Assessment)
  const session3 = await prisma.labSession.findUnique({
    where: { sessionNumber: 3 },
  });

  if (session3) {
    const scenario3 = await prisma.labScenario.create({
      data: {
        sessionId: session3.id,
        scenarioTitle: 'Vulnerability Assessment & Password Cracking',
        scenarioDescription: 'Identify vulnerabilities in discovered services and crack password hashes from compromised database.',
        targetInfo: {
          services: {
            'Apache 2.4.6': ['CVE-2021-41773', 'CVE-2021-42013'],
            'OpenSSH 7.4': ['CVE-2018-15473'],
            'MySQL 5.7.33': ['CVE-2021-2194'],
          },
          password_hashes: [
            '5f4dcc3b5aa765d61d8327deb882cf99',
            '098f6bcd4621d373cade4e832627b4f6',
          ],
        },
        successCriteria: [
          {
            id: 'cve_search',
            description: 'Search CVE database for Apache vulnerabilities',
            command_pattern: '^searchsploit\\s+apache\\s+2\\.4',
            expected_output_keyword: 'CVE',
            points: 20,
            hint: 'Use searchsploit to find exploits',
          },
          {
            id: 'hash_identification',
            description: 'Identify hash types',
            command_pattern: '^hashid\\s+',
            expected_output_keyword: 'MD5',
            points: 15,
            hint: 'Use hashid tool to identify hash type',
          },
          {
            id: 'password_crack',
            description: 'Crack password hashes',
            command_pattern: '^(john|hashcat)',
            expected_output_keyword: 'password',
            points: 25,
            hint: 'Use john or hashcat for cracking',
          },
        ],
        hints: [
          { level: 1, hint_text: 'Check CVE databases for known vulnerabilities', point_penalty: 4 },
          { level: 2, hint_text: 'MD5 hashes are 32 characters long', point_penalty: 5 },
        ],
        deliverables: {
          report_required: true,
          report_format: 'PDF',
          sections: ['CVE List', 'Risk Assessment', 'Cracked Passwords'],
        },
        maxPoints: 100,
      },
    });
    console.log('✅ Session 3 scenario created');
  }

  // Create Session 5 Scenario (Web Security)
  const session5 = await prisma.labSession.findUnique({
    where: { sessionNumber: 5 },
  });

  if (session5) {
    const scenario5 = await prisma.labScenario.create({
      data: {
        sessionId: session5.id,
        scenarioTitle: 'Web Application Security Testing',
        scenarioDescription: 'Test web application for SQL Injection and XSS vulnerabilities. Exploit discovered vulnerabilities and document findings.',
        targetInfo: {
          url: 'http://vulnerable-app.local',
          vulnerabilities: ['SQL Injection', 'XSS', 'CSRF'],
        },
        successCriteria: [
          {
            id: 'sqli_detection',
            description: 'Detect SQL injection vulnerability',
            command_pattern: "^sqlmap.*--url",
            expected_output_keyword: 'vulnerable',
            points: 25,
            hint: "Use sqlmap to test for SQL injection",
          },
          {
            id: 'xss_detection',
            description: 'Identify XSS vulnerability',
            command_pattern: '^test-xss',
            expected_output_keyword: 'XSS',
            points: 20,
            hint: 'Test input fields for XSS',
          },
        ],
        hints: [
          { level: 1, hint_text: "Try ' OR '1'='1 for SQL injection", point_penalty: 5 },
          { level: 2, hint_text: 'Test <script>alert(1)</script> for XSS', point_penalty: 5 },
        ],
        deliverables: {
          report_required: true,
          report_format: 'PDF',
          sections: ['Vulnerability Details', 'Exploitation Steps', 'Remediation'],
        },
        maxPoints: 100,
      },
    });
    console.log('✅ Session 5 scenario created');
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
