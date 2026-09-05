@echo off
:: ============================================================
::  EMPLOYEE / STUDENT SKILL GAP ANALYZER
::  Run the Pure Java REST API Backend
:: ============================================================
setlocal
cd /d "%~dp0"

if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] No .env found. Creating default .env from .env.example...
        copy /y ".env.example" ".env" >nul
    )
)

if not exist "target\classes\com\skillgap\Main.class" (
    echo [INFO] Compiled classes not found. Running compile.bat...
    call compile.bat
)

echo.
echo Starting Skill Gap Analyzer Backend on port 8080...
echo.
java -cp "target\classes;lib\mysql-connector-j.jar" com.skillgap.Main

endlocal
