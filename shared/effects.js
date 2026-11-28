/* Adds rarity effect layers to card faces.
   Mark a face with data-fx="R" (rare) or data-fx="H" (holo), then call CardFX.attach(container).
   Common ("C") faces are left alone. The layers become direct children of the face.
   CardFX.attach(container, {still: true}) is for lots of small cards at once: fewer sparkles, and with
   class="fx-still" on the container (effects.css) nothing animates, so they're painted once. */
(function () {
  const rnd = (a, b) => a + Math.random() * (b - a);
  const PLAN = {
    R: { n: 16, size: [12, 22], bigChance: .1,  layers: ["wash", "sweep"] },
    H: { n: 30, size: [10, 22], bigChance: .25, layers: ["foil", "g1", "g2", "sweep", "glare"] },
  };

  function layers(r, still) {
    const p = PLAN[r];
    let html = p.layers.map(l => `<i class="fxl ${l}" aria-hidden="true"></i>`).join("");
    for (let i = 0, n = still ? Math.ceil(p.n / 3) : p.n; i < n; i++) {
      const big = Math.random() < p.bigChance;
      const s = big ? rnd(28, 40) : rnd(p.size[0], p.size[1]);
      html += `<i class="fxl sp" aria-hidden="true" style="--x:${rnd(6, 94).toFixed(1)}%;--y:${rnd(5, 95).toFixed(1)}%;` +
              `--s:${s.toFixed(0)}px;--d:${rnd(1.8, 3.6).toFixed(2)}s;--w:-${rnd(0, 3.6).toFixed(2)}s;` +
              `--c:hsl(${Math.round(rnd(0, 360))} 100% 66%)"></i>`;
    }
    const tmp = document.createElement("div"), frag = document.createDocumentFragment();
    tmp.innerHTML = html;
    while (tmp.firstChild) frag.appendChild(tmp.firstChild);
    return frag;
  }

  window.CardFX = {
    attach(root, opts) {
      const still = !!(opts && opts.still);
      (root || document).querySelectorAll("[data-fx]").forEach(el => {
        const r = el.dataset.fx;
        if (!PLAN[r] || el.querySelector(":scope > .fxl")) return;
        el.appendChild(layers(r, still));
      });
    },
    // Pointer-driven highlight for the enlarged view. x, y are 0-1; pass null to release.
    live(el, x, y) {
      if (!el) return;
      if (x == null) { el.classList.remove("live"); return; }
      el.classList.add("live");
      el.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
      el.style.setProperty("--my", (y * 100).toFixed(1) + "%");
    },
  };
})();
