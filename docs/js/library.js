/*
 * The design-file library, from docs/designs/index.json (written by
 * reference/design-pages.py). Two mounts:
 *   [data-lib-teaser="slug slug …"] — a fixed handful of cards (landing page)
 *   [data-lib]                      — all files, with search + category filter (designs.html)
 * Entries are untrusted text: everything is escaped, swatches must be plain hex.
 */
(function () {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const hex = h => /^#[0-9a-f]{3,8}$/i.test(h) ? h : 'transparent';

  function card(e) {
    return `<li class="lib-card">
      <a href="design.html?f=${encodeURIComponent(e.slug)}">
        <span class="lib-swatches" aria-hidden="true">${(e.swatches || []).map(h => `<i style="background:${hex(h)}"></i>`).join('')}</span>
        <span class="lib-name">${esc(e.name)}</span>
        <span class="lib-cat">${esc(e.category)}</span>
        <span class="lib-sum">${esc(e.summary)}</span>
      </a>
    </li>`;
  }

  let cache = null;
  const load = () => cache || (cache = fetch('designs/index.json').then(r => {
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }).catch(err => { cache = null; throw err; }));

  // ---- landing teaser ----
  document.querySelectorAll('[data-lib-teaser]').forEach(ul => {
    const want = ul.dataset.libTeaser.split(/\s+/);
    load().then(all => {
      ul.innerHTML = want.map(s => all.find(e => e.slug === s)).filter(Boolean).map(card).join('');
    }).catch(() => { ul.hidden = true; });
  });

  // ---- full library ----
  const root = document.querySelector('[data-lib]');
  if (!root) return;
  const grid = root.querySelector('[data-lib-grid]');
  const q = root.querySelector('[data-lib-q]');
  const chips = root.querySelector('[data-lib-cats]');
  const count = root.querySelector('[data-lib-count]');
  const empty = root.querySelector('[data-lib-empty]');
  const error = root.querySelector('[data-lib-error]');
  let all = [];

  function render() {
    const term = q.value.trim().toLowerCase();
    const cat = State.get('cat');
    const hits = all.filter(e => (!cat || e.category === cat) &&
      (!term || (e.name + ' ' + e.slug + ' ' + e.summary + ' ' + e.category).toLowerCase().includes(term)));
    grid.innerHTML = hits.map(card).join('');
    count.textContent = hits.length === all.length ? `${all.length} files` : `${hits.length} of ${all.length} files`;
    empty.hidden = hits.length > 0;
    root.querySelector('[data-lib-empty-term]').textContent = term ? `“${q.value.trim()}”` : 'this filter';
    chips.querySelectorAll('[data-cat]').forEach(b => {
      const on = (b.dataset.cat || null) === cat;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }

  function start() {
    error.hidden = true;
    grid.setAttribute('aria-busy', 'true');
    grid.innerHTML = Array.from({ length: 9 }, () => '<li class="lib-card is-skeleton"><span class="skeleton" style="height:9.5rem;display:block"></span></li>').join('');
    // The scaffold's latency engine, so Loading → Slow / ⟳ Replay demo the skeleton; real fetch underneath.
    const wait = new Promise(r => setTimeout(r, UI.fakeLatency('read')));
    Promise.all([load(), wait]).then(([data]) => {
      all = data;
      const cats = [...new Set(all.map(e => e.category))].sort();
      chips.innerHTML = `<button type="button" class="chip" data-cat="">All</button>` +
        cats.map(c => `<button type="button" class="chip" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
      q.value = State.get('q') || '';
      render();
    }).catch(() => {
      grid.innerHTML = '';
      error.hidden = false;
      count.textContent = '';
    }).finally(() => grid.setAttribute('aria-busy', 'false'));
  }

  chips.addEventListener('click', ev => {
    const b = ev.target.closest('[data-cat]');
    if (!b) return;
    State.set('cat', b.dataset.cat || null);
    render();
  });
  q.addEventListener('input', () => { State.set('q', q.value.trim() || null); render(); });
  root.querySelector('[data-lib-clear]').addEventListener('click', () => {
    q.value = ''; State.set('q', null); State.set('cat', null); render(); q.focus();
  });
  root.querySelector('[data-lib-retry]').addEventListener('click', start);
  UI.registerLoader(start);
  start();
})();
