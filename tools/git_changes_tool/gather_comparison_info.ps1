
# Save the script directory for output file
$scriptDir = $PSScriptRoot
if (-not $scriptDir) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
}

# Navigate to git repository root
$gitRoot = git rev-parse --show-toplevel 2>$null
if (-not $gitRoot) {
    Write-Host "Error: Not in a git repository!"
    exit 1
}
# Convert Unix path to Windows path if needed
$gitRoot = $gitRoot -replace '/', '\'
Set-Location $gitRoot

# Get list of staged files dynamically
$files = git diff --name-only --cached
if (-not $files) {
    Write-Host "No staged files found. Please stage files using 'git add' first."
    exit
}



$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$outputFile = Join-Path $scriptDir "comparison_bundle_$timestamp.txt"

# Set UTF-8 encoding to properly handle Cyrillic and other Unicode characters
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Clear output file with UTF-8 encoding
"" | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "Gathering info for comparison against origin/main..."
Add-Content -Path $outputFile -Value "=== GATHERED INFO FOR COMPARISON AT $(Get-Date) ===" -Encoding UTF8
Add-Content -Path $outputFile -Value "Targeting Remote: origin/main" -Encoding UTF8
Add-Content -Path $outputFile -Value "===================================================" -Encoding UTF8

# Get Git Status specific to these files
Add-Content -Path $outputFile -Value "`n[GIT STATUS]" -Encoding UTF8
git status -s $files | Out-String | Add-Content -Path $outputFile -Encoding UTF8

# Generate the Diff (This is the most efficient comparison)
# It shows full content for new files (as additions) and standard diffs for modified ones.
Add-Content -Path $outputFile -Value "`n[GIT DIFF vs ORIGIN/MAIN]" -Encoding UTF8
git diff origin/main -- $files | Out-String | Add-Content -Path $outputFile -Encoding UTF8

Write-Host "Done. Info gathered in $outputFile"
Write-Host "You can now send $outputFile to compare against the remote version."
