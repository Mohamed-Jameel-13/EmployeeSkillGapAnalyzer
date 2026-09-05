@echo off
title Skill Gap Frontend
setlocal
cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo [INFO] node_modules not found. Installing frontend dependencies...
    call npm install
)

echo.
echo Starting Frontend on http://localhost:3000...
echo.
npm run dev

endlocal
