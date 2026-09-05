@echo off
title Skill Gap Analyzer - Launcher
echo ============================================================
echo   EMPLOYEE / STUDENT SKILL GAP ANALYZER
echo ============================================================
echo.

if not exist "%~dp0frontend\node_modules" (
    echo [SETUP] Installing frontend dependencies first...
    cd /d "%~dp0frontend"
    call npm install
    cd /d "%~dp0"
)

echo [1/2] Starting Pure Java REST API Backend on port 8080...
start "Skill Gap Backend (Java :8080)" cmd /k "cd /d %~dp0backend && run.bat"

echo Waiting for backend initialization...
timeout /t 3 /nobreak >nul

echo [2/2] Starting React + Vite Frontend on port 3000...
start "Skill Gap Frontend (React :3000)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ============================================================
echo   Application started successfully!
echo   - Backend:  http://localhost:8080
echo   - Frontend: http://localhost:3000
echo ============================================================
echo.
pause
