# Chrome Extension — Password Generator

## Structure

```
/
├── manifest.json          # Manifest V3 entry point
├── popup.html             # Extension popup UI
├── popup.css              # Popup styles (light + dark theme)
├── popup.js               # Popup logic: generate, save, copy, aliases, theme
├── background.js          # Service worker: dynamic icon swap on tab change
├── options.html           # Alias settings (opens in separate popup window)
├── options.js             # Alias CRUD (localStorage → pgAliases)
├── options.css            # Settings page styles
├── history.html           # Full history view (opens in separate popup window)
├── history.js             # History search, edit/save, copy
├── history.css            # History page styles
├── common.css             # Shared CSS vars for options/history pages
├── generate-icons.js      # Node script to render SVG → PNG via sharp
├── build.ps1              # PowerShell build script → dist/password-generator.zip
├── icons/
│   ├── icon.svg           # Source SVG (purple shield, grey checkmark)
│   ├── icon-active.svg    # Source SVG (purple shield, green checkmark)
│   ├── icon*.png          # Generated PNG icons (16/32/48/128)
│   └── icon-active*.png   # Active-state PNG icons
├── docs/                  # GitHub Pages landing page
│   ├── index.html
│   ├── style.css
│   └── script.js
└── skills/                # Project-specific skill files
```

## Key Architecture

### Storage (all `localStorage`)
| Key | Type | Description |
|-----|------|-------------|
| `pgTheme` | `"light"` / `"dark"` | Theme preference |
| `pgAutoCopy` | `"true"` / `"false"` | Auto-copy toggle |
| `pgHistory` | `Array<{id,password,length,charsetSize,host,date}>` | Last 20 saved/copied passwords |
| `pgSites` | `Record<hostname, {password,length,charsetSize,date}>` | Per-site saved passwords |
| `pgAliases` | `string[]` | URL trigger patterns |

### History recording
- Not every generation is saved to history
- Saved only on: **manual copy**, **auto-copy**, or **explicit save**
- Each entry gets a unique `id` (timestamp + random)

### Icon swap (purple shield with checkmark)
- **Default**: grey checkmark (`#94a3b8`)
- **Active** (site has saved password): green checkmark (`#22c55e`)
- Managed by `background.js` service worker (listens to `onActivated`, `onUpdated`)
- Also set from `popup.js` on popup open

### Dynamic icon via `chrome.action.setIcon`
Uses pre-generated PNG dictionary:
```js
chrome.action.setIcon({
  path: { "16": "icons/icon-active16.png", … },
  tabId
});
```

### Alias notification
- User defines a URL trigger pattern (e.g. `/admin`) in settings window
- On popup open, if URL matches an alias AND the current host has a saved password → shows amber banner with password
- Banner can be dismissed or copied

## Permissions
- `activeTab` — query current tab URL/host
- `storage` — `chrome.storage.local` (synced from localStorage for service worker badge logic)

## Service Worker (`background.js`)
- No `persistent` flag (MV3 service worker)
- On `onActivated` / `onUpdated` → reads `chrome.storage.local.pgSites` → swaps icon
- `onInstalled` → checks active tab once