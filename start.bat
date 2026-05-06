@echo off
REM Concert Ticketing System - Quick Start Script for Windows

echo.
echo 🎵 Concert Ticketing System - Quick Start
echo ==========================================
echo.

REM Check Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose found
echo.

REM Check if docker-compose.yml exists
if not exist "docker-compose.yml" (
    echo ❌ docker-compose.yml not found. Please run this script from the project root.
    pause
    exit /b 1
)

REM Build and start
echo 🚀 Building and starting services...
echo.

docker-compose down -v >nul 2>&1

echo Building images...
docker-compose build --no-cache

echo.
echo Starting services...
docker-compose up -d

REM Wait for services
echo.
echo ⏳ Waiting for services to start...
timeout /t 5

REM Check health
echo.
echo 🏥 Checking service health...

setlocal enabledelayedexpansion
for /l %%i in (1,1,10) do (
    curl -s http://localhost:3000/health >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ Backend is ready
        goto :done
    )
    if %%i equ 10 (
        echo ❌ Backend failed to start
        pause
        exit /b 1
    )
    echo    Attempt %%i/10...
    timeout /t 2 /nobreak >nul
)

:done
REM Display information
echo.
echo ==========================================
echo ✅ System is Ready!
echo ==========================================
echo.
echo 📱 Frontend:  http://localhost:4200
echo 🔌 Backend:   http://localhost:3000
echo 📊 Blockchain: http://localhost:3000/blockchain
echo 📋 Logs:      docker-compose logs -f
echo.
echo 🧪 Test Scenarios:
echo    1. Create concert
echo    2. View seats
echo    3. Buy ticket
echo    4. Check blockchain
echo.
echo 📚 Documentation:
echo    - README.md           - Overview
echo    - SETUP_GUIDE.md      - Setup instructions
echo    - API_DOCUMENTATION.md - All endpoints
echo    - ARCHITECTURE.md     - System design
echo.
echo Type: docker-compose logs backend
echo to see live logs
echo.
pause
