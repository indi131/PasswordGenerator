$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$dist = Join-Path $root "dist"
$tmp = Join-Path $dist "extension"
$key = Join-Path $root "key.pem"
$zip = Join-Path $dist "password-generator.zip"
$crx = Join-Path $dist "password-generator.crx"

Write-Host "=== Password Generator - Build ===" -ForegroundColor Cyan

if (Test-Path $dist) { if (Test-Path $dist) { Remove-Item -Recurse -Force $dist } }
New-Item -ItemType Directory -Path $tmp -Force | Out-Null

# Copy files
$files = @("manifest.json","popup.html","popup.css","popup.js")
foreach ($f in $files) { Copy-Item (Join-Path $root $f) (Join-Path $tmp $f) }
New-Item -ItemType Directory -Path (Join-Path $tmp "icons") -Force | Out-Null
foreach ($f in @("icon16.png","icon32.png","icon48.png","icon128.png")) {
  Copy-Item (Join-Path $root "icons\$f") (Join-Path $tmp "icons\$f")
}

# ZIP
Write-Host "Creating ZIP..." -ForegroundColor Yellow
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tmp, $zip)
$zipSize = [math]::Round((Get-Item $zip).Length / 1KB, 1)
Write-Host "  password-generator.zip ($zipSize KB)" -ForegroundColor Green

# CRX via Chrome
$chromePaths = @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)
$chromeExe = $null
foreach ($p in $chromePaths) { if (Test-Path $p) { $chromeExe = $p; break } }

if ($chromeExe) {
  Write-Host "Creating CRX via Chrome..." -ForegroundColor Yellow

  if (-not (Test-Path $key)) {
    Write-Host "  Generating private key..." -ForegroundColor Yellow
    & $chromeExe --pack-extension="$tmp" --no-message-box 2>&1 | Out-Null
    $genKey = Join-Path $tmp ".pem"
    if (Test-Path $genKey) { Move-Item -LiteralPath $genKey -Destination $key -Force }
  }

  if (Test-Path $crx) { Remove-Item -Force $crx }
  & $chromeExe --pack-extension="$tmp" --pack-extension-key="$key" --no-message-box 2>&1 | Out-Null
  $chromeCrx = Join-Path $dist "extension.crx"

  if (Test-Path $chromeCrx) {
    Move-Item -LiteralPath $chromeCrx -Destination $crx -Force
    $crxSize = [math]::Round((Get-Item $crx).Length / 1KB, 1)
    Write-Host "  password-generator.crx ($crxSize KB)" -ForegroundColor Green
  } else {
    Write-Host "  CRX creation failed (Chrome error)" -ForegroundColor Red
  }
} else {
  Write-Host "Chrome not found, skipping CRX" -ForegroundColor Yellow
}

# Cleanup
Remove-Item -Recurse -Force $tmp

Write-Host "Done!" -ForegroundColor Cyan
Write-Host "  ZIP: $zip" -ForegroundColor Green
if (Test-Path $crx) { Write-Host "  CRX: $crx" -ForegroundColor Green }
else { Write-Host "  CRX: skipped (Chrome not found or error)" -ForegroundColor Yellow }


