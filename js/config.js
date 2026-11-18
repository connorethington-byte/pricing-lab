// ============================================================
//  SITE SETTINGS — the few things you'll change by hand.
// ============================================================

window.LAB_CONFIG = {
  // Placeholder name (site name is still an open decision).
  siteName: "Lab Market",

  // Paste your Apps Script "Web app URL" here (ends in /exec).
  // Leave it empty and the site runs in "offline" mode: nothing is sent,
  // and the checkout screen shows the row that WOULD have been sent.
  sheetUrl: "https://script.google.com/macros/s/AKfycbyVtlH9_zgbmESxhCC8-naNhIDbH9pkn762hfD6S5Jhox-qdOe4Gb5jcJGRraWkslu_IA/exec",

  // Game v3 writes to its own fresh tab in the same Google Sheet.
  sheetTab: "responses_v3",

  // Time limit per aisle (the practice aisle uses it too).
  secondsPerAisle: 6,

  // Don't show a percentile until at least this many OTHER shoppers have played.
  minShoppersForRank: 5,

  // Bump this whenever you change an aisle, so you can tell rows apart in the Sheet.
  appVersion: "v3-gut-1",
};
