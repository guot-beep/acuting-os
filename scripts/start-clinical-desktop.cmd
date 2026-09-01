@echo off
rem start-clinical-desktop.cmd — 診間桌機一鍵啟動(給 Ting 用,雙擊即可)
rem   1) 若這個目錄是釘在 main 的唯讀副本(detached HEAD),先更新到最新 main;離線就用現在這版
rem   2) 啟動 SQLite 病例服務,並打開瀏覽器到 http://127.0.0.1:8785/
rem 病例 .db 預設在 %USERPROFILE%\Documents\AcuTing\acuting-clinical.db(repo 外;D7:絕不 commit)
rem 這個黑色視窗要一直開著;關掉 = app 存不了檔(app 會大聲說,不會靜默丟)。
setlocal
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0.."
title acuting-clinical-sqlite

git symbolic-ref -q HEAD >nul 2>&1
if errorlevel 1 (
  echo [1/2] 更新 app 到最新 main ...
  git fetch -q origin main 2>nul && git checkout -q --detach origin/main 2>nul || echo       離線或更新失敗,先用現在這一版。
) else (
  echo [1/2] 這個目錄在分支上,不是釘 main 的副本,不自動更新。
)

echo [2/2] 啟動 SQLite 病例服務 ...
node scripts\clinical-sqlite-service.js --open %*

echo.
echo 服務已停止。按任意鍵關閉視窗。
pause >nul
