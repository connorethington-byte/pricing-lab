/**
 * Lab Market — Google Apps Script backend.
 *
 * Paste this whole file into Extensions → Apps Script of your Google Sheet,
 * then Deploy → New deployment → Web app (Execute as: Me, Access: Anyone).
 *
 * doPost: receives ONE shopping trip (JSON) and appends it as ONE row.
 *         New columns (e.g. a2_choice when aisle 2 goes live) are added
 *         automatically, so you never edit headers by hand.
 * doGet:  returns live totals as JSON for the results page (test rows excluded).
 */

const SHEET_NAME = 'responses';
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

    const clean = { received_at: new Date().toISOString() };
    Object.keys(data).slice(0, MAX_KEYS).forEach(function (key) {
      if (!/^[a-z0-9_]{1,40}$/.test(key)) return; // only simple column names
      clean[key] = cleanValue_(data[key]);
    });

    const sheet = getSheet_();
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
 * Live results. Example output:
 * { ok: true, n: 42, aisles: { a1: { A: { n: 20, choices: { regular: 14, jumbo: 5, skip: 1 } },
 *                                    B: { n: 22, choices: { ... } } } } }
 */
function doGet() {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return json_({ ok: true, n: 0, aisles: {} });

  const headers = values[0];
  const rows = values.slice(1).map(function (r) {
    const o = {};
    headers.forEach(function (h, i) { o[h] = r[i]; });
    return o;
  }).filter(function (o) { return String(o.is_test) !== '1'; });

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
  return json_({ ok: true, n: rows.length, aisles: aisles });
}

// ---------- helpers ----------
function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
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
