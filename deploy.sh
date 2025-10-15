#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Store the current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Pull latest changes
echo "📥 Pulling latest changes from $CURRENT_BRANCH..."
git pull origin $CURRENT_BRANCH

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build packages first
echo "🔨 Building packages..."
pnpm build:packages

# Build Next.js application
echo "🔨 Building Next.js application..."
pnpm build:app

# Create logs directory if it doesn't exist
mkdir -p logs

# Restart or start PM2
echo "♻️  Restarting application..."
if pm2 describe pubdev > /dev/null 2>&1; then
  pm2 reload pubdev --update-env
else
  pm2 start ecosystem.config.js
fi

# Show status
echo "📊 Current status:"
pm2 status

echo ""
echo "✅ Deployment complete!"
echo "📝 View logs with: pm2 logs pubdev"

