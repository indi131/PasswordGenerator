# GitHub Pages Landing Page

Located in `/docs/`. Served at `https://indi131.github.io/PasswordGenerator/`.

## Files
- `docs/index.html` — page structure
- `docs/style.css` — responsive styles, light-only (no dark theme)
- `docs/script.js` — interactive demo generator, no external deps

## Interactive demo
- Live password generation using `crypto.getRandomValues()`
- Checkboxes to toggle character sets
- Slider + number input for length
- Entropy-based strength bar (5 levels)
- Copy button using `navigator.clipboard`

## Publishing
1. Push to `main` branch
2. GitHub repo → Settings → Pages → Branch: `main`, folder: `/docs`
3. URL: `https://<user>.github.io/PasswordGenerator/`

## Design notes
- Compact layout with focus on the generator (hero merged into demo card)
- Features grid (2 columns), install steps (2 columns)
- Everything in Russian except GitHub links