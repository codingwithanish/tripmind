#!/bin/bash
# Deploy to development environment

set -e

echo "🚀 Deploying to development environment..."

# Build images
echo "🔨 Building Docker images..."
docker-compose -f infra/docker/docker-compose.yml \
               -f infra/docker/docker-compose.dev.yml \
               build

# Start services
echo "🐳 Starting services..."
docker-compose -f infra/docker/docker-compose.yml \
               -f infra/docker/docker-compose.dev.yml \
               up -d

echo "✅ Development deployment complete!"
echo ""
echo "Services available at:"
echo "  Frontend: http://localhost:5173"
echo "  API:      http://localhost:3000"
echo "  MongoDB:  localhost:27017"
