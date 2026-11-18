// ============================================================
//  AISLES CONFIG — every product, price and version lives here.
//  Change a price = edit one number. The app reads this file.
// ============================================================
//
//  HOW AN AISLE IS DESCRIBED
//  id, number, department, title     – names (id "a3" becomes Sheet columns a3_version, a3_choice, ...)
//  ready: true                       – show it to shoppers (false = hidden)
//  listItem                          – which grocery-list item it fills (null = NOT on the list)
//  type                              – "choice"   pick one option (or skip)
//                                      "quantity" pick how many, 0–maxQty   (chips)
//                                      "coupon"   one product + a coupon     (pasta sauce)
//  versions                          – each shopper gets ONE of these at random
//  prompt / skipLabel                – text on the screen
//  art                               – which drawing to use (see js/art.js)
//
//  PRICES can be one number (same for everyone)          unitPrice: 6.00
//  or depend on the version the shopper got              unitPrice: { A: 8.00, B: 7.00 }
//  tag / wasPrice work the same way:                     tag: { B: "SALE" }   wasPrice: { B: 8.99 }
//  onlyIn: ["B"] shows an option ONLY in those versions (coffee decoy).
// ============================================================

// The shopper's grocery list (8 items). Ice cream + the new product are NOT on it.
window.GROCERY_LIST = [
  { id: "avocados",     label: "2 avocados" },
  { id: "eggs",         label: "Eggs" },
  { id: "cereal",       label: "Cereal" },
  { id: "coffee",       label: "Coffee" },
  { id: "chips",        label: "Chips" },
  { id: "juice",        label: "Juice" },
  { id: "pasta_sauce",  label: "Pasta sauce" },
  { id: "paper_towels", label: "Paper towels" },
];

