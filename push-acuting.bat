@echo off
setlocal

set "SCRIPT=%~dp0push-acuting.ps1"

if not exist "%SCRIPT%" (
  echo Could not find push-acuting.ps1.
  echo Please run push-acuting.bat from the acupuncture-point-app folder,
  echo or create a shortcut instead of copying the bat file.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT%"
pause
