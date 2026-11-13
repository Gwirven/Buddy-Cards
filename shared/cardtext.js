// CardText.html(card, rarity) -> the name bar + flavour text layer, plus the serial tab (just the id, like 0001BH) at the bottom edge, for a card face.
// card: {id, name, flavor, border, hide_name?, hide_flavor?, rank?, stats?}  (the old hide_text hides both).
//  If stats ([top, right, bottom, left]) are given, that's the
// Quadruple Quartet view: no name bar and no flavour text; one big box with just the stats fills the space both boxes use.
//  Stats are colours since Quadruple Quartet 2.0 (["G", "B", "G", "R"]): Blue triangle, Green circle, Red square, and the
//  rank as a row of 5 pips in its own small box at the top of the card (it decides same-colour fights). Number stats (Triple Triad 1.x) still show as numbers.
window.CardText = {
  EMPTY: "Buddy and Gwirven were too lazy to put anything here",   // shown in the flavour box of a bordered card that has no flavour text

  COLOURS: { B: "Blue", G: "Green", R: "Red" },
  // one side's shape, pointing outward on its side (k: 0 top, 1 right, 2 bottom, 3 left); the triangle shows the direction
  shape(c, k) {
    const body = c === "B" ? `<path d="M50 6 L94 88 H6 Z" transform="rotate(${k * 90} 50 55)"/>`
               : c === "G" ? `<circle cx="50" cy="50" r="40"/>`
               : `<rect x="12" y="12" width="76" height="76" rx="6"/>`;
    return `<svg class="tts ${c}" viewBox="0 0 100 100" aria-hidden="true">${body}</svg>`;
  },
  sides(card) {
    const s = card.stats, side = k => this.shape(s[k], k), n = this.COLOURS;
    const rk = Math.max(0, Math.min(5, parseInt(card.rank, 10) || 0));
    return `<div class="ctx-st col" aria-label="top ${n[s[0]]}, right ${n[s[1]]}, bottom ${n[s[2]]}, left ${n[s[3]]}${rk ? `, rank ${rk}` : ""}">` +
      `<b class="t">${side(0)}</b><b class="l">${side(3)}</b><b class="r">${side(1)}</b><b class="b">${side(2)}</b></div>`;
  },

  // the rank as a row of 5 pips (gold = rank, dim = the rest), in its own small box at the top of the card
  pips(rank) {
    const rk = Math.max(0, Math.min(5, parseInt(rank, 10) || 0));
    if (!rk) return "";
    return `<div class="ctx-pips" aria-label="rank ${rk} of 5">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= rk ? "on" : ""}"></i>`).join("")}</div>`;
  },

  esc: s => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])),
  html(card, rarity) {
    if (!card) return "";
    const hideName = card.hide_name ?? card.hide_text, hideFlav = card.hide_flavor ?? card.hide_text;   // name bar / flavour box, independently
    // the serial tab: a small tab on the bottom edge, in the frame's colour, on every card (even with all text hidden)
    const tab = `<div class="ctab ${this.esc(rarity || "C")}"><i></i><span>${this.esc(card.id + (rarity || ""))}</span></div>`;
    const A = v => (v === 10 ? "A" : v);
    const colour = card.stats && card.stats.length === 4 && card.stats.every(v => v in this.COLOURS);
    const st = colour ? this.sides(card) : card.stats ? `<div class="ctx-st" aria-label="top ${card.stats[0]}, right ${card.stats[1]}, bottom ${card.stats[2]}, left ${card.stats[3]}">` +
      `<b class="t">${A(card.stats[0])}</b><b class="l">${A(card.stats[3])}</b><b class="r">${A(card.stats[1])}</b><b class="b">${A(card.stats[2])}</b></div>` : "";
    // Quadruple Quartet view (stats given): no flavour text at all, just the stats, centred in the box
    const text = st || hideFlav ? "" : card.flavor ? `<p>${this.esc(card.flavor)}</p>` : card.border ? `<p class="ctx-empty">${this.esc(this.EMPTY)}</p>` : "";
    const flav = st ? `<div class="ctx-flav has-stats triad"><div class="ctx-foot">${st}</div></div>`
               : text || card.border ? `<div class="ctx-flav">${text}</div>` : "";
    const name = hideName || st ? "" : `<div class="ctx-name">${this.esc(card.name)}</div>`;
    const pips = colour ? this.pips(card.rank) : "";
    return `<div class="ctx ${card.border ? "bordered" : ""}">${name}${pips}${flav}${tab}</div>`;
  },
};

