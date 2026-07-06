$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$dist = Join-Path $root "dist"
$crx = Join-Path $dist "password-generator.crx"
$key = Join-Path $root "key.pem"

Write-Host "=== Password Generator - Build ===" -ForegroundColor Cyan

# 1. Prepare dist
if (Test-Path $dist) { Remove-Item -Recurse -Force $dist }
New-Item -ItemType Directory -Path $dist -Force | Out-Null

# 2. Copy source files to temp directory
$tmp = Join-Path $dist "extension"
New-Item -ItemType Directory -Path $tmp -Force | Out-Null

$files = @(
  "manifest.json",
  "popup.html",
  "popup.css",
  "popup.js",
  "icons/icon16.png",
  "icons/icon32.png",
  "icons/icon48.png",
  "icons/icon128.png"
)

foreach ($f in $files) {
  $src = Join-Path $root $f
  $dst = Join-Path $tmp $f
  $parent = Split-Path $dst -Parent
  if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
  Copy-Item -LiteralPath $src -Destination $dst
}

# 3. Generate key if not exists
if (-not (Test-Path $key)) {
  Write-Host "Generating private key..." -ForegroundColor Yellow
  npx crx keygen $root 2>&1 | Out-Null
  Write-Host "  key.pem created" -ForegroundColor Green
}

# 4. Pack CRX
Write-Host "Packing CRX..." -ForegroundColor Yellow
npx crx pack $tmp -o $crx -p $key 2>&1 | Out-Null

# 5. Clean up temp
Remove-Item -Recurse -Force $tmp

# 6. Report
$len = (Get-Item $crx).Length
$kb = [math]::Round($len / 1KB, 1)
Write-Host "Done! $crx ($kb KB)" -ForegroundColor Green
