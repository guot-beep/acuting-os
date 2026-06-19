$ErrorActionPreference = "Stop"

$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
$target = Join-Path $repo "push-acuting.bat"

if (-not (Test-Path $target)) {
  Write-Host "Could not find push-acuting.bat in $repo" -ForegroundColor Red
  exit 1
}

$desktop = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktop "Push AcuTing to GitHub.lnk"

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $target
$shortcut.WorkingDirectory = $repo
$shortcut.Description = "Commit and push AcuTing OS updates to GitHub"
$shortcut.Save()

Write-Host ""
Write-Host "Desktop shortcut created:" -ForegroundColor Green
Write-Host $shortcutPath
Write-Host ""
Write-Host "Use this shortcut instead of copying push-acuting.bat to Desktop."
