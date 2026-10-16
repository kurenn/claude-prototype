/*
 * Site-wide: margin notes. Wide screens show every .mnote open in the right-hand
 * column; narrow screens fold them behind "why" so the reading line stays clean.
 * Markup ships them open, so with no JS every note is simply visible.
 */
(function () {
  const wide = window.matchMedia('(min-width: 1100px)');
  function sync() {
    document.querySelectorAll('details.mnote').forEach(d => { d.open = wide.matches; });
  }
  sync();
  wide.addEventListener('change', sync);
})();
