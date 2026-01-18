# TripMind Makefile
# Common development commands

.PHONY: install dev build test clean docker-up docker-down

# Install all dependencies
install:
	npm install
	cd apps/web-ui && npm install
	cd services/api-service && npm install

# Run development servers
dev:
	npm run dev

# Run frontend only
dev-frontend:
	npm run dev:frontend

# Run backend only
dev-backend:
	npm run dev:backend

# Build all services
build:
	./scripts/build-all.sh

# Build packages only
build-packages:
	@for pkg in packages/*/; do \
		if [ -f "$$pkg/package.json" ]; then \
			echo "Building $$pkg..."; \
			(cd "$$pkg" && npm run build); \
		fi \
	done

# Run tests
test:
	cd apps/web-ui && npm test
	cd services/api-service && npm test

# Clean build artifacts
clean:
	rm -rf apps/web-ui/dist
	rm -rf services/api-service/dist
	rm -rf packages/*/dist

# Clean node_modules
clean-modules:
	rm -rf node_modules
	rm -rf apps/web-ui/node_modules
	rm -rf services/api-service/node_modules
	rm -rf packages/*/node_modules

# Docker commands
docker-up:
	docker-compose -f infra/docker/docker-compose.yml up -d

docker-down:
	docker-compose -f infra/docker/docker-compose.yml down

docker-dev:
	docker-compose -f infra/docker/docker-compose.yml \
		-f infra/docker/docker-compose.dev.yml up

docker-build:
	docker-compose -f infra/docker/docker-compose.yml build

# Database commands
db-migrate:
	./scripts/migrate-db.sh

db-seed:
	./scripts/seed-data.sh

# Lint
lint:
	cd apps/web-ui && npm run lint
	cd services/api-service && npm run lint

# Help
help:
	@echo "Available commands:"
	@echo "  make install      - Install all dependencies"
	@echo "  make dev          - Run all development servers"
	@echo "  make dev-frontend - Run frontend only"
	@echo "  make dev-backend  - Run backend only"
	@echo "  make build        - Build all services"
	@echo "  make test         - Run all tests"
	@echo "  make clean        - Clean build artifacts"
	@echo "  make docker-up    - Start Docker containers"
	@echo "  make docker-down  - Stop Docker containers"
	@echo "  make lint         - Run linters"
