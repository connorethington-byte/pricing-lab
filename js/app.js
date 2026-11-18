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
  function isPhone() {
    return matchMedia("(max-width: 560px)").matches;
  }
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

  // ---------- shared header: budget meter + grocery list ----------
  function headerHTML() {
    const pct = Math.max(0, (trip.budgetLeft / CFG.budget) * 100);
    const items = LIST.map((it) => {
      const s = trip.list[it.id];
      const mark = s === "got" ? "✓" : s === "skipped" ? "–" : "";
      return `<li class="${s || ""}"><span class="box">${mark}</span>${it.label}</li>`;
    }).join("");
    const inCart = trip.results.filter((r) => r.spent > 0).length;
    const gotCount = LIST.filter((it) => trip.list[it.id] === "got").length;
    // On phones the list starts closed as a small "📋 List (x/8)" button.
    const openAttr = isPhone() ? "" : "open";
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
          <p class="lead">A quick cartoon grocery run. About 5 minutes.</p>
          <ul class="rules">
            <li><b>You have ${money(CFG.budget)}</b> and a grocery list.</li>
            <li>Walk the aisles in order — <b>one aisle per screen, no going back</b>.</li>
            <li><b>Try to save money</b>, but if an offer compels you, go for it.</li>
            <li>You can skip any item. Fake money, no prize — just shop like you normally would.</li>
          </ul>
          <p class="fine">Anonymous: no names or emails. Your choices are saved as one row when you check out.</p>
          ${AISLES.length < 10 ? `<p class="preview-note">Preview build: ${AISLES.length} of 10 aisles open.</p>` : ""}
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

  // ---------- price helpers ----------
  // A setting can be one value for everyone, or { version: value } (see aisles.js).
  function byVersion(setting, version) {
    if (setting === null || setting === undefined) return undefined;
    return typeof setting === "object" ? setting[version] : setting;
  }
  const round2 = (n) => Math.round(n * 100) / 100;
  const fits = (cost) => cost <= trip.budgetLeft + 1e-9;   // within budget?

  // ---------- screen: one aisle ----------
  // Every aisle shares the same frame (budget, sign, prompt, Skip / Add buttons).
  // The middle part comes from a renderer picked by aisle.type.
  function aisleScreen() {
    const aisle = AISLES[trip.aisleIndex];
    const version = trip.versions[aisle.id];
    const enteredMs = performance.now();
    const view = RENDERERS[aisle.type](aisle, version);
    const skipLabel = aisle.skipLabel || `Skip ${aisle.title.toLowerCase()}`;

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
        ${view.html}
        <div class="actions">
          <button class="btn ghost" id="skip">${skipLabel}</button>
          <button class="btn primary" id="go" disabled>Pick one above</button>
        </div>
        <p class="no-back">Heads up: once you leave an aisle, you can't come back.</p>
      </section>`);

    const goBtn = node.querySelector("#go");
    node.querySelector("#skip").addEventListener("click", () =>
      finishAisle({ choice: view.skipChoice ?? "skip", qty: 0, spent: 0, extra: view.skipExtra ? view.skipExtra() : {} }));
    view.setup(node, goBtn, finishAisle);

    // result = { choice, qty, spent, line (receipt text), extra (more Sheet columns) }
    function finishAisle(result) {
      trip.budgetLeft = round2(trip.budgetLeft - result.spent);
      if (aisle.listItem) trip.list[aisle.listItem] = result.qty > 0 ? "got" : "skipped";
      trip.results.push({
        aisle,
        version,
        choice: result.choice,
        qty: result.qty,
        spent: result.spent,
        line: result.line || null,
        extra: result.extra || {},
        budgetAfter: trip.budgetLeft,
        seconds: Math.round((performance.now() - enteredMs) / 100) / 10,
      });
      trip.aisleIndex++;
      if (trip.aisleIndex < AISLES.length) aisleScreen();
      else checkoutScreen();
    }

    show(node);
  }

  const RENDERERS = {
    // ---- "choice": pick ONE option (or skip). One option = a Buy / Skip aisle. ----
    choice(aisle, version) {
      const qty = aisle.quantity || 1;
      const opts = aisle.options.filter((o) => !o.onlyIn || o.onlyIn.includes(version));
      const unit = (o) => byVersion(o.unitPrice, version);
      const cost = (o) => round2(unit(o) * qty);

      const cards = opts.map((o) => {
        const over = !fits(cost(o));
        const tag = byVersion(o.tag, version);
        const was = byVersion(o.wasPrice, version);
        const sub = over ? "Over budget" : qty > 1 ? `${qty} for ${money(cost(o))}` : (o.detail || "");
        return `
          <button class="option" data-id="${o.id}" aria-pressed="false" ${over ? "disabled" : ""}>
            <div class="art">
              ${window.ART.products[aisle.art](o, version)}
              ${tag ? `<span class="tag">${tag}</span>` : ""}
            </div>
            <div class="price-card">
              <span class="opt-name">${o.name}</span>
              ${o.pitch ? `<span class="opt-pitch">${o.pitch}</span>` : ""}
              <span class="opt-price">${was ? `<s class="was">${money(was)}</s> ` : ""}${money(unit(o))} <small>${aisle.priceLabel || ""}</small></span>
              <span class="opt-total ${over ? "over" : ""}">${sub}</span>
            </div>
          </button>`;
      }).join("");

      const grid = `<div class="options cols-${opts.length}">${cards}</div>`;
      return {
        html: aisle.layout === "endcap"
          ? `<div class="endcap"><div class="endcap-banner">✨ NEW THIS WEEK ✨</div>${grid}</div>` : grid,
        setup(node, goBtn, done) {
          let selected = null;
          const buttons = node.querySelectorAll(".option");
          const select = (btn) => {
            selected = opts.find((o) => o.id === btn.dataset.id);
            buttons.forEach((b) => b.setAttribute("aria-pressed", b === btn ? "true" : "false"));
            goBtn.disabled = false;
            goBtn.textContent = `Add to cart · ${money(cost(selected))} →`;
          };
          buttons.forEach((btn) => btn.addEventListener("click", () => select(btn)));
          // A single product (Buy / Skip aisle): select it straight away, if affordable.
          if (opts.length === 1 && !buttons[0].disabled) select(buttons[0]);
          goBtn.addEventListener("click", () => done({
            choice: selected.id, qty, spent: cost(selected),
            line: `${qty} × ${selected.receiptName || selected.name}`,
          }));
        },
      };
    },

    // ---- "quantity": choose how many (0 to maxQty). Chips. ----
    quantity(aisle, version) {
      const big = byVersion(aisle.tagBig, version);
      const small = byVersion(aisle.tagSmall, version);
      return {
        skipChoice: 0,
        html: `
          <div class="single">
            <div class="option static">
              <div class="art">${window.ART.products[aisle.art](aisle, version)}</div>
              <div class="price-card">
                <span class="opt-name">${aisle.name}</span>
                <div class="shelf-tag"><span class="shelf-big">${big}</span>${small ? `<span class="shelf-small">${small}</span>` : ""}</div>
                <div class="stepper" role="group" aria-label="How many bags">
                  <button class="btn step" id="minus" aria-label="One fewer">−</button>
                  <span class="count" id="count" aria-live="polite">0</span>
                  <button class="btn step" id="plus" aria-label="One more">+</button>
                </div>
                <span class="opt-total" id="qtynote">bags</span>
              </div>
            </div>
          </div>`,
        setup(node, goBtn, done) {
          let n = 0;
          const price = aisle.unitPrice;
          const plus = node.querySelector("#plus"), minus = node.querySelector("#minus");
          const update = () => {
            node.querySelector("#count").textContent = n;
            minus.disabled = n === 0;
            const nextFits = fits(round2((n + 1) * price));
            plus.disabled = n >= aisle.maxQty || !nextFits;
            node.querySelector("#qtynote").textContent =
              n < aisle.maxQty && !nextFits ? "Over budget for more" : n === 1 ? "bag" : "bags";
            goBtn.disabled = n === 0;
            goBtn.textContent = n === 0 ? "Choose how many" : `Add ${n} bag${n > 1 ? "s" : ""} · ${money(round2(n * price))} →`;
          };
          plus.addEventListener("click", () => { n++; update(); });
          minus.addEventListener("click", () => { n--; update(); });
          update();
          goBtn.addEventListener("click", () => done({
            choice: n, qty: n, spent: round2(n * price), line: `${n} × ${aisle.receiptName}`,
          }));
        },
      };
    },

    // ---- "coupon": one product + a $-off coupon. A = one click, B = type a code. Pasta sauce. ----
    coupon(aisle, version) {
      const full = aisle.unitPrice, off = aisle.couponValue;
      let applied = false;
      const couponHTML = version === "A"
        ? `<div class="coupon">
             <span class="coupon-amt">${money(off)} OFF</span>
             <span class="coupon-what">${aisle.title}</span>
             <button class="btn small" id="clip">✂️ Clip coupon</button>
           </div>`
        : `<div class="flyer">
             <span class="flyer-head">This week's flyer</span>
             <p>Save <b>${money(off)}</b> on ${aisle.title.toLowerCase()} with code</p>
             <span class="flyer-code">${aisle.couponCode}</span>
             <label class="code-label" for="code">Enter the 6-digit code:</label>
             <div class="code-row">
               <input id="code" inputmode="numeric" autocomplete="off" maxlength="6" placeholder="••••••">
               <button class="btn small" id="apply">Apply</button>
             </div>
             <span class="code-msg" id="codemsg" role="status"></span>
           </div>`;
      return {
        skipExtra: () => ({ coupon: "N" }),
        html: `
          <div class="coupon-aisle">
            <div class="option static">
              <div class="art">${window.ART.products[aisle.art](aisle, version)}</div>
              <div class="price-card">
                <span class="opt-name">${aisle.name}</span>
                <span class="opt-price" id="price">${money(full)}</span>
                <span class="opt-total" id="note">${aisle.detail || ""}</span>
              </div>
            </div>
            ${couponHTML}
          </div>`,
        setup(node, goBtn, done) {
          const price = () => round2(applied ? full - off : full);
          const update = () => {
            node.querySelector("#price").innerHTML = applied
              ? `<s class="was">${money(full)}</s> ${money(price())}` : money(price());
            const ok = fits(price());
            node.querySelector("#note").textContent = ok ? (aisle.detail || "") : "Over budget";
            node.querySelector("#note").classList.toggle("over", !ok);
            goBtn.disabled = !ok;
            goBtn.textContent = `Add to cart · ${money(price())} →`;
          };
          const apply = () => { applied = true; update(); };
          if (version === "A") {
            const clip = node.querySelector("#clip");
            clip.addEventListener("click", () => { apply(); clip.disabled = true; clip.textContent = "✓ Clipped"; });
          } else {
            const input = node.querySelector("#code"), msg = node.querySelector("#codemsg");
            const tryCode = () => {
              if (input.value.replace(/\D/g, "") === aisle.couponCode) {
                apply(); input.disabled = true; node.querySelector("#apply").disabled = true;
                msg.textContent = `✓ ${money(off)} off applied`; msg.className = "code-msg ok";
              } else {
                msg.textContent = "That code doesn't match — check the flyer."; msg.className = "code-msg err";
              }
            };
            node.querySelector("#apply").addEventListener("click", tryCode);
            input.addEventListener("keydown", (e) => { if (e.key === "Enter") tryCode(); });
          }
          update();
          goBtn.addEventListener("click", () => done({
            choice: "buy", qty: 1, spent: price(),
            line: `1 × ${aisle.receiptName}${applied ? " w/ coupon" : ""}`,
            extra: { coupon: applied ? "Y" : "N" },   // coupon used on the purchase
          }));
        },
      };
    },
  };

  // ---------- the ONE row sent to the Sheet ----------
  function buildRow() {
    const row = {
      session_id: trip.sessionId,
      app_version: CFG.appVersion,
      row_type: isTest ? "TEST" : "LIVE",  // easy to spot in the Sheet
      is_test: isTest ? 1 : 0,            // same thing as a number (handy in R)
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
      // Aisle-specific extras, e.g. a9_coupon (Y/N)
      Object.keys(r.extra).forEach((k) => { row[p + k] = r.extra[k]; });
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

    // Receipt: everything bought, then which list items were skipped.
    const bought = trip.results.filter((r) => r.qty > 0);
    const lines = bought.length
      ? bought.map((r) => `<li><span>${r.line}</span><span>${money(r.spent)}</span></li>`).join("")
      : `<li><span>(nothing bought)</span><span>${money(0)}</span></li>`;
    const skipped = LIST.filter((it) => trip.list[it.id] === "skipped").map((it) => it.label);

    const node = el(`
      <section class="screen checkout">
        ${headerHTML()}
        <div class="receipt">
          <h2>Receipt</h2>
          <p class="store">${CFG.siteName}</p>
          <ul class="lines">${lines}</ul>
          <div class="total"><span>Total</span><span>${money(row.total_spent)}</span></div>
          <div class="total sub"><span>Budget left</span><span>${money(trip.budgetLeft)}</span></div>
          ${skipped.length ? `<p class="skipped-note">Skipped from your list: ${skipped.join(", ")}</p>` : ""}
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
