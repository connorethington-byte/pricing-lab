// ============================================================
//  APP — screens, budget, randomization, timing, data upload.
//  Reads settings from config.js and aisles from aisles.js.
// ============================================================

(function () {
  const CFG = window.LAB_CONFIG;
  const AISLES = window.AISLES.filter((a) => a.ready);
  const LIST = window.GROCERY_LIST;
  const SUBMITTED_KEY = "pricingLab_submitted";

  // URL switches for you while building:
  //   ?test=1   -> row is marked is_test=1 and the one-per-browser lock is ignored
  //   ?reset=1  -> clears this browser's "already shopped" flag
  const params = new URLSearchParams(location.search);
  const isTest = params.get("test") === "1";
  if (params.get("reset") === "1") safeStorage("remove", SUBMITTED_KEY);

  const app = document.getElementById("app");
  const money = (n) => "$" + n.toFixed(2);

  // ---------- the trip (everything we'll send) ----------
  const trip = {
    sessionId: randomId(),
    startedAt: null,
    startMs: 0,
    budgetLeft: CFG.budget,
    aisleIndex: 0,
    versions: {},   // aisle id -> version shown
    results: [],    // one entry per completed aisle
    list: {},       // grocery id -> "got" | "skipped"
    hp: "",         // honeypot value
  };

  // ---------- helpers ----------
  function randomId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  function safeStorage(op, key, val) {
    try {
      if (op === "get") return localStorage.getItem(key);
      if (op === "set") localStorage.setItem(key, val);
      if (op === "remove") localStorage.removeItem(key);
    } catch (e) { /* private mode etc. — just carry on */ }
    return null;
  }
  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function show(node) {
    app.innerHTML = "";
    app.appendChild(node);
    window.scrollTo(0, 0);
    const h = node.querySelector("h1, h2");
    if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
  }

  // ---------- shared header: budget meter + grocery list ----------
  function headerHTML() {
    const pct = Math.max(0, (trip.budgetLeft / CFG.budget) * 100);
    const items = LIST.map((it) => {
      const s = trip.list[it.id];
      const mark = s === "got" ? "✓" : s === "skipped" ? "–" : "";
      return `<li class="${s || ""}"><span class="box">${mark}</span>${it.label}</li>`;
    }).join("");
    const inCart = trip.results.filter((r) => r.spent > 0).length;
    return `
      <header class="hud">
        <div class="budget">
          <div class="budget-top">
            <span class="budget-label">Budget left</span>
            <span class="budget-amt">${money(trip.budgetLeft)}</span>
          </div>
          <div class="meter" role="meter" aria-valuemin="0" aria-valuemax="${CFG.budget}"
               aria-valuenow="${trip.budgetLeft.toFixed(2)}" aria-label="Budget left">
            <div class="meter-fill" style="width:${pct}%"></div>
          </div>
          <div class="budget-sub">of ${money(CFG.budget)} · ${window.ART.cart()} ${inCart} in cart</div>
        </div>
        <details class="list" open>
          <summary>Grocery list</summary>
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
          <p class="lead">A quick cartoon grocery run. About 5 minutes.</p>
          <ul class="rules">
            <li><b>You have ${money(CFG.budget)}</b> and a grocery list.</li>
            <li>Walk the aisles in order — <b>one aisle per screen, no going back</b>.</li>
            <li><b>Try to save money</b>, but if an offer compels you, go for it.</li>
            <li>You can skip any item. Fake money, no prize — just shop like you normally would.</li>
          </ul>
          <p class="fine">Anonymous: no names or emails. Your choices are saved as one row when you check out.</p>
          ${AISLES.length < 10 ? `<p class="preview-note">Preview build: ${AISLES.length} of 10 aisles open.</p>` : ""}
          ${isTest ? `<p class="preview-note">Test mode (?test=1): this row will be marked as a test.</p>` : ""}
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
    trip.hp = document.getElementById("hp").value; // honeypot (read now; the intro disappears next)
    // Randomization: each aisle independently picks its version, right now.
    AISLES.forEach((a) => { trip.versions[a.id] = pick(a.versions); });
    aisleScreen();
  }

  // ---------- screen: one aisle ----------
  function aisleScreen() {
    const aisle = AISLES[trip.aisleIndex];
    const version = trip.versions[aisle.id];
    const enteredMs = performance.now();
    let selected = null;

    const optionCards = aisle.options.map((opt) => {
      const cost = opt.unitPrice * aisle.quantity;
      const over = cost > trip.budgetLeft + 1e-9;
      const tag = opt.tag[version];
      return `
        <button class="option" data-id="${opt.id}" aria-pressed="false" ${over ? "disabled" : ""}>
          <div class="art">
            ${window.ART.products[aisle.art](opt, version)}
            ${tag ? `<span class="tag">${tag}</span>` : ""}
          </div>
          <div class="price-card">
            <span class="opt-name">${opt.name}</span>
            <span class="opt-price">${money(opt.unitPrice)} <small>each</small></span>
            <span class="opt-total">${over ? "Over budget" : `${aisle.quantity} for ${money(cost)}`}</span>
          </div>
        </button>`;
    }).join("");

    const node = el(`
      <section class="screen aisle">
        ${headerHTML()}
        <div class="aisle-sign">
          ${window.ART.signIcons[aisle.art] ? window.ART.signIcons[aisle.art]() : ""}
          <div>
            <span class="sign-num">Aisle ${aisle.number}</span>
            <h2>${aisle.department}</h2>
          </div>
        </div>
        <p class="aisle-prompt">Your list says <b>${aisle.quantity} ${aisle.title.toLowerCase()}</b>. Pick a kind, or skip.</p>
        <div class="options">${optionCards}</div>
        <div class="actions">
          <button class="btn ghost" id="skip">Skip ${aisle.title.toLowerCase()}</button>
          <button class="btn primary" id="go" disabled>Pick one above</button>
        </div>
        <p class="no-back">Heads up: once you leave an aisle, you can't come back.</p>
      </section>`);

    const goBtn = node.querySelector("#go");
    node.querySelectorAll(".option").forEach((btn) => {
      btn.addEventListener("click", () => {
        selected = aisle.options.find((o) => o.id === btn.dataset.id);
        node.querySelectorAll(".option").forEach((b) =>
          b.setAttribute("aria-pressed", b === btn ? "true" : "false"));
        goBtn.disabled = false;
        goBtn.textContent = `Add to cart · ${money(selected.unitPrice * aisle.quantity)} →`;
      });
    });
    node.querySelector("#skip").addEventListener("click", () => finishAisle(null));
    goBtn.addEventListener("click", () => finishAisle(selected));

    function finishAisle(opt) {
      const spent = opt ? opt.unitPrice * aisle.quantity : 0;
      trip.budgetLeft = Math.round((trip.budgetLeft - spent) * 100) / 100;
      if (aisle.listItem) trip.list[aisle.listItem] = opt ? "got" : "skipped";
      trip.results.push({
        aisle,
        version,
        choice: opt ? opt.id : "skip",
        name: opt ? opt.name : null,
        qty: opt ? aisle.quantity : 0,
        spent,
        budgetAfter: trip.budgetLeft,
        seconds: Math.round((performance.now() - enteredMs) / 100) / 10,
      });
      trip.aisleIndex++;
      if (trip.aisleIndex < AISLES.length) aisleScreen();
      else checkoutScreen();
    }

    show(node);
  }

  // ---------- the ONE row sent to the Sheet ----------
  function buildRow() {
    const row = {
      session_id: trip.sessionId,
      app_version: CFG.appVersion,
      is_test: isTest ? 1 : 0,
      started_at: trip.startedAt,
      finished_at: new Date().toISOString(),
      device: matchMedia("(pointer: coarse)").matches ? "touch" : "mouse",
      budget_start: CFG.budget,
      budget_end: trip.budgetLeft,
      total_spent: Math.round((CFG.budget - trip.budgetLeft) * 100) / 100,
      total_seconds: Math.round((performance.now() - trip.startMs) / 100) / 10,
      aisles_completed: trip.results.length,
    };
    // Per-aisle columns: a1_version, a1_choice, a1_qty, a1_spent, a1_budget_after, a1_seconds ...
    trip.results.forEach((r) => {
      const p = r.aisle.id + "_";
      row[p + "version"] = r.version;
      row[p + "choice"] = r.choice;
      row[p + "qty"] = r.qty;
      row[p + "spent"] = r.spent;
      row[p + "budget_after"] = r.budgetAfter;
      row[p + "seconds"] = r.seconds;
    });
    row.hp = trip.hp; // honeypot — Apps Script drops rows where this isn't empty
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

  // ---------- screen: checkout ----------
  function checkoutScreen() {
    const row = buildRow();

    const lines = trip.results.map((r) => `
      <li><span>${r.name ? `${r.qty} × ${r.name}` : `<s>${r.aisle.title}</s> (skipped)`}</span>
          <span>${money(r.spent)}</span></li>`).join("");

    const node = el(`
      <section class="screen checkout">
        ${headerHTML()}
        <div class="receipt">
          <h2>Receipt</h2>
          <p class="store">${CFG.siteName}</p>
          <ul class="lines">${lines}</ul>
          <div class="total"><span>Total</span><span>${money(row.total_spent)}</span></div>
          <div class="total sub"><span>Budget left</span><span>${money(trip.budgetLeft)}</span></div>
          <p class="status" id="status" role="status">Saving your trip…</p>
        </div>
        <div class="debug" id="debug" hidden>
          <p><b>Offline mode</b> — no Sheet URL in <code>js/config.js</code> yet. This is the row that would be sent:</p>
          <pre>${JSON.stringify(row, null, 2)}</pre>
        </div>
      </section>`);
    show(node);

    const status = node.querySelector("#status");
    sendRow(row)
      .then((res) => {
        if (res.offline) {
          status.textContent = "Not connected to a Sheet yet (offline mode).";
          node.querySelector("#debug").hidden = false;
          console.log("Row that would be sent:", row);
          return;
        }
        if (!res.ok) throw new Error(res.error || "Unknown error");
        if (!isTest) safeStorage("set", SUBMITTED_KEY, new Date().toISOString());
        status.textContent = "Saved — thanks for shopping! 🛒";
        status.classList.add("ok");
      })
      .catch((err) => {
        console.error(err);
        status.innerHTML = `Couldn't save your trip. <button class="btn ghost small" id="retry">Try again</button>`;
        status.classList.add("err");
        status.querySelector("#retry").addEventListener("click", checkoutRetry);
      });

    function checkoutRetry() {
      status.className = "status";
      status.textContent = "Saving your trip…";
      sendRow(row)
        .then((res) => {
          if (!res.ok) throw new Error(res.error);
          if (!isTest) safeStorage("set", SUBMITTED_KEY, new Date().toISOString());
          status.textContent = "Saved — thanks for shopping! 🛒";
          status.classList.add("ok");
        })
        .catch(() => { status.textContent = "Still couldn't save. Check your connection and refresh."; status.classList.add("err"); });
    }
  }

  // ---------- go ----------
  if (!isTest && safeStorage("get", SUBMITTED_KEY)) alreadyScreen();
  else introScreen();
})();
