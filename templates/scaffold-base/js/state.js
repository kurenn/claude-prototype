/*
 * URL state hydration + share button + history drawer.
 *
 * Philosophy: every interactive state (modal open, tab selected, theme) lives
 * in the URL. Reload the URL → same screen. Share the URL → same screen.
 *
 * Usage from app.js:
 *   State.hydrate({
 *     modal: (v) => v && openModal(v),
 *     tab:   (v) => v && selectTab(v),
 *   });
 *   // later, when user opens a modal:
 *   State.set('modal', 'signup');
 */
(function () {
  const SESSION_KEY = 'proto-history';
  const MAX_HISTORY = 10;

  function readParams() {
    const p = new URLSearchParams(location.search);
    const out = {};
    for (const [k, v] of p.entries()) out[k] = v;
    return out;
  }

  function writeParams(obj) {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(obj)) {
      if (v !== null && v !== undefined && v !== '') p.set(k, v);
    }
    const hash = location.hash || '';
    const url = location.pathname + (p.toString() ? '?' + p.toString() : '') + hash;
    history.replaceState(null, '', url);
  }

  function set(key, value) {
    const current = readParams();
    if (value === null || value === undefined || value === '') delete current[key];
    else current[key] = String(value);
    writeParams(current);
    pushHistory();
  }

  function get(key) {
    return readParams()[key] || null;
  }

  function hydrate(handlers) {
    const params = readParams();
    for (const [key, fn] of Object.entries(handlers || {})) {
      try { fn(params[key] || null); } catch (e) { console.warn('hydrate', key, e); }
    }
  }

  // --- SHARE BUTTON -------------------------------------------------------
  function copyShareUrl() {
    const url = location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => toast('Link copied'));
    } else {
      // fallback for http:// without clipboard
      const ta = document.createElement('textarea');
      ta.value = url; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('Link copied'); } catch {}
      document.body.removeChild(ta);
    }
  }

  function toast(msg) {
    let el = document.querySelector('.proto-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'proto-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('visible');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('visible'), 1600);
  }

  // --- HISTORY DRAWER (Shift+?) ------------------------------------------
  function readHistory() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]'); }
    catch { return []; }
  }
  function writeHistory(arr) {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(arr)); } catch {}
  }
  function pushHistory() {
    const url = location.pathname + location.search + location.hash;
    const title = document.title || url;
    const arr = readHistory().filter(e => e.url !== url);
    arr.unshift({ url, title, at: Date.now() });
    if (arr.length > MAX_HISTORY) arr.length = MAX_HISTORY;
    writeHistory(arr);
  }

  function renderHistoryDrawer() {
    let el = document.querySelector('.proto-history');
    if (!el) {
      el = document.createElement('aside');
      el.className = 'proto-history';
      document.body.appendChild(el);
    }
    const entries = readHistory();
    el.innerHTML = '<h3>Recently viewed</h3>' + (
      entries.length === 0
        ? '<p style="font-size:.8rem;opacity:.7">No history yet.</p>'
        : '<ol>' + entries.map(e =>
            `<li><a href="${e.url}">${e.title}</a></li>`
          ).join('') + '</ol>'
    );
    el.classList.toggle('visible');
  }

  // --- WIRE UI ------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    pushHistory(); // seed history with initial page
    document.querySelectorAll('[data-share]').forEach(btn => {
      btn.addEventListener('click', copyShareUrl);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.key === '?') renderHistoryDrawer();
    if (e.key === 'Escape') {
      document.querySelector('.proto-history.visible')?.classList.remove('visible');
    }
  });

  window.State = { get, set, hydrate, toast };
})();
