# CLAUDE.md — Connor's Portfolio: Pricing Psychology Lab

Read this file at the start of every session. It is the source of truth for decisions made so far.

## Who / why
Connor Ethington — UCLA Cognitive Science (Entrepreneurship minor), graduating June 2027. Targeting product, GTM, sales/biz ops and rotational roles (tech, sports, startups). This repo is the first project of an interactive portfolio hosted free on **GitHub Pages** (no paid domain). Connor knows R and basic Python; keep code simple and readable, and explain steps plainly.

## Build approach (decided)
- Plain **HTML / CSS / JavaScript, no build step** → deploys directly to GitHub Pages.
- **All aisle details live in one config file** (e.g. `js/aisles.js`): products, prices, versions, measures. Changing a price = editing one line.
- **Cartoon style**: flat, friendly SVG illustrations drawn in code, one consistent look.
- **Randomization**: on start, each aisle independently assigns its version (A/B or price level).
- **Data**: at checkout, the full trip posts as ONE row to a **Google Sheet via Google Apps Script** web app. One submission per browser (localStorage flag) + hidden honeypot field for bots.
- **Live results page**: Apps Script returns aggregates as JSON → charts with Chart.js.
- Deeper analysis later in R.
- **Build now, iterate as we go.** Aisle 1 is locked; aisles 2–10 are drafts and will be finalized one at a time — build them from config so they're easy to change.

## Build phases
1. **Skeleton**: intro screen, $45 budget meter, grocery list, Aisle 1 working end-to-end with random A/B, data landing in the Google Sheet. Deploy to GitHub Pages.
2. Add aisles 2–10 from config as each is locked.
3. Checkout receipt → stated-WTP question → survey → personal reveal cards.
4. Live results page (charts + new-product price slider: demand → revenue → profit).
5. Pilot with 5–10 friends, fix confusion, launch.
6. Write-up page after data is in.

## Experiment design
- **Purpose:** clear, interview-ready pricing principles ("When pricing a new product, I learned…"), not precise academic estimates. One takeaway per aisle.
- **Format:** cartoon virtual supermarket. **$45 budget**, **grocery list**, **10 aisles in fixed order**, one aisle per screen, **no going back**. Each aisle is a hidden experiment.
- **Instruction to shoppers:** *try to save money, but if an offer compels you, go for it.* Fake money, no prize.
- Can't exceed budget (item shows "over budget"). Can skip any item.
- **Record at every aisle:** version shown, choice, budget remaining, seconds spent.
- **Design rule:** list items test WHICH option people choose; optional extras (new product, ice cream) test BUY vs SKIP.
- **Grocery list (8):** avocados, eggs, cereal, coffee, chips, juice, pasta sauce, paper towels. NOT on list: ice cream, new product.
- Do NOT use "Never Solo Cup" anywhere in this project.

### Aisle order
1 Produce/avocados (scarcity) · 2 Dairy/eggs (necessity price) · 3 Frozen/ice cream (treat price) · 4 Cereal (brand vs store brand) · 5 NEW product end-cap (mid-trip impulse) · 6 Coffee (decoy) · 7 Chips (2 for $5) · 8 Juice (crossed-out reference price) · 9 Pasta sauce (easy vs effort coupon) · 10 Paper towels (flat vs bulk tiers)

### Aisle 1 — Produce: Avocados (Scarcity) — LOCKED
- List item "2 avocados" — **quantity fixed at 2**; pick a type or skip.
- **Regular $1.00 each** (left) vs **JUMBO $2.00 each** (right, drawn bigger).
- **Version A:** both bins full, no tag. **Version B:** Jumbo bin shows **only 3 avocados** + "🔥 Only 3 left!" tag. Regular bin full in both.
- Measure: % choosing Jumbo (A vs B); time on aisle.
- Principle: "Scarcity can push customers to the premium option even when the price doesn't change."
- Results: two bars (% Jumbo A vs B). Reveal card: "You saw 'Only 3 left!' and picked Jumbo — like X% of shoppers who saw it (vs Y% who didn't)."

### Aisle 2 — Dairy: Eggs (Necessity pricing) — LOCKED
- List item "Eggs." Three choices: **Dozen**, **Half dozen**, or **Skip**. One carton (quantity 1).
- **4 price versions**, randomly assigned: dozen **$3 / $5 / $7 / $9**. Half dozen is always 60% of the dozen: **$1.80 / $3.00 / $4.20 / $5.40**.
- Cartoon egg cartons side by side: a full dozen carton and a smaller half-dozen carton.
- Record: price version (`a2_version` = dozen price, "3"/"5"/"7"/"9"), choice (`dozen`/`half`/`skip`), budget remaining, seconds on aisle.
- Receipt: "1 × Eggs (dozen)" or "1 × Eggs (half dozen)".
- Principle: on necessities, customers buy less rather than leave (shrinkflation).

