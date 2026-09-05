@echo off
:: ============================================================
::  EMPLOYEE / STUDENT SKILL GAP ANALYZER
::  Compile Pure Java Backend Source Files
:: ============================================================
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo Compiling Skill Gap Analyzer Backend...
echo.

if not exist "target\classes" mkdir "target\classes"

dir /s /b src\main\java\*.java > sources.txt

javac -encoding UTF-8 -cp "lib\mysql-connector-j.jar" -d target\classes @sources.txt

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo [SUCCESS] All backend sources compiled to target\classes
    echo ============================================================
) else (
    echo.
    echo [ERROR] Compilation failed.
)

if exist sources.txt del sources.txt

endlocal
