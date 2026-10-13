# Dungeon Forge Day 8 artwork / UI publishing assistant
# Run from the existing dungeon-forge Git repository folder in PowerShell.
# Example: .\scripts\publish-day8.ps1 -ZipPath "$env:USERPROFILE\Downloads\dungeon-forge-day8.zip"
param(
  [Parameter(Mandatory=$true)][string]$ZipPath
)
$ErrorActionPreference = "Stop"
if (-not (Test-Path ".git")) { throw "먼저 기존 dungeon-forge Git 프로젝트 폴더에서 실행하세요." }
if (-not (Test-Path $ZipPath)) { throw "ZIP 파일이 존재하지 않습니다: $ZipPath" }
git fetch origin main
if ($LASTEXITCODE -ne 0) { throw "GitHub fetch 실패" }
$changes = git status --porcelain
if ($changes) { throw "로컬 변경사항이 있습니다. 먼저 커밋하거나 백업한 뒤 다시 실행하세요." }
git pull --ff-only origin main
if ($LASTEXITCODE -ne 0) { throw "fast-forward pull 실패. 충돌을 해결하세요." }
$temp = Join-Path $env:TEMP ("dungeon-forge-day8-" + [guid]::NewGuid())
New-Item -ItemType Directory -Path $temp | Out-Null
try {
  Expand-Archive -Path $ZipPath -DestinationPath $temp -Force
  $root = Join-Path $temp "dungeon-forge"
  foreach ($name in @("index.html", "test_day8.js", "docs-DAY8.md")) {
    $source = Join-Path $root $name
    if (Test-Path $source) { Copy-Item $source $name -Force }
  }
  $art = Join-Path $root "assets\art"
  if (-not (Test-Path $art)) { throw "압축파일에서 assets/art 폴더를 찾지 못했습니다." }
  New-Item -ItemType Directory -Path "assets\art" -Force | Out-Null
  Copy-Item (Join-Path $art "*") "assets\art" -Force -Recurse
  if (Get-Command node -ErrorAction SilentlyContinue) {
    if (Test-Path "test_day8.js") { node test_day8.js; if ($LASTEXITCODE -ne 0) { throw "Day 8 테스트 실패" } }
  }
  git add index.html assets/art test_day8.js docs-DAY8.md
  $staged = git diff --cached --name-only
  if (-not $staged) { Write-Host "추가 변경 파일이 없습니다."; return }
  git commit -m "Deploy Day 8 original artwork and improved crafting UI"
  if ($LASTEXITCODE -ne 0) { throw "Commit 실패" }
  git push origin main
  if ($LASTEXITCODE -ne 0) { throw "GitHub push 실패" }
  Write-Host "업로드 완료. Vercel 자동 배포: https://dungeon-forge-gilt.vercel.app/"
} finally { Remove-Item $temp -Recurse -Force -ErrorAction SilentlyContinue }
