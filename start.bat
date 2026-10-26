@echo off
setlocal enabledelayedexpansion

:: ===============================================================================
:: AegisLoop - Windows Startup Script
:: Launches FastAPI Backend (Port 8001) and Vite Frontend (Port 5173) in separate windows.
:: ===============================================================================

title AegisLoop Launcher

:: Parse command-line flags
set "START_FLAGS="
set "NON_INTERACTIVE=0"

:parse_args
if "%~1"=="" goto :done_args
if /i "%~1"=="/?" goto :help
if /i "%~1"=="-h" goto :help
if /i "%~1"=="--help" goto :help
if /i "%~1"=="--no-window" (
    set "START_FLAGS=/B"
    shift
    goto :parse_args
)
if /i "%~1"=="--bg" (
    set "START_FLAGS=/B"
    shift
    goto :parse_args
)
if /i "%~1"=="--non-interactive" (
    set "NON_INTERACTIVE=1"
    shift
    goto :parse_args
)
shift
goto :parse_args
:done_args

:: Resolve absolute paths relative to this script's directory
set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%frontend"
set "BACKEND_VENV=%BACKEND_DIR%\.venv"
set "BACKEND_ACTIVATE=%BACKEND_VENV%\Scripts\activate.bat"
set "BACKEND_UVICORN=%BACKEND_VENV%\Scripts\uvicorn.exe"
set "BACKEND_ENTRY=%BACKEND_DIR%\app\main.py"
set "FRONTEND_PKG=%FRONTEND_DIR%\package.json"
set "FRONTEND_MODULES=%FRONTEND_DIR%\node_modules"

:: Default configuration (can be overridden via environment variables)
if not defined BACKEND_HOST set "BACKEND_HOST=127.0.0.1"
if not defined BACKEND_PORT set "BACKEND_PORT=8001"
if not defined FRONTEND_PORT set "FRONTEND_PORT=5173"

echo ===============================================================================
echo   AegisLoop -- Purple-Team Security Workflow Prototype Launcher
echo ===============================================================================
echo   Root Directory:     %ROOT_DIR%
echo   Backend Directory:  %BACKEND_DIR%
echo   Frontend Directory: %FRONTEND_DIR%
echo   Backend Target:     http://%BACKEND_HOST%:%BACKEND_PORT%
echo   Frontend Target:    http://localhost:%FRONTEND_PORT%
echo ===============================================================================
echo.

:: -------------------------------------------------------------------------------
:: 1. Backend Dependency and Environment Checks
:: -------------------------------------------------------------------------------
echo [1/4] Checking backend environment...

if not exist "%BACKEND_DIR%" goto :err_backend_dir
if not exist "%BACKEND_ENTRY%" goto :err_backend_entry
if not exist "%BACKEND_ACTIVATE%" goto :err_backend_venv
if not exist "%BACKEND_UVICORN%" goto :err_backend_uvicorn

echo       Backend virtual environment verified: OK.

:: -------------------------------------------------------------------------------
:: 2. Frontend Dependency and Environment Checks
:: -------------------------------------------------------------------------------
echo [2/4] Checking frontend environment...

if not exist "%FRONTEND_DIR%" goto :err_frontend_dir
if not exist "%FRONTEND_PKG%" goto :err_frontend_pkg

where npm >nul 2>&1
if errorlevel 1 goto :err_npm_missing

if not exist "%FRONTEND_MODULES%" goto :err_frontend_modules

echo       Frontend node_modules verified: OK.

:: -------------------------------------------------------------------------------
:: 3. Port / Duplicate Process Detection
:: -------------------------------------------------------------------------------
echo [3/4] Checking for existing instances on ports %BACKEND_PORT% and %FRONTEND_PORT%...

set "BACKEND_RUNNING=0"
set "BACKEND_PID="
for /f "tokens=5" %%a in ('netstat -ano -p tcp ^| findstr /R /C:":%BACKEND_PORT% .*LISTENING"') do (
    set "BACKEND_RUNNING=1"
    set "BACKEND_PID=%%a"
)

set "FRONTEND_RUNNING=0"
set "FRONTEND_PID="
for /f "tokens=5" %%a in ('netstat -ano -p tcp ^| findstr /R /C:":%FRONTEND_PORT% .*LISTENING"') do (
    set "FRONTEND_RUNNING=1"
    set "FRONTEND_PID=%%a"
)

if "!BACKEND_RUNNING!"=="1" (
    echo       [SKIP] Port %BACKEND_PORT% is already in use by process PID: !BACKEND_PID!.
    echo              Skipping duplicate backend launch.
) else (
    echo       Port %BACKEND_PORT% is available for backend.
)

if "!FRONTEND_RUNNING!"=="1" (
    echo       [SKIP] Port %FRONTEND_PORT% is already in use by process PID: !FRONTEND_PID!.
    echo              Skipping duplicate frontend launch.
) else (
    echo       Port %FRONTEND_PORT% is available for frontend.
)

if "!BACKEND_RUNNING!"=="1" if "!FRONTEND_RUNNING!"=="1" goto :both_already_running

:: -------------------------------------------------------------------------------
:: 4. Launch Services in Dedicated Terminal Windows
:: -------------------------------------------------------------------------------
echo [4/4] Launching services in dedicated terminal windows...

