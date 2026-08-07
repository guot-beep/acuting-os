@echo off
REM start-local.bat — open AcuTing OS in the browser.
REM
REM The app must be served over http:// (not opened as a file://) because
REM index.html loads data/generated/*.js — double-clicking index.html gives a
REM blank page. Node is not on PATH on this machine, so it is spelled out here.

set "NODE=C:\Program Files\nodejs\node.exe"
if not exist "%NODE%" set "NODE=C:\Users\guoti\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%NODE%" (
  echo Could not find node.exe. Tell Claude and paste this line.
  pause
  exit /b 1
)

cd /d "%~dp0"
echo Rebuilding data...
"%NODE%" scripts\build-data.js >nul
start "" http://localhost:8361
echo.
echo AcuTing OS is running at http://localhost:8361
echo Leave this window open. Close it to stop the server.
echo.
"%NODE%" scripts\dev-server.js 8361
