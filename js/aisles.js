// ============================================================
//  AISLES CONFIG (Game v2: Unit-Price Traps) — see GAME_SPEC.md
//  Every product, price and size lives here. Change a price = edit one number.
// ============================================================
//
//  Each aisle has a TRICK option and a PLAIN option (coffee also has a DECOY).
//  For each shopper, every aisle flips a coin:
//     TRAP → the trick is ~20% WORSE per unit than plain
//     DEAL → the trick is ~20% BETTER per unit than plain
//
//  OPTION FIELDS
//   role        "plain" | "trick" | "decoy"
//   price       price of ONE package — a number, or { DEAL: x, TRAP: y }
//   units       how many units in ONE package (oz, lb, eggs, bags, sheets) — number or { DEAL, TRAP }
//   big         the large price text on the card     (default "{price}")
//   small       the small print: package size etc.   (shown on every product)
//   tag         flashy sticker (optional)            — text, or { DEAL, TRAP }
//   wasPrice    crossed-out "was" price (optional)
//   payFor      for "Buy 2 Get 1 Free": how many packs you pay for, so {each} = price ÷ payFor
//   other fields = drawing settings for js/art.js
//
//  TEXT PLACEHOLDERS (filled in automatically)
//   {price} package price · {each} price ÷ payFor · {units} units per package
//   {unitPrice} price per unit — ONLY used where the spec says a real label shows it (chicken $/lb)
//
//  REVEAL TEXT (fellWhy) placeholders:
//   {chosenUnit} {bestUnit} unit prices · {chosenName} {bestName} · {chosenPrice} · {chosenUnits}
//
//  NEVER show $/oz-style unit prices while shopping — they only appear in the end reveal.
// ============================================================

window.GROCERY_LIST = [
  { id: "avocados",     label: "2 avocados" },
  { id: "chicken",      label: "Chicken" },
  { id: "eggs",         label: "Eggs" },
  { id: "cereal",       label: "Cereal" },
  { id: "coffee",       label: "Coffee" },
  { id: "chips",        label: "Chips" },
  { id: "cookies",      label: "Cookies" },
  { id: "juice",        label: "Juice" },
  { id: "pasta_sauce",  label: "Pasta sauce" },
  { id: "paper_towels", label: "Paper towels" },
];

// Every aisle randomly gets one of these, 50/50, independently.
window.AISLE_VERSIONS = ["TRAP", "DEAL"];

