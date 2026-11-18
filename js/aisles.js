// ============================================================
//  AISLES CONFIG (Game v3: "Your Gut vs. The Math") — see GAME_SPEC.md
//  Every product, price and size lives here. Change a price = edit one number.
// ============================================================
//
//  8 TRICK aisles + 2 FILLER aisles. For each shopper, every aisle flips a coin:
//     TRAP → the trick (or, in a filler, the "other" option) is 20% WORSE per unit than plain
//     DEAL → it is 20% BETTER per unit than plain
//  Each aisle also randomly puts the trick/other option on the LEFT or RIGHT.
//
//  OPTION FIELDS
//   role      "plain" | "trick" | "decoy" | "alt" (alt = the other option in a filler aisle)
//   price     price of ONE package — a number, or { DEAL: x, TRAP: y }. Shown big on the card.
//   units     units in ONE package (avocados, lb, eggs, oz, bags, rolls) — number or { DEAL, TRAP }
//   size      small text under the price, e.g. "24 oz box"   ({units} = units in this version)
//   tag       flashy sticker (optional). {price} = this option's price.
//   wasPrice  crossed-out "was" price (optional)
//   gutName   how the reveal names it: "Your gut said FAMILY SIZE. The math said the regular box…"
//   other fields = drawing settings for js/art.js (drawn to scale where sizes differ)
//
//  NEVER show per-unit prices while shopping — they only appear in the end reveal.
// ============================================================

