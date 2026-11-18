// ============================================================
//  APP — screens, timer, randomization, scoring, data upload.
//  Game v3 ("Your Gut vs. The Math"). Reads js/config.js + js/aisles.js.
// ============================================================

(function () {
  const CFG = window.LAB_CONFIG;
  const AISLES = window.AISLES.filter((a) => a.ready !== false);
  const PRACTICE = window.PRACTICE_AISLE;
  const LIST = window.GROCERY_LIST;
  const VERSIONS = window.AISLE_VERSIONS;
  const SUBMITTED_KEY = "pricingLab_v3_submitted";
  const LIMIT_MS = CFG.secondsPerAisle * 1000;

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
    sides: {},      // aisle id -> "L" | "R"  (where the trick / other option sits)
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
  const price$ = (n) => (n % 1 === 0 ? "$" + n : money(n));          // round numbers: "$8"
  const unit$ = (v, unit) => `$${v.toFixed(2)}/${unit}`;              // reveal only: "$0.42/oz"
  const byVersion = (setting, version) =>
    setting !== null && typeof setting === "object" ? setting[version] : setting;
  const fill = (text, vars) => String(text).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
    const price = byVersion(opt.price, version);
    const units = byVersion(opt.units, version);
    const vars = { price: price$(price), units };
    return {
      opt, id: opt.id, role: opt.role, name: opt.name,
      price, units,
      unitPrice: price / units,        // $ per avocado / lb / egg / oz / bag / roll
      gut: fill(opt.gutName || opt.name, vars),
      vars,
    };
  }

  // ---------- shared header: cart total + grocery list ----------
  function headerHTML(practice) {
    const items = LIST.map((it) => {
      const s = trip.list[it.id];
      const mark = s === "got" ? "✓" : s === "skipped" ? "–" : "";
      return `<li class="${s || ""}"><span class="box">${mark}</span>${it.label}</li>`;
    }).join("");
    const gotCount = LIST.filter((it) => trip.list[it.id] === "got").length;
    return `
      <header class="hud">
        <div class="budget">
          <div class="budget-top">
            <span class="budget-label">${window.ART.cart()} Cart</span>
            <span class="budget-amt">${money(trip.cartTotal)}</span>
          </div>
          <div class="budget-sub">${practice ? "Practice — doesn't count" : `Aisle ${trip.aisleIndex + 1} of ${AISLES.length}`}</div>
        </div>
        <details class="list" ${isPhone() ? "" : "open"}>
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
          <p class="lead"><b>Spend wisely and go for the best deals.</b><br>You've got ${CFG.secondsPerAisle} seconds per aisle — trust your gut!</p>
          <ul class="rules">
            <li>${AISLES.length} aisles, one grocery list. <b>Tap a product</b> to drop it in your cart.</li>
            <li>⏱️ ${CFG.secondsPerAisle} seconds per aisle. Run out of time and you leave empty-handed.</li>
            <li>No budget limit. Fake money, no prize — about 2 minutes.</li>
          </ul>
          <p class="fine">Anonymous: no names or emails. A surprise is waiting at checkout. 👀</p>
          <!-- honeypot: hidden from people, bots tend to fill it -->
          <label class="hp" aria-hidden="true">Website <input id="hp" name="website" tabindex="-1" autocomplete="off"></label>
          <button class="btn primary big" id="start">Try a practice aisle →</button>
        </div>
      </section>`);
    node.querySelector("#start").addEventListener("click", () => {
      trip.hp = document.getElementById("hp").value;   // honeypot (read now; the intro disappears next)
      aisleScreen(true);
    });
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

  // After the practice aisle: explain, then start the real (recorded) trip.
  function readyScreen(how) {
    const said = how === "timeout" ? "⏱️ Time ran out — that's what happens if you freeze. Be quicker on the real ones!"
      : how === "skip" ? "You skipped it — that works too when you don't want something."
      : "Nice! That's all there is to it: one tap and you're on to the next aisle.";
    const node = el(`
      <section class="screen intro">
        <div class="card ready">
          <p class="eyebrow">Practice done</p>
          <h2>Ready? Now it counts.</h2>
          <p class="lead">${said}</p>
          <p>${AISLES.length} aisles · ${CFG.secondsPerAisle} seconds each · <b>trust your gut</b>.</p>
          <button class="btn primary big" id="go">Start shopping →</button>
        </div>
      </section>`);
    node.querySelector("#go").addEventListener("click", startTrip);
    show(node);
  }

  function startTrip() {
    trip.startedAt = new Date().toISOString();
    trip.startMs = performance.now();
    // Randomization: every aisle independently flips its own coins, right now.
    AISLES.forEach((a) => {
      trip.versions[a.id] = pick(VERSIONS);
      trip.sides[a.id] = pick(["L", "R"]);
    });
    aisleScreen(false);
  }

  // ---------- screen: one aisle (timed, one tap) ----------
  function aisleScreen(practice) {
    const aisle = practice ? PRACTICE : AISLES[trip.aisleIndex];
    const version = practice ? "DEAL" : trip.versions[aisle.id];
    const side = practice ? "R" : trip.sides[aisle.id];

    // Config lists plain first (left) and the trick / other option last (right).
    // side "L" flips the order so the trick appears on the left.
    let offers = aisle.options.map((o) => offer(aisle, o, version));
    if (side === "L") offers = offers.slice().reverse();

    const cards = offers.map((of) => {
      const o = of.opt;
      const tag = byVersion(o.tag, version);
      const was = byVersion(o.wasPrice, version);
      const drawOpt = Object.assign({}, o, { units: of.units, price: of.price });   // resolved for drawing to scale
      return `
        <button class="option" data-id="${o.id}">
          <div class="art">
            ${window.ART.products[aisle.art](drawOpt, version)}
            ${tag ? `<span class="tag">${fill(tag, of.vars)}</span>` : ""}
          </div>
          <div class="price-card">
            <span class="opt-name">${o.name}</span>
            <span class="opt-price">${was ? `<s class="was">${price$(was)}</s> ` : ""}${price$(of.price)}</span>
            <span class="opt-small">${fill(o.size || "", of.vars)}</span>
          </div>
        </button>`;
    }).join("");

    const node = el(`
      <section class="screen aisle ${practice ? "practice" : ""}">
        ${headerHTML(practice)}
        <div class="aisle-top">
          <div class="aisle-sign">
            ${window.ART.signIcons[aisle.art] ? window.ART.signIcons[aisle.art]() : ""}
            <div>
              <span class="sign-num">${practice ? "Practice" : `Aisle ${aisle.number}`}</span>
              <h2>${aisle.department}</h2>
            </div>
          </div>
          <div class="timer" role="timer" aria-label="Seconds left">
            <span class="timer-num" id="tnum">⏱️ ${CFG.secondsPerAisle}</span>
            <span class="timer-bar"><span class="timer-fill" id="tfill"></span></span>
          </div>
        </div>
        <p class="aisle-prompt">${aisle.prompt}</p>
        <div class="options cols-${offers.length}">${cards}</div>
        <div class="actions">
          <button class="btn ghost small" id="skip">Skip</button>
        </div>
        <div class="flash" id="flash" hidden></div>
      </section>`);
    show(node);

    // --- timer: starts the moment the products are on screen ---
    let over = false, t0 = 0, raf = 0, timeoutId = 0;
    const tnum = node.querySelector("#tnum"), tfill = node.querySelector("#tfill");
    requestAnimationFrame(() => {
      t0 = performance.now();
      timeoutId = setTimeout(() => finish(null, "timeout"), LIMIT_MS);
      tick();
    });
    function tick() {
      if (over) return;
      const left = Math.max(0, LIMIT_MS - (performance.now() - t0));
      tnum.textContent = `⏱️ ${Math.ceil(left / 1000)}`;
      tfill.style.width = (left / LIMIT_MS) * 100 + "%";
      node.querySelector(".timer").classList.toggle("hurry", left <= 2000);
      raf = requestAnimationFrame(tick);
    }

    node.querySelectorAll(".option").forEach((btn) =>
      btn.addEventListener("click", () => finish(offers.find((of) => of.id === btn.dataset.id), "tap", btn)));
    node.querySelector("#skip").addEventListener("click", () => finish(null, "skip"));

    async function finish(chosen, how, btn) {
      if (over) return;          // only the first tap counts
      over = true;
      clearTimeout(timeoutId);
      cancelAnimationFrame(raf);
      const rtMs = Math.round(performance.now() - t0);
      node.querySelectorAll("button").forEach((b) => { b.disabled = true; });

      // quick feedback, then move on
      const flash = node.querySelector("#flash");
      if (chosen) { btn.classList.add("added"); flash.textContent = `🛒 Added · ${price$(chosen.price)}`; }
      else flash.textContent = how === "timeout" ? "⏱️ Time's up!" : "Skipped";
      flash.className = `flash ${how}`;
      flash.hidden = false;
      await sleep(how === "timeout" ? 800 : 450);

      if (practice) { readyScreen(how); return; }

      const best = offers.reduce((a, b) => (b.unitPrice < a.unitPrice ? b : a));
      const lost = chosen ? round2((chosen.unitPrice - best.unitPrice) * chosen.units) : 0;
      const spent = chosen ? chosen.price : 0;
      trip.cartTotal = round2(trip.cartTotal + spent);
      if (aisle.listItem) trip.list[aisle.listItem] = chosen ? "got" : "skipped";
      trip.results.push({
        aisle, version, side, offers, best, chosen,
        choice: chosen ? chosen.role : how,   // trick / plain / decoy / alt / skip / timeout
        units: chosen ? chosen.units : 0,
        spent,
        lost,                                 // $ lost vs the best unit price (skip / timeout = 0)
        rtMs,
        outcome: outcomeOf(aisle, version, chosen, how, lost),
      });
      trip.aisleIndex++;
      if (trip.aisleIndex < AISLES.length) aisleScreen(false);
      else surveyScreen();
    }
  }

  // What happened in an aisle, for the reveal.
  function outcomeOf(aisle, version, chosen, how, lost) {
    if (how === "timeout") return "froze";
    if (!chosen) return "skipped";
    if (aisle.filler) return lost === 0 ? "filler_good" : "filler_bad";
    if (chosen.role === "decoy") return "fell";                 // the decoy is never the best buy
    if (version === "TRAP") return chosen.role === "trick" ? "fell" : "spotted";
    return chosen.role === "trick" ? "lucky" : "missed";        // DEAL version
  }

  // ---------- screen: survey (before the reveal, so results can't sway answers) ----------
  const SURVEY = [
    { key: "s_gut", q: "Did you mostly go with your gut or compare prices?",
      a: ["1", "2", "3", "4", "5", "6", "7"], ends: ["All gut", "Compared everything"] },
    { key: "s_student", q: "Are you a student?", a: ["Yes", "No"] },
    { key: "s_age", q: "Age range", a: ["Under 18", "18–24", "25–34", "35–49", "50+"] },
    { key: "s_freq", q: "How often do you buy groceries?", a: ["Rarely", "Monthly", "Weekly", "Several times a week"] },
    { key: "s_unit_check", q: "Do you usually check the price per ounce?", a: ["Never", "Sometimes", "Always"] },
  ];

  function surveyScreen() {
    const qs = SURVEY.map((s) => `
      <fieldset class="q">
        <legend>${s.q}</legend>
        <div class="pills ${s.ends ? "scale" : ""}">
          ${s.a.map((a) => `<label class="pill"><input type="radio" name="${s.key}" value="${a}"><span>${a}</span></label>`).join("")}
        </div>
        ${s.ends ? `<div class="scale-ends"><span>${s.ends[0]}</span><span>${s.ends[1]}</span></div>` : ""}
      </fieldset>`).join("");
    const node = el(`
      <section class="screen survey">
        <div class="card">
          <p class="eyebrow">Checkout</p>
          <h2>${SURVEY.length} quick questions, then your results</h2>
          <p class="fine">No timer here. Anonymous and optional — skip any you like.</p>
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
    // Gut's weakness = the trick that cost the most money among tricks fallen for.
    const costByTrick = {};
    byOutcome("fell").forEach((r) => {
      costByTrick[r.aisle.trickType] = (costByTrick[r.aisle.trickType] || 0) + r.lost;
    });
    const weakness = Object.keys(costByTrick).sort((a, b) => costByTrick[b] - costByTrick[a])[0] || "";
    return {
      spent, lost, smartCart,
      lostPct: smartCart > 0 ? Math.round((lost / smartCart) * 1000) / 10 : 0,
      score,
      fell: byOutcome("fell"), spotted: byOutcome("spotted"), lucky: byOutcome("lucky"),
      missed: byOutcome("missed"), froze: byOutcome("froze"), skipped: byOutcome("skipped"),
      fillerGood: byOutcome("filler_good"), fillerBad: byOutcome("filler_bad"),
      weakness, weaknessCost: round2(costByTrick[weakness] || 0),
    };
  }

  // ---------- the ONE row sent to the Sheet ----------
  function buildRow(S) {
    const row = {
      sheet_tab: CFG.sheetTab,              // Apps Script writes to this tab (v3 = fresh tab)
      session_id: trip.sessionId,
      app_version: CFG.appVersion,
      row_type: isTest ? "TEST" : "LIVE",
      is_test: isTest ? 1 : 0,
      started_at: trip.startedAt,
      finished_at: new Date().toISOString(),
      device: matchMedia("(pointer: coarse)").matches ? "touch" : "mouse",
      seconds_per_aisle: CFG.secondsPerAisle,
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
      froze: S.froze.length,
      items_skipped: S.skipped.length,
      filler_correct: S.fillerGood.length,
      weakness: S.weakness,
    };
    // Per aisle: version (TRAP/DEAL), side of trick (L/R), choice, units, spent, lost, reaction time
    trip.results.forEach((r) => {
      const p = r.aisle.id + "_";
      row[p + "version"] = r.version;
      row[p + "side"] = r.side;
      row[p + "choice"] = r.choice;
      row[p + "units"] = r.units;
      row[p + "spent"] = r.spent;
      row[p + "lost"] = r.lost;
      row[p + "rt_ms"] = r.rtMs;
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

  // ---------- screen: the reveal — "Your Gut vs. The Math" ----------
  function revealScreen() {
    const S = summary();
    const row = buildRow(S);

    // One line per aisle: what your gut picked vs what the math says.
    const gutLine = (r) => {
      const u = (of) => unit$(of.unitPrice, r.aisle.unit);
      const best = r.best;
      if (r.outcome === "froze") return `🧊 You froze on the ${r.aisle.title.toLowerCase()}. The math said ${best.gut} (${u(best)}).`;
      if (!r.chosen) return `You skipped it. The math said ${best.gut} (${u(best)}).`;
      if (r.lost === 0) {
        const next = r.offers.filter((o) => o !== r.chosen).reduce((a, b) => (b.unitPrice < a.unitPrice ? b : a));
        return `Your gut said ${r.chosen.gut} — and the math agrees: ${u(r.chosen)} vs ${u(next)}.`;
      }
      return `Your gut said ${r.chosen.gut}. The math said ${best.gut}: ${u(r.chosen)} vs ${u(best)}. <span class="bad">Cost: ${money(r.lost)}.</span>`;
    };
    const badge = (r) => r.aisle.filler
      ? `<span class="vbadge filler">⚖️ NO TRICK</span>`
      : `<span class="vbadge ${r.version.toLowerCase()}">${r.version === "TRAP" ? "🪤 TRAP" : "✅ DEAL"}</span>`;

    const aisleRows = trip.results.map((r) => `
      <li class="gline ${r.chosen && r.lost === 0 ? "ok" : r.lost > 0 ? "cost" : "none"}">
        <div class="gtop"><span>${r.aisle.emoji} <b>${r.aisle.title}</b></span>${badge(r)}</div>
        <div class="gtext">${gutLine(r)}</div>
      </li>`).join("");

    const group = (list, title, cls) => `
      <div class="tally ${cls}">
        <span class="tnum">${list.length}</span>
        <span class="tlabel">${title}</span>
        <span class="titems">${list.map((r) => r.aisle.emoji + " " + r.aisle.title).join(", ") || "—"}</span>
      </div>`;

    const node = el(`
      <section class="screen reveal">
        <div class="reveal-head">
          <p class="eyebrow">Your results</p>
          <h2>Your Gut vs. The Math</h2>
          <p class="fine">Most aisles had a trick — and secretly flipped a coin. Sometimes the trick was a rip-off, sometimes a real deal.</p>
        </div>

        <div class="scorecards">
          <div class="scard big">
            <span class="slabel">Smart Shopper Score</span>
            <span class="sval">${S.score}<small>/100</small></span>
            <span class="ssub">10 points for every aisle where your gut picked the best value</span>
          </div>
          <div class="scard">
            <span class="slabel">Your gut cost you</span>
            <span class="sval bad">${money(S.lost)}</span>
            <span class="ssub">${S.lost > 0 ? `${S.lostPct}% more than the smartest cart (${money(S.smartCart)} for the same stuff)` : "You paid the best price for everything you bought 🎉"}</span>
          </div>
          <div class="scard">
            <span class="slabel">🏆 Vs other shoppers</span>
            <span class="sval" id="pct">…</span>
            <span class="ssub" id="pctsub">Comparing with everyone who's played</span>
          </div>
          <div class="scard wide">
            <span class="slabel">Your gut's weakness</span>
            <span class="sval small">${S.weakness || "None found 👀"}</span>
            <span class="ssub">${S.weakness ? `This trick cost you ${money(S.weaknessCost)}` : "You didn't fall for a single trap"}</span>
          </div>
        </div>

        <div class="tallies">
          ${group(S.fell, "🪤 Fell for", "fell")}
          ${group(S.spotted, "✅ Spotted", "spotted")}
          ${group(S.lucky, "💡 Lucky", "lucky")}
          ${group(S.froze, "🧊 Froze", "froze")}
        </div>

        <section class="rgroup">
          <h3>Aisle by aisle</h3>
          <ul class="glines">${aisleRows}</ul>
          <div class="gtotals">
            <div><span>You spent</span><b>${money(S.spent)}</b></div>
            <div><span>Smartest cart (same items)</span><b>${money(S.smartCart)}</b></div>
          </div>
          <p class="status" id="status" role="status">Saving your trip…</p>
        </section>

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
