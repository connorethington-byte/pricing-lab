# Lab Market — a shopping game about pricing tricks

A 4-minute cartoon grocery run. Every aisle has a trick (scarcity tag, "Family Size!",
"Buy 2 Get 1 Free", fake sale…) — and secretly flips a coin: the trick is either a
**trap** (~20% worse per unit) or a **real deal** (~20% better). At checkout, shoppers
see exactly where they lost money. Every trip is saved as one row in a Google Sheet.

Part of Connor Ethington's portfolio. **Design: [GAME_SPEC.md](GAME_SPEC.md) (v2).**

## How it's built
Plain HTML/CSS/JavaScript, no build step, hosted on GitHub Pages.

| File | What it is |
|---|---|
| `index.html` | The page |
| `js/config.js` | Site name, **Google Sheet URL** + tab |
| `js/aisles.js` | **Every aisle, product, price, size and trick.** Change a price here. |
| `js/art.js` | The cartoon drawings (SVG made in code) |
| `js/app.js` | Screens, TRAP/DEAL coin flips, scoring, the reveal, sending the row |
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
