/*
 * Loading demo controls — the tweaks-bar wiring for the timing engine in ui.js.
 *
 * The engine (fake-latency + spinner-delay + minimum-visible-duration) runs by
 * default on every simulated action; this file only adds the *demo* controls in
 * #proto-controls so a reviewer can re-watch and re-time the (transient) loading:
 *
 *   - ⟳ Replay  (`data-loading-replay`)     → UI.replayLoading(): re-runs every
 *     `[data-skeleton-on-load]` container's load sequence (+ any UI.registerLoader
 *     loaders) through the engine, so the choreography can be watched again.
 *   - Speed     (`data-speed-option=...`)    → UI.setSpeed(mode): instant | real |
 *     slow, a global multiplier on every latency. "real" is the default/pressed one.
 *
 * Speed persists in localStorage (proto-speed) like theme, so a reload keeps the
 * chosen pace. UI.setSpeed already syncs each button's aria-pressed; this file just
 * restores the stored value on load and wires the clicks. Keep the STORAGE_KEY in
 * sync with ui.js's SPEED_KEY.
 */
(function () {
  const SPEEDS = ['instant', 'real', 'slow'];
  const STORAGE_KEY = (window.PROTO_NS || 'proto-') + 'speed'; // mirrors SPEED_KEY in js/ui.js

  function getStored() { try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; } }

  // Init: URL param > localStorage > default ('real'). UI.setSpeed persists + syncs
  // the segmented control's aria-pressed, so a single call restores full state.
  const params = new URLSearchParams(location.search);
  const fromUrl = params.get('speed');
  const stored = getStored();
  const initial =
    (fromUrl && SPEEDS.includes(fromUrl)) ? fromUrl :
    (stored && SPEEDS.includes(stored))   ? stored :
    'real';
  window.UI && window.UI.setSpeed(initial);

  // Speed segmented control — direct pick.
  document.querySelectorAll('[data-speed-option]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      window.UI && window.UI.setSpeed(btn.dataset.speedOption);
    });
  });

  // ⟳ Replay — re-run the load choreography so it can be watched again.
  document.querySelectorAll('[data-loading-replay]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      window.UI && window.UI.replayLoading();
    });
  });

  // Hide the whole Loading control (Replay + Speed) when the page simulates no loading —
  // no `[data-skeleton-on-load]` region and no registered loader. Otherwise ⟳ Replay does
  // nothing and reads as broken. Re-evaluated at window.load (after DOMContentLoaded
  // handlers have registered their loaders) and whenever a loader registers later.
  function syncLoadingVisibility() {
    if (!window.UI || typeof window.UI.hasLoaders !== 'function') return;
    var replay = document.querySelector('[data-loading-replay]');
    var section = replay && replay.closest('.proto-bar-section');
    if (!section) return;
    section.hidden = !window.UI.hasLoaders();
  }
  document.addEventListener('proto:loaders-changed', syncLoadingVisibility);
  if (document.readyState === 'complete') syncLoadingVisibility();
  else window.addEventListener('load', syncLoadingVisibility);
})();
