#!/bin/bash

# Concert Ticketing System - Quick Start Script

echo "🎵 Concert Ticketing System - Quick Start"
echo "=========================================="
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose found"
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found. Please run this script from the project root."
    exit 1
fi

# Build and start
echo "🚀 Building and starting services..."
echo ""

docker-compose down -v 2>/dev/null

echo "Building images..."
docker-compose build --no-cache

echo ""
echo "Starting services..."
docker-compose up -d

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to start..."
sleep 5

# Check health
echo ""
echo "🏥 Checking service health..."

for i in {1..10}; do
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ Backend is ready"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "❌ Backend failed to start"
        exit 1
    fi
    echo "   Attempt $i/10..."
    sleep 2
done

# Display information
echo ""
echo "=========================================="
echo "✅ System is Ready!"
echo "=========================================="
echo ""
echo "📱 Frontend:  http://localhost:4200"
echo "🔌 Backend:   http://localhost:3000"
echo "📊 Blockchain: http://localhost:3000/blockchain"
echo "📋 Logs:      docker-compose logs -f"
echo ""
echo "🧪 Test Scenarios:"
echo "   1. Create concert"
echo "   2. View seats"
echo "   3. Buy ticket"
echo "   4. Check blockchain"
echo ""
echo "📚 Documentation:"
echo "   - README.md           - Overview"
echo "   - SETUP_GUIDE.md      - Setup instructions"
echo "   - API_DOCUMENTATION.md - All endpoints"
echo "   - ARCHITECTURE.md     - System design"
echo ""
echo "Type: docker-compose logs backend"
echo "to see live logs"
echo ""
