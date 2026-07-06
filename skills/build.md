# Build Process

## Prerequisites
- Node.js (for sharp-based icon generation)
- PowerShell (for build.ps1)

## Build

```powershell
.\build.ps1
```

Produces `dist/password-generator.zip` (≈30 KB).

## What the build does

1. Runs `node generate-icons.js` → renders `icons/icon*.png` and `icons/icon-active*.png` from SVGs using sharp
2. Copies all source files to a temp directory
3. Zips them → `dist/password-generator.zip`

## Files included in the zip

All files needed for `chrome://extensions/` → «Загрузить распакованное расширение»:
- `manifest.json`, `popup.html`, `popup.css`, `popup.js`
- `background.js`
- `options.html`, `options.css`, `options.js`
- `history.html`, `history.css`, `history.js`
- `common.css`
- `icons/*.png` (generated)
- `generate-icons.js` (for reference)

## Manual install

1. Unzip `password-generator.zip`
2. Open `chrome://extensions/`
3. Enable «Режим разработчика»
4. «Загрузить распакованное расширение» → select the unzipped folder

## Icon regeneration (standalone)

```powershell
node generate-icons.js
```

Output: `icons/icon*.png` and `icons/icon-active*.png` at 16/32/48/128 px.