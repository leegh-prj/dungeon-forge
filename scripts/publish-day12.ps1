# Day 12 HD artwork installer for Windows PowerShell 5.1 / PowerShell 7.
# Place dungeon-forge-day12-hd-assets.zip in Downloads and run from the project repo:
# powershell -ExecutionPolicy Bypass -File .\scripts\publish-day12.ps1
param([string]$ZipPath=(Join-Path (Join-Path $HOME 'Downloads') 'dungeon-forge-day12-hd-assets.zip'))
$ErrorActionPreference='Stop'
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Git for Windows not found.' }
if (-not (Test-Path -LiteralPath $ZipPath)) { throw ('ZIP file not found: '+$ZipPath) }
$zip=(Resolve-Path -LiteralPath $ZipPath).Path
$repo=Split-Path -Parent $PSScriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $repo '.git'))) { throw ('Git repository not found: '+$repo) }
Push-Location $repo
$tmp=$null
try {
  & git diff --quiet
  if ($LASTEXITCODE -ne 0) { throw 'Tracked local changes found. Commit or back up your changes before publishing.' }
  & git diff --cached --quiet
  if ($LASTEXITCODE -ne 0) { throw 'Staged local changes found.' }
  Write-Host '[1/5] Updating main...' -ForegroundColor Cyan
  & git pull --ff-only origin main
  if ($LASTEXITCODE -ne 0) { throw 'Git pull failed.' }
  $tmp=Join-Path $env:TEMP ('df-day12-'+[guid]::NewGuid().ToString('N'))
  Expand-Archive -LiteralPath $zip -DestinationPath $tmp -Force
  $expected=Join-Path $tmp 'assets/hd/hero/idle-0.webp'
  if (-not (Test-Path -LiteralPath $expected)) { throw 'ZIP does not contain assets/hd/hero/idle-0.webp.' }
  Write-Host '[2/5] Installing HD sprites and region artwork...' -ForegroundColor Cyan
  foreach ($folder in @('hd','backgrounds','materials')) {
    $source=Join-Path $tmp ('assets/'+$folder)
    $dest=Join-Path $repo ('assets/'+$folder)
    New-Item -ItemType Directory -Path $dest -Force | Out-Null
    Copy-Item -Path (Join-Path $source '*') -Destination $dest -Force -Recurse
  }
  Write-Host '[3/5] Verifying assets...' -ForegroundColor Cyan
  foreach ($file in @('assets/hd/hero/idle-0.webp','assets/hd/slime/idle-0.webp','assets/hd/magma/attack-0.webp','assets/backgrounds/water.webp','assets/backgrounds/fire.webp','assets/backgrounds/storm.webp','assets/backgrounds/poison.webp')) {
    if (-not (Test-Path -LiteralPath (Join-Path $repo $file))) { throw ('Missing: '+$file) }
  }
  & git add -- assets/hd assets/backgrounds assets/materials
  if ($LASTEXITCODE -ne 0) { throw 'Git add failed.' }
  & git diff --cached --quiet
  if ($LASTEXITCODE -eq 0) { Write-Host 'No new files to publish.'; return }
  Write-Host '[4/5] Committing HD artwork...' -ForegroundColor Cyan
  & git commit -m 'Publish Day 12 original high resolution animation frames and regional art'
  if ($LASTEXITCODE -ne 0) { throw 'Git commit failed.' }
  Write-Host '[5/5] Pushing to GitHub/Vercel...' -ForegroundColor Cyan
  & git push origin main
  if ($LASTEXITCODE -ne 0) { throw 'Git push failed.' }
  Write-Host 'SUCCESS: https://dungeon-forge-gilt.vercel.app/' -ForegroundColor Green
} finally {
  if ($tmp -and (Test-Path -LiteralPath $tmp)) { Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue }
  Pop-Location
}
