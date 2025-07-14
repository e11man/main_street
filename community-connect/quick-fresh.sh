#!/bin/bash

echo "🚀 Quick fresh start - clearing caches and restarting..."

# Stop any running processes
echo "🛑 Stopping processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
sleep 2

# Clear Next.js cache
echo "🗑️  Clearing Next.js cache..."
rm -rf .next 2>/dev/null || true
rm -rf .swc 2>/dev/null || true
rm -rf .cache 2>/dev/null || true

# Clear npm cache
echo "🗑️  Clearing npm cache..."
npm cache clean --force 2>/dev/null || true

# Start development server
echo "🚀 Starting development server with fresh MongoDB data..."
echo "✅ Caches cleared!"
echo "🌐 Server will be available at http://localhost:3000"
echo "📊 MongoDB will now always pull fresh data!"
echo ""
echo "💡 Remember to clear your browser cache:"
echo "   Chrome/Edge: Ctrl+Shift+Delete"
echo "   Firefox: Ctrl+Shift+Delete"
echo "   Safari: Cmd+Option+E"
echo ""

npm run dev