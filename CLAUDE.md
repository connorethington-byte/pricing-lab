# CLAUDE.md — Connor's Portfolio: Shopping Game (Pricing Psychology Lab)

Read this file at the start of every session. It is the source of truth for decisions made so far.

> **Game design lives in [`GAME_SPEC.md`](GAME_SPEC.md) (v3: "Your Gut vs. The Math").** v3 replaced
> v2 (Unit-Price Traps), which replaced the v1 pricing-psychology design. Older specs are in git history.
> When this file and GAME_SPEC.md disagree on game design, GAME_SPEC.md wins. All prices/sizes are in `js/aisles.js`.

## Who / why
Connor Ethington — UCLA Cognitive Science (Entrepreneurship minor), graduating June 2027. Targeting product, GTM, sales/biz ops and rotational roles (tech, sports, startups). This repo is the first project of an interactive portfolio hosted free on **GitHub Pages** (no paid domain). Connor knows R and basic Python; keep code simple and readable, and explain steps plainly — one step at a time, not long lists of instructions at once.

## Build approach (decided)
- Plain **HTML / CSS / JavaScript, no build step** → deploys directly to GitHub Pages.
- **All aisle details live in one config file** (`js/aisles.js`): products, prices, sizes, tags, reveal text. Changing a price = editing one line.
- **Cartoon style**: flat, friendly SVG illustrations drawn in code (`js/art.js`), one consistent look.
- **Randomization**: on start, each aisle independently flips two coins: **TRAP/DEAL** (50/50) and which **side (L/R)** the trick/other option appears on.
- **Data**: after the survey, the full trip posts as ONE row to a **Google Sheet via Google Apps Script** web app, in the tab **`responses_v3`** (older tabs `responses`, `responses_v2` are obsolete). One submission per browser (localStorage flag) + hidden honeypot field for bots.
- **Live results**: Apps Script `doGet` returns aggregates as JSON (per-aisle TRAP/DEAL choice counts, all Smart Shopper Scores, avg $ lost). Results page charts with Chart.js later. Deeper analysis in R.

## Build phases (v3)
1. ✅ Engine, test mode, Apps Script pipeline, GitHub Pages.
2. ✅ v3 aisles (8 trick + 2 filler, all from config), practice aisle, 6-second timer, one-tap buying, running cart total.
3. ✅ Survey (before the reveal) → end reveal "Your Gut vs. The Math".
4. Results page (Trap Leaderboard, filler baseline, avg $ lost, do unit-price checkers do better under time pressure?).
5. Pilot with 5–10 friends, fix confusion, launch. Target 150–300 shoppers.
6. Write-up page after data is in.

## Decisions made while building (not spelled out in GAME_SPEC.md)
- **Smart Shopper Score** = 10 points per aisle (all 10, fillers included) where the shopper bought the lowest-unit-price option. Skips/timeouts score 0. Shown only at the end.
- **Percentile** = % of other shoppers' scores you beat (ties count half). Hidden until at least `minShoppersForRank` (5) other shoppers exist. Test mode compares against TEST rows too.
- **Money lost** = (chosen unit price − best unit price on that shelf) × units bought; skip/timeout = $0. "Smartest cart" = spent − lost.
- **Filler aisles** use role `alt` for the "other" option and still record `TRAP`/`DEAL` (= other option 20% worse/better). They're excluded from Fell/Spotted/Lucky and from "weakness"; `filler_correct` counts best picks.
- **Coffee Medium (decoy)** counts as "fell for" in both versions (never the best buy). Note: in DEAL it is slightly better than Small, but Large is best.
- **Reveal tallies:** 🪤 Fell for (TRAP + trick, or decoy) · ✅ Spotted (TRAP + plain) · 💡 Lucky (DEAL + trick) · 🧊 Froze (timeouts). DEAL + plain ("missed a real deal") is counted in the data (`deals_missed`) and shown in the aisle-by-aisle lines.
- **Gut's weakness** = the trick type that cost the most $ among tricks fallen for (ties → first aisle).
- **Survey comes BEFORE the reveal** so results can't bias answers. No timer on the survey.
- **Practice aisle** (bananas, `PRACTICE_AISLE` in config) teaches tap + timer and is never recorded.
- One tap = in the cart; the first tap wins (later taps ignored). ~0.45 s "Added" flash, ~0.8 s "Time's up!" flash. Reaction time is measured from products appearing to the tap.
- Card format everywhere: big total price (round numbers shown without cents, e.g. "$8") + size underneath. Per-unit prices appear only in the reveal, as dollars ($0.42/oz).
- Trick option stays visually identical across versions; only price/size changes. Pasta "New Look" jar uses the same Classic label (fix from play-test); jars, cereal boxes, coffee bags and juice are drawn to scale.
- Do NOT use "Never Solo Cup" anywhere in this project.

## Implementation notes (current state)
- Site: https://connorethington-byte.github.io/pricing-lab/
- Files: `js/config.js` (site name, Sheet URL, `sheetTab`, `secondsPerAisle`, `minShoppersForRank`, `appVersion` — bump when an aisle changes), `js/aisles.js` (all aisle config), `js/art.js` (SVG drawings), `js/app.js` (logic), `css/style.css`, `apps-script/Code.gs` (backend; routes rows to the tab in `sheet_tab` — any `responses_vN` works without a redeploy — and auto-adds columns).
- Option fields in config: `role` (plain/trick/decoy/alt), `price` + `units` per package (number or `{ DEAL, TRAP }`), `size` / `tag` / `gutName` text with `{price}` `{units}` placeholders, `wasPrice`. Aisle fields: `filler`, `trickType`, `unit`, `emoji`.
- Sheet columns: totals (`total_spent, total_lost, smart_cart, lost_pct, smart_score, traps_fallen, traps_spotted, deals_taken, deals_missed, froze, items_skipped, filler_correct, weakness, seconds_per_aisle, total_seconds`), per aisle `aN_version` (TRAP/DEAL), `aN_side` (L/R of the trick/other option), `aN_choice` (trick/plain/decoy/alt/skip/timeout), `aN_units, aN_spent, aN_lost, aN_rt_ms`, survey `s_gut` (1–7), `s_student, s_age, s_freq, s_unit_check`.
- `?test=1` → repeat runs allowed, row flagged `row_type = TEST` / `is_test = 1` (excluded from results). `?reset=1` clears the one-per-browser lock.
- **Changing `Code.gs`** requires: Apps Script → Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy (keeps the same URL).
- On phones the grocery list collapses to a "📋 List (x/10)" button.

### Still open
Site name ("Lab Market" is a placeholder); recruitment channels; results page.

## Other planned portfolio projects (later, separate)
Never Solo Cup interactive product page (team project — credit team); Shiny Hitter public demo (synthetic data, Shinylive); PsychoPy memory test in browser.
