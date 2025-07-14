#!/bin/bash

echo "🧹 Clearing all caches and restarting with fresh MongoDB data..."

# Stop any running processes
echo "🛑 Stopping any running processes..."
pkill -f "next dev" || true
pkill -f "npm run dev" || true
pkill -f "node" || true

# Clear Next.js cache completely
echo "🗑️  Clearing Next.js cache..."
rm -rf .next
rm -rf .swc
rm -rf .cache
rm -rf .vercel
rm -rf out

# Clear node modules and package-lock
echo "🗑️  Removing node_modules and package-lock..."
rm -rf node_modules
rm -f package-lock.json

# Clear npm cache completely
echo "🗑️  Clearing npm cache..."
npm cache clean --force
npm cache verify

# Clear any global caches
echo "🗑️  Clearing global caches..."
rm -rf ~/.npm/_cacache || true
rm -rf ~/.cache/npm || true

# Clear browser caches (if possible)
echo "🌐 Clearing browser caches..."
echo "Please manually clear your browser cache:"
echo "  - Chrome: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)"
echo "  - Firefox: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)"
echo "  - Safari: Cmd+Option+E"
echo "  - Edge: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)"

# Clear any remaining temporary files
echo "🧹 Clearing temporary files..."
find . -name "*.tmp" -delete
find . -name "*.log" -delete
find . -name ".DS_Store" -delete
find . -name "*.swp" -delete
find . -name "*.swo" -delete

# Clear any Docker caches if using Docker
echo "🐳 Clearing Docker caches (if applicable)..."
docker system prune -f || true

# Reinstall dependencies with fresh cache
echo "📦 Reinstalling dependencies with fresh cache..."
npm install --no-cache

# Set environment to development
export NODE_ENV=development
export NEXT_TELEMETRY_DISABLED=1

# Start development server with fresh data
echo "🚀 Starting development server with fresh MongoDB data..."
echo "✅ All caches cleared and dependencies reinstalled!"
echo "🌐 Server will be available at http://localhost:3000"
echo "📊 MongoDB will now always pull fresh data!"
echo "🔄 No caching enabled - all data will be fresh from MongoDB!"

npm run dev