// ============================================================
//  APP — screens, randomization, timing, scoring, data upload.
//  Game v2 (Unit-Price Traps). Reads js/config.js + js/aisles.js.
// ============================================================

(function () {
  const CFG = window.LAB_CONFIG;
  const AISLES = window.AISLES.filter((a) => a.ready !== false);
  const LIST = window.GROCERY_LIST;
  const VERSIONS = window.AISLE_VERSIONS;
  const SUBMITTED_KEY = "pricingLab_v2_submitted";

  // URL switches for you while building:
  //   ?test=1   -> row flagged TEST (row_type) and the one-per-browser lock is ignored
  //   ?reset=1  -> clears this browser's "already shopped" flag
  const params = new URLSearchParams(location.search);
  const isTest = params.get("test") === "1";
  if (params.get("reset") === "1") safeStorage("remove", SUBMITTED_KEY);

  const app = document.getElementById("app");

  // ---------- the trip (everything we'll send) ----------
  const trip = {
    sessionId: randomId(),
    startedAt: null,
    startMs: 0,
    aisleIndex: 0,
    versions: {},   // aisle id -> "TRAP" | "DEAL"
    results: [],    // one entry per aisle
    list: {},       // grocery id -> "got" | "skipped"
    cartTotal: 0,
    survey: {},
    hp: "",         // honeypot value
  };

  // ---------- small helpers ----------
  function randomId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const round2 = (n) => Math.round(n * 100) / 100;
  const money = (n) => "$" + n.toFixed(2);
  // Unit prices read best in cents under $1: 16.7¢, 8.4¢, 48¢.  $1+ stays dollars: $4.99.
  const unitMoney = (v) => (v >= 1 ? money(v) : `${Math.round(v * 1000) / 10}¢`);
  // A setting can be one value for everyone, or { TRAP: x, DEAL: y }.
  const byVersion = (setting, version) =>
    setting !== null && typeof setting === "object" ? setting[version] : setting;
  // Fill "{price} each" style text from a table of values.
  const fill = (text, vars) => String(text).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));

  function safeStorage(op, key, val) {
    try {
      if (op === "get") return localStorage.getItem(key);
      if (op === "set") localStorage.setItem(key, val);
      if (op === "remove") localStorage.removeItem(key);
    } catch (e) { /* private mode etc. — just carry on */ }
    return null;
  }
  const isPhone = () => matchMedia("(max-width: 560px)").matches;
  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function show(node) {
    app.innerHTML = "";
    app.appendChild(node);
    if (isTest) app.prepend(el(`<div class="test-badge">🧪 TEST MODE — this row will be flagged TEST</div>`));
    window.scrollTo(0, 0);
    const h = node.querySelector("h1, h2");
    if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
  }

  // ---------- one option, priced for this shopper's version ----------
  function offer(aisle, opt, version) {
    const qty = aisle.quantity || 1;
    const price = byVersion(opt.price, version);
    const units = byVersion(opt.units, version);
    return {
      opt,
      id: opt.id,
      role: opt.role,
      name: opt.name,
      price,                         // one package
      units,                         // units in one package
      unitPrice: price / units,      // $ per oz / lb / egg / bag / sheet
      total: round2(price * qty),    // what the shopper pays
      totalUnits: units * qty,
      vars: {                        // for "{price} each" style text
        price: money(price),
        each: money(price / (opt.payFor || 1)),
        units,
        unitPrice: money(price / units),
      },
    };
  }

  // ---------- shared header: cart total + grocery list ----------
  function headerHTML() {
    const items = LIST.map((it) => {
      const s = trip.list[it.id];
      const mark = s === "got" ? "✓" : s === "skipped" ? "–" : "";
      return `<li class="${s || ""}"><span class="box">${mark}</span>${it.label}</li>`;
    }).join("");
    const inCart = trip.results.filter((r) => r.choice !== "skip").length;
    const gotCount = LIST.filter((it) => trip.list[it.id] === "got").length;
    const openAttr = isPhone() ? "" : "open";   // phones: list starts as a small button
    return `
      <header class="hud">
        <div class="budget">
          <div class="budget-top">
            <span class="budget-label">${window.ART.cart()} Cart total</span>
            <span class="budget-amt">${money(trip.cartTotal)}</span>
          </div>
          <div class="budget-sub">${inCart} item${inCart === 1 ? "" : "s"} in cart · aisle ${Math.min(trip.aisleIndex + 1, AISLES.length)} of ${AISLES.length}</div>
        </div>
        <details class="list" ${openAttr}>
          <summary>
            <span class="list-title">Grocery list</span>
            <span class="list-pill">📋 List (${gotCount}/${LIST.length})</span>
          </summary>
          <ul>${items}</ul>
        </details>
      </header>`;
  }

  // ---------- screen: intro ----------
  function introScreen() {
    const node = el(`
      <section class="screen intro">
        <div class="awning" aria-hidden="true"></div>
        <div class="card">
          <p class="eyebrow">Welcome to</p>
          <h1>${CFG.siteName}</h1>
          <p class="lead"><b>Spend wisely and go for the best deals.</b></p>
          <ul class="rules">
            <li>You have a grocery list of ${LIST.length} items and ${AISLES.length} aisles to walk.</li>
            <li>One aisle per screen, in order — <b>no going back</b>.</li>
            <li>In each aisle, pick the option you think is the better buy, or skip it.</li>
            <li>No budget limit. Fake money, no prize — about 4 minutes.</li>
          </ul>
          <p class="fine">Anonymous: no names or emails. A surprise is waiting at checkout. 👀</p>
          <!-- honeypot: hidden from people, bots tend to fill it -->
          <label class="hp" aria-hidden="true">Website <input id="hp" name="website" tabindex="-1" autocomplete="off"></label>
          <button class="btn primary big" id="start">Grab a cart →</button>
        </div>
      </section>`);
    node.querySelector("#start").addEventListener("click", startTrip);
    show(node);
  }

  function alreadyScreen() {
    show(el(`
      <section class="screen intro">
        <div class="awning" aria-hidden="true"></div>
        <div class="card">
          <h1>Thanks for shopping!</h1>
          <p class="lead">This browser has already completed a trip — one per person keeps the data clean.</p>
        </div>
      </section>`));
  }

  function startTrip() {
    trip.startedAt = new Date().toISOString();
    trip.startMs = performance.now();
    trip.hp = document.getElementById("hp").value;   // honeypot (read now; the intro disappears next)
    // Randomization: every aisle independently flips its own coin, right now.
    AISLES.forEach((a) => { trip.versions[a.id] = pick(VERSIONS); });
    aisleScreen();
  }

  // ---------- screen: one aisle ----------
  function aisleScreen() {
    const aisle = AISLES[trip.aisleIndex];
    const version = trip.versions[aisle.id];
    const enteredMs = performance.now();
    const offers = aisle.options.map((o) => offer(aisle, o, version));
    const qty = aisle.quantity || 1;

    const cards = offers.map((of) => {
      const o = of.opt;
      const tag = byVersion(o.tag, version);
      const was = byVersion(o.wasPrice, version);
      return `
        <button class="option" data-id="${o.id}" aria-pressed="false">
          <div class="art">
            ${window.ART.products[aisle.art](o, version)}
            ${tag ? `<span class="tag">${fill(tag, of.vars)}</span>` : ""}
          </div>
          <div class="price-card">
            <span class="opt-name">${o.name}</span>
            <span class="opt-price">${was ? `<s class="was">${money(was)}</s> ` : ""}${fill(o.big || "{price}", of.vars)}</span>
            <span class="opt-small">${fill(o.small || "", of.vars)}</span>
            ${qty > 1 ? `<span class="opt-total">${qty} for ${money(of.total)}</span>` : ""}
          </div>
        </button>`;
    }).join("");

    const node = el(`
      <section class="screen aisle">
        ${headerHTML()}
        <div class="aisle-sign">
          ${window.ART.signIcons[aisle.art] ? window.ART.signIcons[aisle.art]() : ""}
          <div>
            <span class="sign-num">Aisle ${aisle.number} of ${AISLES.length}</span>
            <h2>${aisle.department}</h2>
          </div>
        </div>
        <p class="aisle-prompt">${aisle.prompt}</p>
        <div class="options cols-${offers.length}">${cards}</div>
        <div class="actions">
          <button class="btn ghost" id="skip">Skip ${aisle.title.toLowerCase()}</button>
          <button class="btn primary" id="go" disabled>Pick one above</button>
        </div>
        <p class="no-back">Heads up: once you leave an aisle, you can't come back.</p>
      </section>`);

    let selected = null;
    const goBtn = node.querySelector("#go");
    const buttons = node.querySelectorAll(".option");
    buttons.forEach((btn) => btn.addEventListener("click", () => {
      selected = offers.find((of) => of.id === btn.dataset.id);
      buttons.forEach((b) => b.setAttribute("aria-pressed", b === btn ? "true" : "false"));
      goBtn.disabled = false;
      goBtn.textContent = `Add to cart · ${money(selected.total)} →`;
    }));
    node.querySelector("#skip").addEventListener("click", () => finish(null));
    goBtn.addEventListener("click", () => finish(selected));

    function finish(chosen) {
      // Best = lowest price per unit among the options on this shelf.
      const best = offers.reduce((a, b) => (b.unitPrice < a.unitPrice ? b : a));
      const lost = chosen ? round2((chosen.unitPrice - best.unitPrice) * chosen.totalUnits) : 0;
      const spent = chosen ? chosen.total : 0;
      trip.cartTotal = round2(trip.cartTotal + spent);
      if (aisle.listItem) trip.list[aisle.listItem] = chosen ? "got" : "skipped";
      trip.results.push({
        aisle, version, offers, best, chosen,
        choice: chosen ? chosen.role : "skip",   // trick / plain / decoy / skip
        units: chosen ? chosen.totalUnits : 0,
        spent,
        lost,                                    // $ lost vs the best unit price (skip = 0)
        outcome: outcomeOf(version, chosen),
        seconds: Math.round((performance.now() - enteredMs) / 100) / 10,
      });
      trip.aisleIndex++;
      if (trip.aisleIndex < AISLES.length) aisleScreen();
      else surveyScreen();
    }

    show(node);
  }

  // What happened in an aisle, for the reveal.
  function outcomeOf(version, chosen) {
    if (!chosen) return "skipped";
    if (chosen.role === "decoy") return "fell";                 // the decoy is never the best buy
    if (version === "TRAP") return chosen.role === "trick" ? "fell" : "spotted";
    return chosen.role === "trick" ? "lucky" : "missed";        // DEAL version
  }

  // ---------- screen: survey (before the reveal, so the results can't sway answers) ----------
  const SURVEY = [
    { key: "s_student", q: "Are you a student?", a: ["Yes", "No"] },
    { key: "s_age", q: "Age range", a: ["Under 18", "18–24", "25–34", "35–49", "50+"] },
    { key: "s_freq", q: "How often do you buy groceries?", a: ["Rarely", "Monthly", "Weekly", "Several times a week"] },
    { key: "s_unit_check", q: "Do you usually check the price per ounce?", a: ["Never", "Sometimes", "Always"] },
  ];

  function surveyScreen() {
    const qs = SURVEY.map((s) => `
      <fieldset class="q">
        <legend>${s.q}</legend>
        <div class="pills">
          ${s.a.map((a) => `<label class="pill"><input type="radio" name="${s.key}" value="${a}"><span>${a}</span></label>`).join("")}
        </div>
      </fieldset>`).join("");
    const node = el(`
      <section class="screen survey">
        <div class="card">
          <p class="eyebrow">Checkout</p>
          <h2>4 quick questions, then your results</h2>
          <p class="fine">Anonymous and optional — skip any you like.</p>
          <form id="survey">${qs}
            <button class="btn primary big" type="submit">See my results →</button>
          </form>
        </div>
      </section>`);
    node.querySelector("#survey").addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      SURVEY.forEach((s) => { trip.survey[s.key] = fd.get(s.key) || ""; });
      revealScreen();
    });
    show(node);
  }

  // ---------- scoring ----------
  function summary() {
    const R = trip.results;
    const spent = round2(R.reduce((s, r) => s + r.spent, 0));
    const lost = round2(R.reduce((s, r) => s + r.lost, 0));
    const smartCart = round2(spent - lost);   // same items, best price per unit
    const byOutcome = (o) => R.filter((r) => r.outcome === o);
    // Smart Shopper Score: 10 points for each aisle where you bought the best-value option.
    const score = R.filter((r) => r.chosen && r.lost === 0).length * 10;
    // Weakness = the trick type that cost the most money among tricks fallen for.
    const costByTrick = {};
    byOutcome("fell").forEach((r) => {
      costByTrick[r.aisle.trickType] = (costByTrick[r.aisle.trickType] || 0) + r.lost;
    });
    const weakness = Object.keys(costByTrick).sort((a, b) => costByTrick[b] - costByTrick[a])[0] || "";
    return {
      spent, lost, smartCart,
      lostPct: smartCart > 0 ? Math.round((lost / smartCart) * 1000) / 10 : 0,
      score,
      fell: byOutcome("fell"), spotted: byOutcome("spotted"),
      lucky: byOutcome("lucky"), missed: byOutcome("missed"), skipped: byOutcome("skipped"),
      weakness, weaknessCost: round2(costByTrick[weakness] || 0),
    };
  }

  // ---------- the ONE row sent to the Sheet ----------
  function buildRow(S) {
    const row = {
      sheet_tab: CFG.sheetTab,              // Apps Script writes to this tab (v2 = fresh tab)
      session_id: trip.sessionId,
      app_version: CFG.appVersion,
      row_type: isTest ? "TEST" : "LIVE",
      is_test: isTest ? 1 : 0,
      started_at: trip.startedAt,
      finished_at: new Date().toISOString(),
      device: matchMedia("(pointer: coarse)").matches ? "touch" : "mouse",
      total_seconds: Math.round((performance.now() - trip.startMs) / 100) / 10,
      total_spent: S.spent,
      total_lost: S.lost,
      smart_cart: S.smartCart,
      lost_pct: S.lostPct,
      smart_score: S.score,
      traps_fallen: S.fell.length,
      traps_spotted: S.spotted.length,
      deals_taken: S.lucky.length,
      deals_missed: S.missed.length,
      items_skipped: S.skipped.length,
      weakness: S.weakness,
    };
    // Per aisle: a1_version (TRAP/DEAL), a1_choice (trick/plain/decoy/skip), a1_units, a1_spent, a1_lost, a1_seconds
    trip.results.forEach((r) => {
      const p = r.aisle.id + "_";
      row[p + "version"] = r.version;
      row[p + "choice"] = r.choice;
      row[p + "units"] = r.units;
      row[p + "spent"] = r.spent;
      row[p + "lost"] = r.lost;
      row[p + "seconds"] = r.seconds;
    });
    Object.assign(row, trip.survey);
    row.hp = trip.hp;   // honeypot — Apps Script drops rows where this isn't empty
    return row;
  }

  async function sendRow(row) {
    if (!CFG.sheetUrl) return { ok: false, offline: true };
    // text/plain avoids a CORS "preflight", which Apps Script can't answer.
    const res = await fetch(CFG.sheetUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(row),
    });
    return res.json();
  }

  async function fetchStats() {
    const url = `${CFG.sheetUrl}?tab=${encodeURIComponent(CFG.sheetTab)}${isTest ? "&include_tests=1" : ""}`;
    const res = await fetch(url);
    return res.json();
  }

  // ---------- screen: the reveal — "Where you lost money" ----------
  function revealScreen() {
    const S = summary();
    const row = buildRow(S);

    // Text pieces for one aisle
    const unitTxt = (r, of) => `${unitMoney(of.unitPrice)}/${r.aisle.unit}`;
    const vars = (r) => {
      const c = r.chosen || r.best;
      return {
        chosenUnit: unitMoney(c.unitPrice), bestUnit: unitMoney(r.best.unitPrice),
        chosenName: nameOf(c), bestName: nameOf(r.best),
        chosenPrice: money(c.price), chosenUnits: c.units,
      };
    };
    // Receipt names are unique ("Chips (1 bag)" vs "Chips (2-for bundle)"), so the reveal uses them.
    const nameOf = (of) => of.opt.receiptName || of.name;
    const trickOf = (r) => r.offers.find((o) => o.role === "trick");
    const plainOf = (r) => r.offers.find((o) => o.role === "plain");
    const why = (r) => {
      const v = vars(r), t = trickOf(r), p = plainOf(r);
      const trick = r.aisle.trickType.toLowerCase();
      if (r.outcome === "fell") return fill(r.chosen.role === "decoy" ? r.aisle.decoyWhy : r.aisle.fellWhy, v);
      if (r.outcome === "spotted") return `You dodged the ${trick} trick — ${nameOf(t)} was ${unitTxt(r, t)} vs ${unitTxt(r, p)} for ${nameOf(p)}.`;
      if (r.outcome === "lucky") return `This time the ${trick} was a real deal: ${unitTxt(r, t)} vs ${unitTxt(r, p)}.`;
      if (r.outcome === "missed") return `This time the ${trick} was a real deal — ${nameOf(t)} was ${unitTxt(r, t)} vs ${unitTxt(r, r.chosen)} for yours.`;
      return "";
    };

    // 1. Receipt with unit prices revealed
    const receipt = trip.results.map((r) => {
      const badge = `<span class="vbadge ${r.version.toLowerCase()}">${r.version === "TRAP" ? "🪤 TRAP" : "✅ DEAL"}</span>`;
      if (!r.chosen) {
        return `<li class="rline skipped"><div class="rtop"><span>${r.aisle.title} — skipped</span><span>${money(0)}</span></div>
          <div class="rsub">${badge} Best was ${nameOf(r.best)} at ${unitTxt(r, r.best)}</div></li>`;
      }
      const isBest = r.lost === 0;
      return `<li class="rline">
        <div class="rtop"><span>${nameOf(r.chosen)}</span><span>${money(r.spent)}</span></div>
        <div class="rsub">${badge} You paid <b>${unitTxt(r, r.chosen)}</b>
          ${isBest ? `<span class="good">✓ best price</span>` : `· best: ${nameOf(r.best)} ${unitTxt(r, r.best)} <span class="bad">−${money(r.lost)}</span>`}
        </div></li>`;
    }).join("");

    const group = (list, title, cls, showLost) => list.length ? `
      <section class="rgroup ${cls}">
        <h3>${title} <span class="count-chip">${list.length}</span></h3>
        <ul>${list.map((r) => `<li><b>${r.aisle.title}</b>${showLost && r.lost > 0 ? ` <span class="bad">−${money(r.lost)}</span>` : ""}<br><span>${why(r)}</span></li>`).join("")}</ul>
      </section>` : "";

    const node = el(`
      <section class="screen reveal">
        <div class="reveal-head">
          <p class="eyebrow">Your results</p>
          <h2>Where you lost money</h2>
          <p class="fine">Every aisle had a trick — and flipped a coin. Sometimes the trick was a trap, sometimes a real deal.</p>
        </div>

        <div class="scorecards">
          <div class="scard big">
            <span class="slabel">Smart Shopper Score</span>
            <span class="sval">${S.score}<small>/100</small></span>
            <span class="ssub">10 points for every aisle where you bought the best value</span>
          </div>
          <div class="scard">
            <span class="slabel">Lost to tricks</span>
            <span class="sval bad">${money(S.lost)}</span>
            <span class="ssub">${S.lost > 0 ? `${S.lostPct}% more than the smartest cart (${money(S.smartCart)})` : "You paid the best price for everything you bought 🎉"}</span>
          </div>
          <div class="scard">
            <span class="slabel">🏆 Vs other shoppers</span>
            <span class="sval" id="pct">…</span>
            <span class="ssub" id="pctsub">Comparing with everyone who's played</span>
          </div>
          <div class="scard">
            <span class="slabel">Your weakness</span>
            <span class="sval small">${S.weakness || "None found 👀"}</span>
            <span class="ssub">${S.weakness ? `This trick cost you ${money(S.weaknessCost)}` : "You didn't fall for a single trap"}</span>
          </div>
        </div>

        ${group(S.fell, "🪤 Fell for", "fell", true)}
        ${group(S.spotted, "✅ Spotted", "spotted", false)}
        ${group(S.lucky, "💡 Lucky / smart", "lucky", false)}
        ${group(S.missed, "😬 Missed a real deal", "missed", true)}

        <div class="receipt wide">
          <h2>Receipt</h2>
          <p class="store">${CFG.siteName} · unit prices revealed</p>
          <ul class="lines rlines">${receipt}</ul>
          <div class="total"><span>Total</span><span>${money(S.spent)}</span></div>
          <div class="total sub"><span>Smartest cart (same items)</span><span>${money(S.smartCart)}</span></div>
          <p class="status" id="status" role="status">Saving your trip…</p>
        </div>

        <div class="debug" id="debug" hidden>
          <p><b>Offline mode</b> — no Sheet URL in <code>js/config.js</code>. This is the row that would be sent:</p>
          <pre>${JSON.stringify(row, null, 2)}</pre>
        </div>
      </section>`);
    show(node);

    const status = node.querySelector("#status");
    const pctEl = node.querySelector("#pct"), pctSub = node.querySelector("#pctsub");
    const noRank = (msg) => { pctEl.textContent = "—"; pctSub.textContent = msg; };

    const save = () => sendRow(row).then((res) => {
      if (res.offline) {
        status.textContent = "Not connected to a Sheet (offline mode).";
        node.querySelector("#debug").hidden = false;
        noRank("Ranking needs the Sheet connection.");
        return;
      }
      if (!res.ok) throw new Error(res.error || "Unknown error");
      if (!isTest) safeStorage("set", SUBMITTED_KEY, new Date().toISOString());
      status.textContent = "Saved — thanks for shopping! 🛒";
      status.className = "status ok";
      return showPercentile();
    });

    function showPercentile() {
      return fetchStats().then((stats) => {
        const scores = (stats.scores || []).slice();
        const mine = scores.indexOf(S.score);
        if (mine >= 0) scores.splice(mine, 1);   // leave your own (just-saved) score out
        if (scores.length < CFG.minShoppersForRank) {
          noRank(`Not enough shoppers yet to rank you (${scores.length} so far) — check back soon.`);
          return;
        }
        const below = scores.filter((s) => s < S.score).length;
        const same = scores.filter((s) => s === S.score).length;
        const pct = Math.round(((below + same / 2) / scores.length) * 100);
        pctEl.textContent = `Beat ${pct}%`;
        pctSub.textContent = `of ${scores.length} other shoppers' Smart Shopper Scores`;
      }).catch(() => noRank("Couldn't load other shoppers' scores right now."));
    }

    save().catch((err) => {
      console.error(err);
      status.innerHTML = `Couldn't save your trip. <button class="btn ghost small" id="retry">Try again</button>`;
      status.className = "status err";
      noRank("Ranking appears once your trip is saved.");
      status.querySelector("#retry").addEventListener("click", () => {
        status.className = "status"; status.textContent = "Saving your trip…";
        save().catch(() => { status.textContent = "Still couldn't save. Check your connection and refresh."; status.className = "status err"; });
      });
    });
  }

  // ---------- go ----------
  if (!isTest && safeStorage("get", SUBMITTED_KEY)) alreadyScreen();
  else introScreen();
})();
