# Docker & CI/CD Setup Guide

## 🐳 Docker Setup

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Make (optional, for convenience commands)

### Quick Start (Development)

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Start development services (PostgreSQL & Redis):**
   ```bash
   # Using Make
   make dev

   # Or using Docker Compose directly
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```

4. **Seed the database:**
   ```bash
   npm run db:seed
   ```

5. **Start the Next.js development server:**
   ```bash
   npm run dev
   ```

### Production Deployment

1. **Build and start all services:**
   ```bash
   # Using Make
   make build
   make start

   # Or using Docker Compose directly
   docker-compose build
   docker-compose up -d
   ```

2. **Run migrations:**
   ```bash
   make migrate
   ```

### Available Make Commands

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make dev` | Start development services |
| `make dev-down` | Stop development services |
| `make build` | Build Docker images |
| `make start` | Start production services |
| `make stop` | Stop all services |
| `make logs` | View logs from all services |
| `make shell` | Open shell in app container |
| `make shell-db` | Open PostgreSQL shell |
| `make migrate` | Run database migrations |
| `make seed` | Seed the database |
| `make clean` | Remove containers and volumes |

---

## 🔄 GitHub Actions CI/CD

### Workflows

#### 1. CI/CD Pipeline (`.github/workflows/ci-cd.yml`)

Triggered on push to `main` or `develop` branches:

- **Lint & Type Check**: ESLint and TypeScript validation
- **Build**: Compile the Next.js application
- **Security Scan**: npm audit for vulnerabilities
- **Docker Build & Push**: Build and push to GitHub Container Registry
- **Deploy Staging**: Automatic deployment to staging
- **Deploy Production**: Manual approval required

#### 2. PR Check (`.github/workflows/pr-check.yml`)

Triggered on pull requests:

- Validates code quality
- Checks for Prisma schema changes
- Comments on PRs with migration warnings

#### 3. Database Migration (`.github/workflows/db-migrate.yml`)

Manual workflow for database migrations:

- Choose environment (staging/production)
- Run Prisma migrations safely

### Setup Required

#### 1. GitHub Secrets

Navigate to **Settings → Secrets and Variables → Actions** and add:

| Secret | Description |
|--------|-------------|
| `DATABASE_URL` | PostgreSQL connection string for production |
| `JWT_SECRET` | JWT secret key for production |

#### 2. GitHub Environments

Create environments in **Settings → Environments**:

- **staging**
  - Add `STAGING_URL` variable
  - Add `DATABASE_URL` secret

- **production**
  - Add `PRODUCTION_URL` variable
  - Add `DATABASE_URL` secret
  - Configure required reviewers for deployment approval

#### 3. GitHub Container Registry

The workflow automatically pushes Docker images to:
```
ghcr.io/<owner>/<repository>:latest
ghcr.io/<owner>/<repository>:main-<sha>
```

### Deployment Strategies

#### Option A: Self-Hosted Server with Docker

```bash
# On your server
docker pull ghcr.io/<owner>/<repository>:latest

# Using docker-compose
docker-compose pull
docker-compose up -d
```

#### Option B: Deploy to Cloud Platforms

**Railway:**
```bash
railway link
railway up
```

**Vercel (without Docker):**
```bash
vercel deploy --prod
```

**DigitalOcean App Platform:**
- Connect your GitHub repository
- Configure build command: `npm run build`
- Configure run command: `npm start`

---

## 📁 File Structure

```
├── .github/
│   └── workflows/
│       ├── ci-cd.yml        # Main CI/CD pipeline
│       ├── pr-check.yml     # PR validation
│       └── db-migrate.yml   # Database migration workflow
├── Dockerfile               # Production multi-stage build
├── Dockerfile.migrate       # Migration runner
├── docker-compose.yml       # Production services
├── docker-compose.dev.yml   # Development services
├── .dockerignore           # Docker build exclusions
├── .env.example            # Environment template
└── Makefile                # Convenience commands
```

---

## 🔧 Troubleshooting

### Common Issues

**1. Docker build fails with Prisma error:**
```bash
# Ensure Prisma client is generated
npx prisma generate
```

**2. Database connection refused:**
```bash
# Check if database is running
docker-compose ps

# View database logs
make logs-db
```

**3. Port already in use:**
```bash
# Check what's using the port
lsof -i :3000
lsof -i :5432

# Or change ports in .env
APP_PORT=3001
DB_PORT=5433
```

**4. Permission denied on volume:**
```bash
# Reset volumes
make clean
make start
```

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Use strong secrets** - Generate JWT secrets with:
   ```bash
   openssl rand -base64 32
   ```
3. **Rotate secrets regularly** - Update GitHub Secrets periodically
4. **Use environment-specific secrets** - Different secrets for staging/production
5. **Enable branch protection** - Require PR reviews before merging to main
