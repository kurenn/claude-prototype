/*
 * Page-specific glue.
 * Add interactive behaviors here. Keep each screen's state flowing through
 * State.set() so URLs stay shareable.
 */
(function () {
  // Reveal-on-scroll for any element with class="reveal"
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

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
  document.querySelectorAll('[data-tab]').forEach(b => {
    b.addEventListener('click', () => {
      const name = b.dataset.tab;
      window.State?.set('tab', name);
      selectTab(name);
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
