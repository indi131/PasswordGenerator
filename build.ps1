$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$dist = Join-Path $root "dist"
$zip = Join-Path $dist "password-generator.zip"

Write-Host "=== Password Generator - Build ===" -ForegroundColor Cyan

if (Test-Path $dist) { Remove-Item -Recurse -Force $dist }
New-Item -ItemType Directory -Path $dist -Force | Out-Null

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

$tmp = Join-Path $dist "tmp"
New-Item -ItemType Directory -Path $tmp -Force | Out-Null

foreach ($f in $files) {
  $src = Join-Path $root $f
  $dst = Join-Path $tmp $f
  $parent = Split-Path $dst -Parent
  if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
  Copy-Item -LiteralPath $src -Destination $dst
}

if (Test-Path $zip) { Remove-Item -Force $zip }

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tmp, $zip)

Remove-Item -Recurse -Force $tmp

$len = (Get-Item $zip).Length
$kb = [math]::Round($len / 1KB, 1)
Write-Host "Done! $zip ($kb KB)" -ForegroundColor Green
