@echo off
setlocal
cd /d "%~dp0"
where git >nul 2>nul
if errorlevel 1 (
  echo Git for Windows is required: https://git-scm.com/downloads/win
  echo Install Git, then double-click this file again.
  pause
  exit /b 1
)
echo Uploading Iron Crown v1.2.0 to connex222/IRON-CROWN...
git push -u origin main
if errorlevel 1 (
  echo.
  echo Push failed. Check your GitHub login and try again.
  pause
  exit /b 1
)
echo.
echo Upload complete: https://github.com/connex222/IRON-CROWN
pause
