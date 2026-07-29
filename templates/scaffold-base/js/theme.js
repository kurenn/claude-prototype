/*
 * Theme switcher.
 *
 * Works with visible segmented controls: `<button data-theme-option="<name>">`
 * Applies data-theme on <html>, persists to localStorage, respects URL param
 * and prefers-color-scheme on first visit.
 *
 * The inline anti-FOUC script in every screen's <head> duplicates the
 * localStorage/prefers-color-scheme lookup below (minus the URL param) so the
 * theme paints before first render — keep it in sync with THEMES / DARK_THEME
 * whenever either changes here.
 */
(function () {
  const THEMES = ['studio', 'terminal', 'mono']; // edit to match your DESIGN.md
  const DARK_THEME = 'terminal'; // theme prefers-color-scheme:dark picks — rename alongside THEMES
  const STORAGE_KEY = 'proto-theme';
  const root = document.documentElement;

  function getStored() { try { return localStorage.getItem(STORAGE_KEY); } catch { return null; } }
  function setStored(v) { try { localStorage.setItem(STORAGE_KEY, v); } catch {} }

  function applyTheme(name) {
    if (!THEMES.includes(name)) name = THEMES[0];
    // Kill transitions for one frame around the flip so every token snaps to the new theme
    // instantly, instead of animating a laggy, multi-speed color smear (Rauno: no
    // transitions during a theme flip — the CSS `html.theme-switching *` rule does the
    // suppressing). Double-rAF removal lands the no-transition paint before re-enabling.
    root.classList.add('theme-switching');
    root.dataset.theme = name;
    setStored(name);
    // update visible segmented controls
    document.querySelectorAll('[data-theme-option]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.themeOption === name));
    });
    // update any theme-label spans (for legacy cycle buttons)
    document.querySelectorAll('[data-theme-label]').forEach(el => el.textContent = name);
    if (window.State) window.State.set('theme', name === THEMES[0] ? null : name);
    // Re-enable transitions once the new palette has painted (two frames later, so the
    // transition-less repaint is guaranteed to have landed first).
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        root.classList.remove('theme-switching');
      });
    });
  }

  // Init: URL param > localStorage > prefers-color-scheme > default
  const params = new URLSearchParams(location.search);
  const fromUrl = params.get('theme');
  const stored = getStored();
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial =
    (fromUrl && THEMES.includes(fromUrl)) ? fromUrl :
    (stored && THEMES.includes(stored))   ? stored :
    (prefersDark && THEMES.includes(DARK_THEME)) ? DARK_THEME :
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
