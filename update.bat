@echo off
chcp 65001 >nul
setlocal
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

REM --- 確認在 main 分支 ---
git checkout main
if errorlevel 1 (
    echo [X] 切換到 main 失敗。請把這個畫面截圖給 Claude。
    pause
    exit /b 1
)
echo.

REM --- 1) 先把本機改動存成 commit（永不遺失）---
git add -A
git diff --cached --quiet
if errorlevel 1 (
    echo [1/3] 發現本機改動，先 commit 起來...
    git commit -m "local update %date% %time%"
) else (
    echo [1/3] 沒有本機改動，略過。
)
echo.

REM --- 2) 拉 GitHub 最新（合併，不覆蓋）---
echo [2/3] 從 GitHub 拉最新...
git pull origin main --no-edit
if errorlevel 1 (
    echo.
    echo [!] 拉取時發生衝突 —— 已安全停下，沒有覆蓋任何東西。
    echo     你剛剛的改動已經 commit 保住了，很安全。
    echo     請「不要自己 reset」，把這個畫面截圖給 Claude 幫你合併。
    git merge --abort >nul 2>&1
    echo.
    pause
    exit /b 1
)
echo.

REM --- 3) 推回 GitHub ---
echo [3/3] 推回 GitHub...
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
