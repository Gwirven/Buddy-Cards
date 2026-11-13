// "There's an update" popup for the editor pages (card editor, Settings, Overlay layout). Just include this script.
// It asks the bot when the page opens, again shortly after (the bot may only just have started and not asked GitHub
// yet), and every few minutes in case a page is left open. Closing it lasts until the page is next opened, or until
// something newer comes out.
(() => {
  const SOON = 15000, EVERY = 10 * 60000;
  let shown = "";

  function el(tag, css, text) {
    const e = document.createElement(tag);
    e.style.cssText = css;
    if (text) e.textContent = text;       // always text, never HTML
    return e;
  }

  function popup(u) {
    const d = el("dialog", "max-width:520px;width:calc(100% - 32px);background:#181b24;color:#e7e9ee;border:1px solid #6bff95;" +
                           "border-radius:12px;padding:20px;font:15px/1.5 Inter,system-ui,sans-serif");
    d.id = "update-notice";
    d.append(el("h2", "margin:0 0 10px;font-size:20px;color:#6bff95", "⬆️ Update available"));
    for (const line of u.available) d.append(el("div", "font-weight:700", line));
    if (u.notes) {
      d.append(el("div", "margin-top:12px;color:#8b91a1;font-size:12px;text-transform:uppercase;letter-spacing:.06em", "What's new"));
      d.append(el("div", "white-space:pre-wrap;overflow-wrap:anywhere;max-height:35vh;overflow:auto;font-size:14px", u.notes));
    }
    d.append(el("p", "margin:14px 0 16px", u.how));
    const ok = el("button", "background:#9147ff;border:1px solid #9147ff;border-radius:6px;color:#fff;font:inherit;font-weight:700;" +
                            "padding:8px 16px;cursor:pointer", "OK, remind me later");
    ok.onclick = () => d.close();
    d.append(ok);
    d.onclose = () => d.remove();
    document.body.append(d);
    d.showModal();
  }

  async function check(opened) {
    let u;
    try {
      const r = await fetch("/setup/api/update-notice" + (opened ? "?opened=1" : ""));
      if (!r.ok) return;
      u = await r.json();
    } catch { return; }                   // the bot restarting: try again next time
    const id = (u.available || []).join("|");
    if (id && id !== shown && !document.getElementById("update-notice")) { shown = id; popup(u); }
  }

  check(true);
  setTimeout(check, SOON);
  setInterval(check, EVERY);
})();
