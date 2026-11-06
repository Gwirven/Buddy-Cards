// CardText.html(card, rarity) -> the name bar + flavour text layer, plus the serial tab (just the id, like 0001BH) at the bottom edge, for a card face.
// card: {id, name, flavor, border, hide_name?, hide_flavor?, rank?, stats?}  (the old hide_text hides both).
//  rank (1-5) shows as stars at the right end of the name bar.  If stats ([top, right, bottom, left]) are given, that's the
// Triple Triad view: no name bar and no flavour text; one big box with just the stats fills the space both boxes use.
window.CardText = {
  EMPTY: "Buddy and Gwirven were too lazy to put anything here",   // shown in the flavour box of a bordered card that has no flavour text

  esc: s => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])),
  html(card, rarity) {
    if (!card) return "";
    const hideName = card.hide_name ?? card.hide_text, hideFlav = card.hide_flavor ?? card.hide_text;   // name bar / flavour box, independently
    // the serial tab: a small tab on the bottom edge, in the frame's colour, on every card (even with all text hidden)
    const tab = `<div class="ctab ${this.esc(rarity || "C")}"><i></i><span>${this.esc(card.id + (rarity || ""))}</span></div>`;
    const A = v => (v === 10 ? "A" : v);
    const st = card.stats ? `<div class="ctx-st" aria-label="top ${card.stats[0]}, right ${card.stats[1]}, bottom ${card.stats[2]}, left ${card.stats[3]}">` +
      `<b class="t">${A(card.stats[0])}</b><b class="l">${A(card.stats[3])}</b><b class="r">${A(card.stats[1])}</b><b class="b">${A(card.stats[2])}</b></div>` : "";
    const rk = Math.max(0, Math.min(5, parseInt(card.rank, 10) || 0));
    const stars = rk ? `<span class="ctx-stars" aria-label="${rk} star${rk > 1 ? "s" : ""}">${"\u2605".repeat(rk)}</span>` : "";
    // Triple Triad view (stats given): no flavour text at all, just the stats, centred in the box
    const text = st || hideFlav ? "" : card.flavor ? `<p>${this.esc(card.flavor)}</p>` : card.border ? `<p class="ctx-empty">${this.esc(this.EMPTY)}</p>` : "";
    const flav = st ? `<div class="ctx-flav has-stats triad"><div class="ctx-foot">${st}</div></div>`
               : text || card.border ? `<div class="ctx-flav">${text}</div>` : "";
    const name = hideName || st ? "" : `<div class="ctx-name${stars ? " has-rank" : ""}"${stars ? ` style="--rk:${rk}"` : ""}>${this.esc(card.name)}${stars}</div>`;
    return `<div class="ctx ${card.border ? "bordered" : ""}">${name}${flav}${tab}</div>`;
  },
};

