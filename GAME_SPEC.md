# Connor's Shopping Game — Game Spec v3: "Your Gut vs. The Math"

Replaces v2. Why: in play-testing, v2 felt like doing math the whole time; mixed price formats (per lb vs total) were annoying; pasta just tested reading fine print. v3 makes every decision a **fast gut call** while keeping hidden traps/deals so the ending can show **where your gut cost you money**.

## Core mechanic
- **8 trick aisles + 2 filler aisles.** Each trick aisle has a pricing trick (sticker, banner, "deal").
- For every shopper, each aisle independently flips a coin (50/50):
  - 🪤 **TRAP:** trick option is **20% WORSE** per unit than the plain option
  - ✅ **DEAL:** trick option is **20% BETTER** per unit than the plain option
- **Filler aisles:** two plain options, no tricks/stickers. One is randomly 20% better per unit. Measures baseline "gut sense of value" and keeps players from noticing that every aisle is a gimmick.
- Key question: do people take the trick equally often whether it's a TRAP or a DEAL? (= gut follows the label, not the value)

## Shopper experience
- Intro: **"Spend wisely and go for the best deals. You've got 6 seconds per aisle — trust your gut!"**
- **Practice aisle first (not recorded):** a simple two-option aisle so players learn the tap + timer before it counts.
- **⏱️ 6-second countdown per aisle**, shown as a friendly shopping timer. Timer starts when products appear.
- **One tap on a product = it goes in the cart and the game moves on.** No separate "Add to cart" button (too slow for 6 seconds). Keep a small "Skip" button.
- **Timeout = nothing added**, recorded as `timeout`. Reveal can say "You froze on the cereal."
- **Randomize which side (left/right) the trick option appears on**, per aisle, per shopper. Record the side.
- **Same price format on every card:** big total price + size underneath (e.g. "$8" / "24 oz box"). No per-lb or per-unit prices anywhere during shopping.
- **Round numbers only.**
- **Draw products to scale** where size differs (smaller jar looks smaller, family-size box looks bigger), so a sharp gut *could* catch it at a glance.
- No budget limit; show a small running cart total. Grocery list: avocados, chicken, eggs, cereal, coffee, chips, cookies, juice, pasta sauce, paper towels.
- Smart Shopper Score stays a surprise until the end.

## The 10 aisles (all numbers in config)

| # | Aisle | Type | Trick | Plain option | Trick option — DEAL | Trick option — TRAP | Unit |
|---|---|---|---|---|---|---|---|
| 1 | 🥑 Produce: Avocados | **FILLER** | none — two plain bags | Bag of 4, **$4** | Other bag: 5 for **$4** | Other bag: 5 for **$6** | per avocado |
| 2 | 🍗 Meat: Chicken | Trick | **"VALUE PACK" sticker** | 2 lb pack, **$10** | Value Pack 3 lb, **$12** | Value Pack 3 lb, **$18** | per lb |
| 3 | 🥚 Dairy: Eggs | Trick | **Low sticker price:** half dozen with "Just $X!" callout | Dozen, **$5** | Half dozen, **$2** | Half dozen, **$3** | per egg |
| 4 | 🥣 Cereal | Trick | **"FAMILY SIZE!" banner**, big box | 12 oz box, **$5** | Family Size 24 oz, **$8** | Family Size 24 oz, **$12** | per oz |
| 5 | ☕ Coffee | Trick | **Decoy:** Medium makes Large look smart (trick option = Large) | Small 10 oz, **$5** | Large 20 oz **$8**; decoy Medium 15 oz **$7** | Large 20 oz **$12**; decoy Medium 15 oz **$11** | per oz |
| 6 | 🍫 Snacks: Chips | Trick | **"2 for $X!"** sign | 1 bag, **$2.50** | **2 for $4** | **2 for $6** | per bag |
| 7 | 🍪 Cookies | Trick | **"Buy 2, Get 1 FREE!"** (bundle = 3 packs, pay for 2) | 1 pack 10 oz, **$5** | Packs $6 each → 3 for **$12** (30 oz) | Packs $9 each → 3 for **$18** (30 oz) | per oz |
| 8 | 🥤 Drinks: Juice | Trick | **Fake sale:** ~~$10~~ crossed out + SALE tag | 60 oz, **$6** | Sale juice 50 oz, **$4** | Sale juice 50 oz, **$6** | per oz |
| 9 | 🍝 Pantry: Pasta sauce | Trick | **"NEW LOOK!"** jar (same label text in both versions; same brand/flavor as classic) | Classic 24 oz, **$4** | New Look **30 oz**, $4 (jar drawn bigger) | New Look **20 oz**, $4 (jar drawn smaller) | per oz |
| 10 | 🧻 Household: Paper towels | **FILLER** | none — two plain packs | 6 rolls, **$6** | Other pack: 5 rolls **$4** | Other pack: 5 rolls **$6** | per roll |

Check: every DEAL is exactly 20% better and every TRAP exactly 20% worse per unit than the plain option (cereal, chicken, eggs, coffee, chips, cookies, juice, pasta, fillers).
Fix from play-test: pasta "New Look" jar must be the SAME product as Classic (same tomato label style, not "Artisan"/premium look) — only the "NEW LOOK!" badge and size differ.

## Data per aisle
version (TRAP/DEAL), side of trick option (L/R), choice (trick / plain / skip / timeout), units bought, money lost, reaction time (ms).
**Money lost** = (unit price of chosen option − best unit price in that aisle) × units bought. Skip/timeout = $0, flagged.
Start a fresh Sheet tab for v3.

## End reveal: "Your Gut vs. The Math"
1. Each aisle: what your gut picked vs what the math says, with unit prices revealed and $ lost.
   e.g. "🥣 Your gut said FAMILY SIZE. The math said the regular box: $0.50/oz vs $0.42/oz. Cost: $2.00."
2. **Total your gut cost you** ($ and % vs the smartest cart).
3. 🪤 Fell for · ✅ Spotted · 💡 Lucky (took the trick when it was a real deal) · 🧊 Froze (timeouts).
4. 🏆 Percentile vs other shoppers + "Your gut's weakness: ___" (trick that cost the most).

## Survey (short, anonymous)
- "Did you mostly go with your gut or compare prices?" (1 = all gut … 7 = compared everything)
- Student Y/N, age range, grocery shopping frequency, "Do you usually check price per ounce?" (never / sometimes / always)

## Results page (portfolio)
- **Trap Leaderboard:** for each trick, % who took it when TRAP vs when DEAL. Small gap = gut follows the label.
- Filler aisles = baseline gut accuracy with no tricks.
- Average $ lost; do self-described "unit price checkers" actually do better under time pressure?
- Interview line: "People shop on gut, and gut follows labels. Under time pressure, shoppers took the 'SALE' option almost as often when it was a rip-off as when it was a real deal."
