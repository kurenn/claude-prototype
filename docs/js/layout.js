/*
 * Layout switcher — comfortable (default) / compact.
 *
 * Comfortable: generous whitespace, docs-feel. Line-height 1.7, max 720.
 * Compact: tighter, reference-manual feel. Line-height 1.55, max 640.
 */
(function () {
  const LAYOUTS = ['comfortable', 'compact'];
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
