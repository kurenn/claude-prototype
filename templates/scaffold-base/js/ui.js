/*
 * UI interaction helpers — loading, success toast, form validation.
 *
 * Baseline interaction states every prototype needs so clicks feel real:
 *   - `[data-loading="Booking..."]` on a button → click briefly shows that text
 *     then fires the configured action (navigation, modal, toast).
 *   - `[data-toast="Sent"]` on a button → click fires a toast with that text.
 *   - `[data-confirm="Really delete?"]` → click shows browser confirm first.
 *
 * Pair with empty-state sections: `<div data-empty-when="<persona>"> ... </div>`
 * hidden unless the current persona matches.
 *
 * Use programmatically from app.js:
 *   UI.toast('Message sent');
 *   UI.toast('Something failed', 'error');
 *   UI.loadingButton(btn, 800, () => { location.href = '/next.html'; });
 *
 * Modal focus trap — call from app.js's openModal/closeModal:
 *   UI.trapFocus(modalEl, triggerEl);  // on open: focus moves inside, Tab loops
 *   UI.releaseFocus(modalEl);          // on close: focus returns to triggerEl
 * Esc-to-close and click-outside-to-close stay app.js's job (they decide
 * *when* to close); this helper only owns focus while the modal is open.
 */
(function () {
  const TOAST_MS = 1600;

  // ---------- TOAST ----------
  function toast(msg, type) {
    let el = document.querySelector('.proto-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'proto-toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.remove('is-error', 'is-success');
    if (type === 'error')   el.classList.add('is-error');
    if (type === 'success') el.classList.add('is-success');
    el.classList.add('visible');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('visible'), TOAST_MS);
  }

  // ---------- LOADING BUTTON ----------
  // Shows data-loading text briefly, then runs the callback (or the original href).
  function loadingButton(btn, ms, callback) {
    if (btn.dataset.loadingActive === '1') return; // debounce double-click
    const original = btn.textContent;
    const loadingText = btn.dataset.loading || 'Loading…';
    btn.dataset.loadingActive = '1';
    btn.disabled = true;
    btn.dataset.originalText = original;
    btn.textContent = loadingText;
    btn.classList.add('is-loading');
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove('is-loading');
      btn.disabled = false;
      btn.dataset.loadingActive = '0';
      if (typeof callback === 'function') callback();
    }, ms || 600);
  }

  // ---------- WIRE DECLARATIVE ATTRIBUTES ----------
  document.addEventListener('click', (e) => {
    // In feedback pin-mode, let the overlay capture the click — don't fire loading/nav/confirm.
    if (document.body.classList.contains('proto-fb-active')) return;
    const el = e.target.closest('[data-loading], [data-toast], [data-confirm]');
    if (!el) return;

    // confirm — must come first, can cancel other actions
    if (el.dataset.confirm && !window.confirm(el.dataset.confirm)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }

    // loading + optional toast
    if (el.dataset.loading) {
      e.preventDefault();
      const href = el.getAttribute('href');
      const toastMsg = el.dataset.toast;
      loadingButton(el, 800, () => {
        if (toastMsg) toast(toastMsg, 'success');
        if (href && href !== '#') {
          // small delay so toast is visible briefly before navigation
          setTimeout(() => { location.href = href; }, toastMsg ? 400 : 0);
        }
      });
      return;
    }

    // plain toast (no loading)
    if (el.dataset.toast) {
      toast(el.dataset.toast, el.dataset.toastType || 'success');
    }
  }, true);

  // ---------- SKELETON LOADERS ----------
  // Briefly swap a container's real content for placeholder silhouettes.
  // Useful for filter changes, pagination, fake page-load animations.
  //
  //   UI.showSkeletons(resultsGrid, { count: 3 });
  //   setTimeout(() => UI.hideSkeletons(resultsGrid), 700);
  //
  // Or use the combined helper:
  //   UI.fakeLoad(resultsGrid, 700, { count: 3 });
  //
  // If no `template` option is provided, a generic card skeleton is used.
  const DEFAULT_SKELETON_TEMPLATE = `
    <article class="card skeleton-item">
      <div class="skeleton is-block"></div>
      <div style="padding: 1rem">
        <div class="skeleton is-text-lg" style="width:60%"></div>
        <div class="skeleton is-text"    style="width:40%; margin-top:.5rem"></div>
        <div class="skeleton is-text"    style="width:85%; margin-top:.75rem"></div>
      </div>
    </article>
  `;

  function showSkeletons(container, options) {
    if (!container) return;
    options = options || {};
    const count = options.count || 3;
    const template = options.template || DEFAULT_SKELETON_TEMPLATE;
    if (container.dataset.skeletonActive === '1') return;
    container.dataset.stashedContent = container.innerHTML;
    container.dataset.skeletonActive = '1';
    container.innerHTML = Array.from({ length: count }, () => template).join('');
  }

  function hideSkeletons(container) {
    if (!container || container.dataset.skeletonActive !== '1') return;
    container.innerHTML = container.dataset.stashedContent || '';
    delete container.dataset.stashedContent;
    delete container.dataset.skeletonActive;
  }

  function fakeLoad(container, duration, options) {
    showSkeletons(container, options);
    setTimeout(() => hideSkeletons(container), duration || 700);
  }

  // ---------- MODAL FOCUS TRAP ----------
  // Vanilla, dependency-free. One active trap per modal element, tracked by
  // a WeakMap so multiple modals on a page can't collide.
  const FOCUSABLE_SELECTOR = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])', 'audio[controls]', 'video[controls]',
    '[contenteditable="true"]',
  ].join(',');

  function isVisible(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  function getFocusable(container) {
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(isVisible);
  }

  const traps = new WeakMap(); // modalEl -> { trigger, onKeydown }

  // Moves focus to the first focusable element inside modalEl, then traps
  // Tab/Shift+Tab so it cycles within the modal instead of leaking to the
  // page behind it. triggerEl (usually the button that opened the modal) is
  // remembered so releaseFocus() can put focus back where the user was.
  function trapFocus(modalEl, triggerEl) {
    if (!modalEl) return;
    releaseFocus(modalEl); // clear any stale trap before re-arming

    const trigger = triggerEl || document.activeElement;
    const focusables = getFocusable(modalEl);

    if (focusables.length === 0) {
      // Nothing focusable inside — the modal itself becomes the focus target
      // so Tab has somewhere sane to land and screen readers announce it.
      if (!modalEl.hasAttribute('tabindex')) modalEl.setAttribute('tabindex', '-1');
      modalEl.focus({ preventScroll: true });
    } else {
      focusables[0].focus({ preventScroll: true });
    }

    function onKeydown(e) {
      if (e.key !== 'Tab') return;
      const items = getFocusable(modalEl);
      if (items.length === 0) { e.preventDefault(); return; }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    modalEl.addEventListener('keydown', onKeydown);
    traps.set(modalEl, { trigger, onKeydown });
  }

  // Tears down the trap and restores focus to whatever triggered the modal
  // (falls back gracefully if the trigger is gone — e.g. removed from the DOM).
  function releaseFocus(modalEl) {
    if (!modalEl) return;
    const rec = traps.get(modalEl);
    if (!rec) return;
    modalEl.removeEventListener('keydown', rec.onKeydown);
    traps.delete(modalEl);
    if (rec.trigger && typeof rec.trigger.focus === 'function' && document.contains(rec.trigger)) {
      rec.trigger.focus({ preventScroll: true });
    }
  }

  window.UI = {
    toast, loadingButton, showSkeletons, hideSkeletons, fakeLoad,
    trapFocus, releaseFocus,
  };
})();
