$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$dist = Join-Path $root "dist"
$tmp = Join-Path $dist "extension"
$zip = Join-Path $dist "password-generator.zip"

Write-Host "=== Password Generator - Build ===" -ForegroundColor Cyan

if (Test-Path $dist) { Remove-Item -Recurse -Force $dist }
New-Item -ItemType Directory -Path $tmp -Force | Out-Null

Write-Host "Generating icons..." -ForegroundColor Yellow
node (Join-Path $root "generate-icons.js")
Write-Host "Copying files..." -ForegroundColor Yellow

$files = @("manifest.json","popup.html","popup.css","popup.js","background.js","common.css","options.html","options.css","options.js","history.html","history.css","history.js","generate-icons.js")
foreach ($f in $files) { Copy-Item (Join-Path $root $f) (Join-Path $tmp $f) }
New-Item -ItemType Directory -Path (Join-Path $tmp "icons") -Force | Out-Null
foreach ($f in @("icon.svg","icon-active.svg","icon16.png","icon32.png","icon48.png","icon128.png","icon-active16.png","icon-active32.png","icon-active48.png","icon-active128.png")) {
  Copy-Item (Join-Path $root "icons\$f") (Join-Path $tmp "icons\$f")
}

Write-Host "Creating ZIP..." -ForegroundColor Yellow
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tmp, $zip)
$zipSize = [math]::Round((Get-Item $zip).Length / 1KB, 1)
Write-Host "  password-generator.zip ($zipSize KB)" -ForegroundColor Green

Remove-Item -Recurse -Force $tmp
Write-Host "Done!" -ForegroundColor Cyan