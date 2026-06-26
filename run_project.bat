@echo off
echo ===================================================
echo   Starting Sheikh Amer Bahjat Digital Archive
echo ===================================================
echo.

echo [0/2] Cleaning up any old processes on ports 3000 and 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo Killing zombie process %%a on port 3000...
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo Killing zombie process %%a on port 8000...
    taskkill /f /pid %%a >nul 2>&1
)

echo [1/2] Starting Backend Server (Port 8000)...
start "Sheikh Bahjat - Backend API" cmd /k "cd /d "%~dp0backend" && set PYTHONPATH=%~dp0backend;%~dp0backend\venv\Lib\site-packages&& set PYTHONIOENCODING=utf-8&& "C:\Users\hamoz\AppData\Local\Programs\Python\Python39\python.exe" -m uvicorn app.main:app --reload --port 8000"

echo [2/2] Starting Frontend Server (Port 3000)...
start "Sheikh Bahjat - Frontend Web" cmd /k "cd /d "%~dp0frontend" && set PATH=%~dp0node-v22.16.0-win-x64;%PATH%&& call npm.cmd run dev"

echo.
echo ===================================================
echo   Servers launched successfully!
echo   Website: http://localhost:3000
echo   Backend API: http://localhost:8000
echo ===================================================
echo.
pause
