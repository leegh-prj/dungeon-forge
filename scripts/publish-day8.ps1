# ASCII-only script for Windows PowerShell 5.1 and PowerShell 7.
# Run from ANY folder using the full path to this file.
param(
  [string]$ZipPath = (Join-Path (Join-Path $HOME 'Downloads') 'dungeon-forge-day8.zip')
)
$ErrorActionPreference = 'Stop'
function Run-Git {
  param([string[]]$Arguments)
  & git @Arguments
  if ($LASTEXITCODE -ne 0) { throw ('Git command failed: git ' + ($Arguments -join ' ')) }
}
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Git is not installed or not on PATH.' }
if (-not (Test-Path -LiteralPath $ZipPath)) { throw ('ZIP not found: ' + $ZipPath) }
$zip = (Resolve-Path -LiteralPath $ZipPath).Path
$repo = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $repo '.git'))) {
  throw ('Run this script from the scripts folder inside an existing Git repository. Repo not found: ' + $repo)
}
Push-Location $repo
$temp = $null
try {
  $remote = (& git remote get-url origin).Trim()
  if ($LASTEXITCODE -ne 0 -or $remote -notmatch 'leegh-prj[/ :]dungeon-forge') {
    throw ('Unexpected Git origin: ' + $remote)
  }
  & git diff --quiet
  if ($LASTEXITCODE -ne 0) { throw 'Local tracked files were modified. Commit or back them up before running.' }
  & git diff --cached --quiet
  if ($LASTEXITCODE -ne 0) { throw 'Staged changes detected. Commit or reset them first.' }

  Write-Host '[1/5] Pulling origin/main...' -ForegroundColor Cyan
  Run-Git -Arguments @('pull', '--ff-only', 'origin', 'main')
  $temp = Join-Path $env:TEMP ('dungeon-forge-day8-' + [guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Path $temp | Out-Null
  Expand-Archive -LiteralPath $zip -DestinationPath $temp -Force
  $source = Join-Path $temp 'dungeon-forge'
  $sourceIndex = Join-Path $source 'index.html'
  $art = Join-Path $source 'assets/art'
  if (-not (Test-Path -LiteralPath $sourceIndex)) { throw 'ZIP missing dungeon-forge/index.html.' }
  if (-not (Test-Path -LiteralPath (Join-Path $art 'hero.webp'))) { throw 'ZIP missing assets/art/hero.webp.' }

  Write-Host '[2/5] Copying Day 8 app and graphics...' -ForegroundColor Cyan
  foreach ($name in @('index.html', 'test_day8.js', 'docs-DAY8.md')) {
    $from = Join-Path $source $name
    if (Test-Path -LiteralPath $from) { Copy-Item -LiteralPath $from -Destination (Join-Path $repo $name) -Force }
  }
  $dest = Join-Path $repo 'assets/art'
  New-Item -ItemType Directory -Path $dest -Force | Out-Null
  Copy-Item -Path (Join-Path $art '*') -Destination $dest -Force -Recurse

  Write-Host '[3/5] Checking files and running tests...' -ForegroundColor Cyan
  foreach ($rel in @('assets/art/hero.webp', 'assets/art/slime.webp', 'assets/art/items/weapons/5.webp', 'test_day8.js')) {
    if (-not (Test-Path -LiteralPath (Join-Path $repo $rel))) { throw ('Missing required file: ' + $rel) }
  }
  if (Get-Command node -ErrorAction SilentlyContinue) {
    & node test_day8.js
    if ($LASTEXITCODE -ne 0) { throw 'Day 8 test failed. Upload canceled.' }
  } else { Write-Host 'Node.js not found; skipping test.' -ForegroundColor Yellow }

  Write-Host '[4/5] Committing changes...' -ForegroundColor Cyan
  Run-Git -Arguments @('add', '--', 'index.html', 'assets/art', 'test_day8.js', 'docs-DAY8.md')
  & git diff --cached --quiet
  if ($LASTEXITCODE -eq 0) { Write-Host 'Nothing to publish.'; return }
  Run-Git -Arguments @('commit', '-m', 'Deploy Day 8 high resolution art and UI')

  Write-Host '[5/5] Pushing changes to GitHub...' -ForegroundColor Cyan
  Run-Git -Arguments @('push', 'origin', 'main')
  Write-Host 'SUCCESS. Vercel will deploy automatically:' -ForegroundColor Green
  Write-Host 'https://dungeon-forge-gilt.vercel.app/'
}
finally {
  if ($null -ne $temp -and (Test-Path -LiteralPath $temp)) {
    Remove-Item -LiteralPath $temp -Recurse -Force -ErrorAction SilentlyContinue
  }
  Pop-Location
}
