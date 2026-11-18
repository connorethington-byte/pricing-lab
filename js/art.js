// ============================================================
//  ART — flat cartoon SVG drawings, built as strings.
//  One shared look: thick dark outline, flat fills, one highlight.
// ============================================================

window.ART = (function () {
  const INK = "#2B2A33";

  // One avocado, centred at (x, y). s = scale, r = tilt in degrees.
  function avocado(x, y, s, r) {
    return `
      <g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">
        <path d="M0,-25 C8,-25 10,-13 12,-5 C18,5 21,13 19,18 C15,27 -15,27 -19,18
                 C-21,13 -18,5 -12,-5 C-10,-13 -8,-25 0,-25 Z"
              fill="#3E6B2A" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
        <ellipse cx="-7" cy="2" rx="3.5" ry="8" fill="#fff" opacity="0.28" transform="rotate(18 -7 2)"/>
        <rect x="-1.8" y="-30" width="3.6" height="6" rx="1.5" fill="#6B4A2B" stroke="${INK}" stroke-width="1.5"/>
      </g>`;
  }

  // Slots in a crate, FRONT row first, so "3 left" = the 3 at the front.
  // Each slot: [x, y]. Coordinates are inside a 220 x 170 viewBox.
  const SLOTS = {
    small: [ // 12 regular avocados
      [36,104],[73,104],[110,104],[147,104],[184,104],
      [54,88],[91,88],[128,88],[165,88],
      [73,72],[110,72],[147,72],
    ],
    big: [   // 8 jumbo avocados
      [55,98],[110,98],[165,98],
      [82,78],[138,78],
      [55,62],[110,62],[165,62],
    ],
  };
  const TILTS = [-12, 8, -4, 14, -9, 5, -15, 10, -6, 12, -3, 7];

  // A wooden produce crate holding `count` avocados ("full" = every slot).
  function avocadoCrate(size, count) {
    const slots = size > 1 ? SLOTS.big : SLOTS.small;
    const n = count === "full" ? slots.length : Math.min(count, slots.length);
    // Draw back rows first so front avocados overlap them.
    let fruit = "";
    for (let i = n - 1; i >= 0; i--) {
      const [x, y] = slots[i];
      fruit += avocado(x, y, size, TILTS[i % TILTS.length]);
    }
    return `
      <svg viewBox="0 0 220 170" class="crate-svg" aria-hidden="true">
        <!-- back wall of crate -->
        <path d="M18,40 L202,40 L196,120 L24,120 Z" fill="#8A5A2B" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M24,52 L196,52" stroke="#6E4520" stroke-width="3"/>
        ${fruit}
        <!-- front panel -->
        <path d="M8,112 L212,112 L204,164 L16,164 Z" fill="#C98B4E" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M12,129 L208,129 M14,146 L206,146" stroke="#A86F38" stroke-width="3"/>
        <circle cx="26" cy="120" r="2.5" fill="${INK}"/><circle cx="194" cy="120" r="2.5" fill="${INK}"/>
      </svg>`;
  }

  // Little cut-in-half avocado for the aisle sign.
  function avocadoHalf() {
    return `
      <svg viewBox="-30 -34 60 64" class="sign-icon" aria-hidden="true">
        <path d="M0,-28 C9,-28 11,-15 13,-6 C20,5 23,14 21,20 C16,29 -16,29 -21,20
                 C-23,14 -20,5 -13,-6 C-11,-15 -9,-28 0,-28 Z" fill="#3E6B2A" stroke="${INK}" stroke-width="2.5"/>
        <path d="M0,-22 C6,-22 8,-12 9,-5 C15,5 17,12 15,17 C12,23 -12,23 -15,17
                 C-17,12 -15,5 -9,-5 C-8,-12 -6,-22 0,-22 Z" fill="#D9E8A0"/>
        <circle cx="0" cy="9" r="8" fill="#8A5A2B" stroke="${INK}" stroke-width="2"/>
        <circle cx="-2.5" cy="6.5" r="2" fill="#fff" opacity="0.4"/>
      </svg>`;
  }

  // ---------- Eggs ----------
  function egg(x, y) {
    return `
      <g transform="translate(${x} ${y})">
        <path d="M0,-17 C9,-17 13,-4 13,4 C13,12 7,16 0,16 C-7,16 -13,12 -13,4 C-13,-4 -9,-17 0,-17 Z"
              fill="#FFF6E5" stroke="${INK}" stroke-width="2.3"/>
        <ellipse cx="-5" cy="-5" rx="2.5" ry="5" fill="#fff" transform="rotate(20 -5 -5)"/>
      </g>`;
  }

  // An open egg carton with `count` eggs in two rows (12 = dozen, 6 = half dozen).
  // Same 220 x 170 box as the crate, so cards line up; half dozen is drawn narrower.
  function eggCarton(count) {
    const cols = count / 2, step = 30;
    const w = cols * step + 16, x0 = 110 - w / 2, x1 = 110 + w / 2;
    const ex = (i) => x0 + 8 + step / 2 + i * step;          // egg centre x for column i
    let backRow = "", frontRow = "", cups = "";
    for (let i = 0; i < cols; i++) {
      backRow += egg(ex(i), 86);
      frontRow += egg(ex(i), 104);
      cups += ` q${step / 2},10 ${step},0`;                    // each cup dips under its egg
    }
    return `
      <svg viewBox="0 0 220 170" class="crate-svg" aria-hidden="true">
        <!-- lid, flipped open behind -->
        <path d="M${x0 + 6},30 L${x1 - 6},30 L${x1},78 L${x0},78 Z" fill="#B9D4E8" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <rect x="${110 - Math.min(44, w / 2 - 14)}" y="40" width="${Math.min(88, w - 28)}" height="24" rx="6" fill="#fff" stroke="${INK}" stroke-width="2"/>
        <text x="110" y="57" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="13" fill="${INK}">${count} EGGS</text>
        <!-- tray back -->
        <path d="M${x0},78 L${x1},78 L${x1},112 L${x0},112 Z" fill="#8FB3CE" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        ${backRow}
        ${frontRow}
        <!-- tray front with cup shapes -->
        <path d="M${x0},112 l8,0 ${cups} l8,0 L${x1 - 4},150 L${x0 + 4},150 Z" fill="#A9C9E0" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M${x0 + 6},136 L${x1 - 6},136" stroke="#8FB3CE" stroke-width="3"/>
      </svg>`;
  }

  function eggIcon() {
    return `
      <svg viewBox="-20 -24 40 46" class="sign-icon" aria-hidden="true">
        <path d="M0,-20 C11,-20 16,-5 16,4 C16,14 9,19 0,19 C-9,19 -16,14 -16,4 C-16,-5 -11,-20 0,-20 Z"
              fill="#FFF6E5" stroke="${INK}" stroke-width="2.5"/>
        <ellipse cx="-6" cy="-6" rx="3" ry="6" fill="#fff" transform="rotate(20 -6 -6)"/>
      </svg>`;
  }

  // Shared bits ----------------------------------------------------------
  const svg = (inner) => `<svg viewBox="0 0 220 170" class="crate-svg" aria-hidden="true">${inner}</svg>`;
  const label = (x, y, text, size, fill, weight) =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="${weight || 700}" font-size="${size}" fill="${fill || INK}">${text}</text>`;
  const shadow = (cx, w) => `<ellipse cx="${cx}" cy="161" rx="${w}" ry="5" fill="${INK}" opacity="0.12"/>`;

  // Shrink/grow a whole drawing around its bottom-centre (so it still "sits" on the shelf).
  const scaled = (s, inner) => `<g transform="translate(110 160) scale(${s}) translate(-110 -160)">${inner}</g>`;

  // ---------- Chicken: tray of breasts under plastic wrap ----------
  function chicken(opt) {
    const n = opt.pieces || 2;
    const spots = n === 2 ? [[82, 108], [138, 112]] : [[66, 112], [110, 104], [154, 112]];
    const breast = ([x, y]) => `
      <path transform="translate(${x} ${y})" d="M-26,2 C-28,-18 8,-26 24,-10 C32,0 24,16 4,18 C-16,20 -24,14 -26,2 Z"
            fill="#F4A7A0" stroke="${INK}" stroke-width="2.5"/>
      <path transform="translate(${x} ${y})" d="M-12,-6 q10,-6 20,0" stroke="#E07F78" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    return svg(scaled(opt.scale || 1, `
      ${shadow(110, 84)}
      <path d="M22,82 L198,82 L188,152 L32,152 Z" fill="#EAF2F8" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M34,92 L186,92 L178,142 L42,142 Z" fill="#D6E6F2"/>
      ${spots.map(breast).join("")}
      <path d="M48,90 l22,0 M150,96 l18,-6 M60,138 l26,-8" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
      <rect x="128" y="126" width="64" height="24" rx="4" fill="${opt.stickerColor || "#FFD23F"}" stroke="${INK}" stroke-width="2"/>
      ${label(160, 142, opt.sticker || "FRESH", 10, INK)}`));
  }

  // ---------- Cereal box (scale = bigger box) ----------
  function cerealBox(opt) {
    return svg(scaled(opt.scale || 1, `
      ${shadow(112, 58)}
      <path d="M156,22 L170,14 L170,152 L156,160 Z" fill="#B5711E" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="60" y="22" width="96" height="138" rx="4" fill="#F2B134" stroke="${INK}" stroke-width="3"/>
      <path d="M60,22 L74,14 L170,14 L156,22 Z" fill="#F7C964" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      ${label(108, 50, "HONEY OAT", 15, "#fff")}
      ${label(108, 74, "CRUNCH", 21, "#7A3E12")}
      <path d="M74,118 Q108,152 142,118 Z" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
      <g fill="#D98C2B" stroke="${INK}" stroke-width="1.5">
        <circle cx="90" cy="114" r="6"/><circle cx="104" cy="110" r="6"/><circle cx="118" cy="113" r="6"/><circle cx="130" cy="115" r="5"/><circle cx="111" cy="102" r="5"/>
      </g>
      <path d="M78,96 q6,-8 12,0 M128,92 q6,-8 12,0" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>`));
  }

  // ---------- Coffee bag (size from oz) ----------
  function coffeeBag(opt) {
    const s = 0.55 + 0.45 * ((opt.oz || 24) / 24);
    const w = 96 * s, h = 132 * s, x = 110 - w / 2, y = 160 - h;
    return svg(`
      ${shadow(110, w / 2 + 8)}
      <path d="M${x + 4},${y + 14} L${x + w - 4},${y + 14} L${x + w},${y + h} L${x},${y + h} Z" fill="#7A4E2D" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="${x + 2}" y="${y}" width="${w - 4}" height="16" rx="3" fill="#5A3820" stroke="${INK}" stroke-width="3"/>
      <rect x="${x + w * 0.18}" y="${y + h * 0.36}" width="${w * 0.64}" height="${h * 0.42}" rx="6" fill="#FFF1DC" stroke="${INK}" stroke-width="2.5"/>
      <ellipse cx="110" cy="${y + h * 0.5}" rx="${7 * s}" ry="${10 * s}" fill="#7A4E2D" stroke="${INK}" stroke-width="2" transform="rotate(25 110 ${y + h * 0.5})"/>
      <path d="M${110 - 3 * s},${y + h * 0.5 - 8 * s} q${6 * s},${8 * s} 0,${16 * s}" stroke="#FFF1DC" stroke-width="1.8" fill="none"/>
      ${label(110, y + h * 0.7, opt.oz + " OZ", 13 * s + 2, INK)}`);
  }

  // ---------- Chips: 1 bag, or 2 bags side by side ----------
  function chipsBag(opt) {
    let zigTop = "", zigBot = "";
    for (let i = 0; i < 8; i++) { zigTop += ` l6,-6 l6,6`; zigBot += ` l-6,6 l-6,-6`; }
    const bag = `
      <path d="M62,26 ${zigTop} L170,140 ${zigBot} Z" fill="#F2B134" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M58,50 Q110,42 162,50 L164,74 Q110,66 56,74 Z" fill="#E8573A" stroke="${INK}" stroke-width="2.5"/>
      ${label(110, 67, "SEA SALT", 14, "#fff")}
      <path d="M88,92 Q110,80 132,94 Q130,122 108,126 Q86,118 88,92 Z" fill="#FFE59A" stroke="${INK}" stroke-width="2.5"/>
      <circle cx="102" cy="104" r="2" fill="#D9A43A"/><circle cx="116" cy="110" r="2" fill="#D9A43A"/>`;
    if ((opt.bags || 1) === 1) return svg(`${shadow(110, 56)}${bag}`);
    return svg(`${shadow(110, 92)}
      <g transform="translate(-42 6) rotate(-6 110 100)">${scaled(0.82, bag)}</g>
      <g transform="translate(42 6) rotate(6 110 100)">${scaled(0.82, bag)}</g>`);
  }

  // ---------- Cookies: 1 pack, or a stack of 3 ----------
  function cookies(opt) {
    const c = opt.color || "#2F6E9E";
    const pack = (cy) => `
      <rect x="45" y="${cy - 28}" width="130" height="56" rx="12" fill="${c}" stroke="${INK}" stroke-width="3"/>
      <rect x="112" y="${cy - 20}" width="56" height="40" rx="8" fill="#FFF8EC" stroke="${INK}" stroke-width="2"/>
      ${[0, 1, 2].map((i) => `<circle cx="${124 + i * 16}" cy="${cy}" r="9" fill="#D9A066" stroke="${INK}" stroke-width="1.8"/>
        <circle cx="${121 + i * 16}" cy="${cy - 3}" r="1.8" fill="${INK}"/><circle cx="${127 + i * 16}" cy="${cy + 3}" r="1.8" fill="${INK}"/>`).join("")}
      ${label(79, cy - 2, opt.brand || "COOKIES", 11, "#fff")}
      ${label(79, cy + 12, "CHOC CHIP", 8, "#fff", 600)}`;
    if ((opt.packs || 1) === 1) return svg(`${shadow(110, 70)}${scaled(1.05, pack(128))}`);
    return svg(`${shadow(110, 66)}${scaled(0.86, pack(132) + `<g transform="translate(6 0)">${pack(80)}</g>` + `<g transform="translate(-4 0)">${pack(28)}</g>`)}`);
  }

  // ---------- Juice: plain carton or brand bottle ----------
  function juice(opt) {
    if (opt.style === "bottle") {
      return svg(`
        ${shadow(110, 40)}
        <path d="M98,22 L122,22 L122,40 Q146,54 146,80 L146,150 Q146,158 138,158 L82,158 Q74,158 74,150 L74,80 Q74,54 98,40 Z" fill="#FFA62B" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <rect x="95" y="12" width="30" height="14" rx="4" fill="#3E8E41" stroke="${INK}" stroke-width="2.5"/>
        <rect x="78" y="88" width="64" height="50" rx="6" fill="#FFF8EC" stroke="${INK}" stroke-width="2.5"/>
        <circle cx="110" cy="104" r="7" fill="#FFD23F" stroke="${INK}" stroke-width="1.5"/>
        ${label(110, 124, "SUNNY", 10, INK)}${label(110, 134, "GROVE", 8, INK, 600)}
        <rect x="80" y="52" width="5" height="26" rx="2.5" fill="#fff" opacity="0.4"/>`);
    }
    return svg(`
      ${shadow(110, 40)}
      <path d="M140,50 L152,42 L152,150 L140,158 Z" fill="#D9D4C7" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="80" y="50" width="60" height="108" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
      <path d="M80,50 L92,26 L128,26 L140,50 Z" fill="#F1EFEA" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M128,26 L140,20 L152,42 L140,50 Z" fill="#D9D4C7" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="80" y="70" width="60" height="22" fill="#FFA62B" stroke="${INK}" stroke-width="2.5"/>
      ${label(110, 86, "OJ", 15, "#fff")}
      <circle cx="110" cy="120" r="14" fill="#FFA62B" stroke="${INK}" stroke-width="2.5"/>
      <path d="M110,106 L110,134 M96,120 L124,120" stroke="#FFD08A" stroke-width="2"/>`);
  }

  // ---------- Pasta sauce jar: classic or "new look" label (same jar size) ----------
  function sauceJar(opt) {
    const nl = opt.style === "newlook";
    return svg(`
      ${shadow(110, 46)}
      <rect x="78" y="22" width="64" height="18" rx="4" fill="${nl ? INK : "#E0B03C"}" stroke="${INK}" stroke-width="3"/>
      <path d="M72,40 L148,40 Q156,46 156,60 L156,148 Q156,158 146,158 L74,158 Q64,158 64,148 L64,60 Q64,46 72,40 Z" fill="#C8372D" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      ${nl
        ? `<rect x="64" y="72" width="92" height="62" fill="#2F6E22" stroke="${INK}" stroke-width="2.5"/>
           <path d="M64,84 L156,84 M64,122 L156,122" stroke="#E0B03C" stroke-width="2.5"/>
           ${label(110, 102, "MARINARA", 12, "#fff")}${label(110, 116, "Artisan", 10, "#E0B03C", 500)}`
        : `<rect x="64" y="78" width="92" height="52" fill="#FFF1DC" stroke="${INK}" stroke-width="2.5"/>
           <circle cx="84" cy="104" r="11" fill="#E8573A" stroke="${INK}" stroke-width="2"/>
           <path d="M80,94 l4,3 l4,-3" stroke="#4E9F3D" stroke-width="2.5" fill="none" stroke-linecap="round"/>
           ${label(126, 101, "MARINARA", 10, INK)}${label(126, 115, "Classic", 9, "#5E5B6B", 600)}`}
      <rect x="72" y="52" width="5" height="16" rx="2.5" fill="#fff" opacity="0.35"/>`);
  }

  // ---------- Paper towels: 6 regular rolls or 4 MEGA rolls ----------
  function towels(opt) {
    const n = opt.rolls || 6;
    const [cols, tiers] = n === 6 ? [3, 2] : n === 4 ? [2, 2] : [1, 1];
    const rw = opt.mega ? 62 : 40, rh = opt.mega ? 62 : 50;
    const W = cols * rw, H = tiers * rh, x0 = 110 - W / 2, y0 = 156 - H;
    let rolls = "";
    for (let t = 0; t < tiers; t++) {
      for (let c = 0; c < cols; c++) {
        const x = x0 + c * rw, y = y0 + t * rh;
        rolls += `
          <rect x="${x + 1}" y="${y + 5}" width="${rw - 2}" height="${rh - 6}" fill="#fff" stroke="${INK}" stroke-width="2.2"/>
          <path d="M${x + 1},${y + rh * 0.45} L${x + rw - 1},${y + rh * 0.45}" stroke="#8FC3E6" stroke-width="2" stroke-dasharray="3 3"/>
          <ellipse cx="${x + rw / 2}" cy="${y + 5}" rx="${rw / 2 - 1}" ry="5" fill="#F4F1EA" stroke="${INK}" stroke-width="2.2"/>
          <ellipse cx="${x + rw / 2}" cy="${y + 5}" rx="${rw / 7}" ry="2.2" fill="#C98B4E"/>`;
      }
    }
    const text = opt.mega ? "MEGA" : n + " ROLLS";
    const wrap = `<rect x="${x0 - 7}" y="${y0 - 6}" width="${W + 14}" height="${H + 10}" rx="10" fill="#BFE0F5" opacity="0.45" stroke="${INK}" stroke-width="2.5"/>
         <rect x="${110 - 30}" y="${y0 + H / 2 - 10}" width="60" height="20" rx="5" fill="${opt.mega ? "#E8573A" : "#2F6E9E"}" stroke="${INK}" stroke-width="2"/>
         ${label(110, y0 + H / 2 + 5, text, 11, "#fff")}`;
    return svg(`${shadow(110, W / 2 + 10)}${rolls}${wrap}`);
  }

  // ---------- Small icons for the aisle signs ----------
  const icon = (vb, inner) => `<svg viewBox="${vb}" class="sign-icon" aria-hidden="true">${inner}</svg>`;
  const signDrumstick = () => icon("-22 -22 44 44", `<path d="M-4,-16 C10,-20 20,-6 12,6 C8,12 0,12 -4,8 L-12,16 L-16,12 L-8,4 C-12,0 -14,-12 -4,-16 Z" fill="#E9A15B" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="-15" cy="17" r="3.5" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="-18" cy="13" r="3.5" fill="#fff" stroke="${INK}" stroke-width="2"/>`);
  const signBowl = () => icon("-22 -22 44 44", `<path d="M-18,-2 Q0,26 18,-2 Z" fill="#fff" stroke="${INK}" stroke-width="2.5"/><g fill="#D98C2B" stroke="${INK}" stroke-width="1.5"><circle cx="-8" cy="-5" r="5"/><circle cx="3" cy="-7" r="5"/><circle cx="11" cy="-3" r="4"/></g>`);
  const signMug = () => icon("-22 -22 44 44", `<path d="M-15,-8 L9,-8 L7,16 L-13,16 Z" fill="#fff" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="M9,-3 q10,0 8,8 q-2,6 -9,5" fill="none" stroke="${INK}" stroke-width="2.5"/><path d="M-7,-14 q-3,-4 0,-7 M1,-14 q-3,-4 0,-7" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>`);
  const signChip = () => icon("-22 -22 44 44", `<path d="M-16,-6 Q0,-20 16,-4 Q14,14 -2,16 Q-18,10 -16,-6 Z" fill="#FFE59A" stroke="${INK}" stroke-width="2.5"/><circle cx="-4" cy="0" r="1.8" fill="#D9A43A"/><circle cx="6" cy="5" r="1.8" fill="#D9A43A"/>`);
  const signCookie = () => icon("-22 -22 44 44", `<circle r="17" fill="#D9A066" stroke="${INK}" stroke-width="2.5"/><g fill="${INK}"><circle cx="-6" cy="-6" r="2.5"/><circle cx="6" cy="-3" r="2.5"/><circle cx="-2" cy="7" r="2.5"/><circle cx="8" cy="8" r="2"/></g>`);
  const signGlass = () => icon("-22 -22 44 44", `<path d="M-12,-16 L12,-16 L9,18 L-9,18 Z" fill="#fff" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="M-11,-4 L11,-4 L9,16 L-9,16 Z" fill="#FFA62B"/>`);
  const signJar = () => icon("-22 -22 44 44", `<rect x="-10" y="-19" width="20" height="7" rx="2" fill="#E0B03C" stroke="${INK}" stroke-width="2"/><rect x="-14" y="-12" width="28" height="30" rx="5" fill="#C8372D" stroke="${INK}" stroke-width="2.5"/><rect x="-14" y="-3" width="28" height="11" fill="#FFF1DC"/>`);
  const signRoll = () => icon("-22 -22 44 44", `<rect x="-12" y="-14" width="24" height="32" fill="#fff" stroke="${INK}" stroke-width="2.5"/><ellipse cx="0" cy="-14" rx="12" ry="4.5" fill="#F4F1EA" stroke="${INK}" stroke-width="2.5"/><ellipse cx="0" cy="-14" rx="3.5" ry="1.6" fill="#C98B4E"/>`);

  function cart() {
    return `
      <svg viewBox="0 0 32 28" class="cart-icon" aria-hidden="true">
        <path d="M2,4 L7,4 L10,18 L26,18 L29,8 L8.5,8" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="24" r="2.4" fill="currentColor"/><circle cx="24" cy="24" r="2.4" fill="currentColor"/>
      </svg>`;
  }

  // Lookup: aisle.art -> function(option, version) returning the product drawing.
  const products = {
    avocado: (opt) => avocadoCrate(opt.size, opt.stock || "full"),
    chicken: chicken,
    eggs: (opt) => eggCarton(opt.count),
    cereal: cerealBox,
    coffee: coffeeBag,
    chips: chipsBag,
    cookies: cookies,
    juice: juice,
    sauce: sauceJar,
    towels: towels,
  };
  const signIcons = {
    avocado: avocadoHalf, chicken: signDrumstick, eggs: eggIcon, cereal: signBowl, coffee: signMug,
    chips: signChip, cookies: signCookie, juice: signGlass, sauce: signJar, towels: signRoll,
  };

  return { products, signIcons, cart };
})();
