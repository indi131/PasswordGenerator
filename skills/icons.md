# Icons

## Design
- **Shape**: Lucide shield-check (purple shield outline, checkmark inside)
- **Default**: grey checkmark (`#94a3b8`)
- **Active** (password saved): green checkmark (`#22c55e`)

## Source SVGs
- `icons/icon.svg` — default state (purple shield, grey checkmark)
- `icons/icon-active.svg` — active state (purple shield, green checkmark)

## Generated PNGs
Generated via `generate-icons.js` using the `sharp` library.

### Command
```powershell
node generate-icons.js
```

### Output
| Size | Default | Active |
|------|---------|--------|
| 16   | `icon16.png` | `icon-active16.png` |
| 32   | `icon32.png` | `icon-active32.png` |
| 48   | `icon48.png` | `icon-active48.png` |
| 128  | `icon128.png` | `icon-active128.png` |

## How the swap works
- `background.js` service worker listens to `chrome.tabs.onActivated` / `onUpdated`
- Reads `chrome.storage.local.pgSites`
- Calls `chrome.action.setIcon({ path: {…}, tabId })` with active or default PNG set
- `popup.js` also swaps icon on popup open

## Modifying the icon
1. Edit `icons/icon.svg` and `icons/icon-active.svg`
2. Run `node generate-icons.js`
3. Rebuild: `.\build.ps1`