// Aisles run in this order.
window.AISLES = [
  // ---------------- Aisle 1 — Produce: Avocados (scarcity) — LOCKED ----------------
  {
    id: "a1", ready: true, number: 1, department: "Produce", title: "Avocados",
    listItem: "avocados",
    type: "choice",
    quantity: 2,                // fixed: shopper always takes 2
    prompt: "Your list says <b>2 avocados</b>. Pick a kind, or skip.",
    priceLabel: "each",         // small text after the price
    art: "avocado",
    versions: ["A", "B"],       // A = both bins full. B = Jumbo bin shows only 3 + "Only 3 left!"
    options: [
      {
        id: "regular", name: "Avocados", receiptName: "Regular avocados",
        unitPrice: 1.0,
        size: 0.85,                              // drawing scale
        stock: { A: "full", B: "full" },
      },
      {
        id: "jumbo", name: "JUMBO Avocados", receiptName: "Jumbo avocados",
        unitPrice: 2.0,
        size: 1.25,                              // drawn bigger
        stock: { A: "full", B: 3 },
        tag: { B: "🔥 Only 3 left!" },
      },
    ],
  },

  // ---------------- Aisle 2 — Dairy: Eggs (necessity pricing) — LOCKED ----------------
  {
    id: "a2", ready: true, number: 2, department: "Dairy", title: "Eggs",
    listItem: "eggs",
    type: "choice",
    quantity: 1,
    prompt: "Your list says <b>eggs</b>. Pick a size, or skip.",
    art: "eggs",
    versions: ["3", "5", "7", "9"],   // version name = the dozen price
    options: [
      {
        id: "dozen", name: "Dozen eggs", receiptName: "Eggs (dozen)",
        unitPrice: { "3": 3.0, "5": 5.0, "7": 7.0, "9": 9.0 },
        detail: "12 eggs", count: 12,
      },
      {
        id: "half", name: "Half dozen eggs", receiptName: "Eggs (half dozen)",
        unitPrice: { "3": 1.8, "5": 3.0, "7": 4.2, "9": 5.4 },   // always 60% of the dozen
        detail: "6 eggs", count: 6,
      },
    ],
  },

  // ---------------- Aisle 3 — Frozen: Ice cream (treat price) — BUILT, DRAFT ----------------
  {
    id: "a3", ready: true, number: 3, department: "Frozen", title: "Ice cream",
    listItem: null,                    // NOT on the list
    type: "choice",
    quantity: 1,
    prompt: "<b>Ice cream</b> isn't on your list. Grab a pint, or skip it.",
    art: "icecream",
    versions: ["3", "5", "7", "9"],   // version name = the pint price
    options: [
      {
        id: "buy", name: "Vanilla Bean ice cream", receiptName: "Ice cream (pint)",
        unitPrice: { "3": 3.0, "5": 5.0, "7": 7.0, "9": 9.0 },
        detail: "1 pint", flavor: "VANILLA BEAN",
      },
    ],
  },

  // ---------------- Aisle 4 — Cereal (brand vs store brand) — BUILT, DRAFT ----------------
  {
    id: "a4", ready: true, number: 4, department: "Cereal", title: "Cereal",
    listItem: "cereal",
    type: "choice",
    quantity: 1,
    prompt: "Your list says <b>cereal</b>. Pick a box, or skip.",
    art: "cereal",
    versions: ["4.50", "3.75", "3.00"],   // version name = Market Basics price
    options: [
      {
        id: "brand", name: "Frosted Crunch", receiptName: "Frosted Crunch",
        unitPrice: 5.0,
        detail: "14 oz box", style: "fancy", badge: "America's #1!",
      },
      {
        id: "store", name: "Market Basics", receiptName: "Market Basics cereal",
        unitPrice: { "4.50": 4.5, "3.75": 3.75, "3.00": 3.0 },
        detail: "14 oz box", style: "plain",
      },
    ],
  },

  // ---------------- Aisle 5 — NEW product end-cap (impulse) — BUILT, DRAFT ----------------
  {
    id: "a5", ready: true, number: 5, department: "New this week", title: "New product",
    listItem: null,                    // NOT on the list
    type: "choice",
    quantity: 1,
    layout: "endcap",                  // colourful "NEW!" display
    prompt: "Something new on the end-cap. Buy it, or skip.",
    skipLabel: "Skip it",
    art: "soda4",
    versions: ["4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"],   // version name = price
    options: [
      {
        // PLACEHOLDER product — swap name / pitch / colours here.
        id: "buy", name: "LIFT Sparkling Protein Soda", receiptName: "LIFT soda (4-pack)",
        pitch: "20g protein per can. Zero sugar. Actually fizzy.",
        unitPrice: { "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, "11": 11, "12": 12, "13": 13, "14": 14 },
        detail: "4-pack · 12 oz cans",
        tag: "✨ NEW!",
        brand: "LIFT", canColor: "#6C4BD8", accentColor: "#FFD23F",
        unitCost: 3.0,                 // for the profit chart later — never shown to shoppers
      },
    ],
  },

  // ---------------- Aisle 6 — Coffee (decoy) — BUILT, DRAFT ----------------
  {
    id: "a6", ready: true, number: 6, department: "Coffee", title: "Coffee",
    listItem: "coffee",
    type: "choice",
    quantity: 1,
    prompt: "Your list says <b>coffee</b>. Pick a size, or skip.",
    art: "coffee",
    versions: ["A", "B"],              // B adds the Medium decoy
    options: [
      { id: "small",  name: "Small",  receiptName: "Coffee (small)",  unitPrice: 6.0,  detail: "12 oz bag", oz: 12 },
      { id: "medium", name: "Medium", receiptName: "Coffee (medium)", unitPrice: 9.5,  detail: "18 oz bag", oz: 18, onlyIn: ["B"] },
      { id: "large",  name: "Large",  receiptName: "Coffee (large)",  unitPrice: 10.0, detail: "24 oz bag", oz: 24 },
    ],
  },

  // ---------------- Aisle 7 — Snacks: Chips (multi-unit pricing) — BUILT, DRAFT ----------------
  {
    id: "a7", ready: true, number: 7, department: "Snacks", title: "Chips",
    listItem: "chips",
    type: "quantity",
    prompt: "Your list says <b>chips</b>. How many bags?",
    art: "chips",
    versions: ["A", "B"],
    name: "Classic Sea Salt Chips", receiptName: "Chips",
    unitPrice: 2.5,                    // same real price in both versions
    maxQty: 4,
    tagBig:   { A: "$2.50 each", B: "2 for $5" },
    tagSmall: { A: "",           B: "or $2.50 each" },
  },

  // ---------------- Aisle 8 — Drinks: Juice (reference price) — BUILT, DRAFT ----------------
  {
    id: "a8", ready: true, number: 8, department: "Drinks", title: "Juice",
    listItem: "juice",
    type: "choice",
    quantity: 1,
    prompt: "Your list says <b>juice</b>. Pick one, or skip.",
    art: "juice",
    versions: ["A", "B"],              // B shows a crossed-out $8.99 on Premium
    options: [
      { id: "basic",   name: "Orange Juice",         receiptName: "Juice (basic)",  unitPrice: 3.49, detail: "52 oz carton", style: "carton" },
      { id: "premium", name: "Premium Cold-Pressed", receiptName: "Juice (premium)", unitPrice: 5.99, detail: "52 oz bottle", style: "bottle",
        wasPrice: { B: 8.99 }, tag: { B: "SALE" } },
    ],
  },

  // ---------------- Aisle 9 — Pantry: Pasta sauce (coupon effort) — BUILT, DRAFT ----------------
  {
    id: "a9", ready: true, number: 9, department: "Pantry", title: "Pasta sauce",
    listItem: "pasta_sauce",
    type: "coupon",
    prompt: "Your list says <b>pasta sauce</b>. There's a coupon this week.",
    art: "sauce",
    versions: ["A", "B"],              // A = one-click clip. B = type the code from the flyer.
    name: "Marinara Pasta Sauce", receiptName: "Pasta sauce", detail: "24 oz jar",
    unitPrice: 4.0,
    couponValue: 1.0,
    couponCode: "482915",              // the 6-digit code shown on the flyer in version B
  },

  // ---------------- Aisle 10 — Household: Paper towels (bulk tiers) — BUILT, DRAFT ----------------
  {
    id: "a10", ready: true, number: 10, department: "Household", title: "Paper towels",
    listItem: "paper_towels",
    type: "choice",
    quantity: 1,
    prompt: "Your list says <b>paper towels</b>. Pick a pack, or skip.",
    art: "towels",
    versions: ["A", "B"],              // A = flat per-roll price. B = bulk discount.
    options: [
      { id: "1",  name: "1 roll",  receiptName: "Paper towels (1 roll)",  unitPrice: { A: 2,  B: 2 },  detail: "1 roll",   rolls: 1 },
      { id: "4",  name: "4-pack",  receiptName: "Paper towels (4-pack)",  unitPrice: { A: 8,  B: 7 },  detail: "4 rolls",  rolls: 4 },
      { id: "12", name: "12-pack", receiptName: "Paper towels (12-pack)", unitPrice: { A: 24, B: 18 }, detail: "12 rolls", rolls: 12 },
    ],
  },
];
