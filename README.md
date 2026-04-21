# Kindergarten Planner

A mobile-first kindergarten planner prototype for parents. Shared packing checklists, calendar with vacations and absences, and real-time sync between co-parents.

**Live demo:** _(add your GitHub Pages URL here once deployed)_

## What's inside

- `index.html` — standalone runnable prototype. Open in any browser.
- `src/` — reviewable source, organized by role:
  - `App.jsx` — screen router + info panel
  - `data/seed.js` — mock household data
  - `styles/global.css` — design tokens, phone frame, base styles
  - `components/` — shared UI (avatars, icons, tab bar, checklist row)
  - `screens/` — the five main screens (Today, Calendar, Lists, Household, Activity)

The source files use standard ES module syntax (`import`/`export`). The `index.html` is a pre-bundled single file that inlines everything — handy for quick deploys like GitHub Pages.

## Running locally

No build step needed. Just open `index.html` in a browser:

```bash
# macOS
open index.html

# Or serve it (any static server works)
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploying to GitHub Pages

1. Push this repo to GitHub
2. Repo Settings → Pages → Source: `main` branch, `/` (root)
3. Wait ~1 min, then visit `https://<username>.github.io/<repo-name>`

## Tech choices

- React 18 via CDN (no build toolchain)
- Babel Standalone for JSX transpilation in the browser
- Pure CSS with custom properties — no framework
- Fraunces (display) + Nunito (body) from Google Fonts

## Status

This is a v1 interactive prototype based on the accompanying spec document. What works:

- All 5 screens with live navigation
- Interactive checklist — tap to check items, see who packed what
- Calendar month navigation with color-coded entries
- Toast notifications for key actions

What's stubbed for future work:

- Document import (OCR pipeline) — shown as "SOON" on the Lists screen
- Creating new events, lists, items
- Actual backend + auth — the spec calls for Node/Postgres + Clerk

## License

MIT
