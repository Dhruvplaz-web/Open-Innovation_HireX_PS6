@echo off
title SkillBridge — CraftVerse Hackathon Launcher
echo ==========================================================
echo    SkillBridge: Academia-Industry Collaboration Platform
echo ==========================================================

rem Clear invalid NODE_OPTIONS if present
set NODE_OPTIONS=

echo [1/2] Starting Python FastAPI Backend on http://127.0.0.1:8000 ...
start /B python server/run_server.py

timeout /t 2 /nobreak >nul

echo [2/2] Starting Vite Frontend on http://localhost:5173 ...
cd client
npm run dev
pause
