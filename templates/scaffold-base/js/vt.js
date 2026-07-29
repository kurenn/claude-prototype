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
    var id = (document.querySelector('[data-vt-detail]')||{}).dataset && document.querySelector('[data-vt-detail]').dataset.vtDetail
             || idFromUrl(e.activation.entry.url);
    var el = id && heroFor(id); if (!el) return;
    set(el, 'hero-'+id);
    e.viewTransition.finished.finally(function(){ set(el,''); });   // bfcache-safe cleanup
  });
  window.addEventListener('pagereveal', function (e) {
    if (!e.viewTransition || reduce) return;
    var self = document.querySelector('[data-vt-detail]');
    var id = (self && self.dataset.vtDetail) || idFromUrl(navigation.activation.from.url);
    var el = id && heroFor(id); if (!el) return;
    set(el, 'hero-'+id);
    e.viewTransition.ready.finally(function(){ set(el,''); });      // free name before next nav
  });
})();
