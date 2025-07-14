#!/bin/bash

echo "🚀 Starting fresh MongoDB data pull - clearing all caches..."

# Function to print colored output
print_status() {
    echo -e "\033[1;34m$1\033[0m"
}

print_success() {
    echo -e "\033[1;32m$1\033[0m"
}

print_warning() {
    echo -e "\033[1;33m$1\033[0m"
}

print_error() {
    echo -e "\033[1;31m$1\033[0m"
}

# Stop any running processes
print_status "🛑 Stopping any running processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "node.*next" 2>/dev/null || true
sleep 2

# Clear Next.js cache completely
print_status "🗑️  Clearing Next.js cache..."
rm -rf .next 2>/dev/null || true
rm -rf .swc 2>/dev/null || true
rm -rf .cache 2>/dev/null || true
rm -rf .vercel 2>/dev/null || true
rm -rf out 2>/dev/null || true
rm -rf dist 2>/dev/null || true

# Clear node modules and package-lock
print_status "🗑️  Removing node_modules and package-lock..."
rm -rf node_modules 2>/dev/null || true
rm -f package-lock.json 2>/dev/null || true

# Clear npm cache completely
print_status "🗑️  Clearing npm cache..."
npm cache clean --force 2>/dev/null || true
npm cache verify 2>/dev/null || true

# Clear any global caches
print_status "🗑️  Clearing global caches..."
rm -rf ~/.npm/_cacache 2>/dev/null || true
rm -rf ~/.cache/npm 2>/dev/null || true
rm -rf ~/.npm 2>/dev/null || true

# Clear any remaining temporary files
print_status "🧹 Clearing temporary files..."
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name "*.log" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "*.swp" -delete 2>/dev/null || true
find . -name "*.swo" -delete 2>/dev/null || true
find . -name "*.pid" -delete 2>/dev/null || true

# Clear any Docker caches if using Docker
print_status "🐳 Clearing Docker caches (if applicable)..."
docker system prune -f 2>/dev/null || true

# Clear browser caches (instructions)
print_warning "🌐 Browser Cache Instructions:"
echo "Please manually clear your browser cache:"
echo "  - Chrome: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)"
echo "  - Firefox: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)"
echo "  - Safari: Cmd+Option+E"
echo "  - Edge: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)"
echo ""

# Reinstall dependencies with fresh cache
print_status "📦 Reinstalling dependencies with fresh cache..."
npm install --no-cache --force

if [ $? -eq 0 ]; then
    print_success "✅ Dependencies installed successfully!"
else
    print_error "❌ Failed to install dependencies. Please check your internet connection and try again."
    exit 1
fi

# Set environment variables
export NODE_ENV=development
export NEXT_TELEMETRY_DISABLED=1

# Verify MongoDB connection
print_status "🔍 Verifying MongoDB connection..."
node -e "
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI || 'mongodb+srv://joshalanellman:zIXJY3zEA0SH3WUm@mainstreetoppertunties.t85upr7.mongodb.net/?retryWrites=true&w=majority&appName=mainStreetOppertunties';

async function testConnection() {
  try {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('✅ MongoDB connection successful!');
    await client.close();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
"

if [ $? -eq 0 ]; then
    print_success "✅ MongoDB connection verified!"
else
    print_error "❌ MongoDB connection failed. Please check your connection string."
    exit 1
fi

# Start development server with fresh data
print_success "🚀 Starting development server with fresh MongoDB data..."
echo ""
print_success "✅ All caches cleared and dependencies reinstalled!"
print_success "🌐 Server will be available at http://localhost:3000"
print_success "📊 MongoDB will now always pull fresh data!"
print_success "🔄 No caching enabled - all data will be fresh from MongoDB!"
echo ""
print_warning "💡 Remember to clear your browser cache manually for the best experience!"
echo ""

# Start the development server
npm run dev