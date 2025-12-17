# Ethical Hacking Lab Platform

Web-Based Learning Management System for Penetration Testing Foundation Course

## Project Status

**Current Phase:** Foundation (Phase 1) - IN PROGRESS
**Development Started:** December 2025
**Target Users:** 200 concurrent students
**Total Sessions:** 8 lab sessions

---

## ✅ Completed Tasks (Phase 1)

### 1. Project Setup
- ✅ Next.js 14+ with App Router initialized
- ✅ TypeScript configuration complete
- ✅ Tailwind CSS configured
- ✅ ESLint setup
- ✅ Project structure created according to plan
- ✅ Environment variables configured

### 2. Database Setup
- ✅ PostgreSQL database schema designed
- ✅ Prisma ORM integrated
- ✅ Complete database schema with 9 models:
  - Users (with role-based access)
  - LabSessions
  - LabScenarios
  - CommandDatabase
  - StudentProgress
  - CommandHistory
  - Submissions
  - AuditLogs
  - Reports
- ✅ Prisma Client generated
- ✅ Database helper functions created

### 3. Authentication System
- ✅ JWT-based authentication implemented
- ✅ Password hashing with bcrypt
- ✅ Authentication middleware created
- ✅ Role-based authorization helpers
- ✅ API Routes completed:
  - POST `/api/auth/register` - User registration
  - POST `/api/auth/login` - User login
  - POST `/api/auth/logout` - User logout
  - GET `/api/auth/me` - Get current user

### 4. User Interface
- ✅ Homepage with landing page
- ✅ Login page (fully functional)
- ✅ Registration page (fully functional)
- ✅ Dashboard skeleton with navigation
- ✅ Protected routes (auth-required)
- ✅ Responsive design with Tailwind CSS

---

## 📂 Project Structure

```
ethical-hacking-lab-platform/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── [future lab routes...]
│   ├── api/
│   │   └── auth/
│   │       ├── login/route.ts
│   │       ├── register/route.ts
│   │       ├── logout/route.ts
│   │       └── me/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   ├── lab/
│   ├── terminal/
│   ├── dashboard/
│   ├── report/
│   └── shared/
├── lib/
│   ├── db.ts (Prisma client)
│   ├── auth.ts (Auth utilities)
│   ├── middleware.ts (Auth middleware)
│   ├── simulation/
│   ├── validation/
│   ├── scoring/
│   ├── security/
│   ├── report-generation/
│   └── utils/
├── prisma/
│   └── schema.prisma (Complete DB schema)
├── public/
│   ├── lab-scenarios/
│   ├── images/
│   └── documents/
├── .env (Environment variables)
├── .env.example (Template)
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Redis 7+ (optional for session management)
- npm or pnpm package manager

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env` and update with your database credentials:
   ```bash
   DATABASE_URL="postgresql://postgres:password@localhost:5432/ethical_hacking_lab"
   JWT_SECRET="your-secret-key"
   ```

3. **Run database migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Seed the database (when available):**
   ```bash
   npm run seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to `http://localhost:3000`

---

## 📋 Next Steps (Phase 2)

### Immediate Priority

1. **Database Migration & Seeding**
   - Create initial migration
   - Seed lab sessions data (Sessions 1-8)
   - Seed command database for simulations
   - Create test user accounts

2. **Lab Session 1: OSINT & Reconnaissance**
   - Build OSINT simulator
   - Create command validation system
   - Implement scoring engine
   - Build terminal emulator component
   - Create lab interface UI

3. **Terminal Emulator**
   - Integrate xterm.js
   - Command input/output handling
   - Command history
   - Auto-complete functionality

4. **Progress Tracking System**
   - Track lab completion
   - Points calculation
   - Time tracking
   - Hint usage monitoring

5. **API Routes for Labs**
   - `GET /api/labs` - List all labs
   - `GET /api/labs/[labId]` - Get lab details
   - `POST /api/commands/execute` - Execute command
   - `GET /api/progress/[studentId]` - Get progress

---

## 🛠 Technology Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Node.js
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT with bcrypt
- **Terminal:** xterm.js (to be integrated)
- **Caching:** Redis (to be integrated)
- **Charts:** Recharts (to be integrated)

---

## 📊 Development Roadmap

### Phase 1: Foundation (Weeks 1-2) ✅ IN PROGRESS
- [x] Project setup
- [x] Database schema
- [x] Authentication system
- [x] Basic UI pages
- [ ] Database migrations
- [ ] Test user seeding

### Phase 2: Core Platform (Weeks 3-4) - NEXT
- [ ] Session 1 implementation
- [ ] Terminal emulator
- [ ] Command simulation engine
- [ ] Progress tracking
- [ ] Scoring system

### Phase 3: Assessment & Reporting (Weeks 5-6)
- [ ] Session 3 implementation
- [ ] Report generation system
- [ ] UTS framework
- [ ] Analytics dashboard

### Phase 4: Advanced Features (Weeks 7-8)
- [ ] Sessions 5-6 implementation
- [ ] Admin dashboard
- [ ] Audit logging
- [ ] Anti-cheat system

### Phase 5: Polish & Deployment
- [ ] All 8 sessions complete
- [ ] Load testing
- [ ] Security hardening
- [ ] Production deployment

---

## 🔐 Security Features

- [x] Password hashing with bcrypt (10 rounds)
- [x] JWT token authentication
- [x] Protected API routes
- [x] Role-based access control (RBAC) framework
- [x] Audit logging for user actions
- [ ] Rate limiting (to be implemented)
- [ ] Input sanitization (to be implemented)
- [ ] Anti-cheat detection (to be implemented)

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### Labs (To be implemented)
- `GET /api/labs` - List all labs
- `GET /api/labs/[labId]` - Get lab details
- `POST /api/commands/execute` - Execute command
- `GET /api/progress` - Get student progress

---

## 👥 User Roles

- **STUDENT** - Default role, can access labs and track progress
- **INSTRUCTOR** - Can view student progress and grade submissions
- **ADMIN** - Full access to all features including user management

---

## 🎯 Course Structure

1. **Session 1:** Introduction to Ethical Hacking & Reconnaissance (OSINT)
2. **Session 2:** Network Scanning with Nmap
3. **Session 3:** Vulnerability Assessment & Password Cracking
4. **Session 4:** UTS - Mid-Term Project
5. **Session 5:** Web Application Security (SQLi, XSS)
6. **Session 6:** Metasploit & Privilege Escalation
7. **Session 7:** Report Writing & Social Engineering
8. **Session 8:** UAS - Final Project

**Grading Formula:**
```
Final Grade = (10% × Attendance) + (30% × Weekly Labs) + (25% × UTS) + (35% × UAS)
```

---

## 🐛 Known Issues

- Database not yet migrated (need PostgreSQL running)
- Redis session management not implemented
- Terminal emulator not integrated
- Lab content not seeded
- No data visualization yet

---

## 📖 Documentation

- See [plan.md](./plan.md) for complete project specification
- API documentation to be generated
- User manual to be created

---

## 🤝 Contributing

This is an educational project for Universitas Muhammadiyah Makassar.
Course Code: CW6552021559
Department: Informatika, Fakultas Teknik

---

## 📄 License

Educational use only - Universitas Muhammadiyah Makassar

---

## 📞 Support

For issues or questions, please refer to the course instructor.

**Project Status:** Active Development
**Last Updated:** December 2025
