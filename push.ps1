# Git Push Script for Windows PowerShell
# Usage: .\push.ps1 "Your commit message"

$commitMessage = $args[0]
if (-not $commitMessage) {
    $commitMessage = "Auto-update: " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
}

Write-Host "--- Git Auto Push Start ---" -ForegroundColor Cyan

Write-Host "Step 1: Git Add" -ForegroundColor Yellow
git add .

Write-Host "Step 2: Git Commit" -ForegroundColor Yellow
git commit -m "$commitMessage"

Write-Host "Step 3: Git Push" -ForegroundColor Yellow
git push

Write-Host "--- Done! ---" -ForegroundColor Green