window.AISLES = [
  // ---------------- 1 · Produce: Avocados — Scarcity ----------------
  {
    id: "a1", number: 1, department: "Produce", title: "Avocados", listItem: "avocados",
    trickType: "Scarcity",
    unit: "oz",
    quantity: 2,                                   // fixed: always 2 avocados
    prompt: "Your list says <b>2 avocados</b>. Pick a kind, or skip.",
    art: "avocado",
    options: [
      { id: "regular", role: "plain", name: "Avocados", receiptName: "Avocados",
        price: 1.0, units: 6,
        big: "{price} each", small: "6 oz each",
        size: 0.85 },
      { id: "jumbo", role: "trick", name: "JUMBO Avocados", receiptName: "JUMBO avocados",
        price: { DEAL: 1.2, TRAP: 1.8 }, units: 9,
        big: "{price} each", small: "9 oz each",
        tag: "🔥 Only 3 left!",
        size: 1.25, stock: 3 },
    ],
    fellWhy: "“Only 3 left!” made Jumbo feel special, but at {chosenUnit}/oz it cost more than regular at {bestUnit}/oz.",
  },

  // ---------------- 2 · Meat: Chicken — Mismatched units ----------------
  {
    id: "a2", number: 2, department: "Meat", title: "Chicken", listItem: "chicken",
    trickType: "Mismatched units",
    unit: "lb",
    prompt: "Your list says <b>chicken</b>. Pick a pack, or skip.",
    art: "chicken",
    options: [
      { id: "regular", role: "plain", name: "Chicken Breast", receiptName: "Chicken breast (2 lb)",
        price: 9.98, units: 2,
        big: "{unitPrice}/lb", small: "2 lb pack · {price}",
        pieces: 2, scale: 0.85, sticker: "FRESH" },
      { id: "value", role: "trick", name: "Value Pack Chicken", receiptName: "Value Pack chicken (3 lb)",
        price: { DEAL: 11.97, TRAP: 17.97 }, units: 3,
        big: "{price}", small: "3 lb",
        pieces: 3, scale: 1, sticker: "VALUE PACK", stickerColor: "#E8573A" },
    ],
    fellWhy: "The Value Pack only showed a pack price. At {chosenUnit}/lb it cost more than the regular pack at {bestUnit}/lb.",
  },

  // ---------------- 3 · Dairy: Eggs — Low sticker price ----------------
  {
    id: "a3", number: 3, department: "Dairy", title: "Eggs", listItem: "eggs",
    trickType: "Low sticker price",
    unit: "egg",
    prompt: "Your list says <b>eggs</b>. Pick a size, or skip.",
    art: "eggs",
    options: [
      { id: "dozen", role: "plain", name: "Dozen Eggs", receiptName: "Eggs (dozen)",
        price: 4.8, units: 12, small: "12 eggs", count: 12 },
      { id: "half", role: "trick", name: "Half Dozen Eggs", receiptName: "Eggs (half dozen)",
        price: { DEAL: 1.92, TRAP: 2.88 }, units: 6, small: "6 eggs", count: 6,
        tag: "Just {price}!" },
    ],
    fellWhy: "“Just {chosenPrice}!” looked cheap, but that's {chosenUnit} per egg vs {bestUnit} for the dozen.",
  },

  // ---------------- 4 · Cereal — "Family Size!" ----------------
  {
    id: "a4", number: 4, department: "Cereal", title: "Cereal", listItem: "cereal",
    trickType: "Family size",
    unit: "oz",
    prompt: "Your list says <b>cereal</b>. Pick a box, or skip.",
    art: "cereal",
    options: [
      { id: "regular", role: "plain", name: "Honey Oat Crunch", receiptName: "Cereal (12 oz)",
        price: 4.8, units: 12, small: "12 oz box", scale: 0.78 },
      { id: "family", role: "trick", name: "Honey Oat Crunch", receiptName: "Cereal Family Size (20 oz)",
        price: { DEAL: 6.4, TRAP: 9.6 }, units: 20, small: "20 oz box", scale: 1,
        tag: "FAMILY SIZE!" },
    ],
    fellWhy: "The Family Size box felt like the bulk deal, but at {chosenUnit}/oz it cost more than the regular box at {bestUnit}/oz.",
  },

  // ---------------- 5 · Coffee — Decoy size (trick = Large) ----------------
  {
    id: "a5", number: 5, department: "Coffee", title: "Coffee", listItem: "coffee",
    trickType: "Decoy size",
    unit: "oz",
    prompt: "Your list says <b>coffee</b>. Pick a size, or skip.",
    art: "coffee",
    options: [
      { id: "small", role: "plain", name: "Small", receiptName: "Coffee (small 12 oz)",
        price: 6.0, units: 12, small: "12 oz bag", oz: 12 },
      { id: "medium", role: "decoy", name: "Medium", receiptName: "Coffee (medium 18 oz)",
        price: { DEAL: 9.2, TRAP: 14.0 }, units: 18, small: "18 oz bag", oz: 18 },
      { id: "large", role: "trick", name: "Large", receiptName: "Coffee (large 24 oz)",
        price: { DEAL: 9.6, TRAP: 14.4 }, units: 24, small: "24 oz bag", oz: 24 },
    ],
    fellWhy: "The Medium made Large look like a steal, but Large was {chosenUnit}/oz vs {bestUnit}/oz for Small.",
    decoyWhy: "Medium was the decoy — at {chosenUnit}/oz it was never the best buy ({bestName} was {bestUnit}/oz).",
  },

  // ---------------- 6 · Snacks: Chips — Multi-buy ----------------
  {
    id: "a6", number: 6, department: "Snacks", title: "Chips", listItem: "chips",
    trickType: "Multi-buy",
    unit: "bag",
    prompt: "Your list says <b>chips</b>. Pick one, or skip.",
    art: "chips",
    options: [
      { id: "single", role: "plain", name: "Sea Salt Chips", receiptName: "Chips (1 bag)",
        price: 2.5, units: 1, small: "1 bag · 8 oz", bags: 1 },
      { id: "bundle", role: "trick", name: "Sea Salt Chips", receiptName: "Chips (2-for bundle)",
        price: { DEAL: 4.0, TRAP: 6.0 }, units: 2,
        big: "2 for {price}!", small: "2 bags · 8 oz each", bags: 2 },
    ],
    fellWhy: "“2 for {chosenPrice}!” sounded like a deal, but that's {chosenUnit} a bag vs {bestUnit} for a single.",
  },

  // ---------------- 7 · Cookies — Buy 2, Get 1 FREE ----------------
  {
    id: "a7", number: 7, department: "Cookies", title: "Cookies", listItem: "cookies",
    trickType: "Buy 2, Get 1 Free",
    unit: "oz",
    prompt: "Your list says <b>cookies</b>. Pick one, or skip.",
    art: "cookies",
    options: [
      { id: "brand_a", role: "plain", name: "Cookie Barn", receiptName: "Cookie Barn (1 pack)",
        price: 4.0, units: 10, small: "1 pack · 10 oz",
        packs: 1, brand: "COOKIE BARN", color: "#2F6E9E" },
      { id: "bundle", role: "trick", name: "Crumbly's", receiptName: "Crumbly's (3-pack deal)",
        price: { DEAL: 7.68, TRAP: 11.52 }, units: 24, payFor: 2,
        big: "3 packs for {price}", small: "{each} each · 8 oz packs",
        tag: "Buy 2, Get 1 FREE!",
        packs: 3, brand: "CRUMBLY'S", color: "#B23A6E" },
    ],
    fellWhy: "“Get 1 FREE” felt like a win, but the bundle worked out to {chosenUnit}/oz vs {bestUnit}/oz for {bestName}.",
  },

  // ---------------- 8 · Drinks: Juice — Fake sale ----------------
  {
    id: "a8", number: 8, department: "Drinks", title: "Juice", listItem: "juice",
    trickType: "Fake sale",
    unit: "oz",
    prompt: "Your list says <b>juice</b>. Pick one, or skip.",
    art: "juice",
    options: [
      { id: "store", role: "plain", name: "Store Orange Juice", receiptName: "Store juice (64 oz)",
        price: 4.48, units: 64, small: "64 oz carton", style: "carton" },
      { id: "sale", role: "trick", name: "Sunny Grove Orange Juice", receiptName: "Sunny Grove juice (52 oz)",
        price: { DEAL: 2.91, TRAP: 4.37 }, units: 52, small: "52 oz bottle", style: "bottle",
        wasPrice: 8.99, tag: "SALE" },
    ],
    fellWhy: "The juice was “on sale,” but at {chosenUnit}/oz it cost more than store juice at {bestUnit}/oz.",
  },

  // ---------------- 9 · Pantry: Pasta sauce — "New Look!" (shrinkflation) ----------------
  {
    id: "a9", number: 9, department: "Pantry", title: "Pasta sauce", listItem: "pasta_sauce",
    trickType: "Shrinkflation",
    unit: "oz",
    prompt: "Your list says <b>pasta sauce</b>. Pick a jar, or skip.",
    art: "sauce",
    options: [
      { id: "classic", role: "plain", name: "Classic Marinara", receiptName: "Classic marinara (24 oz)",
        price: 4.0, units: 24, small: "24 oz jar", style: "classic" },
      { id: "newlook", role: "trick", name: "Marinara — New Look", receiptName: "New Look marinara",
        price: 4.0, units: { DEAL: 30, TRAP: 20 }, small: "{units} oz jar", style: "newlook",
        tag: "NEW LOOK!" },
    ],
    fellWhy: "Same price, fresh label — but the new jar held only {chosenUnits} oz. That's {chosenUnit}/oz vs {bestUnit}/oz for Classic.",
  },

  // ---------------- 10 · Household: Paper towels — Inflated claim ----------------
  {
    id: "a10", number: 10, department: "Household", title: "Paper towels", listItem: "paper_towels",
    trickType: "Inflated claim",
    unit: "sheet",
    prompt: "Your list says <b>paper towels</b>. Pick a pack, or skip.",
    art: "towels",
    options: [
      { id: "regular", role: "plain", name: "Regular Rolls", receiptName: "Paper towels (6 regular)",
        price: 6.0, units: 600, small: "6 rolls · 600 sheets", rolls: 6 },
      { id: "mega", role: "trick", name: "MEGA Rolls", receiptName: "Paper towels (4 MEGA)",
        price: { DEAL: 7.04, TRAP: 10.56 }, units: 880, small: "4 Mega rolls · 880 sheets", rolls: 4, mega: true,
        tag: "4 MEGA = 16 regular rolls!" },
    ],
    fellWhy: "“4 = 16 rolls!” sounded huge, but the sheet count says {chosenUnit}/sheet vs {bestUnit}/sheet.",
  },
];
