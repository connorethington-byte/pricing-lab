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

  // Star-burst badge (cereal "America's #1!")
  function burst(cx, cy, r, text, fill) {
    let pts = "";
    for (let i = 0; i < 24; i++) {
      const rad = i % 2 ? r * 0.78 : r, a = (Math.PI * 2 * i) / 24;
      pts += `${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)} `;
    }
    const cut = text.lastIndexOf(" ");
    const l1 = cut > 0 ? text.slice(0, cut) : text, l2 = cut > 0 ? text.slice(cut + 1) : "";
    return `<polygon points="${pts}" fill="${fill}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      ${label(cx, cy - 1, l1.toUpperCase(), 7.5, INK)}${label(cx, cy + 11, l2.toUpperCase(), 12, INK)}`;
  }

  // ---------- Ice cream pint ----------
  function iceCream(opt) {
    return svg(`
      ${shadow(110, 52)}
      <path d="M58,52 L162,52 L152,156 Q110,163 68,156 Z" fill="#FFF1DC" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M61,86 L159,86 L155,126 L65,126 Z" fill="#F28DB8" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      ${label(110, 111, opt.flavor || "VANILLA", 13, "#fff")}
      <rect x="52" y="36" width="116" height="22" rx="7" fill="#E8578F" stroke="${INK}" stroke-width="3"/>
      <circle cx="80" cy="140" r="5" fill="#2B2A33" opacity="0.65"/><circle cx="96" cy="146" r="3.5" fill="#2B2A33" opacity="0.65"/>
      <g stroke="#7FC4E8" stroke-width="2.5" stroke-linecap="round">
        <path d="M30,50 l0,16 M22,58 l16,0 M24,52 l12,12 M36,52 l-12,12"/>
        <path d="M188,90 l0,12 M182,96 l12,0"/>
        <path d="M184,40 l0,8 M180,44 l8,0"/>
      </g>`);
  }

  // ---------- Cereal boxes ----------
  function cerealBox(opt) {
    if (opt.style === "fancy") {
      return svg(`
        ${shadow(112, 58)}
        <path d="M156,22 L170,14 L170,152 L156,160 Z" fill="#B23A22" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <rect x="60" y="22" width="96" height="138" rx="4" fill="#E8573A" stroke="${INK}" stroke-width="3"/>
        <path d="M60,22 L74,14 L170,14 L156,22 Z" fill="#F07C5E" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        ${label(104, 70, "FROSTED", 18, "#FFE066")}
        ${label(108, 92, "CRUNCH", 22, "#fff")}
        <path d="M74,122 Q108,156 142,122 Z" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
        <g fill="#F2B134" stroke="${INK}" stroke-width="1.5">
          <circle cx="90" cy="118" r="6"/><circle cx="104" cy="114" r="6"/><circle cx="118" cy="117" r="6"/><circle cx="130" cy="119" r="5"/><circle cx="111" cy="106" r="5"/>
        </g>
        <path d="M80,110 l3,-6 l3,6 M130,106 l3,-6 l3,6" stroke="#FFE066" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        ${burst(162, 30, 27, opt.badge || "#1!", "#FFD23F")}`);
    }
    return svg(`
      ${shadow(112, 58)}
      <path d="M156,22 L170,14 L170,152 L156,160 Z" fill="#C9C5BC" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="60" y="22" width="96" height="138" rx="4" fill="#F1EFEA" stroke="${INK}" stroke-width="3"/>
      <path d="M60,22 L74,14 L170,14 L156,22 Z" fill="#E2DFD8" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="60" y="34" width="96" height="22" fill="#7A7A86" stroke="${INK}" stroke-width="2.5"/>
      ${label(108, 50, "MARKET BASICS", 11, "#fff")}
      ${label(108, 86, "Frosted", 15, INK, 600)}
      ${label(108, 104, "Corn Cereal", 13, INK, 500)}
      ${label(108, 148, "NET WT 14 OZ", 8, "#5E5B6B", 500)}`);
  }

  // ---------- Soda 4-pack (new product) ----------
  function soda4(opt) {
    const c = opt.canColor || "#6C4BD8", a = opt.accentColor || "#FFD23F";
    let cans = "";
    [38, 75, 112, 149].forEach((x) => {
      cans += `
        <rect x="${x}" y="40" width="33" height="108" rx="7" fill="${c}" stroke="${INK}" stroke-width="2.5"/>
        <rect x="${x + 3}" y="36" width="27" height="8" rx="3" fill="#C9CCD6" stroke="${INK}" stroke-width="2"/>
        <path d="M${x},72 l33,-8 l0,10 l-33,8 Z" fill="${a}"/>
        <rect x="${x + 6}" y="48" width="4" height="16" rx="2" fill="#fff" opacity="0.35"/>
        <text x="${x + 16.5}" y="98" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="10" fill="#fff" transform="rotate(-90 ${x + 16.5} 98)">${opt.brand || "NEW"}</text>`;
    });
    return svg(`
      ${shadow(110, 80)}
      ${cans}
      <path d="M32,112 L188,112 L188,156 L32,156 Z" fill="#E9DFCB" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      ${label(110, 132, (opt.brand || "NEW") + " · PROTEIN SODA", 11, INK)}
      ${label(110, 148, "4 × 12 OZ", 9, "#5E5B6B", 600)}`);
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

  // ---------- Chips bag ----------
  function chipsBag() {
    let zigTop = "", zigBot = "";
    for (let i = 0; i < 8; i++) { zigTop += ` l6,-6 l6,6`; zigBot += ` l-6,6 l-6,-6`; }
    return svg(`
      ${shadow(110, 56)}
      <path d="M62,26 ${zigTop} L170,140 ${zigBot} Z" fill="#F2B134" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M58,50 Q110,42 162,50 L164,74 Q110,66 56,74 Z" fill="#E8573A" stroke="${INK}" stroke-width="2.5"/>
      ${label(110, 67, "CLASSIC", 15, "#fff")}
      <path d="M88,92 Q110,80 132,94 Q130,122 108,126 Q86,118 88,92 Z" fill="#FFE59A" stroke="${INK}" stroke-width="2.5"/>
      <circle cx="102" cy="104" r="2" fill="#D9A43A"/><circle cx="116" cy="110" r="2" fill="#D9A43A"/>`);
  }

  // ---------- Juice: plain carton or fancy bottle ----------
  function juice(opt) {
    if (opt.style === "bottle") {
      return svg(`
        ${shadow(110, 40)}
        <path d="M98,22 L122,22 L122,40 Q146,54 146,80 L146,150 Q146,158 138,158 L82,158 Q74,158 74,150 L74,80 Q74,54 98,40 Z" fill="#FFA62B" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <rect x="95" y="12" width="30" height="14" rx="4" fill="#3E8E41" stroke="${INK}" stroke-width="2.5"/>
        <rect x="78" y="88" width="64" height="50" rx="6" fill="#FFF8EC" stroke="${INK}" stroke-width="2.5"/>
        <path d="M110,96 q10,4 4,16 q-10,-4 -4,-16 Z" fill="#4E9F3D" stroke="${INK}" stroke-width="1.5"/>
        ${label(110, 124, "COLD", 9, INK)}${label(110, 133, "PRESSED", 8, INK, 600)}
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

  // ---------- Pasta sauce jar ----------
  function sauceJar() {
    return svg(`
      ${shadow(110, 46)}
      <rect x="78" y="22" width="64" height="18" rx="4" fill="#E0B03C" stroke="${INK}" stroke-width="3"/>
      <path d="M72,40 L148,40 Q156,46 156,60 L156,148 Q156,158 146,158 L74,158 Q64,158 64,148 L64,60 Q64,46 72,40 Z" fill="#C8372D" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="64" y="78" width="92" height="52" fill="#FFF1DC" stroke="${INK}" stroke-width="2.5"/>
      <circle cx="84" cy="104" r="11" fill="#E8573A" stroke="${INK}" stroke-width="2"/>
      <path d="M80,94 l4,3 l4,-3" stroke="#4E9F3D" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      ${label(126, 101, "MARINARA", 10, INK)}${label(126, 115, "24 OZ", 9, "#5E5B6B", 600)}
      <rect x="72" y="52" width="5" height="20" rx="2.5" fill="#fff" opacity="0.35"/>`);
  }

  // ---------- Paper towels: 1 roll, 4-pack or 12-pack ----------
  function towels(opt) {
    const n = opt.rolls || 1;
    const grid = n === 1 ? [1, 1] : n === 4 ? [2, 2] : [4, 3];   // [columns, tiers]
    const [cols, tiers] = grid;
    const rw = n === 1 ? 56 : n === 4 ? 44 : 34, rh = n === 1 ? 104 : n === 4 ? 56 : 38;
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
    const wrap = n > 1
      ? `<rect x="${x0 - 7}" y="${y0 - 6}" width="${W + 14}" height="${H + 10}" rx="10" fill="#BFE0F5" opacity="0.45" stroke="${INK}" stroke-width="2.5"/>
         <rect x="${110 - 30}" y="${y0 + H / 2 - 10}" width="60" height="20" rx="5" fill="#2F6E9E" stroke="${INK}" stroke-width="2"/>
         ${label(110, y0 + H / 2 + 5, n + " ROLLS", 11, "#fff")}`
      : "";
    return svg(`${shadow(110, W / 2 + 10)}${rolls}${wrap}`);
  }

  // ---------- Small icons for the aisle signs ----------
  const icon = (vb, inner) => `<svg viewBox="${vb}" class="sign-icon" aria-hidden="true">${inner}</svg>`;
  const signSnowflake = () => icon("-22 -22 44 44", `<g stroke="#BFE6FF" stroke-width="3.5" stroke-linecap="round"><path d="M0,-18 V18 M-16,-9 L16,9 M-16,9 L16,-9"/><path d="M-5,-14 L0,-9 L5,-14 M-5,14 L0,9 L5,14"/></g>`);
  const signBowl = () => icon("-22 -22 44 44", `<path d="M-18,-2 Q0,26 18,-2 Z" fill="#fff" stroke="${INK}" stroke-width="2.5"/><g fill="#F2B134" stroke="${INK}" stroke-width="1.5"><circle cx="-8" cy="-5" r="5"/><circle cx="3" cy="-7" r="5"/><circle cx="11" cy="-3" r="4"/></g>`);
  const signStar = () => icon("-22 -22 44 44", `<path d="M0,-19 L5.5,-6 L19,-6 L8,3 L12,17 L0,8 L-12,17 L-8,3 L-19,-6 L-5.5,-6 Z" fill="#FFD23F" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`);
  const signMug = () => icon("-22 -22 44 44", `<path d="M-15,-8 L9,-8 L7,16 L-13,16 Z" fill="#fff" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="M9,-3 q10,0 8,8 q-2,6 -9,5" fill="none" stroke="${INK}" stroke-width="2.5"/><path d="M-7,-14 q-3,-4 0,-7 M1,-14 q-3,-4 0,-7" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>`);
  const signChip = () => icon("-22 -22 44 44", `<path d="M-16,-6 Q0,-20 16,-4 Q14,14 -2,16 Q-18,10 -16,-6 Z" fill="#FFE59A" stroke="${INK}" stroke-width="2.5"/><circle cx="-4" cy="0" r="1.8" fill="#D9A43A"/><circle cx="6" cy="5" r="1.8" fill="#D9A43A"/>`);
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
  // (For one-product aisles like chips/sauce, the aisle itself is passed as the option.)
  const products = {
    avocado: (opt, version) => avocadoCrate(opt.size, opt.stock[version]),
    eggs: (opt) => eggCarton(opt.count),
    icecream: iceCream,
    cereal: cerealBox,
    soda4: soda4,
    coffee: coffeeBag,
    chips: chipsBag,
    juice: juice,
    sauce: sauceJar,
    towels: towels,
  };
  const signIcons = {
    avocado: avocadoHalf, eggs: eggIcon, icecream: signSnowflake, cereal: signBowl, soda4: signStar,
    coffee: signMug, chips: signChip, juice: signGlass, sauce: signJar, towels: signRoll,
  };

  return { products, signIcons, cart };
})();
