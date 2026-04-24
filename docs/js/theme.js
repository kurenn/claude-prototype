/*
 * Theme switcher — terminal (default) / paper / mono.
 *
 * Three themes, visible segmented control in #proto-controls.
 * Respects URL param, localStorage, and prefers-color-scheme on first visit.
 */
(function () {
  const THEMES = ['terminal', 'paper', 'mono'];
  const STORAGE_KEY = 'proto-theme';
  const root = document.documentElement;

  function getStored() { try { return localStorage.getItem(STORAGE_KEY); } catch { return null; } }
  function setStored(v) { try { localStorage.setItem(STORAGE_KEY, v); } catch {} }

  function applyTheme(name) {
    if (!THEMES.includes(name)) name = THEMES[0];
    root.dataset.theme = name;
    setStored(name);
    document.querySelectorAll('[data-theme-option]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.themeOption === name));
    });
    document.querySelectorAll('[data-theme-label]').forEach(el => el.textContent = name);
    if (window.State) window.State.set('theme', name === THEMES[0] ? null : name);
  }

  const params = new URLSearchParams(location.search);
  const fromUrl = params.get('theme');
  const stored = getStored();
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial =
    (fromUrl && THEMES.includes(fromUrl)) ? fromUrl :
    (stored && THEMES.includes(stored))   ? stored :
    (prefersDark ? 'terminal' : 'paper');
  applyTheme(initial);

  document.querySelectorAll('[data-theme-option]').forEach(btn => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.themeOption));
  });
  document.querySelectorAll('[data-theme-switch]').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = THEMES.indexOf(root.dataset.theme);
      applyTheme(THEMES[(i + 1) % THEMES.length]);
    });
  });

  window.Theme = { apply: applyTheme, list: THEMES };
})();
