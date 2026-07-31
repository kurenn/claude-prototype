(function () {
  if (!('startViewTransition' in document)) return;               // unsupported → plain nav
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Builder: tune this to your detail-page URL pattern (e.g. /item/<id>.html, ?id=<id>, /p/<slug>).
  // Default: the last path segment before ".html" (e.g. /listings/loft-42.html → "loft-42").
  function idFromUrl(u){ try { return (new URL(u, location.href).pathname.match(/\/([^\/]+?)\.html$/)||[])[1]||null; } catch(e){ return null; } }
  function set(el,n){ if(el) el.style.viewTransitionName = n; }
  function heroFor(id){
    return document.querySelector('[data-vt-detail="'+CSS.escape(id)+'"] [data-vt-hero]')
        || document.querySelector('[data-vt-item="'+CSS.escape(id)+'"] [data-vt-hero]');
  }
  window.addEventListener('pageswap', function (e) {
    if (!e.viewTransition || reduce) return;
    if (document.documentElement.dataset.motion === 'calm') return;  // calm: root crossfade only (CSS), no element morph
    // Destination id first: matches the clicked card via data-vt-item, or a
    // "related detail" link elsewhere on this page — so detail→detail nav names
    // the clicked card, not this page's own hero. Fall back to this page's own
    // data-vt-detail id (e.g. detail→list back-nav, where no destination id matches).
    var destId = idFromUrl(e.activation.entry.url);
    var destEl = destId && heroFor(destId);
    var selfEl = document.querySelector('[data-vt-detail]');
    var selfId = selfEl && selfEl.dataset.vtDetail;
    var id = destEl ? destId : selfId;
    var el = destEl || (id && heroFor(id));
    if (!el) return;
    set(el, 'hero-'+id);
    function clear(){ set(el,''); }
    e.viewTransition.finished.then(clear, clear);   // bfcache-safe cleanup; .then(f,f) — finished rejects when skipped
  });
  window.addEventListener('pagereveal', function (e) {
    if (!e.viewTransition || reduce) return;
    if (document.documentElement.dataset.motion === 'calm') return;  // calm: root crossfade only (CSS), no element morph
    // Own id first — the incoming page IS the detail. Fall back to guessing the
    // previous page's id from the referring URL (e.g. detail→list back-nav).
    // Guard navigation.activation: it throws in Safari 18.2-18.3, which fires
    // pagereveal with a live root transition but has no window.navigation.
    var self = document.querySelector('[data-vt-detail]');
    var act = window.navigation && navigation.activation;
    var id = (self && self.dataset.vtDetail) || (act && act.from && idFromUrl(act.from.url)) || null;
    var el = id && heroFor(id); if (!el) return;
    set(el, 'hero-'+id);
    function clear(){ set(el,''); }
    e.viewTransition.ready.then(clear, clear);      // free name before next nav; .then(f,f) — ready rejects when skipped
  });
})();
