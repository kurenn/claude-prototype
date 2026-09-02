/*
 * Motion-tier switcher.
 *
 * Works with the visible segmented control: `<button data-motion-option="<tier>">`.
 * Applies data-motion on <html>, persists to localStorage, respects a URL param.
 * The tier gates motion INTENSITY across the scaffold (CSS in styles.css + vt.js):
 *   calm       — dense tools/dashboards. Root transition = fast crossfade only (no slide),
 *                no list→detail hero morph, .enter/.reveal render instantly, no scroll-driven
 *                effects. Micro-interactions (:active press, hover, focus) are KEPT — feedback,
 *                not friction. (Loading/Speed is a separate control.)
 *   standard   — default: crossfade+slide + hero morph + .enter (sparing) + .reveal.
 *   expressive — marketing/landing/pitch: standard + scroll-driven .reveal + a --spring
 *                easing on .enter/key entrances + slightly richer entrance distance/duration.
 *
 * This mirrors js/theme.js's structure. The inline anti-FOUC script in every screen's <head>
 * also sets data-motion from localStorage before first paint — `pagereveal` fires before the
 * incoming page paints, so the tier must be on <html> before the transition CSS resolves.
 * Keep DEFAULT_TIER in sync with that script whenever it changes here.
 *
 * The skill DECIDES the tier from register + tone + screen types and records it in DESIGN.md
 * (reference/discovery.md → "Motion tier"); this control just demos it, with standard as the
 * sensible default it dials up/down from. No theme-flip transition-suppression needed here:
 * flipping data-motion doesn't swap color tokens, so there's no multi-speed color smear to kill.
 */
(function () {
  const TIERS = ['calm', 'standard', 'expressive']; // keep in sync with data-motion CSS + the anti-FOUC default
  const DEFAULT_TIER = 'standard';
  const STORAGE_KEY = (window.PROTO_NS || 'proto-') + 'motion';
  const root = document.documentElement;

  function getStored() { try { return localStorage.getItem(STORAGE_KEY); } catch { return null; } }
  function setStored(v) { try { localStorage.setItem(STORAGE_KEY, v); } catch {} }

  function applyMotion(name) {
    if (!TIERS.includes(name)) name = DEFAULT_TIER;
    root.dataset.motion = name;
    setStored(name);
    // update visible segmented control
    document.querySelectorAll('[data-motion-option]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.motionOption === name));
    });
    // keep the choice in the shareable URL (default → drop the param), like theme
    if (window.State) window.State.set('motion', name === DEFAULT_TIER ? null : name);
  }

  // Init: URL param > localStorage > default
  const params = new URLSearchParams(location.search);
  const fromUrl = params.get('motion');
  const stored = getStored();
  const initial =
    (fromUrl && TIERS.includes(fromUrl)) ? fromUrl :
    (stored && TIERS.includes(stored))   ? stored :
    DEFAULT_TIER;
  applyMotion(initial);

  // Segmented control: direct pick
  document.querySelectorAll('[data-motion-option]').forEach(btn => {
    btn.addEventListener('click', () => applyMotion(btn.dataset.motionOption));
  });

  window.Motion = { apply: applyMotion, list: TIERS };
})();
