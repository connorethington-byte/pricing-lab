# Lab Market — a pricing psychology lab

A 5-minute cartoon grocery run. Each aisle is a hidden pricing experiment
(scarcity, decoys, bundles, reference prices…). Every shopper's trip is saved
as one row in a Google Sheet, and a live results page will chart what people did.

Part of Connor Ethington's portfolio. **Status: Phase 1** — Aisle 1 (scarcity) live.

## How it's built
Plain HTML/CSS/JavaScript, no build step, hosted on GitHub Pages.

| File | What it is |
|---|---|
| `index.html` | The page |
| `js/config.js` | Site name, $45 budget, **Google Sheet URL** |
| `js/aisles.js` | **Every aisle, product, price and version.** Change a price here. |
| `js/art.js` | The cartoon drawings (SVG made in code) |
| `js/app.js` | Screens, random A/B, timing, sending the row |
| `css/style.css` | The look |
| `apps-script/Code.gs` | Google Apps Script backend (paste into the Sheet) |

## Handy URLs while testing
- `?test=1` — row is marked `is_test = 1` (excluded from results) and you can shop again
- `?reset=1` — clears this browser's "already shopped" lock

## Run it locally
```bash
python3 -m http.server 8000
```
then open http://localhost:8000
