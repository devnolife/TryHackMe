<div align="center">

# 🛡️ Ethical Hacking Lab Platform

### *Web-Based Learning Management System for Penetration Testing Education*

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-316192?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0+-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0+-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

**Built with ❤️ by [devnolife](https://github.com/devnolife)**

*Universitas Muhammadiyah Makassar | Fakultas Teknik - Informatika*

[Features](#-key-features) • [Demo](#-demo) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

---

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Course Structure](#-course-structure)
- [Screenshots](#-screenshots)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Ethical Hacking Lab Platform** is a comprehensive, browser-based Learning Management System designed specifically for teaching penetration testing and cybersecurity skills. The platform supports **200 concurrent students** and provides a realistic, hands-on learning experience without the need for virtual machines or Docker containers.

### 🌟 Why This Platform?

- **🚀 Zero Installation** - Everything runs in the browser
- **💻 Realistic Simulations** - Real-world command outputs without actual exploitation
- **📊 Automatic Grading** - Instant feedback and scoring
- **🎓 Academic Focus** - Designed for university-level cybersecurity courses
- **🔐 Built-in Security** - Advanced anti-cheat detection and audit logging
- **📈 Progress Tracking** - Comprehensive analytics and performance monitoring

---

## ✨ Key Features

### 🎮 Interactive Learning
- **8 Comprehensive Lab Sessions** covering OSINT, Network Scanning, Vulnerability Assessment, Web Security, and more
- **21+ Simulated Commands** including Nmap, Whois, SQLMap, Metasploit, and penetration testing tools
- **Browser-Based Terminal** powered by xterm.js for authentic command-line experience
- **Real-Time Validation** with instant feedback and point awards
- **Progressive Difficulty** from beginner to advanced topics

### 📊 Student Dashboard
- **Visual Analytics** with interactive charts and graphs (powered by Recharts)
- **Progress Tracking** across all lab sessions
- **Grade Calculator** with transparent breakdown (Attendance 10% + Labs 30% + UTS 25% + UAS 35%)
- **Command History** with execution statistics
- **Professional Reports** - Generate penetration testing reports with CVSS scoring

### 🏆 Gamification
- **Leaderboard System** with overall and session-specific rankings
- **Medal Badges** for top 3 performers (🥇🥈🥉)
- **Point System** rewarding correct answers and penalizing hints
- **Completion Tracking** with visual progress indicators
- **Real-Time Rankings** updated dynamically

### 👨‍🏫 Admin Panel
- **User Management** - Create, edit, delete, and manage student accounts
- **Analytics Dashboard** - Platform-wide statistics and insights
- **Audit Logs Viewer** - Track all system activities and security events
- **Progress Reset** - Reset individual or all student progress
- **Anti-Cheat Monitoring** - View suspicious activity alerts
- **Bulk Operations** - Manage multiple users efficiently

### 🛡️ Advanced Anti-Cheat System
- **Pattern Detection** - Identifies rapid execution, copy-paste, and automation
- **Timing Analysis** - Flags unrealistic completion times
- **IP Monitoring** - Detects suspicious IP address changes
- **Command Validation** - Recognizes brute force and duplicate patterns
- **Suspicion Scoring** - 4-level threat assessment (LOW, MEDIUM, HIGH, CRITICAL)
- **Automated Alerts** - Real-time notifications for instructors

### 📝 Report Generation
- **Professional Templates** - Industry-standard pentest report format
- **Automatic Generation** - Based on student lab performance
- **Comprehensive Sections** - Executive Summary, Findings, Vulnerabilities, Recommendations
- **CVSS Scoring** - Severity classification (Critical, High, Medium, Low)
- **Print Optimization** - Ready for PDF export
- **Evidence Tracking** - Includes command outputs and screenshots

---

## 🛠 Technology Stack

<div align="center">

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript 5+ |
| **Styling** | Tailwind CSS 3.0+, shadcn/ui components |
| **Backend** | Next.js API Routes, Node.js 18+ |
| **Database** | PostgreSQL 14+ with Prisma ORM 5.0+ |
| **Authentication** | JWT + bcrypt (10 rounds) |
| **Terminal** | xterm.js with FitAddon |
| **Charts** | Recharts for data visualization |
| **Security** | Anti-CSRF, Rate limiting, Input sanitization |
| **DevOps** | Git, Docker (optional), Vercel-ready |

</div>

---

## 🏗 Architecture

```mermaid
graph TB
    A[Client Browser] --> B[Next.js Frontend]
    B --> C[Next.js API Routes]
    C --> D[Authentication Middleware]
    D --> E[Prisma ORM]
    E --> F[PostgreSQL Database]
    C --> G[Command Router]
    G --> H[OSINT Simulator]
    G --> I[Nmap Simulator]
    G --> J[Vuln Scanner Simulator]
    G --> K[Web Exploit Simulator]
    C --> L[Anti-Cheat Engine]
    C --> M[Scoring Engine]
    C --> N[Report Generator]
```

### 📂 Project Structure

```
ethical-hacking-lab-platform/
├── app/
│   ├── (auth)/                    # Authentication pages
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/               # Protected dashboard routes
│   │   ├── page.tsx              # Main dashboard
│   │   ├── labs/                 # Lab sessions
│   │   ├── progress/             # Progress tracking
│   │   ├── reports/              # Report viewer
│   │   ├── leaderboard/          # Rankings
│   │   └── admin/                # Admin panel
│   │       ├── page.tsx          # Analytics dashboard
│   │       ├── users/            # User management
│   │       └── audit-logs/       # Audit log viewer
│   └── api/                      # API routes
│       ├── auth/                 # Authentication endpoints
│       ├── labs/                 # Lab management
│       ├── commands/             # Command execution
│       ├── progress/             # Progress tracking
│       ├── reports/              # Report generation
│       ├── leaderboard/          # Rankings
│       └── admin/                # Admin endpoints
├── components/
│   ├── terminal/                 # Terminal emulator
│   ├── dashboard/                # Dashboard components
│   └── shared/                   # Reusable components
├── lib/
│   ├── simulation/               # Command simulators
│   │   ├── osint-simulator.ts
│   │   ├── nmap-simulator.ts
│   │   ├── vuln-simulator.ts
│   │   ├── web-simulator.ts
│   │   └── command-router.ts
│   ├── scoring/                  # Scoring engine
│   ├── anti-cheat/               # Anti-cheat detection
│   ├── report-generation/        # Report templates
│   ├── auth.ts                   # Auth utilities
│   ├── middleware.ts             # Request middleware
│   └── db.ts                     # Prisma client
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Seed data
└── public/                       # Static assets
```

---

## 🚀 Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **PostgreSQL** 14.x or higher
- **npm** or **pnpm** package manager
- **Git** for version control

### Step-by-Step Guide

1. **Clone the repository**

```bash
git clone https://github.com/devnolife/tryhackme.git
cd tryhackme
```

2. **Install dependencies**

```bash
npm install
# or
pnpm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/ethical_hacking_lab?schema=public"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

4. **Set up the database**

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with test data
npm run db:seed
```

This will create:
- **3 test accounts:**
  - Admin: `admin@example.com` / `admin123`
  - Instructor: `instructor@example.com` / `instructor123`
  - Student: `student@example.com` / `student123`
- **8 lab sessions** (Sessions 1, 2, 3, 5 with full scenarios)
- **Command database** with expected commands and patterns

5. **Start the development server**

```bash
npm run dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

### 🐳 Docker Setup (Optional)

```bash
# Build and run with Docker Compose
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate dev

# Seed database
docker-compose exec app npm run db:seed
```

---

## 📖 Usage

### For Students

1. **Login** with your student credentials
2. **Browse Available Labs** from the Labs page
3. **Start a Lab Session** by clicking on an unlocked lab
4. **Execute Commands** in the terminal emulator
5. **Earn Points** by completing objectives correctly
6. **Track Progress** in your Progress dashboard
7. **Generate Reports** after completing labs
8. **Check Leaderboard** to see your ranking

### For Instructors/Admins

1. **Access Admin Panel** from the navigation menu
2. **View Analytics** on the dashboard
3. **Manage Users** - Create, edit, or delete accounts
4. **Monitor Progress** - Track student performance
5. **Review Audit Logs** - Check system activities
6. **Check Anti-Cheat Alerts** - View suspicious activities
7. **Reset Progress** if needed

---

## 🔌 API Documentation

### Authentication Endpoints

```typescript
POST /api/auth/register
Body: { email, password, fullName, role?, studentId?, department? }
Response: { success: true, token, user }

POST /api/auth/login
Body: { email, password }
Response: { success: true, token, user }

POST /api/auth/logout
Headers: { Authorization: "Bearer <token>" }
Response: { success: true }

GET /api/auth/me
Headers: { Authorization: "Bearer <token>" }
Response: { success: true, user }
```

### Lab Endpoints

```typescript
GET /api/labs
Headers: { Authorization: "Bearer <token>" }
Response: { success: true, labs: [...] }

GET /api/labs/[labId]
Headers: { Authorization: "Bearer <token>" }
Response: { success: true, lab: {...} }

POST /api/commands/execute
Headers: { Authorization: "Bearer <token>" }
Body: { command: string, scenarioId: string }
Response: {
  success: true,
  output: string,
  pointsAwarded: number,
  antiCheat?: { warning: true, ... }
}
```

### Progress & Reports

```typescript
GET /api/progress/[studentId]
Response: {
  success: true,
  progress: { totalPoints, completedLabs, finalGrade, ... }
}

POST /api/reports/generate
Body: { sessionId: string, reportType?: string }
Response: { success: true, reportId: string, report: {...} }

GET /api/reports
Response: { success: true, reports: [...] }

GET /api/reports/[reportId]
Response: { success: true, report: {...} }
```

### Leaderboard

```typescript
GET /api/leaderboard?scope=overall&limit=100
Response: {
  success: true,
  leaderboard: [...],
  currentUserRank: number
}

GET /api/leaderboard?scope=session&sessionId=<id>
Response: { success: true, leaderboard: [...], session: {...} }
```

### Admin Endpoints

```typescript
GET /api/admin/analytics
Response: { success: true, analytics: {...} }

GET /api/admin/users?role=STUDENT&page=1
Response: { success: true, users: [...], pagination: {...} }

PATCH /api/admin/users/[userId]
Body: { fullName?, email?, role?, isActive?, ... }
Response: { success: true, user: {...} }

POST /api/admin/users/[userId]/reset-progress
Body: { resetAll: true } | { sessionId: string }
Response: { success: true }

GET /api/admin/audit-logs?action=EXECUTE_COMMAND
Response: { success: true, logs: [...] }

GET /api/admin/anti-cheat?type=stats
Response: { success: true, stats: {...} }
```

---

## 🎓 Course Structure

### Session Breakdown

| Session | Title | Topics | Difficulty | Status |
|---------|-------|--------|-----------|---------|
| **1** | OSINT & Reconnaissance | whois, nslookup, geoip, dig, host, traceroute | 🟢 Beginner | ✅ Complete |
| **2** | Network Scanning with Nmap | TCP SYN, Connect, UDP, Version, OS detection | 🟢 Beginner | ✅ Complete |
| **3** | Vulnerability Assessment | searchsploit, hashid, john, nikto | 🟡 Intermediate | ✅ Complete |
| **4** | UTS - Mid-Term Project | Comprehensive reconnaissance + scanning | 🟡 Intermediate | 📝 Planned |
| **5** | Web Application Security | SQLMap, XSS, CSRF, LFI, dirb, wfuzz | 🔴 Advanced | ✅ Complete |
| **6** | Metasploit Framework | Exploitation, privilege escalation | 🔴 Advanced | 📝 Planned |
| **7** | Report Writing & Social Engineering | Documentation, phishing simulation | 🟡 Intermediate | 📝 Planned |
| **8** | UAS - Final Project | Full penetration test simulation | 🔴 Advanced | 📝 Planned |

### Grading Formula

```
Final Grade = (10% × Attendance) + (30% × Weekly Labs) + (25% × UTS) + (35% × UAS)

Letter Grades:
A  = 85-100
B+ = 80-84
B  = 75-79
C+ = 70-74
C  = 65-69
D  = 60-64
E  = 0-59
```

### Scoring System

- **Base Points**: Awarded for correct command execution
- **Time Bonus**: Extra points for fast completion
- **Hint Penalty**: -10 points per hint used
- **Perfect Run Bonus**: +20 points for no failed commands
- **Early Completion**: +15 points for finishing before time limit

---

## 📸 Screenshots

> *Coming soon - Screenshots will be added after UI polish phase*

---

## 🔐 Security

### Implemented Security Features

✅ **Authentication & Authorization**
- JWT-based token authentication
- bcrypt password hashing (10 rounds)
- Role-based access control (RBAC)
- Protected API routes with middleware

✅ **Anti-Cheat Detection**
- Rapid execution pattern detection
- Copy-paste command detection
- Duplicate submission detection
- IP address change monitoring
- Timing analysis for unrealistic speeds
- Known solution pattern matching

✅ **Audit Logging**
- All user actions logged
- IP address tracking
- Command execution history
- User management actions
- Authentication events

✅ **Input Validation**
- Server-side validation for all inputs
- Prisma parameterized queries (SQL injection prevention)
- Command sanitization

### Recommended Production Security

- [ ] Implement rate limiting (express-rate-limit)
- [ ] Add CORS configuration
- [ ] Enable HTTPS/TLS
- [ ] Set secure HTTP headers (helmet.js)
- [ ] Implement CSRF tokens for forms
- [ ] Add Redis for session management
- [ ] Enable database connection pooling
- [ ] Set up automated backups
- [ ] Implement monitoring and alerting

---

## 🤝 Contributing

We welcome contributions from the community! This project is part of an academic initiative at **Universitas Muhammadiyah Makassar**.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Coding Standards

- Follow TypeScript best practices
- Use Prettier for code formatting
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

### Reporting Issues

Found a bug or have a feature request? Please open an issue on GitHub with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

---

## 📄 License

**Educational Use Only**

This project is developed for academic purposes at Universitas Muhammadiyah Makassar.

```
Course Code: CW6552021559
Department: Informatika, Fakultas Teknik
Institution: Universitas Muhammadiyah Makassar
Academic Year: 2024/2025
```

For commercial use or redistribution, please contact the course instructor.

---

## 🙏 Acknowledgments

- **Universitas Muhammadiyah Makassar** - For supporting this educational initiative
- **Faculty of Engineering** - Department of Informatics
- **Students** - For providing feedback and testing
- **Open Source Community** - For the amazing tools and libraries

---

## 📞 Support & Contact

### Developer

**devnolife**
- GitHub: [@devnolife](https://github.com/devnolife)
- Project Link: [https://github.com/devnolife/tryhackme](https://github.com/devnolife/tryhackme)

### Course Information

For academic inquiries, please contact your course instructor at Universitas Muhammadiyah Makassar.

---

## 📊 Project Stats

![Lines of Code](https://img.shields.io/badge/Lines%20of%20Code-15000%2B-blue?style=flat-square)
![Files](https://img.shields.io/badge/Files-70%2B-green?style=flat-square)
![Commits](https://img.shields.io/badge/Commits-Active-orange?style=flat-square)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=flat-square)

---

<div align="center">

### ⭐ If you find this project useful, please give it a star!

**Made with ❤️ by [devnolife](https://github.com/devnolife) | © 2025 All Rights Reserved**

*Empowering the next generation of cybersecurity professionals* 🛡️

</div>
