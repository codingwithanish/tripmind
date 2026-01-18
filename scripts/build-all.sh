#!/bin/bash
# Build all services

set -e

echo "🔨 Building all TripMind services..."

# Build packages first
echo "📦 Building shared packages..."
for pkg in packages/*/; do
    if [ -f "$pkg/package.json" ]; then
        echo "  Building $(basename $pkg)..."
        (cd "$pkg" && npm run build)
    fi
done

# Build web UI
echo "🌐 Building web-ui..."
(cd apps/web-ui && npm run build)

# Build API service
echo "🔧 Building api-service..."
(cd services/api-service && npm run build)

echo "✅ All services built successfully!"
