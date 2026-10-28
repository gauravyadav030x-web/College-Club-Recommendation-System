#!/bin/bash
set -e

echo "====================================================================="
echo "   COLLEGE CLUB RECOMMENDATION SYSTEM - INITIALIZING (Linux/macOS)"
echo "====================================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 1. Check Python
if ! command -v python3 &>/dev/null; then
    echo "❌ Error: python3 is not installed or not in PATH."
    exit 1
fi

# 2. Check Node
if ! command -v npm &>/dev/null; then
    echo "❌ Error: npm is not installed or not in PATH."
    exit 1
fi

echo "📦 [1/3] Setting up Python virtual environment and dependencies..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
python scripts/seed.py
cd ..

echo "🎨 [2/3] Preparing React Frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

echo "🚀 [3/3] Launching FastAPI Backend and Vite Frontend..."

# Run backend in background
cd "$SCRIPT_DIR/backend"
source venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

# Run frontend in foreground
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "====================================================================="
echo "   CampusConnect is live!"
echo "   - Frontend UI:  http://localhost:5173"
echo "   - FastAPI Docs: http://127.0.0.1:8000/docs"
echo ""
echo "   Demo Logins:"
echo "   Student: student@university.edu / Student@College2026"
echo "   Admin:   admin@university.edu   / Admin@College2026"
echo "====================================================================="
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
