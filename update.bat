@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ==========================================
echo    AcuTing OS  一鍵更新 (update)
echo ==========================================
echo.

REM --- 確認是 git repo ---
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo [X] 這個資料夾不是 git repo，請把 update.bat 放在專案資料夾裡。
    pause
    exit /b 1
)

REM --- 記住現在在哪個分支 ---
REM 舊版在這裡就直接 checkout main，於是「先 commit 保護改動」根本還沒跑到，
REM checkout 就因為工作區有未提交的改動而被擋下。順序反了 —— 一定要先存檔再換分支。
for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set "CURBR=%%b"
echo 目前分支：!CURBR!
echo.

REM --- 1) 先把本機改動存成 commit（永不遺失，永不 stash、永不 reset）---
git add -A
git diff --cached --quiet
if errorlevel 1 (
    echo [1/4] 發現本機改動，先 commit 起來...
    git commit -m "local update %date% %time%"
    if errorlevel 1 (
        echo [X] commit 失敗。請把這個畫面截圖給 Claude，不要自己 reset。
        pause
        exit /b 1
    )
) else (
    echo [1/4] 沒有本機改動，略過。
)
echo.

REM --- 1b) 保險：先把目前分支推上 GitHub ---
REM 在動任何分支之前就先讓工作有一份在雲端，本機出事也救得回來。
if /i not "!CURBR!"=="main" (
    echo [1b] 先把分支 !CURBR! 備份到 GitHub...
    git push -u origin "!CURBR!"
    echo.
)

REM --- 2) 換到 main（此時工作區已乾淨，不會再被擋）---
echo [2/4] 切換到 main...
git checkout main
if errorlevel 1 (
    echo [X] 切換到 main 失敗。請把這個畫面截圖給 Claude。
    pause
    exit /b 1
)
echo.

REM --- 3) 拉 GitHub 最新（合併，不覆蓋）---
echo [3/4] 從 GitHub 拉最新...
git pull origin main --no-edit
if errorlevel 1 (
    echo.
    echo [!] 拉取時發生衝突 —— 已安全停下，沒有覆蓋任何東西。
    echo     你的改動已經 commit 保住了，很安全。
    echo     請「不要自己 reset」，把這個畫面截圖給 Claude 幫你合併。
    git merge --abort >nul 2>&1
    echo.
    pause
    exit /b 1
)
echo.

REM --- 3b) 剛剛不在 main 的話，把那個分支的工作併回 main ---
REM 否則你在別的分支做的東西會留在原地，更新完看起來像「東西不見了」。
if /i not "!CURBR!"=="main" (
    echo [3b] 把分支 !CURBR! 的工作合併進 main...
    git merge --no-edit "!CURBR!"
    if errorlevel 1 (
        echo.
        echo [!] 合併 !CURBR! 有衝突 —— 已安全停下。
        echo     你的工作還完整留在分支 !CURBR! 上，一點都沒少，
        echo     而且剛剛已經備份到 GitHub 了。
        echo     請把這個畫面截圖給 Claude，不要自己 reset。
        git merge --abort >nul 2>&1
        echo.
        pause
        exit /b 1
    )
    echo.
)

REM --- 4) 推回 GitHub ---
echo [4/4] 推回 GitHub...
git push origin main
if errorlevel 1 (
    echo [X] 推送失敗（可能是網路），等一下再雙擊跑一次就好。
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   完成！ 回瀏覽器按 Ctrl + F5 看最新版。
echo ==========================================
pause
