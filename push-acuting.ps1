$ErrorActionPreference = "Stop"

$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repo

$gitCandidates = @(
  "C:\Program Files\Git\cmd\git.exe",
  "C:\Program Files\Git\bin\git.exe",
  "git"
)

$git = $null
foreach ($candidate in $gitCandidates) {
  try {
    $version = & $candidate --version 2>$null
    if ($LASTEXITCODE -eq 0 -and $version) {
      $git = $candidate
      break
    }
  } catch {
    continue
  }
}

if (-not $git) {
  Write-Host "Git was not found. Please install Git for Windows or add Git to PATH." -ForegroundColor Red
  exit 1
}

$nodeCandidates = @(
  "C:\Users\guoti\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe",
  "node"
)

$node = $null
foreach ($candidate in $nodeCandidates) {
  try {
    $version = & $candidate --version 2>$null
    if ($LASTEXITCODE -eq 0 -and $version) {
      $node = $candidate
      break
    }
  } catch {
    continue
  }
}

if (-not $node) {
  Write-Host "Node.js was not found. Cannot run AcuTing validation before push." -ForegroundColor Red
  exit 1
}

$safePath = ($repo -replace "\\", "/")
& $git config --global --add safe.directory $safePath | Out-Null

Write-Host ""
Write-Host "AcuTing OS GitHub Sync" -ForegroundColor Cyan
Write-Host "Repository: $repo"
Write-Host ""

$branch = (& $git branch --show-current).Trim()
if (-not $branch) {
  $branch = "main"
}

$remote = (& $git remote get-url origin 2>$null).Trim()
if (-not $remote) {
  Write-Host "No GitHub remote is configured. Please add origin first." -ForegroundColor Red
  exit 1
}

$status = & $git status --short
if (-not $status) {
  Write-Host "No local changes to commit. Checking whether GitHub is already up to date..." -ForegroundColor Yellow
  & $git push
  if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Done. GitHub is up to date." -ForegroundColor Green
    exit 0
  }
  exit $LASTEXITCODE
}

Write-Host "Changes to upload:" -ForegroundColor Yellow
$status | ForEach-Object { Write-Host "  $_" }
Write-Host ""

$message = Read-Host "Commit message (press Enter for default)"
if ([string]::IsNullOrWhiteSpace($message)) {
  $stamp = Get-Date -Format "yyyy-MM-dd HH:mm"
  $message = "Update AcuTing OS $stamp"
}

Write-Host ""
Write-Host "Running AcuTing validation..." -ForegroundColor Cyan
& $node --check "app.js"
if ($LASTEXITCODE -ne 0) {
  Write-Host "Validation failed: app.js has a syntax error. Push stopped." -ForegroundColor Red
  exit $LASTEXITCODE
}

& $node "scripts/validate-interactions.js"
if ($LASTEXITCODE -ne 0) {
  Write-Host "Validation failed: interaction audit did not pass. Push stopped." -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Staging files..." -ForegroundColor Cyan
& $git add -A
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Creating commit: $message" -ForegroundColor Cyan
& $git commit -m $message
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Pushing to GitHub: $remote ($branch)" -ForegroundColor Cyan
& $git push
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Done. AcuTing OS has been pushed to GitHub." -ForegroundColor Green
