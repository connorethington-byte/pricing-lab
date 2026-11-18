# CLAUDE.md — Connor's Portfolio: Shopping Game (Pricing Psychology Lab)

Read this file at the start of every session. It is the source of truth for decisions made so far.

> **Game design lives in [`GAME_SPEC.md`](GAME_SPEC.md) (v2: Unit-Price Traps).** It replaced the v1
> 10-aisle pricing-psychology design on 2026-11-18. When this file and GAME_SPEC.md disagree on game
> design, GAME_SPEC.md wins. All prices/sizes are in `js/aisles.js`.

## Who / why
Connor Ethington — UCLA Cognitive Science (Entrepreneurship minor), graduating June 2027. Targeting product, GTM, sales/biz ops and rotational roles (tech, sports, startups). This repo is the first project of an interactive portfolio hosted free on **GitHub Pages** (no paid domain). Connor knows R and basic Python; keep code simple and readable, and explain steps plainly — one step at a time, not long lists of instructions at once.

## Build approach (decided)
- Plain **HTML / CSS / JavaScript, no build step** → deploys directly to GitHub Pages.
- **All aisle details live in one config file** (`js/aisles.js`): products, prices, sizes, tags, reveal text. Changing a price = editing one line.
- **Cartoon style**: flat, friendly SVG illustrations drawn in code (`js/art.js`), one consistent look.
- **Randomization**: on start, each aisle independently flips a coin: **TRAP** or **DEAL** (50/50).
- **Data**: after the survey, the full trip posts as ONE row to a **Google Sheet via Google Apps Script** web app, in the tab **`responses_v2`** (v1 rows in `responses` are obsolete). One submission per browser (localStorage flag) + hidden honeypot field for bots.
- **Live results**: Apps Script `doGet` returns aggregates as JSON (per-aisle TRAP/DEAL choice counts, all Smart Shopper Scores, avg $ lost). Results page charts with Chart.js later. Deeper analysis in R.

## Build phases (v2)
1. ✅ Engine, test mode, Apps Script pipeline, GitHub Pages.
2. ✅ v2 aisles (10, all from config), running cart total (no budget limit).
3. ✅ Survey (before the reveal) → end reveal "Where you lost money".
4. Results page (Trap Leaderboard, avg $ lost, do unit-price checkers do better?).
5. Pilot with 5–10 friends, fix confusion, launch. Target 150–300 shoppers.
6. Write-up page after data is in.

## Decisions made while building v2 (not spelled out in GAME_SPEC.md)
- **Smart Shopper Score** = 10 points per aisle where the shopper bought the best-value (lowest unit price) option. Skips score 0. Shown only at the end.
- **Percentile** = % of other shoppers' Smart Shopper Scores you beat (ties count half). Hidden until at least `minShoppersForRank` (5, in `js/config.js`) other shoppers exist. Test mode includes TEST rows in the comparison.
- **Money lost** = (chosen unit price − best unit price on that shelf) × units bought; skip = $0. "Smartest cart" = same items at best unit prices = spent − lost.
- **Coffee Medium (decoy)** counts as "fell for" in both versions (it's never the best buy).
- **Reveal groups:** 🪤 Fell for (TRAP + trick, or decoy) · ✅ Spotted (TRAP + plain) · 💡 Lucky/smart (DEAL + trick) · 😬 Missed a real deal (DEAL + plain).
- **Weakness** = the trick type that cost the most $ among tricks fallen for.
- **Survey comes BEFORE the reveal** so results can't bias answers (esp. "do you check price per ounce?").
- Unit prices in the reveal are shown in cents under $1 (16.7¢/oz) and dollars above ($4.99/lb). Chicken's plain option shows $/lb while shopping because the spec says it's labeled per lb.
- Chips "2 for $X!" small print shows "2 bags · 8 oz each" (package size), not a per-bag price.
- Do NOT use "Never Solo Cup" anywhere in this project.

## Implementation notes (current state)
- Site: https://connorethington-byte.github.io/pricing-lab/
- Files: `js/config.js` (site name, Sheet URL, `sheetTab`, `minShoppersForRank`, `appVersion` — bump when an aisle changes), `js/aisles.js` (all aisle config), `js/art.js` (SVG drawings), `js/app.js` (logic), `css/style.css`, `apps-script/Code.gs` (backend; routes rows to the tab in `sheet_tab`, auto-adds columns).
- Option fields in config: `role` (plain/trick/decoy), `price` + `units` per package (number or `{ DEAL, TRAP }`), `big` / `small` / `tag` text with `{price}` `{each}` `{units}` `{unitPrice}` placeholders, `wasPrice`, `payFor`.
- Sheet columns: totals (`total_spent, total_lost, smart_cart, lost_pct, smart_score, traps_fallen, traps_spotted, deals_taken, deals_missed, items_skipped, weakness, total_seconds`), per aisle `aN_version` (TRAP/DEAL), `aN_choice` (trick/plain/decoy/skip), `aN_units, aN_spent, aN_lost, aN_seconds`, survey `s_student, s_age, s_freq, s_unit_check`.
- `?test=1` → repeat runs allowed, row flagged `row_type = TEST` / `is_test = 1` (excluded from results). `?reset=1` clears the one-per-browser lock.
- **Changing `Code.gs`** requires: Apps Script → Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy (keeps the same URL).
- On phones the grocery list collapses to a "📋 List (x/10)" button.

### Still open
Site name ("Lab Market" is a placeholder); recruitment channels; results page.

## Other planned portfolio projects (later, separate)
Never Solo Cup interactive product page (team project — credit team); Shiny Hitter public demo (synthetic data, Shinylive); PsychoPy memory test in browser.
