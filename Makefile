# ============================================
# Makefile for Ethical Hacking Lab Platform
# ============================================

.PHONY: help dev dev-up dev-down build start stop restart logs shell migrate seed clean

# Colors
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(GREEN)Ethical Hacking Lab Platform - Docker Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'

# ============================================
# Development Commands
# ============================================

dev-up: ## Start development environment (database & redis only)
	docker-compose -f docker-compose.dev.yml up -d
	@echo "$(GREEN)Development services started!$(NC)"
	@echo "PostgreSQL: localhost:5432"
	@echo "Redis: localhost:6379"
	@echo "PgAdmin: http://localhost:5050"

dev-down: ## Stop development environment
	docker-compose -f docker-compose.dev.yml down
	@echo "$(GREEN)Development services stopped!$(NC)"

dev: dev-up ## Start development (alias for dev-up)
	@echo "$(GREEN)Run 'npm run dev' to start the Next.js app$(NC)"

# ============================================
# Production Commands
# ============================================

build: ## Build Docker images
	docker-compose build
	@echo "$(GREEN)Docker images built successfully!$(NC)"

start: ## Start all services in production mode
	docker-compose up -d
	@echo "$(GREEN)All services started!$(NC)"

stop: ## Stop all services
	docker-compose down
	@echo "$(GREEN)All services stopped!$(NC)"

restart: ## Restart all services
	docker-compose restart
	@echo "$(GREEN)All services restarted!$(NC)"

# ============================================
# Logs & Shell
# ============================================

logs: ## Show logs from all services
	docker-compose logs -f

logs-app: ## Show logs from app service only
	docker-compose logs -f app

logs-db: ## Show logs from database service only
	docker-compose logs -f db

shell: ## Open shell in app container
	docker-compose exec app sh

shell-db: ## Open psql shell in database container
	docker-compose exec db psql -U postgres -d ethical_hacking_lab

# ============================================
# Database Commands
# ============================================

migrate: ## Run database migrations
	docker-compose run --rm migrate
	@echo "$(GREEN)Migrations completed!$(NC)"

migrate-dev: ## Run database migrations in development
	npx prisma migrate dev
	@echo "$(GREEN)Migrations completed!$(NC)"

seed: ## Seed the database
	docker-compose exec app npx prisma db seed
	@echo "$(GREEN)Database seeded!$(NC)"

seed-dev: ## Seed the database in development
	npm run db:seed
	@echo "$(GREEN)Database seeded!$(NC)"

studio: ## Open Prisma Studio
	npx prisma studio

# ============================================
# Cleanup Commands
# ============================================

clean: ## Remove all containers and volumes
	docker-compose down -v
	docker-compose -f docker-compose.dev.yml down -v
	@echo "$(GREEN)Containers and volumes removed!$(NC)"

clean-all: ## Remove all containers, volumes, and images
	docker-compose down -v --rmi all
	docker-compose -f docker-compose.dev.yml down -v --rmi all
	@echo "$(GREEN)All containers, volumes, and images removed!$(NC)"

prune: ## Remove unused Docker resources
	docker system prune -f
	@echo "$(GREEN)Unused resources removed!$(NC)"

# ============================================
# Testing & CI Commands
# ============================================

lint: ## Run ESLint
	npm run lint

type-check: ## Run TypeScript type check
	npx tsc --noEmit

build-check: ## Build the application
	npm run build

ci: lint type-check build-check ## Run all CI checks
	@echo "$(GREEN)All CI checks passed!$(NC)"
