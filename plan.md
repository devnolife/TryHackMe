# Ethical Hacking Lab Platform
## Web-Based Learning Management System for Penetration Testing Foundation Course

**Course Code:** CW6552021559  
**Duration:** 8 Sessions (Semester V)  
**Student Capacity:** 200 concurrent users  
**Approach:** Web-based Simulation + Interactive Learning  

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Platform Architecture](#platform-architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [Feature Specifications](#feature-specifications)
6. [Session Breakdown & Tasks](#session-breakdown--tasks)
7. [Development Roadmap](#development-roadmap)
8. [Deployment & Infrastructure](#deployment--infrastructure)
9. [Grading System](#grading-system)
10. [API Endpoints](#api-endpoints)

---

## PROJECT OVERVIEW

### Vision
Build a comprehensive, scalable web-based learning platform that enables 200 students to practice ethical hacking fundamentals through interactive simulations, guided labs, and realistic penetration testing workflows.

### Core Objectives
- ✅ Provide hands-on ethical hacking training without infrastructure overhead
- ✅ Support 200 concurrent students with simulation-based labs
- ✅ Enable progressive learning from reconnaissance to exploitation
- ✅ Deliver professional-grade penetration testing experience
- ✅ Maintain full audit trail for academic integrity
- ✅ Minimize operational costs while maximizing learning outcomes

### Key Features
- **Interactive Web Terminal:** Browser-based command interface with Kali Linux simulation
- **Lab Management System:** 8 structured sessions with progressive difficulty
- **Scenario-Based Learning:** Realistic penetration testing workflows
- **Automated Grading:** Real-time feedback and point calculation
- **Progress Tracking:** Dashboard showing student performance and completion
- **Report Generator:** Professional pentest report creation tools
- **Anti-Cheat System:** Detection of suspicious activity and command validation
- **Multi-Role Support:** Student, Instructor, and Administrator views

---

## PLATFORM ARCHITECTURE

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Browser)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Auth Pages    │  │ Lab Terminal │  │   Dashboard  │   │
│  │  (Login/Reg)   │  │  (xterm.js)  │  │  (Progress)  │   │
│  └────────────────┘  └──────────────┘  └──────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↕ (HTTPS/WebSocket)
┌─────────────────────────────────────────────────────────────┐
│           NEXT.JS APPLICATION LAYER (Server)                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            NEXT.JS API Routes                        │  │
│  │  ├── /api/auth/* (Authentication & Session)         │  │
│  │  ├── /api/labs/* (Lab Management)                   │  │
│  │  ├── /api/commands/* (Command Execution & Validation)  │
│  │  ├── /api/progress/* (Student Progress Tracking)    │  │
│  │  ├── /api/reports/* (Report Generation)             │  │
│  │  └── /api/admin/* (Administrator Functions)         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            BUSINESS LOGIC LAYER                      │  │
│  │  ├── Simulation Engine (Command Router & Validator) │  │
│  │  ├── Scoring System (Point Calculation)             │  │
│  │  ├── Anti-Cheat Module (Suspicious Activity Detection) │
│  │  ├── Report Engine (Template & Generation)          │  │
│  │  └── Progress Calculator (Completion & Analytics)   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↕ (TCP/SQL)
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │  PostgreSQL DB   │  │  Redis Cache │  │ File Storage│  │
│  │                  │  │              │  │  (Reports)  │  │
│  │ ├── Users        │  │ ├── Sessions │  │             │  │
│  │ ├── Labs         │  │ ├── Cache    │  │ ├── PDFs    │  │
│  │ ├── Scenarios    │  │ └── Locks    │  │ └── Images  │  │
│  │ ├── Commands     │  │              │  │             │  │
│  │ ├── Progress     │  │              │  │             │  │
│  │ ├── Submissions  │  │              │  │             │  │
│  │ └── Audit Logs   │  │              │  │             │  │
│  └──────────────────┘  └──────────────┘  └─────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Project Structure

```
ethical-hacking-lab-platform/
│
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx (Dashboard Home)
│   │   ├── labs/
│   │   │   ├── page.tsx (Labs List)
│   │   │   └── [labId]/
│   │   │       ├── page.tsx (Lab Interface)
│   │   │       └── terminal.tsx (Terminal Emulator)
│   │   ├── progress/
│   │   │   └── page.tsx (Progress Dashboard)
│   │   ├── reports/
│   │   │   ├── page.tsx (Reports List)
│   │   │   ├── [reportId]/page.tsx (View Report)
│   │   │   └── generator/page.tsx (Report Generator)
│   │   └── admin/
│   │       ├── page.tsx (Admin Dashboard)
│   │       ├── students/page.tsx (Student Management)
│   │       ├── labs/page.tsx (Lab Configuration)
│   │       └── analytics/page.tsx (Analytics Dashboard)
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── register/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── me/route.ts
│   │   │
│   │   ├── labs/
│   │   │   ├── route.ts (GET all labs, POST create lab)
│   │   │   └── [labId]/route.ts (GET, PUT, DELETE lab)
│   │   │
│   │   ├── commands/
│   │   │   ├── execute/route.ts (Execute & validate command)
│   │   │   ├── validate/route.ts (Dry-run validation)
│   │   │   └── history/route.ts (Get command history)
│   │   │
│   │   ├── progress/
│   │   │   ├── route.ts (GET student progress)
│   │   │   ├── [studentId]/route.ts (GET specific student)
│   │   │   └── [labId]/route.ts (GET lab-specific progress)
│   │   │
│   │   ├── reports/
│   │   │   ├── route.ts (GET, POST reports)
│   │   │   ├── generate/route.ts (Generate report)
│   │   │   └── [reportId]/download/route.ts (Download PDF)
│   │   │
│   │   └── admin/
│   │       ├── users/route.ts (Manage users)
│   │       ├── analytics/route.ts (Get analytics)
│   │       └── audit-logs/route.ts (Get audit logs)
│   │
│   └── globals.css
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── lab/
│   │   ├── LabHeader.tsx
│   │   ├── LabDescription.tsx
│   │   ├── LabObjectives.tsx
│   │   ├── SuccessCriteria.tsx
│   │   ├── HintSystem.tsx
│   │   └── LabStatusIndicator.tsx
│   │
│   ├── terminal/
│   │   ├── TerminalEmulator.tsx (xterm.js wrapper)
│   │   ├── CommandInput.tsx
│   │   ├── CommandOutput.tsx
│   │   └── TerminalHistory.tsx
│   │
│   ├── dashboard/
│   │   ├── ProgressCard.tsx
│   │   ├── LabCard.tsx
│   │   ├── StatsPanel.tsx
│   │   └── RecentActivity.tsx
│   │
│   ├── report/
│   │   ├── ReportTemplate.tsx
│   │   ├── ReportPreview.tsx
│   │   ├── ReportExport.tsx
│   │   └── ReportSection.tsx
│   │
│   └── shared/
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       ├── Card.tsx
│       ├── Button.tsx
│       ├── Modal.tsx
│       └── LoadingSpinner.tsx
│
├── lib/
│   ├── db.ts (Database connection)
│   ├── auth.ts (Authentication utilities)
│   ├── middleware.ts (Next.js middleware)
│   │
│   ├── simulation/
│   │   ├── command-router.ts (Route commands to simulators)
│   │   ├── osint-simulator.ts (OSINT tool simulation)
│   │   ├── nmap-simulator.ts (Nmap output simulation)
│   │   ├── vuln-simulator.ts (Vulnerability data)
│   │   ├── password-simulator.ts (Hash cracking simulation)
│   │   └── web-simulator.ts (Web app vulnerability simulation)
│   │
│   ├── validation/
│   │   ├── command-validator.ts (Validate command syntax)
│   │   ├── payload-validator.ts (Validate exploit payloads)
│   │   └── report-validator.ts (Validate report completeness)
│   │
│   ├── scoring/
│   │   ├── scoring-engine.ts (Calculate points)
│   │   ├── rubric.ts (Grading rubric definitions)
│   │   └── multipliers.ts (Bonus/penalty calculations)
│   │
│   ├── security/
│   │   ├── anti-cheat.ts (Detect suspicious patterns)
│   │   ├── audit-logger.ts (Log all activities)
│   │   └── input-sanitizer.ts (Sanitize user input)
│   │
│   ├── report-generation/
│   │   ├── report-generator.ts (Main generator)
│   │   ├── template-renderer.ts (Render templates)
│   │   ├── pdf-exporter.ts (Export to PDF)
│   │   └── report-sections.ts (Section builders)
│   │
│   └── utils/
│       ├── constants.ts (Constants & config)
│       ├── helpers.ts (General utilities)
│       └── validators.ts (Input validation)
│
├── db/
│   ├── schema.ts (Prisma schema)
│   ├── prisma.ts (Prisma client)
│   ├── seed.ts (Database seeding)
│   │
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_lab_scenarios.sql
│       ├── 003_command_database.sql
│       └── 004_audit_logs.sql
│
├── public/
│   ├── lab-scenarios/ (Lab content files)
│   │   ├── session-1.json
│   │   ├── session-2.json
│   │   ├── session-3.json
│   │   └── ...
│   │
│   ├── images/
│   │   ├── logos/
│   │   └── icons/
│   │
│   └── documents/
│       ├── ethical-hacking-guide.pdf
│       └── reporting-template.pdf
│
├── .env.local (Environment variables - DO NOT COMMIT)
├── .env.example (Template for environment variables)
├── .gitignore
├── next.config.js
├── tsconfig.json
├── tailwind.config.js
├── package.json
├── README.md (This file)
└── SETUP.md (Setup instructions)
```

---

## TECHNOLOGY STACK

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **UI Library:** React 18+
- **Styling:** Tailwind CSS
- **Terminal Emulator:** xterm.js
- **HTTP Client:** Axios or Fetch API
- **State Management:** React Context API (or Zustand)
- **Charts/Analytics:** Recharts or Chart.js

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Next.js API Routes
- **Language:** TypeScript
- **ORM:** Prisma
- **Caching:** Redis
- **Job Queue:** BullMQ (optional, for async tasks)

### Database
- **Primary:** PostgreSQL 14+
- **Caching:** Redis 7+
- **Schema Management:** Prisma Migrations

### Infrastructure
- **Hosting:** Vercel, Render, Railway, or DigitalOcean
- **Environment:** Docker (for local development)
- **CI/CD:** GitHub Actions

### Development Tools
- **Package Manager:** npm or pnpm
- **Code Quality:** ESLint, Prettier
- **Testing:** Jest, React Testing Library
- **Version Control:** Git

---

## DATABASE SCHEMA

### Core Tables

#### 1. `users`
```sql
Table: users
├── id: UUID (Primary Key)
├── email: String (Unique)
├── password: String (Hashed)
├── full_name: String
├── role: Enum ['STUDENT', 'INSTRUCTOR', 'ADMIN']
├── student_id: String (Unique, nullable for instructors)
├── department: String
├── enrollment_date: DateTime
├── is_active: Boolean
├── created_at: DateTime
└── updated_at: DateTime
```

#### 2. `lab_sessions`
```sql
Table: lab_sessions
├── id: UUID (Primary Key)
├── session_number: Integer (1-8)
├── title: String
├── description: Text
├── topic: String
├── learning_objectives: JSON
├── estimated_duration_minutes: Integer
├── difficulty_level: Enum ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
├── is_active: Boolean
├── display_order: Integer
├── created_at: DateTime
└── updated_at: DateTime
```

#### 3. `lab_scenarios`
```sql
Table: lab_scenarios
├── id: UUID (Primary Key)
├── session_id: UUID (Foreign Key → lab_sessions)
├── scenario_title: String
├── scenario_description: Text
├── target_info: JSON
│  ├── ip_address: String
│  ├── hostname: String
│  ├── services: Array[String]
│  └── vulnerabilities: Array[String]
├── success_criteria: JSON
│  └── Array[{
│      id: String,
│      description: String,
│      command_pattern: String (regex),
│      expected_output_keyword: String,
│      points: Integer,
│      hint: String
│    }]
├── hints: JSON
│  └── Array[{
│      level: Integer,
│      hint_text: String,
│      point_penalty: Integer
│    }]
├── deliverables: JSON
├── max_points: Integer
├── created_at: DateTime
└── updated_at: DateTime
```

#### 4. `command_database`
```sql
Table: command_database
├── id: UUID (Primary Key)
├── scenario_id: UUID (Foreign Key → lab_scenarios)
├── command_pattern: String (regex pattern)
├── command_description: String
├── expected_output: Text (simulated output)
├── success_keywords: Array[String]
├── failure_messages: Array[String]
├── points_awarded: Integer
├── validation_type: Enum ['EXACT', 'KEYWORD', 'REGEX']
├── command_category: Enum ['OSINT', 'SCANNING', 'ENUMERATION', 'EXPLOITATION', 'ANALYSIS']
├── created_at: DateTime
└── updated_at: DateTime
```

#### 5. `student_progress`
```sql
Table: student_progress
├── id: UUID (Primary Key)
├── student_id: UUID (Foreign Key → users)
├── session_id: UUID (Foreign Key → lab_sessions)
├── scenario_id: UUID (Foreign Key → lab_scenarios)
├── status: Enum ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'SUBMITTED']
├── total_points: Integer
├── max_points: Integer
├── attempts: Integer
├── hints_used: Integer
├── time_spent_minutes: Integer
├── started_at: DateTime
├── completed_at: DateTime (nullable)
├── submitted_at: DateTime (nullable)
└── updated_at: DateTime
```

#### 6. `command_history`
```sql
Table: command_history
├── id: UUID (Primary Key)
├── student_id: UUID (Foreign Key → users)
├── scenario_id: UUID (Foreign Key → lab_scenarios)
├── command_text: String
├── command_timestamp: DateTime
├── is_valid: Boolean
├── validation_result: JSON
│  ├── is_correct: Boolean
│  ├── points_awarded: Integer
│  ├── output: String
│  ├── message: String
│  └── hint_provided: String (nullable)
├── execution_time_ms: Integer
├── ip_address: String (for audit)
├── user_agent: String (for audit)
└── created_at: DateTime
```

#### 7. `submissions`
```sql
Table: submissions
├── id: UUID (Primary Key)
├── student_id: UUID (Foreign Key → users)
├── session_id: UUID (Foreign Key → lab_sessions)
├── submission_type: Enum ['UTS', 'WEEKLY_LAB', 'UAS']
├── submission_data: JSON
│  ├── report_content: Text
│  ├── findings: Array[Object]
│  ├── recommendations: Array[Object]
│  └── metadata: Object
├── total_score: Integer
├── max_score: Integer
├── feedback: Text (nullable)
├── submitted_at: DateTime
├── graded_at: DateTime (nullable)
├── graded_by: UUID (Foreign Key → users, nullable)
└── updated_at: DateTime
```

#### 8. `audit_logs`
```sql
Table: audit_logs
├── id: UUID (Primary Key)
├── student_id: UUID (Foreign Key → users)
├── session_id: UUID (Foreign Key → lab_sessions, nullable)
├── action: String
├── action_type: Enum ['LOGIN', 'COMMAND_EXECUTE', 'SUBMISSION', 'HINT_REQUEST', 'LOGOUT']
├── resource_type: String (nullable)
├── resource_id: String (nullable)
├── details: JSON
├── suspicious_flag: Boolean (for anti-cheat)
├── ip_address: String
├── user_agent: String
├── created_at: DateTime
└── updated_at: DateTime
```

#### 9. `reports`
```sql
Table: reports
├── id: UUID (Primary Key)
├── student_id: UUID (Foreign Key → users)
├── session_id: UUID (Foreign Key → lab_sessions)
├── report_type: Enum ['SESSION_REPORT', 'FINAL_REPORT']
├── title: String
├── executive_summary: Text
├── findings: JSON
├── vulnerabilities: JSON
├── recommendations: JSON
├── conclusion: Text
├── pdf_url: String (nullable)
├── generated_at: DateTime
├── last_modified_at: DateTime
└── created_at: DateTime
```

---

## FEATURE SPECIFICATIONS

### Feature 1: Authentication System
**Description:** Secure user authentication and session management

**Requirements:**
- User registration with email verification
- Password hashing with bcrypt
- JWT token-based authentication
- Session management with Redis
- Role-based access control (RBAC)
- Rate limiting on login attempts

**Implementation Files:**
- `app/api/auth/register/route.ts`
- `app/api/auth/login/route.ts`
- `lib/auth.ts`

---

### Feature 2: Interactive Lab Terminal
**Description:** Browser-based terminal interface for command execution

**Requirements:**
- xterm.js integration
- Command input validation
- Real-time output display
- Command history
- Auto-complete suggestions
- Copy-paste support

**Implementation Files:**
- `components/terminal/TerminalEmulator.tsx`
- `app/api/commands/execute/route.ts`
- `lib/simulation/command-router.ts`

---

### Feature 3: Simulation Engine
**Description:** Core system that simulates Kali Linux tools

**Sub-Features:**
- OSINT Tool Simulation
- Nmap Output Generator
- Vulnerability Database Lookup
- Password Cracking Simulator
- Web Application Vulnerability Simulator

**Implementation Files:**
- `lib/simulation/osint-simulator.ts`
- `lib/simulation/nmap-simulator.ts`
- `lib/simulation/vuln-simulator.ts`
- `lib/simulation/password-simulator.ts`
- `lib/simulation/web-simulator.ts`

---

### Feature 4: Progress Tracking
**Description:** Monitor student progress across all sessions

**Requirements:**
- Real-time progress updates
- Session completion tracking
- Points calculation
- Time tracking
- Attempt counting
- Hint usage tracking

**Implementation Files:**
- `app/(dashboard)/progress/page.tsx`
- `app/api/progress/route.ts`
- `lib/scoring/scoring-engine.ts`

---

### Feature 5: Automated Report Generation
**Description:** Generate professional penetration testing reports

**Requirements:**
- Template-based report generation
- PDF export functionality
- Report sections (Executive Summary, Findings, Recommendations)
- Automatic data compilation from lab work
- Professional formatting

**Implementation Files:**
- `app/(dashboard)/reports/generator/page.tsx`
- `app/api/reports/generate/route.ts`
- `lib/report-generation/report-generator.ts`

---

### Feature 6: Scoring & Grading System
**Description:** Automatic point calculation and grading

**Requirements:**
- Command-level scoring
- Lab-level scoring
- Session-level scoring
- Grade calculation (10% attendance + 30% weekly + 25% UTS + 35% UAS)
- Bonus/penalty system
- Instant feedback

**Implementation Files:**
- `lib/scoring/scoring-engine.ts`
- `lib/scoring/rubric.ts`
- `lib/scoring/multipliers.ts`

---

### Feature 7: Anti-Cheat System
**Description:** Detect and flag suspicious activity

**Requirements:**
- Unusual command patterns detection
- Copy-paste detection
- Timing analysis (too fast completion)
- Duplicate submissions detection
- IP address monitoring
- Audit logging of all activities

**Implementation Files:**
- `lib/security/anti-cheat.ts`
- `lib/security/audit-logger.ts`

---

### Feature 8: Admin Dashboard
**Description:** Administrative interface for instructors

**Requirements:**
- Student management (view, edit, reset progress)
- Lab configuration
- Analytics dashboard
- Audit log viewing
- Bulk operations

**Implementation Files:**
- `app/(dashboard)/admin/page.tsx`
- `app/api/admin/users/route.ts`
- `app/api/admin/analytics/route.ts`

---

## SESSION BREAKDOWN & TASKS

### SESSION 1: Introduction to Ethical Hacking & Reconnaissance (Weeks 1-2)

**Learning Objectives:**
- Understand ethical hacking methodology
- Learn information gathering (OSINT) techniques
- Understand legal and ethical framework
- Practice reconnaissance tools

**Lab Scenario:**
```
Company: ABC Corporation (example-company.com)
Mission: Perform initial reconnaissance and gather intelligence
Duration: 2 weeks
Points: 100
```

**Detailed Tasks:**

#### Task 1.1: OSINT Information Gathering
**Time Allocation:** Week 1, Days 1-3
**Points:** 30

**Subtasks:**
1. Gather company information
   - Command: `whois example-company.com`
   - Expected Output: Registrant info, DNS servers, registration dates
   - Points: 10
   
2. DNS enumeration
   - Command: `nslookup example-company.com`
   - Expected Output: A records, MX records, NS records
   - Points: 10
   
3. IP geolocation
   - Command: `geoip 192.168.1.100`
   - Expected Output: Location, ISP, ASN
   - Points: 10

**Deliverable:**
- OSINT Intelligence Report (2-3 pages)
- Contains: Company info, DNS records, IP information
- Format: PDF with findings and analysis

**Grading Rubric:**
- Completeness (10 pts): All information gathered
- Accuracy (10 pts): Correct interpretation of data
- Analysis Quality (10 pts): Critical thinking evident

---

#### Task 1.2: Legal & Ethical Framework
**Time Allocation:** Week 1, Days 4-5
**Points:** 20

**Subtasks:**
1. Ethics Quiz
   - 10 multiple choice questions
   - Topics: Ethical hacking principles, legal considerations
   - Points: 10

2. Case Study Analysis
   - Read scenario of penetration testing
   - Answer questions about ethical considerations
   - Points: 10

**Deliverable:**
- Quiz submission with score
- Case study analysis document

**Grading Rubric:**
- Accuracy (10 pts)
- Analysis depth (10 pts)

---

#### Task 1.3: Documentation & Reporting
**Time Allocation:** Week 2, Days 1-5
**Points:** 50

**Subtasks:**
1. Compile findings
   - Organize all gathered information
   - Create structured report
   
2. Professional formatting
   - Use report template
   - Include executive summary
   - Add findings section
   - Include recommendations

**Deliverable:**
- Professional OSINT Report (PDF)
- 5-10 pages
- Executive summary + detailed findings

**Grading Rubric:**
- Completeness (20 pts)
- Professional presentation (15 pts)
- Technical accuracy (15 pts)

---

**Session 1 Total:**
- Duration: 2 weeks
- Points: 100
- Deliverables: OSINT Report, Quiz, Case Study
- Prerequisites: None
- Skills Gained: Information gathering, reconnaissance, professional writing

---

### SESSION 2: Network Scanning with Nmap (Weeks 3-4)

**Learning Objectives:**
- Master network scanning techniques
- Learn port scanning methodologies
- Identify services running on target
- Understand scanning evasion concepts

**Lab Scenario:**
```
Target Network: 192.168.1.0/24
Target Host: 192.168.1.100
Mission: Perform comprehensive network scanning
Duration: 2 weeks
Points: 100
```

**Detailed Tasks:**

#### Task 2.1: Basic Network Scanning
**Time Allocation:** Week 3, Days 1-3
**Points:** 30

**Subtasks:**
1. Host discovery scan
   - Command: `nmap -sn 192.168.1.0/24`
   - Expected Output: List of active hosts
   - Points: 10
   - Success Criteria: Identify 15+ active hosts

2. Port scanning (TCP SYN)
   - Command: `nmap -sS 192.168.1.100`
   - Expected Output: Open TCP ports
   - Points: 10
   - Success Criteria: Identify ports 22, 80, 443, 3306, 5432

3. UDP port scanning
   - Command: `nmap -sU 192.168.1.100`
   - Expected Output: Open UDP ports
   - Points: 10
   - Success Criteria: Identify DNS (53), DHCP (67), NTP (123)

**Deliverable:**
- Network scanning report with findings
- Port inventory list

**Grading Rubric:**
- Correctness (15 pts)
- Completeness (10 pts)
- Analysis (5 pts)

---

#### Task 2.2: Service Version Detection
**Time Allocation:** Week 3, Days 4-5
**Points:** 35

**Subtasks:**
1. Service version enumeration
   - Command: `nmap -sV 192.168.1.100`
   - Expected Output: Service names and versions
   - Points: 15
   - Success Criteria: Detect Apache 2.4.6, OpenSSH 7.4, MySQL 5.7

2. OS detection
   - Command: `nmap -O 192.168.1.100`
   - Expected Output: Operating system guess
   - Points: 10
   - Success Criteria: Correctly identify Linux OS

3. Aggressive scanning
   - Command: `nmap -A 192.168.1.100`
   - Expected Output: Combined output
   - Points: 10
   - Success Criteria: Full service discovery

**Deliverable:**
- Service inventory document
- OS identification report

**Grading Rubric:**
- Version accuracy (15 pts)
- Completeness (10 pts)
- OS detection (10 pts)

---

#### Task 2.3: Network Mapping & Analysis
**Time Allocation:** Week 4, Days 1-5
**Points:** 35

**Subtasks:**
1. Create network topology diagram
   - Map discovered hosts
   - Show services per host
   - Include network relationships
   - Points: 15

2. Analyze findings
   - Identify critical services
   - Note version vulnerabilities
   - Assess exposure
   - Points: 10

3. Professional report
   - Compile all findings
   - Use report template
   - Include recommendations
   - Points: 10

**Deliverable:**
- Network Topology Diagram
- Network Scanning Report (5-8 pages)
- Service vulnerability assessment

**Grading Rubric:**
- Diagram quality (10 pts)
- Report professionalism (15 pts)
- Analysis depth (10 pts)

---

**Session 2 Total:**
- Duration: 2 weeks
- Points: 100
- Deliverables: Network diagram, scanning reports, service inventory
- Prerequisites: Session 1
- Skills Gained: Network scanning, service identification, vulnerability awareness

---

### SESSION 3: Vulnerability Assessment & Password Cracking (Weeks 5-6)

**Learning Objectives:**
- Learn vulnerability assessment methodology
- Search and interpret CVE databases
- Understand password cracking techniques
- Learn hash types and cracking methods

**Lab Scenario:**
```
Mission: Assess vulnerabilities in identified services
Target Services: From Session 2 findings
Duration: 2 weeks
Points: 100
```

**Detailed Tasks:**

#### Task 3.1: CVE Database Searching
**Time Allocation:** Week 5, Days 1-3
**Points:** 30

**Subtasks:**
1. Identify applicable CVEs
   - Search: Apache 2.4.6 vulnerabilities
   - Expected: List of 5+ CVEs
   - Points: 10

2. CVSS Scoring
   - Find CVSS scores for identified CVEs
   - Understand scoring methodology
   - Points: 10

3. Vulnerability Assessment
   - Assess impact of each CVE
   - Determine exploitability
   - Points: 10

**Deliverable:**
- CVE Assessment Report
- Vulnerability spreadsheet with CVSS scores

**Grading Rubric:**
- Accuracy (15 pts)
- Completeness (10 pts)
- Understanding (5 pts)

---

#### Task 3.2: Password Hash Cracking
**Time Allocation:** Week 5, Days 4-5, Week 6, Days 1-2
**Points:** 40

**Subtasks:**
1. Hash type identification
   - Identify 5 different hash types
   - MD5, SHA1, bcrypt, SHA256, NTLM
   - Points: 10

2. Brute force cracking simulation
   - Crack provided password hashes
   - Using simulation (pre-computed results)
   - Points: 15

3. Hash analysis
   - Identify weak passwords
   - Assess password policies
   - Points: 15

**Deliverable:**
- Password cracking report
- Hash analysis document
- Cracked passwords list

**Grading Rubric:**
- Hash type identification (10 pts)
- Cracking success (15 pts)
- Analysis quality (15 pts)

---

#### Task 3.3: Vulnerability & Risk Assessment Report
**Time Allocation:** Week 6, Days 3-5
**Points:** 30

**Subtasks:**
1. Compile vulnerability findings
   - Aggregate all CVEs
   - Include CVSS scores
   - Show cracked passwords
   - Points: 10

2. Risk assessment
   - Prioritize vulnerabilities
   - Estimate impact
   - Points: 10

3. Professional report
   - Use template
   - Include recommendations
   - Executive summary
   - Points: 10

**Deliverable:**
- Vulnerability Assessment Report (8-10 pages)
- Risk matrix
- Remediation recommendations

**Grading Rubric:**
- Completeness (10 pts)
- Professionalism (10 pts)
- Analysis quality (10 pts)

---

**Session 3 Total:**
- Duration: 2 weeks
- Points: 100
- Deliverables: CVE report, password cracking report, risk assessment
- Prerequisites: Session 1, 2
- Skills Gained: CVE research, vulnerability assessment, password analysis

---

### SESSION 4: UTS - Reconnaissance & Scanning Project (Week 7-8)

**Learning Objectives:**
- Apply all skills from Sessions 1-3
- Conduct end-to-end reconnaissance
- Create professional penetration testing report
- Demonstrate understanding of methodology

**Lab Scenario:**
```
Company: Demo Company Inc.
Website: demo-company.com
Target: Comprehensive reconnaissance phase
Duration: 2 weeks (Week 7-8)
Points: 100 (UTS = 25% of grade)
```

**Project Requirements:**

#### Phase 1: Planning (Week 7, Days 1-2)
**Points:** 10

**Tasks:**
1. Scope definition
   - Define targets
   - Set rules of engagement
   - Document methodology

2. Planning document
   - 2-3 page scope statement

---

#### Phase 2: Reconnaissance (Week 7, Days 3-5)
**Points:** 30

**Tasks:**
1. OSINT gathering
   - Company research
   - Employee research
   - Network research

2. Network discovery
   - IP range identification
   - Network mapping

3. Service identification
   - Port scanning
   - Service enumeration
   - Version identification

**Deliverable:**
- Reconnaissance findings document
- Network topology diagram
- Service inventory

---

#### Phase 3: Vulnerability Assessment (Week 8, Days 1-3)
**Points:** 30

**Tasks:**
1. CVE identification
   - Search for applicable CVEs
   - Prioritize by CVSS score

2. Vulnerability mapping
   - Map CVEs to services
   - Assess exploitability

**Deliverable:**
- Vulnerability assessment
- Risk ratings

---

#### Phase 4: Professional Report (Week 8, Days 4-5)
**Points:** 30

**Tasks:**
1. Report compilation
   - All findings organized
   - Professional format
   - Executive summary
   - Detailed findings
   - Recommendations
   - Appendices

**Deliverable:**
- **Final Penetration Testing Report (15-20 pages)**
  - Executive Summary (2-3 pages)
  - Scope & Methodology (2-3 pages)
  - Findings & Vulnerabilities (5-8 pages)
  - Risk Assessment (2-3 pages)
  - Recommendations (2-3 pages)
  - Appendices (network diagrams, detailed findings)

---

**UTS Grading Rubric (100 points):**

| Criteria | Points |
|----------|--------|
| Completeness of reconnaissance | 20 |
| Accuracy of findings | 20 |
| Quality of vulnerability assessment | 20 |
| Professional presentation | 20 |
| Analysis depth and critical thinking | 20 |
| **TOTAL** | **100** |

---

### SESSION 5: Web Application Security & SQL Injection (Weeks 9-10)

**Learning Objectives:**
- Understand web application vulnerabilities
- Learn SQL injection attack techniques
- Practice exploitation methodology
- Understand mitigation strategies

**Lab Scenario:**
```
Vulnerable Application: VulnApp 1.0
Mission: Identify and exploit SQL injection vulnerabilities
Duration: 2 weeks
Points: 100
```

**Detailed Tasks:**

#### Task 5.1: SQL Injection Fundamentals
**Time Allocation:** Week 9, Days 1-3
**Points:** 30

**Subtasks:**
1. Identify SQL injection points
   - Analyze login form
   - Identify input fields susceptible to SQLi
   - Points: 10

2. Craft SQL injection payloads
   - Basic authentication bypass: `' OR '1'='1`
   - Union-based injection for data extraction
   - Boolean-based blind SQLi
   - Time-based blind SQLi
   - Points: 15

3. Document techniques
   - Explain each attack method
   - Show payloads and results
   - Points: 5

**Deliverable:**
- SQL Injection technique documentation
- Payload examples with explanations

**Grading Rubric:**
- Technique understanding (15 pts)
- Payload crafting (10 pts)
- Documentation (5 pts)

---

#### Task 5.2: Cross-Site Scripting (XSS)
**Time Allocation:** Week 9, Days 4-5, Week 10, Days 1-2
**Points:** 35

**Subtasks:**
1. Stored XSS exploitation
   - Identify injectable parameters
   - Craft XSS payload
   - Verify execution
   - Points: 12

2. Reflected XSS exploitation
   - Identify reflected inputs
   - Craft payloads
   - Test execution
   - Points: 12

3. XSS impact analysis
   - Assess data theft potential
   - Evaluate session hijacking risk
   - Points: 11

**Deliverable:**
- XSS exploitation report
- Payload examples
- Impact assessment

**Grading Rubric:**
- Payload accuracy (15 pts)
- Exploitation success (15 pts)
- Impact analysis (5 pts)

---

#### Task 5.3: Web Security Assessment Report
**Time Allocation:** Week 10, Days 3-5
**Points:** 35

**Subtasks:**
1. Compile exploitation findings
   - Document all successful attacks
   - Include evidence screenshots (simulated)
   - Show vulnerable code

2. Risk assessment
   - Evaluate severity
   - Estimate business impact
   - Prioritize fixes

3. Professional report
   - Use security report template
   - Include mitigation recommendations
   - Executive summary

**Deliverable:**
- Web Application Security Assessment Report (10-12 pages)
- Exploitation examples with evidence
- Risk ratings and recommendations

**Grading Rubric:**
- Report completeness (12 pts)
- Professionalism (12 pts)
- Analysis quality (11 pts)

---

**Session 5 Total:**
- Duration: 2 weeks
- Points: 100
- Deliverables: SQLi documentation, XSS report, security assessment
- Prerequisites: Sessions 1-4
- Skills Gained: Web vulnerability exploitation, security assessment

---

### SESSION 6: Metasploit Framework & Privilege Escalation (Weeks 11-12)

**Learning Objectives:**
- Learn Metasploit framework basics
- Practice privilege escalation techniques
- Understand post-exploitation activities
- Learn lateral movement concepts

**Lab Scenario:**
```
Mission: Exploit vulnerable services and escalate privileges
Targets: Services from Session 2
Duration: 2 weeks
Points: 100
```

**Detailed Tasks:**

#### Task 6.1: Metasploit Framework Basics
**Time Allocation:** Weeks 11, Days 1-3
**Points:** 30

**Subtasks:**
1. Module selection
   - Select appropriate exploit module
   - Understand module options
   - Set required parameters
   - Points: 10

2. Payload generation
   - Select payload type
   - Generate shellcode
   - Understand payload options
   - Points: 10

3. Exploitation execution
   - Execute exploit (simulated)
   - Verify successful exploitation
   - Document results
   - Points: 10

**Deliverable:**
- Metasploit exploitation documentation
- Module configurations
- Execution logs

**Grading Rubric:**
- Module selection (10 pts)
- Configuration accuracy (10 pts)
- Execution success (10 pts)

---

#### Task 6.2: Privilege Escalation Techniques
**Time Allocation:** Week 11, Days 4-5, Week 12, Days 1-2
**Points:** 35

**Subtasks:**
1. Linux privilege escalation
   - Identify SUID binaries
   - Kernel exploit research
   - Misconfigurations exploitation
   - Points: 12

2. Windows privilege escalation
   - Token impersonation
   - UAC bypass techniques
   - Registry manipulation
   - Points: 12

3. Post-exploitation (simulated)
   - Verify privilege level
   - System reconnaissance
   - Document privileges obtained
   - Points: 11

**Deliverable:**
- Privilege escalation techniques document
- PoC (Proof of Concept) examples
- Results documentation

**Grading Rubric:**
- Technique understanding (15 pts)
- Escalation success (15 pts)
- Post-exploitation (5 pts)

---

#### Task 6.3: Exploitation & Post-Exploitation Report
**Time Allocation:** Week 12, Days 3-5
**Points:** 35

**Subtasks:**
1. Compile all exploitation activities
   - Metasploit usage details
   - Privilege escalation chain
   - Post-exploitation activities

2. System access documentation
   - Show access levels obtained
   - Document system state
   - Evidence collection

3. Professional report
   - Detailed exploitation narrative
   - Recommendations for hardening
   - Executive summary

**Deliverable:**
- Exploitation & Privilege Escalation Report (10-12 pages)
- Exploitation methodology documentation
- Hardening recommendations

**Grading Rubric:**
- Completeness (12 pts)
- Technical accuracy (12 pts)
- Professionalism (11 pts)

---

**Session 6 Total:**
- Duration: 2 weeks
- Points: 100
- Deliverables: Metasploit documentation, privilege escalation report
- Prerequisites: Sessions 1-5
- Skills Gained: Exploitation frameworks, privilege escalation, post-exploitation

---

### SESSION 7: Report Writing, Social Engineering & CTF (Weeks 13-14)

**Learning Objectives:**
- Master professional penetration testing report writing
- Understand social engineering attack vectors
- Practice CTF (Capture The Flag) challenges
- Develop critical thinking skills

**Lab Activities:**

#### Activity 7.1: Professional Report Writing (Week 13)
**Points:** 40

**Tasks:**
1. Report template training
   - Executive summary writing
   - Finding documentation
   - Risk rating methodology
   - Recommendation crafting

2. Real report examples
   - Study professional pentest reports
   - Understand industry standards
   - Learn from best practices

3. Group report writing
   - Students compile all findings from previous sessions
   - Create comprehensive report
   - Peer review process

**Deliverable:**
- Comprehensive penetration testing report (20-25 pages)
- All findings compiled
- Professional presentation

**Grading Rubric:**
- Structure and organization (15 pts)
- Writing quality (15 pts)
- Technical accuracy (10 pts)

---

#### Activity 7.2: Social Engineering Awareness (Week 13)
**Points:** 30

**Tasks:**
1. Social engineering simulation
   - Phishing email analysis
   - Social engineering tactics
   - Mitigation strategies

2. Case studies
   - Real-world social engineering attacks
   - Analysis and discussion
   - Countermeasures

3. Documentation
   - Social engineering vectors
   - Defense mechanisms
   - Policy recommendations

**Deliverable:**
- Social engineering analysis document
- Defense recommendations

**Grading Rubric:**
- Awareness (10 pts)
- Analysis quality (10 pts)
- Recommendations (10 pts)

---

#### Activity 7.3: CTF Challenges (Week 14)
**Points:** 30

**Tasks:**
1. Easy CTF (10 points)
   - OSINT challenge
   - Find hidden information
   - Extract flag

2. Medium CTF (10 points)
   - Simple vulnerability exploitation
   - Password cracking
   - Extract flag

3. Hard CTF (10 points)
   - Multi-stage challenge
   - Combine multiple techniques
   - Extract flag

**Deliverable:**
- CTF flags submission
- Challenge walkthrough documentation

**Grading Rubric:**
- Easy flag (10 pts)
- Medium flag (10 pts)
- Hard flag (10 pts)

---

**Session 7 Total:**
- Duration: 2 weeks
- Points: 100
- Deliverables: Final report, social engineering analysis, CTF solutions
- Prerequisites: Sessions 1-6
- Skills Gained: Professional writing, awareness, problem-solving

---

### SESSION 8: UAS - Full Penetration Test Simulation (Weeks 15-16)

**Learning Objectives:**
- Conduct end-to-end penetration test
- Demonstrate all learned skills
- Create professional final report
- Comprehensive assessment

**Project Requirements:**

#### Comprehensive Penetration Testing Engagement

**Scenario:**
```
Client: Global Technology Solutions Inc.
Website: globaltechsolutions.com
Network Range: 10.0.0.0/24
Scope: Full penetration testing (all techniques learned)
Rules of Engagement: Full testing authorized
Duration: 2 weeks (Week 15-16)
Points: 100 (UAS = 35% of grade - Most important!)
```

**Phases:**

##### Phase 1: Pre-Engagement (Week 15, Days 1-2)
**Points:** 10

**Tasks:**
1. Scope & Methodology
   - Define targets
   - Set ROE (Rules of Engagement)
   - Create testing plan

2. Deliverable:
   - Pre-engagement document (3-4 pages)

---

##### Phase 2: Reconnaissance (Week 15, Days 3-5)
**Points:** 20

**Tasks:**
1. OSINT gathering
2. Network discovery
3. IP range identification

**Deliverable:**
- Reconnaissance findings
- Initial network map

---

##### Phase 3: Scanning & Enumeration (Week 16, Days 1-2)
**Points:** 20

**Tasks:**
1. Network scanning (Nmap)
2. Service enumeration
3. Version identification

**Deliverable:**
- Network topology diagram
- Service inventory

---

##### Phase 4: Vulnerability Analysis (Week 16, Days 2-3)
**Points:** 15

**Tasks:**
1. CVE identification
2. Vulnerability mapping
3. Risk assessment

**Deliverable:**
- Vulnerability list
- Risk matrix

---

##### Phase 5: Exploitation & Post-Exploitation (Week 16, Days 3-4)
**Points:** 20

**Tasks:**
1. Web vulnerabilities exploitation (SQLi, XSS)
2. Service exploitation (Metasploit)
3. Privilege escalation
4. Post-exploitation activities

**Deliverable:**
- Exploitation documentation
- System access evidence

---

##### Phase 6: Final Report (Week 16, Days 4-5)
**Points:** 15

**Deliverable: COMPREHENSIVE PENETRATION TESTING REPORT (30-40 pages)**

**Report Structure:**
1. **Executive Summary** (3-5 pages)
   - Overview of findings
   - High-level risks
   - Key recommendations

2. **Methodology** (2-3 pages)
   - Testing approach
   - Tools used
   - Timeline

3. **Scope & Rules of Engagement** (2 pages)
   - Defined targets
   - Testing boundaries
   - Authorization confirmation

4. **Findings** (15-20 pages)
   - Detailed for each vulnerability
   - CVSS scores
   - Impact assessment
   - Exploitation proof

5. **Risk Assessment** (3-5 pages)
   - Risk matrix
   - Severity ratings
   - Business impact

6. **Recommendations** (3-5 pages)
   - Remediation steps
   - Prioritization
   - Implementation roadmap

7. **Appendices**
   - Network diagrams
   - Service inventory
   - CVE details
   - Command examples

---

**UAS Grading Rubric (100 points):**

| Criteria | Points |
|----------|--------|
| Reconnaissance completeness | 15 |
| Scanning & enumeration accuracy | 15 |
| Vulnerability identification (quantity & accuracy) | 20 |
| Exploitation success | 15 |
| Post-exploitation documentation | 10 |
| Report professional quality | 15 |
| Analysis depth and critical thinking | 10 |
| **TOTAL** | **100** |

---

**Final Grade Calculation:**

```
Final Grade = (10% × Attendance) + (30% × Weekly Labs Avg) + (25% × UTS) + (35% × UAS)

Example:
- Attendance: 90/100 → 9 points
- Weekly Labs: 85/100 → 25.5 points
- UTS: 78/100 → 19.5 points
- UAS: 88/100 → 30.8 points
- TOTAL: 84.8 → Grade B
```

---

## DEVELOPMENT ROADMAP

### Phase 1: Foundation (Weeks 1-2) - CRITICAL PATH

**Week 1:**
- [ ] Setup Next.js project structure
- [ ] Configure TypeScript
- [ ] Setup Tailwind CSS
- [ ] Initialize PostgreSQL database
- [ ] Setup Prisma ORM
- [ ] Create database schema
- [ ] Setup authentication system (JWT)
- [ ] Create user model & registration flow

**Week 2:**
- [ ] Login functionality
- [ ] Session management with Redis
- [ ] Role-based access control
- [ ] Create lab_sessions table & seed data
- [ ] Build dashboard skeleton
- [ ] Create lab_scenarios table
- [ ] Setup file structure for API routes

**Deliverables:**
- Basic authentication working
- Database schema created
- Project structure ready
- Can login as student/instructor

---

### Phase 2: Core Platform (Weeks 3-4) - CRITICAL PATH

**Week 3:**
- [ ] Build Session 1 content (OSINT lab)
- [ ] Create command_database table
- [ ] Build OSINT simulator (`osint-simulator.ts`)
- [ ] Create terminal emulator component
- [ ] Implement basic command routing
- [ ] Build lab interface component
- [ ] Create Session 1 UI

**Week 4:**
- [ ] Build Session 2 content (Nmap lab)
- [ ] Create Nmap simulator (`nmap-simulator.ts`)
- [ ] Implement command validation
- [ ] Build progress tracking
- [ ] Create scoring engine basics
- [ ] Build lab completion detection
- [ ] Setup automated grading for Session 1 & 2

**Deliverables:**
- Session 1 fully functional
- Session 2 fully functional
- Terminal emulator working
- Basic scoring system

---

### Phase 3: Assessment & Reporting (Weeks 5-6)

**Week 5:**
- [ ] Build Session 3 content (Vulnerability Assessment)
- [ ] Create vulnerability database
- [ ] Create password cracking simulator
- [ ] Build report template system
- [ ] Create report generation engine
- [ ] Build report viewer component

**Week 6:**
- [ ] Build Session 4 UTS framework
- [ ] Create UTS submission system
- [ ] Build progress dashboard
- [ ] Create analytics/stats system
- [ ] Build hint system for labs
- [ ] Implement anti-cheat detection basics

**Deliverables:**
- Session 3 functional
- Report generation working
- UTS framework ready
- Progress tracking functional

---

### Phase 4: Advanced Features (Weeks 7-8)

**Week 7:**
- [ ] Build Session 5 content (Web vulnerabilities)
- [ ] Create vulnerable web app simulator
- [ ] Implement SQL injection simulation
- [ ] Implement XSS simulation
- [ ] Build command history tracking
- [ ] Create audit logging system

**Week 8:**
- [ ] Build Session 6 content (Metasploit & privesc)
- [ ] Create Metasploit framework simulator
- [ ] Create privilege escalation scenarios
- [ ] Build admin dashboard
- [ ] Create student management interface
- [ ] Implement analytics dashboard
- [ ] Create comprehensive testing suite

**Deliverables:**
- All 6 sessions functional
- Admin dashboard working
- Audit logging active
- Full feature set operational

---

### Phase 5: Polish & Deployment (Post-Launch)

**During Semester:**
- [ ] Bug fixes based on student feedback
- [ ] Performance optimization
- [ ] UI/UX improvements
- [ ] Session 7 content refinement
- [ ] Session 8 (UAS) framework preparation
- [ ] Load testing for 200 concurrent users
- [ ] Security hardening

**Post-Semester:**
- [ ] User feedback analysis
- [ ] Feature improvements
- [ ] Database optimization
- [ ] Documentation updates
- [ ] Curriculum integration

---

## DEPLOYMENT & INFRASTRUCTURE

### Hosting Options

#### Option 1: Vercel (Recommended for Quick Launch)
```
Pros:
✅ Zero-config deployment
✅ Automatic scaling
✅ Built-in CI/CD
✅ Free tier available

Cons:
❌ Serverless limitations (long-running tasks)
❌ Cold starts possible
❌ Database must be external

Cost: $50-200/month
```

#### Option 2: Railway
```
Pros:
✅ Full Docker support
✅ Easy environment setup
✅ GitHub integration
✅ Affordable

Cons:
❌ Less mature than Vercel
❌ Less extensive documentation

Cost: $100-300/month
```

#### Option 3: DigitalOcean (App Platform + Managed DB)
```
Pros:
✅ Full control
✅ Predictable pricing
✅ Good documentation
✅ High performance

Cons:
❌ More setup required
❌ DevOps knowledge needed

Cost: $150-400/month
```

---

### Recommended Stack for Deployment

```
Frontend Deployment:
├── Option A: Vercel (FREE TIER or $20/month)
│   ├── Automatic deployments on push
│   ├── CDN included
│   └── Edge functions support
│
└── Option B: Netlify
    ├── Similar to Vercel
    └── Good free tier

Backend/Database:
├── Option A: PostgreSQL + Redis (Render.com)
│   ├── PostgreSQL: $15-30/month
│   ├── Redis: $15-30/month
│   └── Node.js: Included with Vercel
│
└── Option B: Supabase (PostgreSQL + Auth)
    ├── PostgreSQL: FREE tier or $25/month
    ├── Auth included
    └── Easy integration

Total Estimated Cost: $50-150/month
```

---

### Environment Variables

**Create `.env.local` file (DO NOT COMMIT):**

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ethical-hacking-lab"
DIRECT_URL="postgresql://user:password@localhost:5432/ethical-hacking-lab"

# Redis
REDIS_URL="redis://localhost:6379"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# JWT
JWT_SECRET="your-jwt-secret-key"

# API Configuration
API_BASE_URL="http://localhost:3000"

# Email (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# File Storage
STORAGE_PATH="./public/uploads"
STORAGE_BUCKET_NAME="ethical-hacking-reports"

# Analytics (Optional)
NEXT_PUBLIC_GA_ID="your-google-analytics-id"
```

---

## GRADING SYSTEM

### Final Grade Calculation

```
FORMULA:
Final Grade = (10% × Attendance) + (30% × Weekly Labs) + (25% × UTS) + (35% × UAS)

COMPONENTS:

1. Attendance & Participation (10%)
   - Per-session attendance tracking
   - Participation in labs
   - Scale: 0-100

2. Weekly Labs (30%)
   - 7 sessions × individual scores
   - Each session: 0-100 points
   - Average calculated
   - Scale: 0-100

3. UTS - Mid-Term (25%)
   - Session 4: Reconnaissance & Scanning Project
   - Single comprehensive project
   - Scale: 0-100

4. UAS - Final Exam (35%) [MOST IMPORTANT]
   - Session 8: Full Penetration Test
   - Comprehensive exam covering all skills
   - Scale: 0-100

PASSING CRITERIA:
- Final Score ≥ 60 (D grade)
- Attendance ≥ 75%
- Completed ≥ 75% of assignments
```

### Grade Scale

| Score | Grade | Status |
|-------|-------|--------|
| 85-100 | A | Excellent |
| 80-84 | B+ | Very Good |
| 75-79 | B | Good |
| 70-74 | C+ | Satisfactory |
| 65-69 | C | Adequate |
| 60-64 | D | Minimum |
| < 60 | F | Fail |

---

### Scoring Rubric Template

**Example: Session 1 Task Scoring**

```typescript
// Session 1: OSINT Lab
const session1Rubric = {
  task1: {
    title: "OSINT Information Gathering",
    maxPoints: 30,
    subTasks: [
      {
        name: "Company Information",
        criteria: ["Completeness", "Accuracy"],
        points: 10
      },
      {
        name: "DNS Enumeration",
        criteria: ["Record discovery", "Analysis"],
        points: 10
      },
      {
        name: "IP Geolocation",
        criteria: ["IP identification", "Interpretation"],
        points: 10
      }
    ]
  },
  task2: {
    title: "Ethics & Legal Framework",
    maxPoints: 20,
    subTasks: [
      {
        name: "Ethics Quiz",
        criteria: ["Accuracy"],
        points: 10
      },
      {
        name: "Case Study",
        criteria: ["Analysis", "Understanding"],
        points: 10
      }
    ]
  },
  task3: {
    title: "Professional Reporting",
    maxPoints: 50,
    subTasks: [
      {
        name: "Completeness",
        criteria: ["All findings included"],
        points: 20
      },
      {
        name: "Professional Presentation",
        criteria: ["Formatting", "Clarity"],
        points: 15
      },
      {
        name: "Technical Accuracy",
        criteria: ["Correctness", "Detail"],
        points: 15
      }
    ]
  }
};
```

---

## API ENDPOINTS

### Authentication Endpoints

```typescript
// POST /api/auth/register
// Register new student
Request: {
  email: string,
  password: string,
  fullName: string,
  studentId: string,
  department: string
}
Response: {
  success: boolean,
  message: string,
  userId?: UUID,
  token?: JWT
}

// POST /api/auth/login
// Login user
Request: {
  email: string,
  password: string
}
Response: {
  success: boolean,
  token: JWT,
  user: {
    id: UUID,
    email: string,
    fullName: string,
    role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'
  }
}

// POST /api/auth/logout
// Logout user
Response: {
  success: boolean,
  message: string
}

// GET /api/auth/me
// Get current user
Response: {
  user: User
}
```

### Lab Endpoints

```typescript
// GET /api/labs
// Get all available labs
Response: {
  labs: LabSession[],
  total: number
}

// GET /api/labs/[labId]
// Get specific lab details
Response: {
  lab: LabSession,
  scenarios: LabScenario[],
  studentProgress?: StudentProgress
}

// GET /api/labs/[labId]/scenarios/[scenarioId]
// Get specific scenario
Response: {
  scenario: LabScenario,
  hints: Hint[],
  successCriteria: SuccessCriteria[]
}
```

### Command Execution Endpoints

```typescript
// POST /api/commands/execute
// Execute a command in lab
Request: {
  studentId: UUID,
  labId: UUID,
  scenarioId: UUID,
  command: string
}
Response: {
  success: boolean,
  output: string,
  isCorrect: boolean,
  pointsAwarded: number,
  message: string,
  hint?: string,
  cheatingDetected?: boolean
}

// POST /api/commands/validate
// Dry-run validate command (no points)
Request: {
  command: string,
  scenarioId: UUID
}
Response: {
  isValid: boolean,
  message: string,
  expectedPattern?: string
}

// GET /api/commands/history/[studentId]/[scenarioId]
// Get command history
Response: {
  commands: CommandHistory[],
  total: number
}
```

### Progress Endpoints

```typescript
// GET /api/progress/[studentId]
// Get student's overall progress
Response: {
  student: User,
  sessions: SessionProgress[],
  totalPoints: number,
  completionPercentage: number,
  currentGrade: string
}

// GET /api/progress/[studentId]/[labId]
// Get progress for specific lab
Response: {
  lab: LabSession,
  scenarios: ScenarioProgress[],
  totalPoints: number,
  maxPoints: number,
  completion: number
}
```

### Report Endpoints

```typescript
// POST /api/reports/generate
// Generate report for student
Request: {
  studentId: UUID,
  sessionId: UUID,
  reportType: 'SESSION_REPORT' | 'FINAL_REPORT'
}
Response: {
  success: boolean,
  reportId: UUID,
  pdfUrl: string,
  message: string
}

// GET /api/reports/[reportId]
// Get report
Response: {
  report: Report,
  content: ReportContent
}

// GET /api/reports/[reportId]/download
// Download report as PDF
Response: Binary PDF file
```

### Admin Endpoints

```typescript
// GET /api/admin/users
// Get all users
Response: {
  users: User[],
  total: number
}

// PUT /api/admin/users/[userId]
// Update user
Request: {
  fullName?: string,
  department?: string,
  isActive?: boolean
}
Response: {
  user: User
}

// GET /api/admin/analytics
// Get platform analytics
Response: {
  totalStudents: number,
  totalLabsCompleted: number,
  averageGrade: number,
  completionRate: number,
  sessionStats: SessionStat[]
}

// GET /api/admin/audit-logs
// Get audit logs
Response: {
  logs: AuditLog[],
  total: number
}
```

---

## IMPLEMENTATION PRIORITIES

### Must-Have Features (Weeks 1-4)
1. ✅ User authentication & authorization
2. ✅ Database schema & setup
3. ✅ Terminal emulator component
4. ✅ Session 1 lab (OSINT)
5. ✅ Session 2 lab (Nmap)
6. ✅ Basic command routing
7. ✅ Scoring system
8. ✅ Progress tracking

### Should-Have Features (Weeks 5-7)
1. ⭐ Report generation system
2. ⭐ Session 3-4 labs
3. ⭐ Anti-cheat system
4. ⭐ Admin dashboard
5. ⭐ Hint system
6. ⭐ Lab completion detection

### Nice-to-Have Features (Post-Launch)
1. 💎 Session 5-8 labs (advanced)
2. 💎 Analytics dashboard
3. 💎 Leaderboard system
4. 💎 Lab replay/rewind
5. 💎 Mobile optimization
6. 💎 Real-time notifications

---

## TESTING STRATEGY

### Unit Testing
```
lib/simulation/ - Test all simulators
lib/scoring/ - Test scoring calculations
lib/validation/ - Test validators
lib/security/ - Test anti-cheat logic
```

### Integration Testing
```
API routes - Test end-to-end flows
Database - Test data persistence
Auth flow - Test authentication
Lab workflow - Test complete lab session
```

### Load Testing
```
Target: 200 concurrent students
Tools: Apache JMeter or k6
Metrics: Response time, throughput, errors
```

---

## SUCCESS METRICS

### Technical Metrics
- [ ] Platform uptime ≥ 99%
- [ ] Page load time < 2 seconds
- [ ] API response time < 500ms
- [ ] Zero security vulnerabilities
- [ ] 100% automated tests passing

### Educational Metrics
- [ ] ≥ 90% student completion rate
- [ ] ≥ 85% student satisfaction
- [ ] Average grade ≥ 70
- [ ] ≥ 80% skill acquisition
- [ ] ≥ 95% attendance

### Operational Metrics
- [ ] Platform stability (no crashes)
- [ ] <5 min response to critical issues
- [ ] <1% data loss incidents
- [ ] ≤ 10 bug reports per 100 students
- [ ] <1 minute lab setup time per student

---

## FUTURE ENHANCEMENTS

### Post-Semester Improvements
1. **Docker Integration** - Add real Kali containers for advanced labs
2. **AI-Powered Hints** - Use Claude API for intelligent hint generation
3. **Peer Collaboration** - Add discussion forums per lab
4. **Mobile App** - Native iOS/Android applications
5. **Offline Mode** - Download labs for offline practice
6. **Certification Path** - Multi-course certification program
7. **Industry Partnerships** - Integration with industry employers
8. **Advanced Analytics** - ML-based learning pattern analysis

---

## REFERENCES & RESOURCES

### Documentation
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- PostgreSQL: https://www.postgresql.org/docs
- xterm.js: https://xtermjs.org

### Security Resources
- OWASP Top 10: https://owasp.org/www-project-top-ten
- CompTIA PenTest+: https://www.comptia.org/certifications/pentest
- CVE Database: https://cve.mitre.org

### Learning Materials
- Ethical Hacking Fundamentals
- Penetration Testing Methodology
- Professional Report Writing Guide

---

## CONTACT & SUPPORT

**Project Lead:** Devnolife  
**Institution:** Universitas Muhammadiyah Makassar  
**Department:** Informatika, Fakultas Teknik  
**Course:** Ethical Hacking and Penetration Testing I (CW6552021559)  
**Semester:** V (2024/2025)  

---

## LICENSE & USAGE

This platform is designed for educational purposes within Universitas Muhammadiyah Makassar.

**Permitted Uses:**
- ✅ Student learning and practice
- ✅ Educational assessment
- ✅ Curriculum development
- ✅ Academic research

**Prohibited Uses:**
- ❌ Commercial use without permission
- ❌ Unauthorized distribution
- ❌ Real penetration testing on non-owned systems
- ❌ Unethical hacking activities

---

**Last Updated:** January 2025  
**Version:** 1.0  
**Status:** Ready for Development

---
