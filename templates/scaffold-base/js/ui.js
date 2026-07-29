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
 *   UI.withViewTransition(() => selectTab('billing')); // cross-fade a same-doc update, opt-in
 *
 * Copy-to-clipboard as a label swap (no toast — the label change IS the feedback):
 *   `[data-copy="npm install acme-cli"]` on a button → click copies the text and
 *   swaps the button's own label to "Copied!" for ~1.2s, then reverts.
 *   UI.copyButton(btn, text);  // same behavior, for values only known at click time
 * See reference/microinteractions.md for the full recipe.
 *
 * Undo toast — prefer over a blocking confirm() for reversible actions:
 *   UI.undoToast('Archived "Q3 report"', () => restoreItem(id));  // 6s window by default
 *   UI.undoToast('Removed from list', () => restoreItem(id), 8000); // custom window
 * Calls onUndo if the user clicks Undo within `ms`; otherwise just dismisses and
 * the change stands.
 */
(function () {
  const TOAST_MS = 1600;

  // ---------- TIMING ENGINE (fake-latency) ----------
  // Prototypes have no backend, so loading is *simulated*. The two failure modes
  // are "instant" (every read is free, nothing ever feels like work) and "bare
  // spinner" (a loader that flashes or blinks). This engine fixes both: tiered,
  // non-uniform latency per action *kind*, scaled by a global demo speed, plus a
  // spinner-delay + minimum-visible-duration discipline (withLoader) so loaders
  // never flash on a fast "call" or blink out on a slow one. Every simulated
  // action (fakeLoad, loadingButton, a build's own fakeCall) flows through here.
  // See reference/microinteractions.md → "Simulated latency (the timing engine)".
  const SPEED = { instant: 0, real: 1, slow: 2.5 };   // global multiplier on every latency
  let speedMode = 'real';                             // the tweaks-bar Speed control changes this

  // Per-kind base durations (ms) with ±45% jitter so repeated calls never feel
  // metronomic. nav is a cheap route change; read fetches a list/detail; mutate is
  // a save/submit; upload is the deliberately-slow outlier.
  function fakeLatency(kind) {
    const base = ({ nav: 220, read: 700, mutate: 380, upload: 2200 })[kind] || 600;
    const jitter = 0.45; // ±45%, never uniform
    return (base * (1 - jitter) + Math.random() * base * 2 * jitter) * SPEED[speedMode];
  }

  // Await a simulated call; may reject. `opts.failRate` (0–1) lets a build demo the
  // error path deterministically-ish: `await UI.fakeCall('mutate', { failRate: 1 })`.
  function fakeCall(kind, opts) {
    opts = opts || {};
    return new Promise(function (res, rej) {
      setTimeout(function () {
        (Math.random() < (opts.failRate || 0)) ? rej(new Error('simulated failure')) : res();
      }, fakeLatency(kind || 'read'));
    });
  }

  // Spinner-delay + minimum-visible-duration so loaders never flash/blink:
  //   - `delay` (300ms): don't show the loader at all until the work has been
  //     running this long — a sub-300ms "call" completes with no visible loader.
  //   - `minVisible` (500ms): once shown, keep it up at least this long so it can't
  //     blink out the instant the work resolves a hair later.
  // `work` is a function returning a value/Promise. `show`/`hide` toggle the visual
  // (skeletons, aria-busy, announce). Resolves after hide; re-throws work's rejection.
  function withLoader(work, o) {
    o = o || {};
    const delay = o.delay == null ? 300 : o.delay;
    const minVis = o.minVisible == null ? 500 : o.minVisible;
    let shownAt = 0;
    const t = setTimeout(function () { shownAt = Date.now(); o.show && o.show(); }, delay);
    return Promise.resolve().then(work).then(finish, function (e) { finish(); throw e; });
    function finish() {
      clearTimeout(t);
      if (shownAt) {
        const left = minVis - (Date.now() - shownAt);
        if (left > 0) return new Promise(function (r) { setTimeout(function () { o.hide && o.hide(); r(); }, left); });
      }
      o.hide && o.hide();
    }
  }

  // Change the global demo speed. Persists like theme (localStorage) and keeps any
  // [data-speed-option] segmented buttons' aria-pressed in sync. js/loading.js wires
  // the control bar to this and restores the persisted value on load.
  const SPEED_KEY = 'proto-speed';
  function setSpeed(mode) {
    if (SPEED[mode] == null) return;
    speedMode = mode;
    try { localStorage.setItem(SPEED_KEY, mode); } catch (e) {}
    document.querySelectorAll('[data-speed-option]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.speedOption === mode));
    });
  }
  function getSpeed() { return speedMode; }

  // Replay every page-load loading choreography so the (transient) loading can be
  // *demo'd* — re-runs each `[data-skeleton-on-load]` container through the engine
  // (speed-aware: no fixed duration, so fakeLatency('read') governs it) plus any
  // loaders a build registered via UI.registerLoader(). Wired to ⟳ Replay in the bar.
  const customLoaders = [];
  function registerLoader(fn) { if (typeof fn === 'function') customLoaders.push(fn); }
  function replayLoading() {
    document.querySelectorAll('[data-skeleton-on-load]').forEach(function (container) {
      if (container.dataset.skeletonActive === '1') return; // already mid-load — don't stack
      const count = parseInt(container.dataset.skeletonCount, 10) || 3;
      fakeLoad(container, null, { count: count }); // null duration → engine-timed, speed-aware
    });
    customLoaders.forEach(function (fn) { try { fn(); } catch (e) { console.warn('replayLoading', e); } });
  }

  // ---------- A11Y LOADING SPINE ----------
  // One shared polite live region every loader speaks through, created lazily like
  // .proto-toast. Skeleton bars themselves stay decorative (aria-hidden by nature —
  // they're empty silhouettes); the announcement + aria-busy on the region is what a
  // screen reader hears. announce('') is ignored so a stray call can't blank it.
  function announce(msg) {
    if (msg == null || msg === '') return;
    let el = document.querySelector('.proto-status');
    if (!el) {
      el = document.createElement('div');
      el.className = 'proto-status sr-only';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    // Clear then set on the next frame so an identical repeat message (e.g. "Loading…"
    // twice across a Replay) still triggers the live region instead of being deduped.
    el.textContent = '';
    const set = function () { el.textContent = msg; };
    if (window.requestAnimationFrame) window.requestAnimationFrame(set); // bound to window — no brand-check throw
    else setTimeout(set, 0);
  }

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
    // A still-armed undoToast() may have left its hover/focus-pause listeners on
    // this (shared, reused) element — drop them so they can't hijack this toast's
    // timer later (see undoToast()'s matching set-up below).
    if (el._undoPause) { el.removeEventListener('mouseenter', el._undoPause); el._undoPause = null; }
    if (el._undoArm)   { el.removeEventListener('mouseleave', el._undoArm);   el._undoArm = null; }
    el.textContent = msg;
    el.classList.remove('is-error', 'is-success', 'has-undo');
    if (type === 'error')   el.classList.add('is-error');
    if (type === 'success') el.classList.add('is-success');
    el.classList.add('visible');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('visible'), TOAST_MS);
  }

  // ---------- UNDO TOAST ----------
  // Portions adapted from Hallmark (MIT): prefer optimistic update + Undo over a
  // blocking confirm() dialog for anything reversible (archive, remove-from-list,
  // mark-read). Do the thing immediately, then offer a window to change course.
  //
  //   item.archived = true; renderList();               // optimistic — apply first
  //   UI.undoToast(`Archived "${item.name}"`, () => {
  //     item.archived = false; renderList();             // rollback
  //   });
  //
  // Reuses the same .proto-toast element as toast() above (only one toast — plain
  // or undo — is ever on screen at once). Calls onUndo if the user clicks Undo
  // within `ms` (default 6000 — longer than a plain toast's dwell, since the user
  // has to read the offer and decide); otherwise just dismisses and the change
  // stands. See reference/microinteractions.md for the full recipe.
  function undoToast(msg, onUndo, ms) {
    let el = document.querySelector('.proto-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'proto-toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    // Drop a still-armed previous undo's hover/focus-pause listeners before
    // rebuilding — they're closed over the old dismiss()/dismissMs and would
    // otherwise stack on this shared, reused element across repeated calls.
    if (el._undoPause) { el.removeEventListener('mouseenter', el._undoPause); el._undoPause = null; }
    if (el._undoArm)   { el.removeEventListener('mouseleave', el._undoArm);   el._undoArm = null; }

    el.classList.remove('is-error', 'is-success');
    el.innerHTML = '';
    const msgEl = document.createElement('span');
    msgEl.className = 'proto-toast-msg';
    msgEl.appendChild(document.createTextNode(msg));
    el.appendChild(msgEl);

    const dismissMs = ms || 6000;

    function dismiss() {
      clearTimeout(el._t);
      el.classList.remove('visible', 'has-undo');
    }
    function pause() { clearTimeout(el._t); } // hover/focus on the Undo control — don't dismiss out from under the user
    function arm()   { clearTimeout(el._t); el._t = setTimeout(dismiss, dismissMs); }

    if (typeof onUndo === 'function') {
      const undoBtn = document.createElement('button');
      undoBtn.type = 'button';
      undoBtn.className = 'proto-toast-undo'; // styled in styles.css, incl. pointer-events:auto
      undoBtn.textContent = 'Undo';
      undoBtn.addEventListener('click', () => {
        dismiss();
        onUndo();
      });
      undoBtn.addEventListener('focus', pause);
      undoBtn.addEventListener('blur', arm);
      undoBtn.addEventListener('keydown', (e) => { if (e.key === 'Escape') dismiss(); });
      el.appendChild(undoBtn);
      el.classList.add('has-undo');
      el._undoPause = pause;
      el._undoArm = arm;
      el.addEventListener('mouseenter', pause);
      el.addEventListener('mouseleave', arm);
    }

    el.classList.add('visible');
    arm();
  }

  // ---------- LOADING BUTTON ----------
  // Shows data-loading text briefly, then runs the callback (or the original href).
  // `ms` is optional: pass a number to pin the duration (back-compat), or omit it
  // (null/undefined) to let the timing engine pick — fakeLatency('mutate'), so the
  // button's "work" scales with the global Speed control like every other simulated
  // call. A save/submit is a `mutate`, hence that tier.
  function loadingButton(btn, ms, callback) {
    if (btn.dataset.loadingActive === '1') return; // debounce double-click
    const wait = (ms == null) ? fakeLatency('mutate') : ms;
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
    }, wait);
  }

  // ---------- COPY TO CLIPBOARD (label swap) ----------
  // Portions adapted from Hallmark (MIT): the button's own label IS the feedback —
  // no toast for a copy action. Swaps `btn`'s textContent to a success label for
  // ~1.2s, then reverts. Always copies on click — re-clicks re-copy (harmless,
  // same text) and re-arm the revert timer (the old one is cleared, so reverts
  // never stack). `is-copied` is a plain styling hook (like `.is-loading`
  // elsewhere) if a build wants to visually differentiate the copied state.
  //
  //   UI.copyButton(btn, 'https://example.com/share/abc');
  //
  // Declaratively: <button data-copy="npm install acme-cli">Copy</button> — wired
  // by the delegated click listener below, no JS needed on the screen. Override the
  // success label with `data-copy-success="Link copied!"`.
  function copyButton(btn, text, ms) {
    if (!btn) return;
    // The label swap below is the only feedback (see module comment) — make it
    // announced to screen readers too. Set synchronously, before the clipboard
    // write resolves, so the live region is registered in time to catch it.
    if (!btn.hasAttribute('aria-live')) btn.setAttribute('aria-live', 'polite');

    const successLabel = btn.dataset.copySuccess || 'Copied!';
    const revertMs = ms || 1200;
    // Capture the pre-copy label only when the button isn't already showing the
    // success state — otherwise a re-click mid-window (before the previous
    // revert fires) would capture "Copied!" itself as the thing to revert to.
    const original = btn.dataset.copyActive === '1' ? btn._copyOriginal : btn.textContent;
    btn._copyOriginal = original;

    function swapLabel() {
      btn.dataset.copyActive = '1';
      btn.textContent = successLabel;
      btn.classList.add('is-copied');
      clearTimeout(btn._copyT);
      btn._copyT = setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove('is-copied');
        btn.dataset.copyActive = '0';
      }, revertMs);
    }

    function fallbackCopy() {
      // execCommand fallback for http:// contexts without the Clipboard API —
      // same pattern state.js's copyShareUrl already uses.
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch {}
      document.body.removeChild(ta);
      btn.focus(); // ta.select() stole focus onto the textarea — give the ring back
      if (ok) swapLabel(); // only claim success if the copy actually happened
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(swapLabel, fallbackCopy);
    } else {
      fallbackCopy();
    }
  }

  // ---------- WIRE DECLARATIVE ATTRIBUTES ----------
  document.addEventListener('click', (e) => {
    // In feedback pin-mode, let the overlay capture the click — don't fire loading/nav/confirm.
    if (document.body.classList.contains('proto-fb-active')) return;
    const el = e.target.closest('[data-loading], [data-toast], [data-confirm], [data-copy]');
    if (!el) return;

    // confirm — must come first, can cancel other actions
    if (el.dataset.confirm && !window.confirm(el.dataset.confirm)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }

    // copy-to-clipboard — label swap only, no toast (see reference/microinteractions.md).
    // Truthy (not `!== undefined`) like the other attributes below — `data-copy=""`
    // has nothing to copy, so skip it rather than writing an empty string.
    if (el.dataset.copy) {
      e.preventDefault();
      copyButton(el, el.dataset.copy);
      return;
    }

    // loading + optional toast — `null` duration lets the engine pick
    // fakeLatency('mutate'), so [data-loading] buttons honor the Speed control.
    if (el.dataset.loading) {
      e.preventDefault();
      const href = el.getAttribute('href');
      const toastMsg = el.dataset.toast;
      loadingButton(el, null, () => {
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
    const skeletonMarkup = Array.from({ length: count }, () => template).join('');
    container.dataset.skeletonMarkup = skeletonMarkup;
    container.dataset.skeletonActive = '1';
    container.innerHTML = skeletonMarkup;
  }

  function hideSkeletons(container) {
    if (!container || container.dataset.skeletonActive !== '1') return;
    // Guard: if a render function already replaced the skeleton content (common
    // for containers a build fills itself rather than via data-skeleton-on-load),
    // the container no longer matches what we injected — skip the restore so we
    // don't stomp real content with the stale pre-skeleton snapshot. Flags still
    // get cleared either way so a later showSkeletons() call isn't a no-op.
    if (container.innerHTML === container.dataset.skeletonMarkup) {
      container.innerHTML = container.dataset.stashedContent || '';
    }
    delete container.dataset.stashedContent;
    delete container.dataset.skeletonMarkup;
    delete container.dataset.skeletonActive;
  }

  // Show a container's skeletons for a simulated read, then restore. Back-compatible
  // signature — `duration` still pins the wait when a number is passed (e.g. the
  // documented `UI.fakeLoad(grid, 650, { count: 6 })` from a filter handler) — but
  // now runs the timing engine underneath:
  //   - `duration == null` → fakeLatency('read'), so it's speed-aware (Replay/Speed).
  //   - withLoader discipline: a sub-300ms read never flashes a skeleton; a skeleton
  //     that does show stays up ≥500ms so it can't blink out.
  //   - the container gets aria-busy + a polite "Loading…"/"Loaded." announcement.
  // Returns the withLoader promise (older callers ignored the return — still fine).
  function fakeLoad(container, duration, options) {
    if (!container) return Promise.resolve();
    options = options || {};
    const dur = duration == null ? fakeLatency('read') : duration;
    return withLoader(
      function () { return new Promise(function (r) { setTimeout(r, dur); }); },
      {
        delay: options.delay,
        minVisible: options.minVisible,
        show: function () {
          showSkeletons(container, options);
          container.setAttribute('aria-busy', 'true');
          announce('Loading…');
        },
        hide: function () {
          hideSkeletons(container);
          container.setAttribute('aria-busy', 'false');
          announce('Loaded.');
        },
      }
    );
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

    // Listens on document (not modalEl) because focus can land on <body> or
    // any other element outside the modal (e.g. after clicking non-interactive
    // modal text) — a listener scoped to modalEl would never see Tab in that
    // case, letting focus walk the page behind the overlay.
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
      } else if (!modalEl.contains(document.activeElement)) {
        // Focus is outside the modal entirely (e.g. started on <body>) —
        // pull it back in rather than letting Tab continue from there.
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    }
    // Belt-and-suspenders: if focus ends up outside modalEl by any means
    // other than Tab (e.g. a programmatic .focus() elsewhere), snap it back
    // to the first focusable element inside.
    function onFocusIn(e) {
      if (modalEl.contains(e.target)) return;
      const items = getFocusable(modalEl);
      (items[0] || modalEl).focus({ preventScroll: true });
    }
    document.addEventListener('keydown', onKeydown, true);
    document.addEventListener('focusin', onFocusIn, true);
    traps.set(modalEl, { trigger, onKeydown, onFocusIn });
  }

  // Tears down the trap and restores focus to whatever triggered the modal
  // (falls back gracefully if the trigger is gone — e.g. removed from the DOM).
  function releaseFocus(modalEl) {
    if (!modalEl) return;
    const rec = traps.get(modalEl);
    if (!rec) return;
    document.removeEventListener('keydown', rec.onKeydown, true);
    document.removeEventListener('focusin', rec.onFocusIn, true);
    traps.delete(modalEl);
    if (rec.trigger && typeof rec.trigger.focus === 'function' && document.contains(rec.trigger)) {
      rec.trigger.focus({ preventScroll: true });
    }
  }

  // ---------- VIEW TRANSITIONS (same-doc, opt-in) ----------
  // Wrap a same-document DOM update (tab switch, filter re-render, persona swap) so it
  // cross-fades instead of snapping:
  //
  //   UI.withViewTransition(() => selectTab(name));
  //
  // Falls back to just running `fn` synchronously — same result, no animation — when
  // `document.startViewTransition` isn't supported (older Safari; Firefox shipped same-doc
  // support in Firefox 144 — it's cross-document View Transitions, used by js/vt.js, that
  // Firefox still lacks) or the user has prefers-reduced-motion set. Never gate correctness
  // on this running; it's a visual upgrade, not a step the callback depends on.
  //
  // Adds a `.vt-same-doc` class to <html> for the transition's lifetime so styles.css can
  // give the root a crossfade instead of the directional page-nav slide — both same-doc
  // and cross-doc transitions produce the same ::view-transition-*(root) pseudos, so
  // without this the class-less rule would apply to both. `.then(clear, clear)` (not
  // `.finally`) because `finished` rejects when a transition is skipped, and `.finally`
  // would leave that rejection unhandled.
  function withViewTransition(fn) {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || typeof document.startViewTransition !== 'function') {
      fn();
      return;
    }
    document.documentElement.classList.add('vt-same-doc');
    const t = document.startViewTransition(fn);
    function clear() { document.documentElement.classList.remove('vt-same-doc'); }
    t.finished.then(clear, clear);
  }

  window.UI = {
    toast, undoToast, copyButton, loadingButton,
    showSkeletons, hideSkeletons, fakeLoad,
    trapFocus, releaseFocus, withViewTransition,
    // timing engine + a11y loading spine
    fakeLatency, fakeCall, withLoader,
    setSpeed, getSpeed, replayLoading, registerLoader, announce,
  };
})();
