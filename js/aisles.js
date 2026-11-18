// ============================================================
//  AISLES CONFIG — every product, price and version lives here.
//  Change a price = edit one number. The app reads this file.
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

// Aisles run in this order. Only aisles with ready: true are shown to shoppers.
window.AISLES = [
  // ---------------- Aisle 1 — LOCKED ----------------
  {
    id: "a1",
    ready: true,
    number: 1,
    department: "Produce",
    title: "Avocados",
    listItem: "avocados",       // which grocery-list item this aisle fills
    type: "choice",             // pick ONE option (or skip)
    quantity: 2,                // fixed: shopper always takes 2
    prompt: "Your list says <b>2 avocados</b>. Pick a kind, or skip.",
    priceLabel: "each",         // small text after the price
    art: "avocado",
    versions: ["A", "B"],       // randomly assigned, 50/50
    // A = both bins full, no tag.  B = Jumbo bin shows only 3 + "Only 3 left!"
    options: [
      {
        id: "regular",
        name: "Avocados",
        receiptName: "Regular avocados",         // how it reads on the receipt
        unitPrice: 1.0,
        size: 0.85,                              // drawing scale
        stock: { A: "full", B: "full" },
        tag:   { A: null,   B: null },
      },
      {
        id: "jumbo",
        name: "JUMBO Avocados",
        receiptName: "Jumbo avocados",
        unitPrice: 2.0,
        size: 1.25,                              // drawn bigger
        stock: { A: "full", B: 3 },
        tag:   { A: null,   B: "🔥 Only 3 left!" },
      },
    ],
  },

  // ---------------- Aisle 2 — LOCKED ----------------
  {
    id: "a2",
    ready: true,
    number: 2,
    department: "Dairy",
    title: "Eggs",
    listItem: "eggs",
    type: "choice",
    quantity: 1,                // one carton
    prompt: "Your list says <b>eggs</b>. Pick a size, or skip.",
    priceLabel: "",
    art: "eggs",
    // 4 price versions. The version name IS the dozen price ("3" = $3 dozen).
    versions: ["3", "5", "7", "9"],
    // Half dozen is always 60% of the dozen price.
    options: [
      {
        id: "dozen",
        name: "Dozen eggs",
        receiptName: "Eggs (dozen)",
        unitPrice: { "3": 3.0, "5": 5.0, "7": 7.0, "9": 9.0 },
        detail: "12 eggs",
        count: 12,                               // eggs drawn in the carton
        tag: {},
      },
      {
        id: "half",
        name: "Half dozen eggs",
        receiptName: "Eggs (half dozen)",
        unitPrice: { "3": 1.8, "5": 3.0, "7": 4.2, "9": 5.4 },
        detail: "6 eggs",
        count: 6,
        tag: {},
      },
    ],
  },

  // ---------------- Aisles 3–10 — DRAFTS (not shown yet) ----------------
  { id: "a3",  ready: false, number: 3,  department: "Frozen",      title: "Ice cream",       listItem: null },
  { id: "a4",  ready: false, number: 4,  department: "Cereal",      title: "Cereal",          listItem: "cereal" },
  { id: "a5",  ready: false, number: 5,  department: "End-cap",     title: "NEW product",     listItem: null },
  { id: "a6",  ready: false, number: 6,  department: "Coffee",      title: "Coffee",          listItem: "coffee" },
  { id: "a7",  ready: false, number: 7,  department: "Snacks",      title: "Chips",           listItem: "chips" },
  { id: "a8",  ready: false, number: 8,  department: "Beverages",   title: "Juice",           listItem: "juice" },
  { id: "a9",  ready: false, number: 9,  department: "Pasta",       title: "Pasta sauce",     listItem: "pasta_sauce" },
  { id: "a10", ready: false, number: 10, department: "Household",   title: "Paper towels",    listItem: "paper_towels" },
];
