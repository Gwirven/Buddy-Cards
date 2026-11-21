// Quadruple Quartet plugin: the "Add to hand" builder on collection pages. Loaded by collection/index.html
// (through /api/features) only when the plugin is installed.
(() => {
const C = window.Collection, $ = C.$, esc = C.esc, login = C.login;
const style = document.createElement("style");
style.textContent = `
  .handbar { display:flex; align-items:center; gap:10px; flex-wrap:wrap; background:var(--panel, #181b24); border:1px solid #2a2f3d;
             border-radius:12px; padding:10px 12px; margin:0 0 18px; }
  .handbar h3 { margin:0; font-size:12px; letter-spacing:.08em; text-transform:uppercase; color:var(--dim); white-space:nowrap; }
  .hchips { display:flex; gap:6px; flex-wrap:wrap; flex:1; min-width:0; }
  .hchip { display:inline-flex; align-items:center; gap:6px; padding:4px 6px 4px 10px; border-radius:99px; background:#232838;
           border:1px solid #343b4f; font-size:13px; }
  .hchip b { font-family:ui-monospace, Consolas, monospace; font-size:12px; color:#cfd6e4; }
  .hchip button { all:unset; cursor:pointer; width:18px; height:18px; border-radius:50%; display:grid; place-items:center; color:var(--dim); }
  .hchip button:hover { background:#3a4157; color:#fff; }
  .hempty { color:var(--dim); font-size:13px; }
  .hbtn { background:#9147ff; color:#fff; border:0; border-radius:8px; padding:8px 12px; font:inherit; font-weight:700; cursor:pointer; }
  .hbtn:disabled { background:#2a2f3d; color:var(--dim); cursor:default; }
  .hbtn.ghost { background:none; border:1px solid #343b4f; color:var(--dim); font-weight:600; }
  .hcmd { width:100%; font-family:ui-monospace, Consolas, monospace; font-size:13px; background:#0d0f15; color:#e7e9ee;
          border:1px solid #2a2f3d; border-radius:8px; padding:7px 9px; }
  .hadd { display:block; margin:0 auto 8px; }
  @media (max-width:560px) {                 /* phones: the title and the chips each get their own row */
    .handbar { gap:8px; padding:10px; }
    .handbar h3 { width:100%; }
    .hchips { flex-basis:100%; }
  }
`;
document.head.appendChild(style);

// Pick 5 cards here, copy the "!qq deck ..." command, paste it in chat. The bot checks the person pasting it owns the
// cards, so building a hand on someone else's page does nothing for anyone but them. One copy of a card per
// hand: every version of a card and its alts count as the same card ("family").
let HAND = [], HAND_KEY = "", OWNER = "";
const famOf = g => g.alt_of || g.num;
function loadHand(owner) {
  const top = $("addons-top");
  if (top && !$("handbar")) top.insertAdjacentHTML("beforeend", '<div class="handbar" id="handbar"></div>');
  OWNER = owner; HAND_KEY = "tt-hand:" + (login || "").toLowerCase();
  try { HAND = JSON.parse(localStorage.getItem(HAND_KEY) || "[]"); } catch { HAND = []; }
  const owned = new Set();                       // drop anything this collection no longer has
  C.cards.forEach(g => g.vs.forEach(v => ["H", "R", "C"].forEach(r => { if (v[r] > 0) owned.add(v.id + r); })));
  HAND = HAND.filter(h => owned.has(h.serial)).slice(0, 5);
  renderHand();
}
function saveHand() { try { localStorage.setItem(HAND_KEY, JSON.stringify(HAND)); } catch {} renderHand(); }
let CMD = "!qq";                                   // the plugin's chat command (config can change it)
fetch("/api/features").then(r => r.json()).then(f => { if (f.triad && f.triad.command) { CMD = f.triad.command; renderHand(); } }).catch(() => {});
function deckCmd() { return CMD + " deck " + HAND.map(h => h.serial).join(" "); }
function renderHand() {
  const el = $("handbar"); if (!el) return;
  const full = HAND.length === 5;
  el.innerHTML = `<h3>Quadruple Quartet hand ${HAND.length}/5</h3>
    <div class="hchips">${HAND.length ? HAND.map((h, i) => `<span class="hchip"><b>${esc(h.serial)}</b>${esc(h.name)}<button data-i="${i}" aria-label="Remove ${esc(h.name)}">✕</button></span>`).join("")
      : `<span class="hempty">Open a card and press <b>Add to hand</b>. Pick 5 different cards (versions and alts of one card count once).</span>`}</div>
    ${HAND.length ? `<button class="hbtn ghost" id="hclear">Clear</button>` : ""}
    <button class="hbtn" id="hcopy" ${full ? "" : "disabled"} title="${full ? "" : "Pick 5 cards first"}">Copy ${esc(CMD)} deck command</button>
    <div id="hout" style="width:100%;display:none"></div>`;
  el.querySelectorAll(".hchip button").forEach(b => b.onclick = () => { HAND.splice(+b.dataset.i, 1); saveHand(); refreshAdd(); });
  const clr = $("hclear"); if (clr) clr.onclick = () => { HAND = []; saveHand(); refreshAdd(); };
  $("hcopy").onclick = async () => {
    const cmd = deckCmd(), out = $("hout");
    let ok = false;
    try { await navigator.clipboard.writeText(cmd); ok = true; } catch {}
    out.style.display = "block";
    out.innerHTML = `<input class="hcmd" readonly value="${esc(cmd)}">
      <div class="hempty" style="margin-top:6px">${ok ? "Copied! " : "Copy this, then "}paste it in chat as ${esc(OWNER)}. It only works from that account.</div>`;
    const inp = out.querySelector("input"); inp.focus(); inp.select();
  };
}
function addState(g, serial) {
  const fam = famOf(g), same = HAND.find(h => h.fam === fam);
  if (same && same.serial === serial) return { label: "In your hand", off: true };
  if (same) return { label: `Swap for ${same.serial}`, off: false, swap: true };
  if (HAND.length >= 5) return { label: "Hand is full (5)", off: true };
  return { label: "Add to hand", off: false };
}
function refreshAdd() { C.rerender(); }
function addToHand(g, serial, name) {
  const fam = famOf(g), i = HAND.findIndex(h => h.fam === fam);
  if (i >= 0) HAND[i] = { serial, fam, name }; else if (HAND.length < 5) HAND.push({ serial, fam, name });
  saveHand(); refreshAdd();
}


C.add({
  onUser: d => loadHand(d.name),
  cardHTML: (g, v, r, have) => have && login
    ? (st => `<button class="hbtn hadd" id="hadd" ${st.off ? "disabled" : ""}>${esc(st.label)}</button>`)(addState(g, v.id + r)) : "",
  bindCard: (m, g, v, r) => { const b = m.querySelector("#hadd"); if (b) b.onclick = () => addToHand(g, v.id + r, v.name || g.name); },
});
})();
