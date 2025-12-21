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

  // Create Session 4 Scenario (UTS - Mid-term Assessment)
  const session4 = await prisma.labSession.findUnique({
    where: { sessionNumber: 4 },
  });

  if (session4) {
    const scenario4 = await prisma.labScenario.create({
      data: {
        sessionId: session4.id,
        scenarioTitle: 'UTS - Comprehensive Reconnaissance & Scanning Assessment',
        scenarioDescription: 'Apply all skills learned in Sessions 1-3. Conduct a complete reconnaissance and scanning operation on Target Corp network. Document findings in a professional penetration testing report.',
        targetInfo: {
          company: 'Target Corporation',
          domain: 'targetcorp.local',
          network: '10.10.10.0/24',
          targets: [
            { ip: '10.10.10.10', role: 'Web Server' },
            { ip: '10.10.10.20', role: 'Database Server' },
            { ip: '10.10.10.30', role: 'Mail Server' },
          ],
        },
        successCriteria: [
          {
            id: 'osint_complete',
            description: 'Complete OSINT reconnaissance on target domain',
            command_pattern: '^(whois|nslookup|dig)\\s+targetcorp\\.local',
            expected_output_keyword: 'Domain',
            points: 15,
            hint: 'Start with WHOIS and DNS enumeration',
          },
          {
            id: 'network_discovery',
            description: 'Discover all active hosts in the network',
            command_pattern: '^nmap\\s+-sn\\s+10\\.10\\.10\\.0/24',
            expected_output_keyword: 'Host is up',
            points: 15,
            hint: 'Use ping scan on the entire subnet',
          },
          {
            id: 'full_port_scan',
            description: 'Perform comprehensive port scan on all targets',
            command_pattern: '^nmap\\s+-sS.*10\\.10\\.10\\.',
            expected_output_keyword: 'open',
            points: 20,
            hint: 'Scan all discovered hosts for open ports',
          },
          {
            id: 'service_enumeration',
            description: 'Enumerate services and versions',
            command_pattern: '^nmap\\s+-sV.*10\\.10\\.10\\.',
            expected_output_keyword: 'VERSION',
            points: 20,
            hint: 'Use version detection on open ports',
          },
          {
            id: 'vulnerability_check',
            description: 'Search for known vulnerabilities',
            command_pattern: '^searchsploit',
            expected_output_keyword: 'Exploit',
            points: 15,
            hint: 'Search exploit database for discovered services',
          },
          {
            id: 'report_generation',
            description: 'Generate professional report',
            command_pattern: '^generate-report',
            expected_output_keyword: 'Report',
            points: 15,
            hint: 'Use report generator to create final report',
          },
        ],
        hints: [
          { level: 1, hint_text: 'Follow the methodology: Recon → Scan → Enumerate → Report', point_penalty: 5 },
          { level: 2, hint_text: 'Use nmap -A for aggressive scan combining multiple techniques', point_penalty: 7 },
          { level: 3, hint_text: 'Check CVE databases for all discovered service versions', point_penalty: 10 },
        ],
        deliverables: {
          report_required: true,
          report_format: 'PDF',
          sections: ['Executive Summary', 'Network Topology', 'Host Inventory', 'Service Analysis', 'Vulnerability Assessment', 'Recommendations'],
        },
        maxPoints: 100,
        isAssessment: true,
        timeLimit: 120, // 2 hours
      },
    });
    console.log('✅ Session 4 (UTS) scenario created');
  }

  // Create Session 6 Scenario (Metasploit & Privilege Escalation)
  const session6 = await prisma.labSession.findUnique({
    where: { sessionNumber: 6 },
  });

  if (session6) {
    const scenario6 = await prisma.labScenario.create({
      data: {
        sessionId: session6.id,
        scenarioTitle: 'Metasploit Framework & Privilege Escalation',
        scenarioDescription: 'Learn to use the Metasploit Framework for exploitation. Gain initial access to the target system, escalate privileges, and maintain access.',
        targetInfo: {
          target: '192.168.56.101',
          os: 'Windows 7 SP1',
          services: {
            '445/tcp': 'Microsoft-DS (SMB)',
            '139/tcp': 'NetBIOS-SSN',
            '3389/tcp': 'RDP',
          },
          vulnerability: 'MS17-010 EternalBlue',
        },
        successCriteria: [
          {
            id: 'msf_start',
            description: 'Start Metasploit Framework',
            command_pattern: '^msfconsole',
            expected_output_keyword: 'metasploit',
            points: 5,
            hint: 'Launch msfconsole to start Metasploit',
          },
          {
            id: 'msf_search',
            description: 'Search for EternalBlue exploit',
            command_pattern: '^search.*ms17.010|eternalblue',
            expected_output_keyword: 'eternalblue',
            points: 10,
            hint: 'Use search command to find exploits',
          },
          {
            id: 'msf_use',
            description: 'Select the exploit module',
            command_pattern: '^use.*ms17_010',
            expected_output_keyword: 'exploit',
            points: 10,
            hint: 'Use the exploit/windows/smb/ms17_010_eternalblue module',
          },
          {
            id: 'msf_options',
            description: 'Configure exploit options',
            command_pattern: '^set\\s+(RHOSTS|LHOST|LPORT)',
            expected_output_keyword: '=>',
            points: 15,
            hint: 'Set RHOSTS to target IP, LHOST to your IP',
          },
          {
            id: 'msf_exploit',
            description: 'Execute the exploit',
            command_pattern: '^(run|exploit)',
            expected_output_keyword: 'session',
            points: 20,
            hint: 'Run the exploit to gain access',
          },
          {
            id: 'meterpreter_sysinfo',
            description: 'Gather system information',
            command_pattern: '^sysinfo',
            expected_output_keyword: 'Computer',
            points: 10,
            hint: 'Use sysinfo to learn about the compromised system',
          },
          {
            id: 'priv_esc',
            description: 'Escalate privileges to SYSTEM',
            command_pattern: '^getsystem',
            expected_output_keyword: 'system',
            points: 20,
            hint: 'Use getsystem to escalate privileges',
          },
          {
            id: 'hashdump',
            description: 'Dump password hashes',
            command_pattern: '^hashdump',
            expected_output_keyword: 'Administrator',
            points: 10,
            hint: 'Use hashdump to extract password hashes',
          },
        ],
        hints: [
          { level: 1, hint_text: 'Start msfconsole and search for ms17-010', point_penalty: 3 },
          { level: 2, hint_text: 'Set RHOSTS to target, LHOST to your attack machine', point_penalty: 5 },
          { level: 3, hint_text: 'After getting shell, use getsystem for privilege escalation', point_penalty: 7 },
        ],
        deliverables: {
          report_required: true,
          report_format: 'PDF',
          sections: ['Exploitation Steps', 'Post-Exploitation', 'Credentials Found', 'Recommendations'],
        },
        maxPoints: 100,
      },
    });
    console.log('✅ Session 6 scenario created');
  }

  // Create Session 7 Scenario (Report Writing & CTF)
  const session7 = await prisma.labSession.findUnique({
    where: { sessionNumber: 7 },
  });

  if (session7) {
    const scenario7 = await prisma.labScenario.create({
      data: {
        sessionId: session7.id,
        scenarioTitle: 'Professional Report Writing & CTF Challenges',
        scenarioDescription: 'Practice professional penetration testing report writing. Complete CTF challenges to demonstrate practical skills.',
        targetInfo: {
          ctf_challenges: [
            { id: 'ctf1', name: 'Hidden Flag', difficulty: 'Easy', points: 50 },
            { id: 'ctf2', name: 'Crypto Challenge', difficulty: 'Medium', points: 100 },
            { id: 'ctf3', name: 'Web Exploitation', difficulty: 'Medium', points: 100 },
            { id: 'ctf4', name: 'Privilege Escalation', difficulty: 'Hard', points: 150 },
            { id: 'ctf5', name: 'Final Boss', difficulty: 'Hard', points: 200 },
          ],
          flags: {
            ctf1: 'flag{h1dd3n_1n_pl41n_s1ght}',
            ctf2: 'flag{b4s364_1s_n0t_3ncrypt10n}',
            ctf3: 'flag{sql1_1s_st1ll_d4ng3r0us}',
            ctf4: 'flag{pr1v_3sc_m4st3r}',
            ctf5: 'flag{y0u_4r3_4_h4ck3r_n0w}',
          },
        },
        successCriteria: [
          {
            id: 'ctf_flag1',
            description: 'Find the hidden flag (CTF Challenge 1)',
            command_pattern: '^submit-flag\\s+flag\\{h1dd3n_1n_pl41n_s1ght\\}',
            expected_output_keyword: 'Correct',
            points: 10,
            hint: 'Look carefully at the source code and comments',
          },
          {
            id: 'ctf_flag2',
            description: 'Solve the crypto challenge (CTF Challenge 2)',
            command_pattern: '^submit-flag\\s+flag\\{b4s364_1s_n0t_3ncrypt10n\\}',
            expected_output_keyword: 'Correct',
            points: 15,
            hint: 'The encoded string looks like Base64',
          },
          {
            id: 'ctf_flag3',
            description: 'Exploit the web vulnerability (CTF Challenge 3)',
            command_pattern: '^submit-flag\\s+flag\\{sql1_1s_st1ll_d4ng3r0us\\}',
            expected_output_keyword: 'Correct',
            points: 20,
            hint: 'Test the login form for SQL injection',
          },
          {
            id: 'ctf_flag4',
            description: 'Escalate privileges (CTF Challenge 4)',
            command_pattern: '^submit-flag\\s+flag\\{pr1v_3sc_m4st3r\\}',
            expected_output_keyword: 'Correct',
            points: 25,
            hint: 'Look for SUID binaries or sudo misconfigurations',
          },
          {
            id: 'ctf_flag5',
            description: 'Complete the final challenge (CTF Challenge 5)',
            command_pattern: '^submit-flag\\s+flag\\{y0u_4r3_4_h4ck3r_n0w\\}',
            expected_output_keyword: 'Correct',
            points: 30,
            hint: 'Combine all techniques learned throughout the course',
          },
        ],
        hints: [
          { level: 1, hint_text: 'Start with the easiest challenge and work your way up', point_penalty: 5 },
          { level: 2, hint_text: 'Use online decoders for encoding challenges', point_penalty: 7 },
          { level: 3, hint_text: 'Review previous session materials for techniques', point_penalty: 10 },
        ],
        deliverables: {
          report_required: true,
          report_format: 'PDF',
          sections: ['CTF Writeup', 'Methodology Used', 'Lessons Learned'],
        },
        maxPoints: 100,
        isCTF: true,
      },
    });
    console.log('✅ Session 7 scenario created');
  }

  // Create Session 8 Scenario (UAS - Final Assessment)
  const session8 = await prisma.labSession.findUnique({
    where: { sessionNumber: 8 },
  });

  if (session8) {
    const scenario8 = await prisma.labScenario.create({
      data: {
        sessionId: session8.id,
        scenarioTitle: 'UAS - Full Penetration Test Simulation',
        scenarioDescription: 'Conduct a complete penetration test from reconnaissance to reporting. Demonstrate mastery of all techniques learned throughout the course.',
        targetInfo: {
          company: 'MegaCorp Industries',
          domain: 'megacorp.local',
          network: '172.16.0.0/24',
          targets: [
            { ip: '172.16.0.10', role: 'Domain Controller', os: 'Windows Server 2016' },
            { ip: '172.16.0.20', role: 'Web Server', os: 'Ubuntu 20.04' },
            { ip: '172.16.0.30', role: 'Database Server', os: 'CentOS 8' },
            { ip: '172.16.0.40', role: 'Mail Server', os: 'Windows Server 2012 R2' },
            { ip: '172.16.0.50', role: 'File Server', os: 'Windows 10' },
          ],
          objectives: [
            'Gain initial foothold on the network',
            'Escalate privileges to Domain Admin',
            'Access sensitive data',
            'Document complete attack path',
          ],
        },
        successCriteria: [
          {
            id: 'recon_phase',
            description: 'Complete reconnaissance phase',
            command_pattern: '^(whois|nslookup|dig).*megacorp',
            expected_output_keyword: 'Domain',
            points: 10,
            hint: 'Start with passive reconnaissance',
          },
          {
            id: 'scan_phase',
            description: 'Complete network scanning phase',
            command_pattern: '^nmap.*172\\.16\\.0\\.',
            expected_output_keyword: 'open',
            points: 15,
            hint: 'Scan all targets for open ports and services',
          },
          {
            id: 'vuln_phase',
            description: 'Complete vulnerability assessment',
            command_pattern: '^(searchsploit|nikto|dirb)',
            expected_output_keyword: 'vulnerability',
            points: 15,
            hint: 'Identify vulnerabilities in discovered services',
          },
          {
            id: 'exploit_phase',
            description: 'Gain initial access',
            command_pattern: '^(msfconsole|exploit|run)',
            expected_output_keyword: 'session',
            points: 20,
            hint: 'Exploit a vulnerability to gain access',
          },
          {
            id: 'privesc_phase',
            description: 'Escalate privileges',
            command_pattern: '^(getsystem|sudo)',
            expected_output_keyword: 'root|system',
            points: 15,
            hint: 'Escalate to highest privileges',
          },
          {
            id: 'lateral_phase',
            description: 'Demonstrate lateral movement',
            command_pattern: '^(psexec|ssh|rdp)',
            expected_output_keyword: 'connected',
            points: 15,
            hint: 'Move to other systems in the network',
          },
          {
            id: 'final_report',
            description: 'Generate comprehensive final report',
            command_pattern: '^generate-report.*final',
            expected_output_keyword: 'Report Generated',
            points: 10,
            hint: 'Create a professional penetration test report',
          },
        ],
        hints: [
          { level: 1, hint_text: 'Follow the penetration testing methodology systematically', point_penalty: 10 },
          { level: 2, hint_text: 'The web server may have a vulnerable application', point_penalty: 15 },
          { level: 3, hint_text: 'Look for credential reuse across systems', point_penalty: 20 },
        ],
        deliverables: {
          report_required: true,
          report_format: 'PDF',
          sections: [
            'Executive Summary',
            'Methodology',
            'Reconnaissance Findings',
            'Vulnerability Analysis',
            'Exploitation Details',
            'Post-Exploitation',
            'Risk Assessment',
            'Recommendations',
            'Appendices',
          ],
        },
        maxPoints: 100,
        isAssessment: true,
        isFinal: true,
        timeLimit: 180, // 3 hours
      },
    });
    console.log('✅ Session 8 (UAS) scenario created');
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
