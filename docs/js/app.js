/*
 * Landing-page interactions.
 * - Copy-to-clipboard on code blocks
 * - Smooth anchor scroll with offset for sticky nav
 * - Sticky nav active-section highlight (IntersectionObserver)
 * - Modal (URL-state wired)
 * - Persona skeleton flash (150ms) on switch to sell the illusion
 */
(function () {
  // --- Copy-to-clipboard ---
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const targetSel = btn.dataset.copy;
      const target = targetSel ? document.querySelector(targetSel) : btn.closest('.code-block')?.querySelector('code');
      if (!target) return;
      const text = target.innerText.replace(/^\$\s*/gm, '').trim();
      try {
        await navigator.clipboard.writeText(text);
        btn.classList.add('is-copied');
        window.UI?.toast('Copied to clipboard', 'success');
        setTimeout(() => btn.classList.remove('is-copied'), 1500);
      } catch (e) {
        window.UI?.toast('Copy failed', 'error');
      }
    });
  });

  // --- Smooth anchor scroll ---
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      const y = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: 'smooth' });
      history.replaceState(null, '', '#' + id);
    });
  });

  // --- Sticky nav active-section ---
  const navLinks = Array.from(document.querySelectorAll('.site-nav a[data-nav-link]'));
  const sectionMap = new Map();
  navLinks.forEach(a => {
    const id = a.getAttribute('href').slice(1);
    const sec = document.getElementById(id);
    if (sec) sectionMap.set(sec, a);
  });
  if (sectionMap.size > 0) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          navLinks.forEach(l => l.classList.remove('is-active'));
          sectionMap.get(e.target)?.classList.add('is-active');
        }
      });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
    sectionMap.forEach((_link, sec) => io.observe(sec));
  }

  // --- Modal wiring ---
  function openModal(name) {
    const m = document.querySelector(`[data-modal="${name}"]`);
    if (!m) return;
    m.classList.add('open');
    m.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(m) {
    m.classList.remove('open');
    m.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    window.State?.set('modal', null);
  }
  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const name = btn.dataset.openModal;
      window.State?.set('modal', name);
      openModal(name);
    });
  });
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = btn.closest('[data-modal]');
      if (m) closeModal(m);
    });
  });
  document.querySelectorAll('[data-modal]').forEach(m => {
    m.addEventListener('click', (e) => { if (e.target === m) closeModal(m); });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const open = document.querySelector('[data-modal].open');
      if (open) closeModal(open);
    }
  });

  // --- Tabs (used in the modal preview) ---
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

  // --- Hydrate URL state on load ---
  window.State?.hydrate({
    modal: (v) => v && openModal(v),
    tab:   (v) => v && selectTab(v),
  });

  // --- Persona skeleton flash ---
  document.addEventListener('persona:applied', () => {
    document.querySelectorAll('[data-persona-flash]').forEach(el => {
      el.classList.add('is-flashing');
      setTimeout(() => el.classList.remove('is-flashing'), 180);
    });
  });

  // --- Shift+? recent-screens drawer is handled in state.js; nothing to do here. ---

  window.App = { openModal, closeModal, selectTab };
})();
