/**
 * Lab Market — Google Apps Script backend.
 *
 * Paste this whole file into Extensions → Apps Script of your Google Sheet.
 * After changing it: Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy
 * (that keeps the same /exec URL).
 *
 * doPost: receives ONE shopping trip (JSON) and appends it as ONE row.
 *         The row goes to the tab named in `sheet_tab` (e.g. "responses_v2"),
 *         which is created automatically. New columns are added automatically too.
 * doGet:  returns live totals as JSON for the results / percentile.
 *         ?tab=responses_v2        which tab to read (default "responses")
 *         ?include_tests=1         count TEST rows too (for your own testing)
 */

const DEFAULT_TAB = 'responses';
const TAB_PATTERN = /^responses(_v\d+)?$/;  // only these tab names are allowed
const MAX_KEYS = 300;          // a real trip is well under this
const MAX_VALUE_LENGTH = 200;  // no field should be longer than this

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // two shoppers at the same moment can't overwrite each other
  try {
    const data = JSON.parse(e.postData.contents);

    // Honeypot: a hidden field people never see. If it's filled in, it's a bot.
    // Pretend it worked so the bot doesn't retry, but save nothing.
    if (data.hp) return json_({ ok: true });
    delete data.hp;

    const tab = TAB_PATTERN.test(data.sheet_tab) ? data.sheet_tab : DEFAULT_TAB;
    delete data.sheet_tab;

    const clean = { received_at: new Date().toISOString() };
    Object.keys(data).slice(0, MAX_KEYS).forEach(function (key) {
      if (!/^[a-z0-9_]{1,40}$/.test(key)) return; // only simple column names
      clean[key] = cleanValue_(data[key]);
    });

    const sheet = getSheet_(tab);
    const headers = getHeaders_(sheet);
    Object.keys(clean).forEach(function (key) {
      if (headers.indexOf(key) === -1) {
        headers.push(key);
        sheet.getRange(1, headers.length).setValue(key);
      }
    });
    sheet.appendRow(headers.map(function (h) { return h in clean ? clean[h] : ''; }));
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Example output (v2 tab):
 * { ok: true, n: 42,
 *   scores: [70, 50, 90, ...],                 // every shopper's smart_score (for percentiles)
 *   avg_lost: 3.12,                            // average $ lost per shopper
 *   aisles: { a1: { TRAP: { n: 20, choices: { trick: 9, plain: 10, skip: 1 } },
 *                   DEAL: { n: 22, choices: { ... } } } } }
 */
function doGet(e) {
  const p = (e && e.parameter) || {};
  const tab = TAB_PATTERN.test(p.tab) ? p.tab : DEFAULT_TAB;
  const includeTests = p.include_tests === '1';

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(tab);
  const values = sheet ? sheet.getDataRange().getValues() : [];
  if (values.length < 2) return json_({ ok: true, n: 0, scores: [], avg_lost: 0, aisles: {} });

  const headers = values[0];
  const rows = values.slice(1).map(function (r) {
    const o = {};
    headers.forEach(function (h, i) { o[h] = r[i]; });
    return o;
  }).filter(function (o) { return includeTests || String(o.is_test) !== '1'; });

  const aisles = {};
  headers.forEach(function (h) {
    const m = /^(a\d+)_version$/.exec(h);
    if (!m) return;
    const id = m[1];
    aisles[id] = {};
    rows.forEach(function (o) {
      const v = o[id + '_version'];
      const c = o[id + '_choice'];
      if (v === '' || c === '') return;
      if (!aisles[id][v]) aisles[id][v] = { n: 0, choices: {} };
      aisles[id][v].n++;
      aisles[id][v].choices[c] = (aisles[id][v].choices[c] || 0) + 1;
    });
  });

  const scores = rows.map(function (o) { return o.smart_score; })
    .filter(function (s) { return s !== '' && s !== undefined; }).map(Number);
  const losts = rows.map(function (o) { return o.total_lost; })
    .filter(function (s) { return s !== '' && s !== undefined; }).map(Number);
  const avgLost = losts.length
    ? Math.round(losts.reduce(function (a, b) { return a + b; }, 0) / losts.length * 100) / 100 : 0;

  return json_({ ok: true, n: rows.length, scores: scores, avg_lost: avgLost, aisles: aisles });
}

// ---------- helpers ----------
function getSheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function getHeaders_(sheet) {
  const lastCol = sheet.getLastColumn();
  return lastCol ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
}

function cleanValue_(v) {
  if (typeof v === 'number' || typeof v === 'boolean') return v;
  let s = String(v == null ? '' : v).slice(0, MAX_VALUE_LENGTH);
  // Stop anything that looks like a spreadsheet formula from running.
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