window.GROCERY_LIST = [
  { id: "avocados",     label: "Avocados" },
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

window.AISLE_VERSIONS = ["TRAP", "DEAL"];

// Practice aisle — shown first, teaches tap + timer, NOT recorded.
window.PRACTICE_AISLE = {
  id: "practice", number: 0, department: "Practice aisle", title: "Bananas", emoji: "🍌",
  unit: "banana", prompt: "Practice round — tap the bananas you'd grab!",
  art: "banana",
  options: [
    { id: "small", role: "plain", name: "Bananas", price: 2, units: 4, size: "Bunch of 4", count: 4 },
    { id: "big",   role: "alt",   name: "Bananas", price: 3, units: 6, size: "Bunch of 6", count: 6 },
  ],
};

window.AISLES = [
  // ---------------- 1 · Produce: Avocados — FILLER (no trick) ----------------
  {
    id: "a1", number: 1, department: "Produce", title: "Avocados", emoji: "🥑", listItem: "avocados",
    filler: true, unit: "avocado",
    prompt: "Grab a bag of <b>avocados</b>!",
    art: "avocado",
    options: [
      { id: "bag4", role: "plain", name: "Avocados", price: 4, units: 4, size: "Bag of 4",
        gutName: "the bag of 4", count: 4 },
      { id: "bag5", role: "alt", name: "Avocados", price: { DEAL: 4, TRAP: 6 }, units: 5, size: "Bag of 5",
        gutName: "the bag of 5", count: 5 },
    ],
  },

  // ---------------- 2 · Meat: Chicken — "VALUE PACK" sticker ----------------
  {
    id: "a2", number: 2, department: "Meat", title: "Chicken", emoji: "🍗", listItem: "chicken",
    trickType: "“Value Pack” sticker", unit: "lb",
    prompt: "Grab some <b>chicken</b>!",
    art: "chicken",
    options: [
      { id: "regular", role: "plain", name: "Chicken Breast", price: 10, units: 2, size: "2 lb pack",
        gutName: "the regular pack", pieces: 2, scale: 0.85, sticker: "2 LB" },
      { id: "value", role: "trick", name: "Chicken Breast", price: { DEAL: 12, TRAP: 18 }, units: 3, size: "3 lb pack",
        gutName: "VALUE PACK", tag: "VALUE PACK", pieces: 3, scale: 1, sticker: "3 LB" },
    ],
  },

  // ---------------- 3 · Dairy: Eggs — low sticker price ----------------
  {
    id: "a3", number: 3, department: "Dairy", title: "Eggs", emoji: "🥚", listItem: "eggs",
    trickType: "Low sticker price", unit: "egg",
    prompt: "Grab some <b>eggs</b>!",
    art: "eggs",
    options: [
      { id: "dozen", role: "plain", name: "Eggs", price: 5, units: 12, size: "Dozen (12 eggs)",
        gutName: "the dozen", count: 12 },
      { id: "half", role: "trick", name: "Eggs", price: { DEAL: 2, TRAP: 3 }, units: 6, size: "Half dozen (6 eggs)",
        gutName: "“JUST {price}!”", tag: "Just {price}!", count: 6 },
    ],
  },

  // ---------------- 4 · Cereal — "FAMILY SIZE!" ----------------
  {
    id: "a4", number: 4, department: "Cereal", title: "Cereal", emoji: "🥣", listItem: "cereal",
    trickType: "“Family Size” box", unit: "oz",
    prompt: "Grab some <b>cereal</b>!",
    art: "cereal",
    options: [
      { id: "regular", role: "plain", name: "Honey Oat Crunch", price: 5, units: 12, size: "12 oz box",
        gutName: "the regular box", scale: 0.72 },
      { id: "family", role: "trick", name: "Honey Oat Crunch", price: { DEAL: 8, TRAP: 12 }, units: 24, size: "24 oz box",
        gutName: "FAMILY SIZE", tag: "FAMILY SIZE!", scale: 1 },
    ],
  },

  // ---------------- 5 · Coffee — decoy (trick = Large) ----------------
  {
    id: "a5", number: 5, department: "Coffee", title: "Coffee", emoji: "☕", listItem: "coffee",
    trickType: "Decoy size", unit: "oz",
    prompt: "Grab some <b>coffee</b>!",
    art: "coffee",
    options: [
      { id: "small",  role: "plain", name: "Small",  price: 5, units: 10, size: "10 oz bag",
        gutName: "Small", oz: 10 },
      { id: "medium", role: "decoy", name: "Medium", price: { DEAL: 7, TRAP: 11 }, units: 15, size: "15 oz bag",
        gutName: "Medium", oz: 15 },
      { id: "large",  role: "trick", name: "Large",  price: { DEAL: 8, TRAP: 12 }, units: 20, size: "20 oz bag",
        gutName: "LARGE", oz: 20 },
    ],
  },

  // ---------------- 6 · Snacks: Chips — "2 for $X!" ----------------
  {
    id: "a6", number: 6, department: "Snacks", title: "Chips", emoji: "🍟", listItem: "chips",
    trickType: "“2 for $X” deal", unit: "bag",
    prompt: "Grab some <b>chips</b>!",
    art: "chips",
    options: [
      { id: "single", role: "plain", name: "Sea Salt Chips", price: 2.5, units: 1, size: "1 bag",
        gutName: "one bag", bags: 1 },
      { id: "bundle", role: "trick", name: "Sea Salt Chips", price: { DEAL: 4, TRAP: 6 }, units: 2, size: "2 bags",
        gutName: "“2 FOR {price}!”", tag: "2 for {price}!", bags: 2 },
    ],
  },

  // ---------------- 7 · Cookies — "Buy 2, Get 1 FREE!" ----------------
  {
    id: "a7", number: 7, department: "Cookies", title: "Cookies", emoji: "🍪", listItem: "cookies",
    trickType: "Buy 2, Get 1 Free", unit: "oz",
    prompt: "Grab some <b>cookies</b>!",
    art: "cookies",
    options: [
      { id: "single", role: "plain", name: "Choc Chip Cookies", price: 5, units: 10, size: "1 pack · 10 oz",
        gutName: "one pack", packs: 1, brand: "CRUMBLY'S", color: "#B23A6E" },
      { id: "bundle", role: "trick", name: "Choc Chip Cookies", price: { DEAL: 12, TRAP: 18 }, units: 30, size: "3 packs · 30 oz",
        gutName: "BUY 2, GET 1 FREE", tag: "Buy 2, Get 1 FREE!", packs: 3, brand: "CRUMBLY'S", color: "#B23A6E" },
    ],
  },

  // ---------------- 8 · Drinks: Juice — fake sale ----------------
  {
    id: "a8", number: 8, department: "Drinks", title: "Juice", emoji: "🧃", listItem: "juice",
    trickType: "Fake sale", unit: "oz",
    prompt: "Grab some <b>juice</b>!",
    art: "juice",
    options: [
      { id: "regular", role: "plain", name: "Orange Juice", price: 6, units: 60, size: "60 oz carton",
        gutName: "the regular carton", style: "carton" },
      { id: "sale", role: "trick", name: "Orange Juice", price: { DEAL: 4, TRAP: 6 }, units: 50, size: "50 oz bottle",
        gutName: "SALE", wasPrice: 10, tag: "SALE", style: "bottle", scale: 0.88 },
    ],
  },

  // ---------------- 9 · Pantry: Pasta sauce — "NEW LOOK!" (same product, different size) ----------------
  {
    id: "a9", number: 9, department: "Pantry", title: "Pasta sauce", emoji: "🍝", listItem: "pasta_sauce",
    trickType: "“New Look” jar", unit: "oz",
    prompt: "Grab some <b>pasta sauce</b>!",
    art: "sauce",
    options: [
      { id: "classic", role: "plain", name: "Marinara", price: 4, units: 24, size: "24 oz jar",
        gutName: "the classic jar" },
      { id: "newlook", role: "trick", name: "Marinara", price: 4, units: { DEAL: 30, TRAP: 20 }, size: "{units} oz jar",
        gutName: "NEW LOOK", tag: "NEW LOOK!" },
    ],
  },

  // ---------------- 10 · Household: Paper towels — FILLER (no trick) ----------------
  {
    id: "a10", number: 10, department: "Household", title: "Paper towels", emoji: "🧻", listItem: "paper_towels",
    filler: true, unit: "roll",
    prompt: "Grab some <b>paper towels</b>!",
    art: "towels",
    options: [
      { id: "six", role: "plain", name: "Paper Towels", price: 6, units: 6, size: "6 rolls",
        gutName: "the 6-roll pack", rolls: 6 },
      { id: "five", role: "alt", name: "Paper Towels", price: { DEAL: 4, TRAP: 6 }, units: 5, size: "5 rolls",
        gutName: "the 5-roll pack", rolls: 5 },
    ],
  },
];
