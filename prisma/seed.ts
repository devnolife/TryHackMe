import { PrismaClient, DifficultyLevel, ValidationType, CommandCategory, CTFCategory, CTFDifficulty } from '@prisma/client';
import bcrypt from 'bcrypt';

// Material content embedded inline to avoid import issues
const labMaterials = {
  // Session 1: Introduction to Ethical Hacking & Reconnaissance
  session1: {
    theoryContent: `
# 📚 Pengenalan Ethical Hacking & Reconnaissance

## 🎯 Apa itu Ethical Hacking?

**Ethical Hacking** (juga disebut Penetration Testing atau "Pentesting") adalah praktik menguji keamanan sistem komputer, jaringan, atau aplikasi dengan izin dari pemiliknya.

### Perbedaan Hacker:
| Tipe | Deskripsi |
|------|-----------|
| **White Hat** | Hacker etis yang bekerja dengan izin |
| **Black Hat** | Hacker jahat tanpa izin |
| **Grey Hat** | Di antara keduanya |

---

## 🔍 Metodologi Penetration Testing

1. **Reconnaissance** - Pengumpulan informasi
2. **Scanning & Enumeration** - Identifikasi target
3. **Gaining Access** - Eksploitasi
4. **Maintaining Access** - Mempertahankan akses
5. **Reporting** - Dokumentasi

---

## 🌐 OSINT (Open Source Intelligence)

Teknik mengumpulkan informasi dari sumber publik:
- Domain & DNS: WHOIS, DNS records
- Search Engines: Google dorks
- Social Media: LinkedIn, Twitter

### Contoh Google Dorks:
\`\`\`
site:example.com filetype:pdf
inurl:admin site:example.com
\`\`\`

---

## ⚖️ Aspek Legal & Etika

✅ Selalu dapatkan **izin tertulis**
✅ Dokumentasikan semua aktivitas
❌ Jangan akses sistem tanpa izin
❌ Jangan memodifikasi data

---

## 📋 Tugas Praktikum

1. Melakukan WHOIS lookup
2. Mengumpulkan informasi DNS
3. Mengidentifikasi subdomain
4. Mendokumentasikan semua temuan

**Target**: example-company.com (192.168.1.100)
`,
    prerequisites: [
      'Pemahaman dasar jaringan komputer (IP, DNS, HTTP)',
      'Familiar dengan command line Linux',
      'Pengetahuan dasar tentang protokol internet',
    ],
    resources: [
      { title: 'OWASP Testing Guide', url: 'https://owasp.org/www-project-web-security-testing-guide/', type: 'documentation' },
      { title: 'OSINT Framework', url: 'https://osintframework.com/', type: 'tool' },
    ],
    keyCommands: [
      { command: 'whois <domain>', description: 'Mencari informasi registrasi domain', example: 'whois example-company.com' },
      { command: 'nslookup <domain>', description: 'Query DNS untuk IP address', example: 'nslookup example-company.com' },
      { command: 'dig <domain>', description: 'Advanced DNS query', example: 'dig example-company.com MX' },
      { command: 'ping <target>', description: 'Test konektivitas', example: 'ping 192.168.1.100' },
    ],
  },

  session2: {
    theoryContent: `
# 🔍 Network Scanning dengan Nmap

## 🎯 Apa itu Network Scanning?

**Network Scanning** adalah proses mengidentifikasi host aktif, port terbuka, dan layanan yang berjalan.

---

## 🛠️ Nmap - Network Mapper

Tool scanning paling populer untuk:
- Host discovery
- Port scanning
- Service detection
- OS detection

---

## 📊 Jenis Port Scan

### SYN Scan (-sS) "Stealth Scan"
- Half-open scan
- Lebih cepat, kurang terdeteksi

### TCP Connect (-sT)
- Full TCP handshake
- Tidak perlu root privilege

---

## 🔢 Port States

| State | Deskripsi |
|-------|-----------|
| **open** | Ada layanan aktif |
| **closed** | Accessible tapi tidak ada layanan |
| **filtered** | Firewall memblokir |

---

## 🎯 Common Ports

| Port | Service |
|------|---------|
| 22 | SSH |
| 80 | HTTP |
| 443 | HTTPS |
| 3306 | MySQL |

---

## 📋 Tugas Praktikum

1. Ping scan untuk host aktif
2. SYN scan pada target
3. Deteksi versi service
4. Identifikasi OS target

**Target**: 192.168.1.100
`,
    prerequisites: [
      'Pemahaman TCP/IP',
      'Pengetahuan port dan protokol',
      'Menyelesaikan Session 1',
    ],
    resources: [
      { title: 'Nmap Documentation', url: 'https://nmap.org/docs.html', type: 'documentation' },
    ],
    keyCommands: [
      { command: 'nmap -sn <target>', description: 'Ping scan', example: 'nmap -sn 192.168.1.0/24' },
      { command: 'nmap -sS <target>', description: 'SYN scan (stealth)', example: 'nmap -sS 192.168.1.100' },
      { command: 'nmap -sV <target>', description: 'Version detection', example: 'nmap -sV 192.168.1.100' },
      { command: 'nmap -A <target>', description: 'Aggressive scan', example: 'nmap -A 192.168.1.100' },
    ],
  },

  session3: {
    theoryContent: `
# 🔐 Vulnerability Assessment & Password Cracking

## 🎯 Vulnerability Assessment

Proses sistematis untuk mengidentifikasi kerentanan keamanan.

---

## 📊 CVE & CVSS

### CVE (Common Vulnerabilities and Exposures)
Format: **CVE-YEAR-NUMBER**

### CVSS Score
| Score | Severity |
|-------|----------|
| 0.1 - 3.9 | Low |
| 4.0 - 6.9 | Medium |
| 7.0 - 8.9 | High |
| 9.0 - 10.0 | Critical |

---

## 🔑 Password Cracking

### Jenis Hash
| Algorithm | Length |
|-----------|--------|
| MD5 | 32 chars |
| SHA-1 | 40 chars |
| SHA-256 | 64 chars |

### Attack Types
1. **Dictionary Attack** - Menggunakan wordlist
2. **Brute Force** - Semua kombinasi
3. **Rainbow Table** - Precomputed hashes

---

## 📋 Tugas Praktikum

1. Cari kerentanan dengan searchsploit
2. Identifikasi hash dengan hashid
3. Crack password dengan john

**Target Hash**: 5d41402abc4b2a76b9719d911017c592 (MD5)
`,
    prerequisites: [
      'Menyelesaikan Session 1 dan 2',
      'Pemahaman dasar kriptografi',
    ],
    resources: [
      { title: 'CVE Database', url: 'https://cve.mitre.org/', type: 'database' },
      { title: 'Exploit Database', url: 'https://www.exploit-db.com/', type: 'database' },
    ],
    keyCommands: [
      { command: 'searchsploit <keyword>', description: 'Mencari exploit', example: 'searchsploit apache 2.4' },
      { command: 'hashid <hash>', description: 'Identifikasi jenis hash', example: "hashid '5d41402abc4b2a76b9719d911017c592'" },
      { command: 'john --wordlist=<file> <hashes>', description: 'Crack password', example: 'john --wordlist=rockyou.txt hashes.txt' },
    ],
  },

  session4: {
    theoryContent: `
# 📝 UTS - Reconnaissance & Scanning Project

## 🎯 Tujuan Ujian

Menguji pemahaman dan kemampuan praktis dalam:
1. Information Gathering (OSINT)
2. Network Scanning
3. Vulnerability Assessment

---

## 📋 Scope

**Target**: demo-company.com (10.0.0.50)

### Deliverables
1. Laporan OSINT
2. Hasil network scanning
3. Daftar kerentanan
4. Rekomendasi mitigasi

---

## 📊 Rubrik Penilaian

| Komponen | Bobot |
|----------|-------|
| OSINT Gathering | 25% |
| Network Scanning | 25% |
| Vulnerability ID | 25% |
| Report Quality | 25% |

---

## ⏱️ Waktu: 120 menit

> 🍀 **Good luck!**
`,
    prerequisites: [
      'Menyelesaikan Session 1-3',
      'Memahami metodologi pentesting',
    ],
    resources: [
      { title: 'Pentest Report Template', url: '#', type: 'template' },
    ],
    keyCommands: [
      { command: 'Semua command dari Session 1-3', description: 'Review semua perintah', example: 'whois, nmap, searchsploit' },
    ],
  },

  session5: {
    theoryContent: `
# 🌐 Web Application Security & SQL Injection

## 🎯 Overview

Web Application Security fokus pada keamanan aplikasi berbasis web.

---

## 💉 SQL Injection

Kerentanan yang memungkinkan penyerang menyisipkan kode SQL berbahaya.

### Attack Examples

#### Authentication Bypass
\`\`\`
Username: admin' --
Password: anything
\`\`\`

#### UNION-based SQLi
\`\`\`
id=1 UNION SELECT username,password FROM users--
\`\`\`

---

## 🔧 SQLMap

Tool otomatis untuk SQL injection.

\`\`\`bash
sqlmap -u "http://target.com/page?id=1" --dbs
sqlmap -u "http://target.com/page?id=1" -D dbname --tables
sqlmap -u "http://target.com/page?id=1" -D dbname -T users --dump
\`\`\`

---

## 🕷️ XSS (Cross-Site Scripting)

\`\`\`html
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
\`\`\`

---

## 📋 Tugas Praktikum

1. Identifikasi titik injeksi SQL
2. Gunakan SQLMap untuk enumerate database
3. Uji kerentanan XSS

**Target**: http://192.168.1.100
`,
    prerequisites: [
      'Menyelesaikan Session 1-4',
      'Pemahaman HTTP/HTTPS',
      'Pengetahuan dasar SQL',
    ],
    resources: [
      { title: 'OWASP Top 10', url: 'https://owasp.org/Top10/', type: 'documentation' },
      { title: 'SQLMap Manual', url: 'https://github.com/sqlmapproject/sqlmap/wiki/Usage', type: 'documentation' },
    ],
    keyCommands: [
      { command: 'sqlmap -u <url> --dbs', description: 'Enumerate databases', example: 'sqlmap -u "http://target.com/page?id=1" --dbs' },
      { command: 'dirb <url>', description: 'Directory bruteforce', example: 'dirb http://target.com' },
    ],
  },

  session6: {
    theoryContent: `
# ⚔️ Metasploit Framework & Privilege Escalation

## 🎯 Apa itu Metasploit?

Platform penetration testing paling populer dan powerful.

---

## 🚀 Basic Workflow

\`\`\`bash
msfconsole                    # Start
search type:exploit windows   # Search
use exploit/windows/smb/...   # Select
show options                  # View options
set RHOSTS 192.168.1.100     # Configure
exploit                       # Execute
\`\`\`

---

## 🐚 Meterpreter Commands

\`\`\`bash
sysinfo          # System info
getuid           # Current user
getsystem        # Privilege escalation
hashdump         # Dump password hashes
shell            # System shell
\`\`\`

---

## 📈 Privilege Escalation

### Windows
- getsystem
- Unquoted service paths
- DLL hijacking

### Linux
- SUID binaries
- Sudo misconfigurations
- Kernel exploits

---

## 📋 Tugas Praktikum

1. Launch msfconsole
2. Search dan select exploit
3. Configure dan execute
4. Privilege escalation

**Target**: 192.168.1.100
`,
    prerequisites: [
      'Menyelesaikan Session 1-5',
      'Pemahaman networking',
      'Pengetahuan OS',
    ],
    resources: [
      { title: 'Metasploit Unleashed', url: 'https://www.offensive-security.com/metasploit-unleashed/', type: 'course' },
    ],
    keyCommands: [
      { command: 'msfconsole', description: 'Start Metasploit', example: 'msfconsole' },
      { command: 'search <keyword>', description: 'Search modules', example: 'search windows smb' },
      { command: 'use <module>', description: 'Select module', example: 'use exploit/windows/smb/ms17_010_eternalblue' },
      { command: 'exploit', description: 'Execute', example: 'exploit' },
    ],
  },

  session7: {
    theoryContent: `
# 📝 Report Writing, Social Engineering & CTF

## 📄 Penetration Testing Report

### Struktur Report
1. **Executive Summary** - Untuk non-teknis
2. **Methodology** - Langkah-langkah
3. **Findings** - Detail temuan
4. **Recommendations** - Rekomendasi

---

## 🎭 Social Engineering

Teknik manipulasi psikologis untuk mendapatkan informasi.

### Techniques
1. **Phishing** - Email palsu
2. **Pretexting** - Skenario palsu
3. **Baiting** - USB berbahaya
4. **Tailgating** - Mengikuti orang

---

## 🏁 CTF (Capture The Flag)

Kompetisi keamanan siber.

### Categories
- Web, Crypto, Forensics
- Reverse Engineering, Pwn
- OSINT, Steganography

### Format Flag
\`\`\`
FLAG{this_is_a_sample_flag}
\`\`\`

---

## 📋 Tugas Praktikum

1. Buat executive summary
2. Selesaikan CTF challenges

**CTF Platform**: Menu CTF
`,
    prerequisites: [
      'Menyelesaikan Session 1-6',
      'Kemampuan menulis teknis',
    ],
    resources: [
      { title: 'CTFtime', url: 'https://ctftime.org/', type: 'platform' },
      { title: 'CyberChef', url: 'https://gchq.github.io/CyberChef/', type: 'tool' },
    ],
    keyCommands: [
      { command: 'ctf list', description: 'Lihat CTF challenges', example: 'ctf list' },
      { command: 'submit-flag <flag>', description: 'Submit flag', example: 'submit-flag FLAG{example}' },
    ],
  },

  session8: {
    theoryContent: `
# 🎓 UAS - Full Penetration Test Simulation

## 🎯 Tujuan Ujian Akhir

Simulasi penetration test lengkap yang menguji semua kemampuan.

---

## 📋 Scope

**Network**: 10.0.0.0/24
- Primary: 10.0.0.50 (Windows)
- Secondary: 10.0.0.51 (Linux Web)
- Tertiary: 10.0.0.52 (Database)

---

## 📊 Rubrik Penilaian

| Komponen | Bobot |
|----------|-------|
| Reconnaissance | 15% |
| Scanning | 15% |
| Exploitation | 25% |
| Privilege Escalation | 15% |
| Data Collection | 15% |
| Report Quality | 15% |

---

## ⏱️ Timeline: 3 jam

| Phase | Duration |
|-------|----------|
| Reconnaissance | 30 min |
| Scanning | 45 min |
| Exploitation | 60 min |
| Reporting | 45 min |

---

## 🏆 Flags to Collect

\`\`\`
FLAG{reconnaissance_master}
FLAG{port_scanner_pro}
FLAG{sql_injection_expert}
FLAG{privilege_escalated}
FLAG{final_boss_defeated}
\`\`\`

> 🎓 **Good luck on your final exam!**
`,
    prerequisites: [
      'Menyelesaikan semua Session 1-7',
      'Pemahaman komprehensif pentesting',
    ],
    resources: [
      { title: 'Review semua materi', url: '#', type: 'review' },
    ],
    keyCommands: [
      { command: 'Semua commands', description: 'Gunakan semua pengetahuan', example: 'whois, nmap, sqlmap, msfconsole, dll' },
    ],
  },
};

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
      theoryContent: labMaterials.session1.theoryContent,
      prerequisites: labMaterials.session1.prerequisites,
      resources: labMaterials.session1.resources,
      keyCommands: labMaterials.session1.keyCommands,
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
      theoryContent: labMaterials.session2.theoryContent,
      prerequisites: labMaterials.session2.prerequisites,
      resources: labMaterials.session2.resources,
      keyCommands: labMaterials.session2.keyCommands,
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
      theoryContent: labMaterials.session3.theoryContent,
      prerequisites: labMaterials.session3.prerequisites,
      resources: labMaterials.session3.resources,
      keyCommands: labMaterials.session3.keyCommands,
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
      theoryContent: labMaterials.session4.theoryContent,
      prerequisites: labMaterials.session4.prerequisites,
      resources: labMaterials.session4.resources,
      keyCommands: labMaterials.session4.keyCommands,
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
      theoryContent: labMaterials.session5.theoryContent,
      prerequisites: labMaterials.session5.prerequisites,
      resources: labMaterials.session5.resources,
      keyCommands: labMaterials.session5.keyCommands,
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
      theoryContent: labMaterials.session6.theoryContent,
      prerequisites: labMaterials.session6.prerequisites,
      resources: labMaterials.session6.resources,
      keyCommands: labMaterials.session6.keyCommands,
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
      theoryContent: labMaterials.session7.theoryContent,
      prerequisites: labMaterials.session7.prerequisites,
      resources: labMaterials.session7.resources,
      keyCommands: labMaterials.session7.keyCommands,
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
      theoryContent: labMaterials.session8.theoryContent,
      prerequisites: labMaterials.session8.prerequisites,
      resources: labMaterials.session8.resources,
      keyCommands: labMaterials.session8.keyCommands,
    },
  ];

  for (const session of sessions) {
    const createdSession = await prisma.labSession.upsert({
      where: { sessionNumber: session.sessionNumber },
      update: {
        theoryContent: session.theoryContent,
        prerequisites: session.prerequisites,
        resources: session.resources,
        keyCommands: session.keyCommands,
      },
      create: session,
    });
    console.log(`✅ Lab Session ${session.sessionNumber} created/updated: ${session.title}`);
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
          primary_target: '192.168.1.100',
          services: {
            'Apache 2.4.6': ['CVE-2021-41773', 'CVE-2021-42013'],
            'OpenSSH 7.4': ['CVE-2018-15473'],
            'MySQL 5.7.33': ['CVE-2021-2194'],
          },
          password_hashes: [
            '5f4dcc3b5aa765d61d8327deb882cf99',
            '098f6bcd4621d373cade4e832627b4f6',
          ],
          note: 'Analyze vulnerabilities in services running on target 192.168.1.100',
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
      },
    });
    console.log('✅ Session 8 (UAS) scenario created');
  }

  // --- Seed CTF Challenges ---
  console.log('Seeding CTF challenges...');

  const ctfChallenges: {
    challengeId: string;
    name: string;
    description: string;
    category: CTFCategory;
    difficulty: CTFDifficulty;
    points: number;
    flag: string;
    hints: { id: number; text: string; cost: number }[];
    isActive: boolean;
  }[] = [
      // Web Challenges
      {
        challengeId: 'web-001',
        name: 'Hidden in Plain Sight',
        description: 'The flag is hidden somewhere on this page. Can you find it? Check the source carefully.',
        category: CTFCategory.WEB,
        difficulty: CTFDifficulty.EASY,
        points: 50,
        flag: 'flag{h1dd3n_1n_pl41n_s1ght}',
        hints: [
          { id: 1, text: 'Have you checked the HTML comments?', cost: 10 },
          { id: 2, text: 'Look at the page source with Ctrl+U', cost: 15 },
        ],
        isActive: true,
      },
      {
        challengeId: 'web-002',
        name: 'Cookie Monster',
        description: 'Cookies are delicious, but some contain secrets. Can you find the hidden cookie?',
        category: CTFCategory.WEB,
        difficulty: CTFDifficulty.EASY,
        points: 75,
        flag: 'flag{c00k13_m0nst3r_l0v3s_s3cr3ts}',
        hints: [
          { id: 1, text: 'Use browser developer tools to inspect cookies', cost: 15 },
          { id: 2, text: 'The flag is base64 encoded in a cookie', cost: 20 },
        ],
        isActive: true,
      },
      {
        challengeId: 'web-003',
        name: 'SQL Injection 101',
        description: 'This login form seems vulnerable. Can you bypass the authentication?',
        category: CTFCategory.WEB,
        difficulty: CTFDifficulty.MEDIUM,
        points: 100,
        flag: 'flag{sql1_1s_st1ll_d4ng3r0us}',
        hints: [
          { id: 1, text: "Try entering a single quote (') in the username field", cost: 20 },
          { id: 2, text: "Classic payload: ' OR '1'='1", cost: 30 },
        ],
        isActive: true,
      },
      {
        challengeId: 'web-004',
        name: 'XSS Adventure',
        description: 'This search feature reflects user input. Can you make it execute JavaScript?',
        category: CTFCategory.WEB,
        difficulty: CTFDifficulty.MEDIUM,
        points: 100,
        flag: 'flag{xss_1s_3v3rywh3r3}',
        hints: [
          { id: 1, text: 'Try injecting script tags', cost: 20 },
          { id: 2, text: '<script>alert(document.cookie)</script>', cost: 35 },
        ],
        isActive: true,
      },
      {
        challengeId: 'web-005',
        name: 'API Explorer',
        description: 'This API has some hidden endpoints. Can you find and exploit them?',
        category: CTFCategory.WEB,
        difficulty: CTFDifficulty.HARD,
        points: 150,
        flag: 'flag{4p1_s3cur1ty_m4tt3rs}',
        hints: [
          { id: 1, text: 'Try accessing /api/admin endpoints', cost: 30 },
          { id: 2, text: 'Check for IDOR vulnerabilities in user endpoints', cost: 40 },
        ],
        isActive: true,
      },
      // Crypto Challenges
      {
        challengeId: 'crypto-001',
        name: 'Base64 Basics',
        description: 'This message is encoded. Decode it to find the flag: ZmxhZ3tiNHMzNjRfMXNfbjB0XzNuY3J5cHQxMG59',
        category: CTFCategory.CRYPTO,
        difficulty: CTFDifficulty.EASY,
        points: 50,
        flag: 'flag{b4s364_1s_n0t_3ncrypt10n}',
        hints: [
          { id: 1, text: 'This is not encryption, just encoding', cost: 10 },
          { id: 2, text: 'Use an online Base64 decoder', cost: 15 },
        ],
        isActive: true,
      },
      {
        challengeId: 'crypto-002',
        name: 'ROT13 Rotation',
        description: 'Julius Caesar would be proud. Decode: synt{e0g13_1f_abg_frpher}',
        category: CTFCategory.CRYPTO,
        difficulty: CTFDifficulty.EASY,
        points: 50,
        flag: 'flag{r0t13_1s_not_secure}',
        hints: [
          { id: 1, text: 'This is a substitution cipher with rotation', cost: 10 },
          { id: 2, text: 'Each letter is shifted by 13 positions', cost: 15 },
        ],
        isActive: true,
      },
      {
        challengeId: 'crypto-003',
        name: 'Hash Cracker',
        description: 'Crack this MD5 hash to find the flag: 5f4dcc3b5aa765d61d8327deb882cf99',
        category: CTFCategory.CRYPTO,
        difficulty: CTFDifficulty.MEDIUM,
        points: 100,
        flag: 'flag{password}',
        hints: [
          { id: 1, text: 'This is an MD5 hash of a common password', cost: 20 },
          { id: 2, text: 'Try using an online hash lookup service', cost: 30 },
        ],
        isActive: true,
      },
      {
        challengeId: 'crypto-004',
        name: 'RSA Challenge',
        description: 'We intercepted this RSA-encrypted message. The public key seems weak... n=323, e=5, c=256',
        category: CTFCategory.CRYPTO,
        difficulty: CTFDifficulty.HARD,
        points: 150,
        flag: 'flag{sm4ll_pr1m3s_4r3_b4d}',
        hints: [
          { id: 1, text: 'n is small enough to factor manually', cost: 30 },
          { id: 2, text: 'n = 17 × 19, now calculate φ(n) and d', cost: 50 },
        ],
        isActive: true,
      },
      // Forensics Challenges
      {
        challengeId: 'forensics-001',
        name: 'Strings Attached',
        description: 'This binary file contains a hidden flag. Can you find it?',
        category: CTFCategory.FORENSICS,
        difficulty: CTFDifficulty.EASY,
        points: 50,
        flag: 'flag{str1ngs_r3v34l_s3cr3ts}',
        hints: [
          { id: 1, text: 'Use the strings command on Linux', cost: 10 },
          { id: 2, text: 'strings file.bin | grep flag', cost: 15 },
        ],
        isActive: true,
      },
      {
        challengeId: 'forensics-002',
        name: 'PCAP Analysis',
        description: 'We captured some network traffic. Find the exfiltrated data.',
        category: CTFCategory.FORENSICS,
        difficulty: CTFDifficulty.MEDIUM,
        points: 100,
        flag: 'flag{p4ck3t_c4ptur3_pr0}',
        hints: [
          { id: 1, text: 'Use Wireshark to analyze the PCAP file', cost: 20 },
          { id: 2, text: 'Look for HTTP POST requests with form data', cost: 30 },
        ],
        isActive: true,
      },
      // OSINT Challenges
      {
        challengeId: 'osint-001',
        name: 'Photo Location',
        description: 'Where was this photo taken? The flag format is flag{city_name}',
        category: CTFCategory.OSINT,
        difficulty: CTFDifficulty.EASY,
        points: 75,
        flag: 'flag{jakarta}',
        hints: [
          { id: 1, text: 'Check the image metadata (EXIF data)', cost: 15 },
          { id: 2, text: 'Use exiftool or an online EXIF viewer', cost: 20 },
        ],
        isActive: true,
      },
      {
        challengeId: 'osint-002',
        name: 'Social Engineering',
        description: 'Find the email address of the CEO of "Example Corporation".',
        category: CTFCategory.OSINT,
        difficulty: CTFDifficulty.MEDIUM,
        points: 100,
        flag: 'flag{ceo@example-corporation.com}',
        hints: [
          { id: 1, text: 'Check LinkedIn and company website', cost: 25 },
          { id: 2, text: 'Use email enumeration tools like hunter.io', cost: 35 },
        ],
        isActive: true,
      },
      // Misc/PrivEsc Challenges
      {
        challengeId: 'privesc-001',
        name: 'SUID Exploitation',
        description: 'You have a low-privilege shell. Find and exploit a misconfigured SUID binary.',
        category: CTFCategory.MISC,
        difficulty: CTFDifficulty.MEDIUM,
        points: 100,
        flag: 'flag{pr1v_3sc_m4st3r}',
        hints: [
          { id: 1, text: 'Use "find / -perm -4000 2>/dev/null" to find SUID binaries', cost: 20 },
          { id: 2, text: 'Check GTFOBins for exploitation techniques', cost: 30 },
        ],
        isActive: true,
      },
      {
        challengeId: 'privesc-002',
        name: 'Sudo Misconfiguration',
        description: 'Check your sudo privileges. There might be something exploitable.',
        category: CTFCategory.MISC,
        difficulty: CTFDifficulty.MEDIUM,
        points: 100,
        flag: 'flag{sud0_1s_p0w3rful}',
        hints: [
          { id: 1, text: 'Run "sudo -l" to see your sudo privileges', cost: 20 },
          { id: 2, text: 'Can you run any commands as root?', cost: 25 },
        ],
        isActive: true,
      },
      // Final Challenge
      {
        challengeId: 'final-001',
        name: 'The Final Boss',
        description: 'Combine all your skills to solve this ultimate challenge. Good luck!',
        category: CTFCategory.MISC,
        difficulty: CTFDifficulty.EXPERT,
        points: 200,
        flag: 'flag{y0u_4r3_4_h4ck3r_n0w}',
        hints: [
          { id: 1, text: 'This challenge combines web, crypto, and forensics', cost: 40 },
          { id: 2, text: 'Start with reconnaissance, then exploit', cost: 50 },
          { id: 3, text: 'The flag is in multiple parts across different services', cost: 60 },
        ],
        isActive: true,
      },
    ];

  for (const challenge of ctfChallenges) {
    await prisma.cTFChallenge.upsert({
      where: { challengeId: challenge.challengeId },
      update: {
        name: challenge.name,
        description: challenge.description,
        category: challenge.category,
        difficulty: challenge.difficulty,
        points: challenge.points,
        flag: challenge.flag,
        hints: challenge.hints,
        isActive: challenge.isActive,
      },
      create: challenge,
    });
  }
  console.log('✅ CTF challenges seeded');

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
