# Dungeon Forge Day 8 one-shot uploader (revised).
# Download dungeon-forge-day8.zip, then run this script from any folder.
param(
  [string]$ZipPath = (Join-Path (Join-Path $HOME "Downloads") "dungeon-forge-day8.zip")
)
$ErrorActionPreference = "Stop"

function RunGit([string[]]$GitArgs) {
  & git @GitArgs
  if ($LASTEXITCODE -ne 0) { throw "git $($GitArgs -join ' ') 실패 (exit $LASTEXITCODE)" }
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw "Git 명령어를 찾지 못했습니다. Git for Windows 설치를 확인해 주세요." }
if (-not (Test-Path -LiteralPath $ZipPath)) { throw "Day 8 ZIP 파일이 없습니다: $ZipPath. 다운로드 폴더의 실제 파일명을 확인해 주세요." }
$zip = (Resolve-Path -LiteralPath $ZipPath).Path

# Locate the Git repository using script location, NOT the user's current directory.
$repo = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $repo ".git"))) { throw "Git 프로젝트 폴더를 찾지 못했습니다: $repo. 기존 저장소 안에 있는 scripts/publish-day8.ps1을 실행해 주세요." }
Push-Location $repo
$temp = $null
try {
  $remote = (& git remote get-url origin).Trim()
  if ($LASTEXITCODE -ne 0 -or $remote -notmatch '(leegh-prj[/:]dungeon-forge|github.com/leegh-prj/dungeon-forge)') {
    throw "origin이 leegh-prj/dungeon-forge 저장소가 아닙니다: $remote"
  }

  # Allow untracked files; refuse potentially destructive tracked-file overrides.
  & git diff --quiet
  if ($LASTEXITCODE -eq 1) { throw "기존 추적 파일에 저장하지 않은 수정사항이 있습니다. 먼저 git status로 확인하고 커밋/백업해 주세요." }
  if ($LASTEXITCODE -ne 0) { throw "git diff 검사 실패" }
  & git diff --cached --quiet
  if ($LASTEXITCODE -eq 1) { throw "이미 스테이징된 변경사항이 있습니다. 먼저 커밋/백업해 주세요." }
  if ($LASTEXITCODE -ne 0) { throw "git diff --cached 검사 실패" }

  Write-Host "[1/5] GitHub main 최신화 중..." -ForegroundColor Cyan
  RunGit @("pull","--ff-only","origin","main")
  $temp = Join-Path $env:TEMP ("dungeon-forge-day8-" + [guid]::NewGuid())
  New-Item -ItemType Directory -Path $temp | Out-Null
  Expand-Archive -LiteralPath $zip -DestinationPath $temp -Force
  $source = Join-Path $temp "dungeon-forge"
  if (-not (Test-Path -LiteralPath (Join-Path $source "index.html"))) { throw "ZIP 내부 프로젝트 구조가 예상과 다릅니다. dungeon-forge/index.html이 없습니다." }
  $art = Join-Path $source "assets/art"
  if (-not (Test-Path -LiteralPath (Join-Path $art "hero.webp"))) { throw "ZIP에서 필수 hero.webp를 찾지 못했습니다." }

  Write-Host "[2/5] 게임 파일과 그래픽 적용 중..." -ForegroundColor Cyan
  foreach ($name in @("index.html","test_day8.js","docs-DAY8.md")) {
    $from = Join-Path $source $name
    if (Test-Path -LiteralPath $from) { Copy-Item -LiteralPath $from -Destination (Join-Path $repo $name) -Force }
  }
  New-Item -ItemType Directory -Path (Join-Path $repo "assets/art") -Force | Out-Null
  Copy-Item -Path (Join-Path $art "*") -Destination (Join-Path $repo "assets/art") -Force -Recurse

  Write-Host "[3/5] 필수 파일 및 코드 테스트..." -ForegroundColor Cyan
  foreach ($rel in @("assets/art/hero.webp","assets/art/slime.webp","assets/art/items/weapons/5.webp","test_day8.js")) {
    if (-not (Test-Path -LiteralPath (Join-Path $repo $rel))) { throw "필수 파일 누락: $rel" }
  }
  if (Get-Command node -ErrorAction SilentlyContinue) {
    & node "test_day8.js"
    if ($LASTEXITCODE -ne 0) { throw "Day 8 테스트 실패. 푸시는 진행하지 않았습니다." }
  } else {
    Write-Host "Node.js가 없어 자동 테스트는 건너뜁니다." -ForegroundColor Yellow
  }

  Write-Host "[4/5] GitHub 커밋 생성 중..." -ForegroundColor Cyan
  RunGit @("add","--","index.html","assets/art","test_day8.js","docs-DAY8.md")
  & git diff --cached --quiet
  if ($LASTEXITCODE -eq 0) { Write-Host "변경사항이 없어 배포할 내용이 없습니다."; return }
  RunGit @("commit","-m","Deploy Day 8 high-resolution artwork and UI")
  Write-Host "[5/5] GitHub push 및 Vercel 자동 배포 요청..." -ForegroundColor Cyan
  RunGit @("push","origin","main")
  Write-Host "완료! https://dungeon-forge-gilt.vercel.app/" -ForegroundColor Green
  Write-Host "Vercel이 새 커밋을 배포하면 웹사이트에 변경사항이 반영됩니다."
}
finally {
  if ($temp -and (Test-Path $temp)) { Remove-Item -LiteralPath $temp -Recurse -Force -ErrorAction SilentlyContinue }
  Pop-Location
}
