# Connor's Shopping Game — Game Spec (v2: Unit-Price Traps)

Replaces the earlier 10-aisle pricing-psychology design. Ice cream and the new-product aisle are DROPPED (for now).

## Concept
Every aisle has a **trick** (a flashy tag, a "deal," a bigger box). For every shopper, each aisle independently flips a coin (50/50):
- 🪤 **TRAP:** the trick option is **~20% WORSE** per unit than the plain option
- ✅ **DEAL:** the trick option is **~20% BETTER** per unit than the plain option

Shoppers never know which. Measuring the % who take the trick in TRAP vs DEAL versions shows which tricks fool people most.

## Rules shown to shoppers
- Intro: **"Spend wisely and go for the best deals."** No budget limit. Show a running cart total.
- Grocery list (10): avocados, chicken, eggs, cereal, coffee, chips, cookies, juice, pasta sauce, paper towels.
- One aisle per screen, fixed order, no going back. Shopper picks one option or skips.
- **Show price + package size** (oz, count, lb, sheets) on every product, like real packaging.
- **NEVER show unit prices ($/oz etc.) during shopping.** Unit prices appear only in the end reveal.
- Do not reveal the Smart Shopper Score until the end (surprise).

## Data to record per aisle
version (TRAP/DEAL), option chosen (trick / plain / skip), units bought, money lost, seconds on aisle.
**Money lost** = (unit price of chosen option − best unit price in that aisle) × units bought. Skip = $0 lost (flag as skipped).
Old Sheet columns/rows from v1 are obsolete — start a fresh sheet tab.

## The 10 aisles (all numbers live in config)

| # | Aisle | Trick | Plain option | Trick option — DEAL | Trick option — TRAP | Unit |
|---|---|---|---|---|---|---|
| 1 | 🥑 Produce: Avocados | **Scarcity:** "🔥 Only 3 left!" tag + bin shows 3 avocados | Regular avocado, 6 oz, $1.00 each | Jumbo, 9 oz, **$1.20** each | Jumbo, 9 oz, **$1.80** each | per oz (qty fixed at 2) |
| 2 | 🍗 Meat: Chicken | **Mismatched units:** plain is labeled per lb, trick shows only one big pack price (weight in small print) | Chicken breast, **$4.99/lb**, 2 lb pack = $9.98 | "Value Pack" 3 lb, **$11.97/pack** | "Value Pack" 3 lb, **$17.97/pack** | per lb |
| 3 | 🥚 Dairy: Eggs | **Low sticker price:** half dozen with "Just $X!" callout | Dozen, $4.80 | Half dozen, **$1.92** | Half dozen, **$2.88** | per egg |
| 4 | 🥣 Cereal | **"FAMILY SIZE!"** giant box with banner | Regular box, 12 oz, $4.80 | Family Size, 20 oz, **$6.40** | Family Size, 20 oz, **$9.60** | per oz |
| 5 | ☕ Coffee | **Decoy size:** Medium makes Large look smart (trick option = Large) | Small, 12 oz, $6.00 | Large 24 oz **$9.60**; decoy Medium 18 oz $9.20 | Large 24 oz **$14.40**; decoy Medium 18 oz $14.00 | per oz |
| 6 | 🍫 Snacks: Chips | **Multi-buy:** big "2 for $X!" sign; singles price in small print | 1 bag, 8 oz, $2.50 | **2 for $4.00** | **2 for $6.00** | per bag |
| 7 | 🍪 Cookies | **"Buy 2, Get 1 FREE!"** (bundle = 3 packs) | Brand A, 10 oz, $4.00 | Brand B 8 oz packs, **$3.84 each** → 3 packs for $7.68 | Brand B 8 oz packs, **$5.76 each** → 3 packs for $11.52 | per oz |
| 8 | 🥤 Drinks: Juice | **Fake sale:** ~~$8.99~~ crossed out + SALE tag | Store juice, 64 oz, $4.48 | Sale juice, 52 oz, **$2.91** | Sale juice, 52 oz, **$4.37** | per oz |
| 9 | 🍝 Pantry: Pasta sauce | **"NEW LOOK!"** jar (same label in both versions) | Classic jar, 24 oz, $4.00 | New Look jar, **30 oz**, $4.00 | New Look jar, **20 oz**, $4.00 (shrinkflation) | per oz |
| 10 | 🧻 Household: Paper towels | **Inflated claim:** "4 MEGA rolls = 16 regular rolls!" (true sheet count in small print) | 6 regular rolls, 600 sheets, $6.00 | 4 Mega rolls, 880 sheets, **$7.04** | 4 Mega rolls, 880 sheets, **$10.56** | per sheet |

Notes:
- Bin/shelf position of plain vs trick option: keep consistent within an aisle across versions.
- Cookies: options are "1 pack Brand A" or "Buy 2 Get 1 Free bundle (3 packs Brand B)".
- Chips: options are "1 bag" or "2-for bundle".

## End reveal: "Where you lost money"
1. Receipt with each item, then **unit prices revealed** next to each choice and the best option.
2. **Total lost to tricks** ($ and % vs the smartest cart).
3. 🪤 **Fell for** (traps taken, with $ lost each + one-line why, e.g. "The juice was 'on sale,' but at $0.084/oz it cost more than store juice at $0.070/oz").
4. ✅ **Spotted** (traps avoided) and 💡 **Lucky/Smart** (took the trick when it was a real deal).
5. 🏆 Percentile vs other shoppers + "Your weakness: ___" (the trick type that cost them most).

## Survey (after reveal or before — keep short, anonymous)
Student Y/N, age range, grocery shopping frequency, "Do you usually check price per ounce?" (never / sometimes / always).

## Results page (portfolio)
- **Trap Leaderboard:** each trick's % taken when TRAP vs when DEAL, ranked by % fooled.
- Average $ lost per shopper.
- Do self-described "unit price checkers" actually do better?
- Interview line: "Even when told to find the best deals, shoppers fell for [top trick] X% of the time. Customers judge price by signals, not math."
