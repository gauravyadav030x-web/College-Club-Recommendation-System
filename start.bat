@echo off
setlocal enabledelayedexpansion

echo =====================================================================
echo    COLLEGE CLUB RECOMMENDATION SYSTEM - INITIALIZING
echo =====================================================================

cd /d "%~dp0"

echo [1/4] Checking Python and Node installation...
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not found in PATH! Please install Python 3.10+
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not found in PATH! Please install Node.js 18+
    pause
    exit /b 1
)

echo [2/4] Setting up Backend and Seeding Database...
cd backend
python -m pip install -r requirements.txt >nul 2>nul
python scripts/seed.py
if %errorlevel% neq 0 (
    echo [WARNING] Database seed encountered a non-fatal warning or already seeded.
)
cd ..

echo [3/4] Checking Frontend dependencies...
cd frontend
if not exist "node_modules" (
    echo Installing frontend packages...
    call npm install
)
cd ..

echo [4/4] Launching Backend and Frontend in separate windows...
start "CampusConnect - FastAPI Backend" cmd /k "cd /d %~dp0backend && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
start "CampusConnect - React Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo =====================================================================
echo    CampusConnect is up and running!
echo    - Frontend UI:  http://localhost:5173
echo    - FastAPI Docs: http://localhost:8000/docs
echo.
echo    Demo Accounts:
echo    Student: student@university.edu / Student@College2026
echo    Admin:   admin@university.edu   / Admin@College2026
echo =====================================================================
