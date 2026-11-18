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

  function cart() {
    return `
      <svg viewBox="0 0 32 28" class="cart-icon" aria-hidden="true">
        <path d="M2,4 L7,4 L10,18 L26,18 L29,8 L8.5,8" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="24" r="2.4" fill="currentColor"/><circle cx="24" cy="24" r="2.4" fill="currentColor"/>
      </svg>`;
  }

  // Lookup: aisle.art -> function(option, version) returning the product drawing.
  const products = {
    avocado: (opt, version) => avocadoCrate(opt.size, opt.stock[version]),
    eggs: (opt) => eggCarton(opt.count),
  };
  const signIcons = { avocado: avocadoHalf, eggs: eggIcon };

  return { products, signIcons, cart };
})();
