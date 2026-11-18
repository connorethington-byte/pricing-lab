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

### Aisles 2–10 — DRAFTS (not locked; keep config-driven)
- 2 Eggs: Dozen / Half dozen (60% of dozen price) / Skip; dozen price randomized $3/$5/$7/$9 (half $1.80/$3.00/$4.20/$5.40). Principle: on necessities, customers buy less rather than leave (shrinkflation).
- 3 Ice cream (not on list): pint at $3/$5/$7/$9 → buy rate; compare with eggs.
- 4 Cereal: "Frosted Crunch" $5.00 (fancy box, "America's #1!" badge) vs "Market Basics" at $4.50/$3.75/$3.00 → % store brand.
- 5 New product (not on list): "NEW!" end-cap, random price $4–$14 in $1 steps → demand/revenue/profit curves (~$3 unit cost). Product TBD (placeholder: sparkling protein soda 4-pack).
- 6 Coffee: A Small $6 / Large $10; B adds Medium $9.50 decoy → % Large.
- 7 Chips: "$2.50 each" vs "2 for $5 (or $2.50 each)" → units bought.
- 8 Juice: Basic $3.49 vs Premium $5.99; B shows ~~$8.99~~ $5.99 SALE → % premium.
- 9 Pasta sauce $4.00 + $1-off coupon: A one-click vs B type a 6-digit code → coupon use vs budget-consciousness.
- 10 Paper towels: A flat (1/$2, 4/$8, 12/$24) vs B tiered (1/$2, 4/$7, 12/$18) → pack size + spend.
- Budget check: cheapest list ≈ $30; typical upgrades ≈ $47; plus both extras ≈ $60.

### After checkout
- Stated WTP for the new product ("most you'd pay?") vs actual aisle-5 behavior.
- Anonymous survey: student Y/N, age range, grocery frequency, budget-consciousness 1–5. No names/emails.
- Personal reveal: leaning yes.
- Target 150–300 shoppers. Limitations: student-heavy sample, fake money.

### Still open
New product identity; site name; recruitment channels.

## Other planned portfolio projects (later, separate)
Never Solo Cup interactive product page (team project — credit team); Shiny Hitter public demo (synthetic data, Shinylive); PsychoPy memory test in browser.
