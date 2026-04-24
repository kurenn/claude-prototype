/*
 * Theme switcher.
 *
 * Works with visible segmented controls: `<button data-theme-option="<name>">`
 * Applies data-theme on <html>, persists to localStorage, respects URL param
 * and prefers-color-scheme on first visit.
 */
(function () {
  const THEMES = ['studio', 'terminal', 'mono']; // edit to match your DESIGN.md
  const STORAGE_KEY = 'proto-theme';
  const root = document.documentElement;

  function getStored() { try { return localStorage.getItem(STORAGE_KEY); } catch { return null; } }
  function setStored(v) { try { localStorage.setItem(STORAGE_KEY, v); } catch {} }

  function applyTheme(name) {
    if (!THEMES.includes(name)) name = THEMES[0];
    root.dataset.theme = name;
    setStored(name);
    // update visible segmented controls
    document.querySelectorAll('[data-theme-option]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.themeOption === name));
    });
    // update any theme-label spans (for legacy cycle buttons)
    document.querySelectorAll('[data-theme-label]').forEach(el => el.textContent = name);
    if (window.State) window.State.set('theme', name === THEMES[0] ? null : name);
  }

  // Init: URL param > localStorage > prefers-color-scheme > default
  const params = new URLSearchParams(location.search);
  const fromUrl = params.get('theme');
  const stored = getStored();
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial =
    (fromUrl && THEMES.includes(fromUrl)) ? fromUrl :
    (stored && THEMES.includes(stored))   ? stored :
    (prefersDark && THEMES.includes('terminal')) ? 'terminal' :
    THEMES[0];
  applyTheme(initial);

  // Segmented control: direct pick
  document.querySelectorAll('[data-theme-option]').forEach(btn => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.themeOption));
  });
  // Legacy cycle button (kept for backwards compat)
  document.querySelectorAll('[data-theme-switch]').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = THEMES.indexOf(root.dataset.theme);
      applyTheme(THEMES[(i + 1) % THEMES.length]);
    });
  });

  window.Theme = { apply: applyTheme, list: THEMES };
})();
