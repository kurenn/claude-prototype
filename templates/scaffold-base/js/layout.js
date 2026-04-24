/*
 * Layout switcher — per-prototype, not fixed to column counts.
 *
 * Customize the LAYOUTS array for this prototype. Names should match:
 *   - the `data-layout-option="..."` buttons in the control bar
 *   - the CSS rules keyed off `html[data-layout="..."]` in styles.css
 *
 * Pick names from real product vocabulary in your category. Examples:
 *
 *   const LAYOUTS = ['grid', 'gallery', 'list'];           // photo marketplace
 *   const LAYOUTS = ['compact', 'comfortable', 'spacious']; // dashboard density
 *   const LAYOUTS = ['list-only', 'split-view', 'preview']; // inbox
 *   const LAYOUTS = ['grid-2', 'grid-3', 'grid-4'];         // e-commerce catalog
 *   const LAYOUTS = ['reading', 'with-sidebar'];            // content site
 *
 * The first entry is the default. Applied to <html data-layout="...">.
 */
(function () {
  const LAYOUTS = ['layout-a', 'layout-b']; // CUSTOMIZE for your prototype
  const STORAGE_KEY = 'proto-layout';
  const root = document.documentElement;

  function getStored() { try { return localStorage.getItem(STORAGE_KEY); } catch { return null; } }
  function setStored(v) { try { localStorage.setItem(STORAGE_KEY, v); } catch {} }

  function applyLayout(name) {
    if (!LAYOUTS.includes(name)) name = LAYOUTS[0];
    root.dataset.layout = name;
    setStored(name);
    document.querySelectorAll('[data-layout-option]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.layoutOption === name));
    });
    if (window.State) window.State.set('layout', name === LAYOUTS[0] ? null : name);
  }

  const params = new URLSearchParams(location.search);
  const fromUrl = params.get('layout');
  const stored = getStored();
  const initial =
    (fromUrl && LAYOUTS.includes(fromUrl)) ? fromUrl :
    (stored && LAYOUTS.includes(stored))   ? stored :
    LAYOUTS[0];
  applyLayout(initial);

  document.querySelectorAll('[data-layout-option]').forEach(btn => {
    btn.addEventListener('click', () => applyLayout(btn.dataset.layoutOption));
  });

  window.Layout = { apply: applyLayout, list: LAYOUTS };
})();
