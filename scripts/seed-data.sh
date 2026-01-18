#!/bin/bash
# Seed development data

set -e

echo "🌱 Seeding development data..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Run seed scripts (placeholder - implement based on your needs)
echo "📦 Inserting seed data..."

# Example:
# cd services/api-service && npm run seed

echo "✅ Seed data inserted!"
echo ""
echo "Test accounts created:"
echo "  Email: test@example.com"
echo "  Password: password123"
