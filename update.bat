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

REM --- 2) 抓 GitHub 最新（只抓，不改任何檔案）---
REM 這台電腦現在有兩個工作資料夾共用同一個 repo：
REM   C:\Projects\acupuncture-point-app  ←  Claude 用（claude/... 分支）
REM   C:\Projects\acuting-antigravity    ←  Antigravity 用（main）
REM git 規定同一條分支同時只能被一個資料夾 checkout，所以舊版的
REM 「切換到 main」在 Claude 這邊必定失敗（main 被另一邊佔用）。
REM 新做法：完全不切換分支。把 main 的最新合併「進來」，再把成果推「回去」。
echo [2/4] 從 GitHub 抓最新...
git fetch origin
if errorlevel 1 (
    echo [X] 抓取失敗（可能是網路），等一下再雙擊跑一次就好。
    pause
    exit /b 1
)
echo.

REM --- 3) 把 main 的最新合併進目前分支（合併，不覆蓋）---
echo [3/4] 把 main 的最新合併進 !CURBR!...
git merge --no-edit origin/main
if errorlevel 1 (
    git merge --abort >nul 2>&1
    echo.
    echo [!] 合併有衝突 —— 已安全停下，沒有覆蓋任何東西。
    echo     你的改動已經 commit 而且備份到 GitHub 了，一點都不會少。
    echo     最常見的原因：兩個 AI 改到同一個檔案的同一段。
    echo     請「不要自己 reset」，把這個畫面截圖給 Claude 幫你合併。
    echo.
    pause
    exit /b 1
)
echo.

REM --- 4) 推回 GitHub ---
if /i "!CURBR!"=="main" (
    echo [4/4] 推回 GitHub...
    git push origin main
    if errorlevel 1 (
        echo [X] 推送失敗：可能是網路，或另一個 AI 剛好也推了新東西。
        echo     再雙擊跑一次就好 —— 它會先把對方的東西合進來再推。
        pause
        exit /b 1
    )
) else (
    REM 目前分支的成果「落地」到 main：直接推 HEAD 到遠端 main，
    REM 全程不需要在本機 checkout main，所以不會再撞到另一個資料夾。
    echo [4/4] 把 !CURBR! 的成果推上 GitHub 的 main...
    git push origin HEAD:main
    if errorlevel 1 (
        echo [X] 推送失敗：可能是網路，或另一個 AI 剛好也推了新東西。
        echo     再雙擊跑一次就好 —— 它會先把對方的東西合進來再推。
        pause
        exit /b 1
    )
    REM 把剛剛的合併結果也更新到分支的雲端備份（失敗不擋流程）。
    git push origin "!CURBR!" >nul 2>&1

    REM --- 4b) 順手讓「佔著 main 的那個資料夾」快轉到最新（做不到就跳過）---
    REM 只用 --ff-only 快轉：要嘛乾淨地前進，要嘛什麼都不動，絕不覆蓋。
    set "WTPATH="
    set "MAINWT="
    for /f "tokens=1,* delims= " %%a in ('git worktree list --porcelain') do (
        if "%%a"=="worktree" set "WTPATH=%%b"
        if "%%a"=="branch" if "%%b"=="refs/heads/main" set "MAINWT=!WTPATH!"
    )
    if defined MAINWT (
        echo [4b] 更新另一個資料夾（!MAINWT!）的 main...
        git -C "!MAINWT!" merge --ff-only origin/main >nul 2>&1
        if errorlevel 1 (
            echo      那邊有還沒收尾的工作，先跳過 —— 等那邊自己跑 update 就會同步。
        ) else (
            echo      完成。
        )
    ) else (
        REM main 沒被任何資料夾 checkout 時，直接快轉本機的 main 書籤。
        git fetch origin main:main >nul 2>&1
    )
)

echo.
echo ==========================================
echo   完成！ 回瀏覽器按 Ctrl + F5 看最新版。
echo ==========================================
pause
