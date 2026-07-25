/*
 * Page-specific glue.
 * Add interactive behaviors here. Keep each screen's state flowing through
 * State.set() so URLs stay shareable.
 */
(function () {
  // Reveal-on-scroll — mark any element class="reveal" and it fades/slides in the
  // first time it scrolls into view (see the `.reveal` rules in styles.css for the
  // actual motion). Opt-in per element; nothing reveals unless you add the class.
  //
  // Reduced-motion-safe two ways: (1) if the user has prefers-reduced-motion, skip
  // the observer entirely and just show everything — no need to watch elements that
  // are going to render at full opacity anyway; (2) styles.css also force-overrides
  // `.reveal` to its visible state under the same media query, as a belt-and-suspenders
  // backstop in case JS runs before the check below (or doesn't run at all — see next).
  // Also falls back to "just show it" if IntersectionObserver isn't available at all,
  // so an old/unusual browser never ends up with permanently-invisible content.
  //
  // Static markup only: this scan runs once at script load. `.reveal` elements added
  // later (e.g. list/card markup hydrated from data.js after this file runs) are never
  // observed and stay at opacity 0 — don't add the class to anything rendered after
  // page load. This is on top of the "sparingly, not every card in a list" UX guidance
  // in build.md.
  // Docs: reference/build.md → "Motion utilities (opt-in)".
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || typeof IntersectionObserver !== 'function') {
      revealEls.forEach(el => el.classList.add('visible'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });
      revealEls.forEach(el => io.observe(el));
    }
  }

  // Example modal wiring — replace with your own.
  // triggerEl is whatever the user clicked to open it (undefined on a
  // hydrate-from-URL open); UI.trapFocus/releaseFocus own focus while the
  // modal is open, Esc and this wiring decide *when* it closes.
  function openModal(name, triggerEl) {
    const m = document.querySelector(`[data-modal="${name}"]`);
    if (!m) return;
    m.classList.add('open');
    m.setAttribute('aria-hidden', 'false');
    window.UI?.trapFocus(m, triggerEl);
  }
  function closeModal(m) {
    m.classList.remove('open');
    m.setAttribute('aria-hidden', 'true');
    window.State?.set('modal', null);
    window.UI?.releaseFocus(m);
  }

  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const name = btn.dataset.openModal;
      window.State?.set('modal', name);
      openModal(name, btn);
    });
  });
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = btn.closest('[data-modal]');
      if (m) closeModal(m);
    });
  });
  // Esc closes whichever modal is open — completes the a11y floor
  // (SKILL.md: "moves focus in, traps Tab, restores focus on close; Esc closes").
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = document.querySelector('[data-modal].open');
    if (open) closeModal(open);
  });

  // Tab wiring example
  function selectTab(name) {
    document.querySelectorAll('[data-tab-panel]').forEach(p => {
      p.hidden = p.dataset.tabPanel !== name;
    });
    document.querySelectorAll('[data-tab]').forEach(b => {
      b.setAttribute('aria-selected', String(b.dataset.tab === name));
    });
  }
  // Wrapped in UI.withViewTransition — cross-fades the panel swap in browsers that
  // support the View Transitions API, calls selectTab(name) directly everywhere else
  // (Firefox, older Safari, reduced-motion). See ui.js for the fallback logic.
  document.querySelectorAll('[data-tab]').forEach(b => {
    b.addEventListener('click', () => {
      const name = b.dataset.tab;
      window.State?.set('tab', name);
      (window.UI?.withViewTransition || ((fn) => fn()))(() => selectTab(name));
    });
  });

  // Hydrate interactive state from URL on load
  window.State?.hydrate({
    modal: (v) => v && openModal(v),
    tab:   (v) => v && selectTab(v),
  });

  // Page-load skeletons — any container marked `data-skeleton-on-load`
  document.querySelectorAll('[data-skeleton-on-load]').forEach(container => {
    const count = parseInt(container.dataset.skeletonCount, 10) || 3;
    const duration = parseInt(container.dataset.skeletonDuration, 10) || 700;
    window.UI?.fakeLoad?.(container, duration, { count });
  });

  // Expose for console debugging
  window.App = { openModal, closeModal, selectTab };
})();