### Aisles 3–10 — BUILT — DRAFT (playable; details may still change — edit `js/aisles.js`)
- **3 Frozen: Ice cream** (NOT on list) — one pint, random $3 / $5 / $7 / $9 → Buy or Skip. `a3_version` = price; choice `buy`/`skip`. Compare buy rate with eggs.
- **4 Cereal** — "Frosted Crunch" $5.00 (fancy box, "America's #1!" badge) vs "Market Basics" (plain box) at random $4.50 / $3.75 / $3.00 → pick or skip. `a4_version` = Market Basics price; choice `brand`/`store`/`skip` → % store brand.
- **5 NEW product end-cap** (NOT on list) — "NEW!" display; placeholder "LIFT Sparkling Protein Soda" 4-pack (name, pitch, colours, ~$3 unit cost in config). Random price $4–$14 in $1 steps → Buy or Skip. `a5_version` = price → demand/revenue/profit curves.
- **6 Coffee** — A: Small 12oz $6 / Large 24oz $10. B adds Medium 18oz $9.50 (decoy). Choice `small`/`medium`/`large`/`skip` → % Large.
- **7 Snacks: Chips** — $2.50/bag, quantity 0–4. A tag "$2.50 each"; B tag "2 for $5" + small print "or $2.50 each". `a7_choice` = `a7_qty` = number of bags (0 = skip).
- **8 Drinks: Juice** — Basic $3.49 vs Premium $5.99; B shows ~~$8.99~~ $5.99 + SALE tag on Premium. Choice `basic`/`premium`/`skip` → % premium.
- **9 Pantry: Pasta sauce** — $4.00 with $1-off coupon. A one-click "Clip coupon"; B flyer shows code 482915 that must be typed. Choice `buy`/`skip`; extra column **`a9_coupon`** = Y if bought with the coupon, else N.
- **10 Household: Paper towels** — 1 roll / 4-pack / 12-pack. A $2 / $8 / $24 (flat); B $2 / $7 / $18 (bulk discount). Choice `1`/`4`/`12`/`skip` → pack size + spend.
- Budget check: cheapest list ≈ $30; typical upgrades ≈ $47; plus both extras ≈ $60. Options that cost more than the budget left are disabled and show "Over budget".

## Implementation notes (current state)
- Live: all 10 aisles (1–2 locked, 3–10 built as drafts), then checkout. Site: https://connorethington-byte.github.io/pricing-lab/
- Files: `js/config.js` (site name, budget, Sheet URL, `appVersion` — bump when an aisle changes), `js/aisles.js` (all aisle config; `ready: true` shows an aisle), `js/art.js` (SVG drawings), `js/app.js` (logic), `apps-script/Code.gs` (backend; auto-adds new columns, so new aisles need no Sheet edits).
- Sheet columns per aisle: `aN_version, aN_choice, aN_qty, aN_spent, aN_budget_after, aN_seconds` (+ `a9_coupon`).
- Aisle types in config: `choice` (pick one or skip; one option = Buy/Skip), `quantity` (chips stepper), `coupon` (pasta sauce). Prices/tags can be one value or `{ version: value }`; `onlyIn` limits an option to certain versions.
- Receipt lists everything bought, then "Skipped from your list: …".
- `?test=1` → repeat runs allowed, row flagged `row_type = TEST` / `is_test = 1` (excluded from results). `?reset=1` clears the one-per-browser lock.
- Receipt uses each option's `receiptName`. On phones the grocery list collapses to a "📋 List (x/8)" button.

### After checkout
- Stated WTP for the new product ("most you'd pay?") vs actual aisle-5 behavior.
- Anonymous survey: student Y/N, age range, grocery frequency, budget-consciousness 1–5. No names/emails.
- Personal reveal: leaning yes.
- Target 150–300 shoppers. Limitations: student-heavy sample, fake money.

### Still open
New product identity; site name; recruitment channels.

## Other planned portfolio projects (later, separate)
Never Solo Cup interactive product page (team project — credit team); Shiny Hitter public demo (synthetic data, Shinylive); PsychoPy memory test in browser.