if "!BACKEND_RUNNING!"=="1" goto :skip_backend_launch
echo       Launching FastAPI backend on http://%BACKEND_HOST%:%BACKEND_PORT% ...
start %START_FLAGS% "AegisLoop Backend Port %BACKEND_PORT%" /D "%BACKEND_DIR%" cmd /k "call .venv\Scripts\activate.bat && echo =============================================================================== && echo   AegisLoop FastAPI Backend Server -- Port %BACKEND_PORT% && echo   URL: http://%BACKEND_HOST%:%BACKEND_PORT% (Health: /health, Docs: /docs) && echo   Press Ctrl+C to stop this backend server && echo =============================================================================== && echo. && uvicorn app.main:app --host %BACKEND_HOST% --port %BACKEND_PORT% --reload"
:skip_backend_launch

if "!FRONTEND_RUNNING!"=="1" goto :skip_frontend_launch
echo       Launching Vite frontend on http://localhost:%FRONTEND_PORT% ...
start %START_FLAGS% "AegisLoop Frontend Port %FRONTEND_PORT%" /D "%FRONTEND_DIR%" cmd /k "set VITE_API_BASE_URL=http://%BACKEND_HOST%:%BACKEND_PORT% && echo =============================================================================== && echo   AegisLoop Vite Frontend Server -- Port %FRONTEND_PORT% && echo   URL: http://localhost:%FRONTEND_PORT% && echo   API Target: http://%BACKEND_HOST%:%BACKEND_PORT% && echo   Press Ctrl+C to stop this frontend server && echo =============================================================================== && echo. && npm run dev -- --port %FRONTEND_PORT%"
:skip_frontend_launch

:done
echo.
echo ===============================================================================
echo   AegisLoop services ready!
echo.
echo   - Backend:  http://%BACKEND_HOST%:%BACKEND_PORT%
echo   - Frontend: http://localhost:%FRONTEND_PORT%
echo.
echo   Each service runs in its own terminal window so logs remain visible.
echo   - To stop a service: switch to its window and press Ctrl+C (or close the window).
echo   - To stop via PowerShell:
echo       Stop-Process -Id (Get-NetTCPConnection -LocalPort %BACKEND_PORT%).OwningProcess -Force
echo       Stop-Process -Id (Get-NetTCPConnection -LocalPort %FRONTEND_PORT%).OwningProcess -Force
echo ===============================================================================
echo.
exit /b 0

:both_already_running
echo.
echo [WARNING] Both backend and frontend appear to be running already:
echo           - Backend PID:  !BACKEND_PID! (port %BACKEND_PORT%)
echo           - Frontend PID: !FRONTEND_PID! (port %FRONTEND_PORT%)
echo           No new terminal windows were opened.
echo.
echo To stop the existing services, close their windows or run in PowerShell:
echo   Stop-Process -Id !BACKEND_PID! -Force
echo   Stop-Process -Id !FRONTEND_PID! -Force
goto :done

:: -------------------------------------------------------------------------------
:: Error Handlers
:: -------------------------------------------------------------------------------
:err_backend_dir
echo [ERROR] Backend directory does not exist:
echo         "%BACKEND_DIR%"
goto :error_exit

:err_backend_entry
echo [ERROR] Backend application entry point missing:
echo         "%BACKEND_ENTRY%"
goto :error_exit

:err_backend_venv
echo [ERROR] Python virtual environment is missing!
echo         Expected activate script at:
echo         "%BACKEND_ACTIVATE%"
echo.
echo To resolve this issue, set up the virtual environment manually:
echo   cd /d "%BACKEND_DIR%"
echo   python -m venv .venv
echo   call .venv\Scripts\activate.bat
echo   pip install -r requirements.txt
goto :error_exit

:err_backend_uvicorn
echo [ERROR] Uvicorn executable not found in virtual environment:
echo         "%BACKEND_UVICORN%"
echo.
echo Please install required dependencies into the virtual environment:
echo   cd /d "%BACKEND_DIR%"
echo   call .venv\Scripts\activate.bat
echo   pip install -r requirements.txt
goto :error_exit

:err_frontend_dir
echo [ERROR] Frontend directory does not exist:
echo         "%FRONTEND_DIR%"
goto :error_exit

:err_frontend_pkg
echo [ERROR] Frontend package.json missing:
echo         "%FRONTEND_PKG%"
goto :error_exit

:err_npm_missing
echo [ERROR] Node.js / npm was not found on your system PATH.
echo         Please install Node.js v18 or higher and ensure npm is accessible from PATH.
goto :error_exit

:err_frontend_modules
echo [ERROR] Frontend dependencies (node_modules) are missing!
echo         Expected node_modules at:
echo         "%FRONTEND_MODULES%"
echo.
echo To resolve this issue, install dependencies manually:
echo   cd /d "%FRONTEND_DIR%"
echo   npm install
goto :error_exit

:error_exit
echo.
echo ===============================================================================
echo   Startup failed! Please address the error above and try again.
echo ===============================================================================
echo.
if "!NON_INTERACTIVE!"=="0" (
    echo Press any key to exit...
    pause >nul
)
exit /b 1

:help
echo.
echo AegisLoop Windows Launcher (start.bat)
echo.
echo Usage:
echo   start.bat [options]
echo.
echo Options:
echo   --help, -h, /?         Display this help message and exit.
echo   --no-window, --bg      Run processes in background without creating GUI console windows.
echo   --non-interactive      Do not wait for keypress on error (for automated scripts).
echo.
echo Environment Variable Overrides:
echo   BACKEND_HOST           Backend IP address (default: 127.0.0.1)
echo   BACKEND_PORT           Backend port (default: 8001)
echo   FRONTEND_PORT          Frontend port (default: 5173)
echo.
exit /b 0
