/*
 * Feedback overlay — always visible.
 *
 * The 💬 Feedback button ships in the control bar on every screen. Reviewers
 * can add comments without needing to discover any URL tricks.
 *
 * UX:
 *  - Press the 💬 button in the control bar to toggle comment mode + panel
 *  - Cursor becomes a crosshair; click any element to pin a comment to it
 *  - A popover opens: type a note, pick type (bug / change / question), save
 *  - Numbered pins stay visible on the element
 *  - Panel shows all comments; each can be expanded / edited / deleted
 *  - "Export" downloads feedback-{timestamp}.json
 *
 * Output JSON includes shareable_url so Claude can reproduce the exact state.
 */
(function () {
  const toggleBtn = document.querySelector('[data-feedback-toggle]');
  if (!toggleBtn) return;
  // Ensure visible (in case a template still carries .hidden)
  toggleBtn.classList.remove('hidden');

  const STORAGE_KEY = 'proto-feedback';
  let commentMode = false;
  let comments = load();

  // ---------- STORAGE ----------
  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(comments)); } catch {}
    renderPins();
  }

  // ---------- SELECTORS ----------
  // Best-effort CSS path for an element. Prefers IDs, then data-* attrs, falls
  // back to tag + :nth-of-type chain.
  function cssPathOf(el) {
    if (!(el instanceof Element)) return '';
    const path = [];
    while (el && el.nodeType === 1 && el !== document.body) {
      let sel = el.tagName.toLowerCase();
      if (el.id) { path.unshift('#' + CSS.escape(el.id)); break; }
      const dataAttr = Array.from(el.attributes).find(a => a.name.startsWith('data-') && a.name !== 'data-theme');
      if (dataAttr) {
        sel += `[${dataAttr.name}="${CSS.escape(dataAttr.value)}"]`;
      } else {
        const parent = el.parentElement;
        if (parent) {
          const siblings = Array.from(parent.children).filter(s => s.tagName === el.tagName);
          if (siblings.length > 1) sel += `:nth-of-type(${siblings.indexOf(el) + 1})`;
        }
      }
      path.unshift(sel);
      el = el.parentElement;
    }
    return path.join(' > ');
  }

  // ---------- COMMENT CAPTURE ----------
  function enterCommentMode() {
    commentMode = true;
    document.body.classList.add('proto-fb-active');
  }
  function exitCommentMode() {
    commentMode = false;
    document.body.classList.remove('proto-fb-active');
  }

  function onCaptureClick(e) {
    if (!commentMode) return;
    // ignore clicks on the overlay itself
    if (e.target.closest('.proto-fb-panel, .proto-fb-popover, [data-feedback-toggle]')) return;
    e.preventDefault();
    e.stopPropagation();
    const target = e.target;
    const rect = target.getBoundingClientRect();
    openPopover({
      x: e.clientX, y: e.clientY,
      selector: cssPathOf(target),
      element_text: (target.innerText || target.textContent || '').trim().slice(0, 100),
      coords: { x: Math.round(e.clientX), y: Math.round(e.clientY) },
      rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
    });
    exitCommentMode();
  }
  document.addEventListener('click', onCaptureClick, true);

  // ---------- POPOVER ----------
  function openPopover(ctx, existing) {
    closePopover();
    const pop = document.createElement('div');
    pop.className = 'proto-fb-popover';
    pop.style.left = Math.min(ctx.x, window.innerWidth - 300) + 'px';
    pop.style.top  = Math.min(ctx.y + 10, window.innerHeight - 220) + 'px';
    pop.innerHTML = `
      <div class="proto-fb-popover-body">
        <div class="proto-fb-types">
          <label><input type="radio" name="fb-type" value="bug"> bug</label>
          <label><input type="radio" name="fb-type" value="change" checked> change</label>
          <label><input type="radio" name="fb-type" value="question"> question</label>
        </div>
        <textarea placeholder="What's the feedback?" rows="4"></textarea>
        <div class="proto-fb-popover-actions">
          <button data-fb-cancel>Cancel</button>
          <button data-fb-save class="proto-fb-primary">Save</button>
        </div>
      </div>
    `;
    document.body.appendChild(pop);

    const textarea = pop.querySelector('textarea');
    const typeInput = () => pop.querySelector('input[name="fb-type"]:checked').value;

    if (existing) {
      textarea.value = existing.note;
      pop.querySelector(`input[value="${existing.type}"]`).checked = true;
    }
    setTimeout(() => textarea.focus(), 0);

    pop.querySelector('[data-fb-cancel]').addEventListener('click', closePopover);
    pop.querySelector('[data-fb-save]').addEventListener('click', () => {
      const note = textarea.value.trim();
      if (!note) return;
      if (existing) {
        existing.note = note;
        existing.type = typeInput();
      } else {
        comments.push({
          id: Date.now(),
          page: location.pathname.split('/').pop() || 'index.html',
          shareable_url: location.href,
          viewport: { w: window.innerWidth, h: window.innerHeight, theme: document.documentElement.dataset.theme },
          selector: ctx.selector,
          element_text: ctx.element_text,
          coords: ctx.coords,
          type: typeInput(),
          note,
          created_at: new Date().toISOString(),
        });
      }
      save();
      closePopover();
      renderPanel();
    });
  }
  function closePopover() {
    document.querySelectorAll('.proto-fb-popover').forEach(el => el.remove());
  }

  // ---------- PINS ----------
  function renderPins() {
    document.querySelectorAll('.proto-fb-pin').forEach(el => el.remove());
    const here = location.pathname.split('/').pop() || 'index.html';
    comments.filter(c => c.page === here).forEach((c, i) => {
      const pin = document.createElement('button');
      pin.className = 'proto-fb-pin';
      pin.textContent = String(i + 1);
      pin.title = `${c.type}: ${c.note.slice(0, 80)}`;
      try {
        const el = document.querySelector(c.selector);
        if (el) {
          const r = el.getBoundingClientRect();
          pin.style.left = (window.scrollX + r.right - 12) + 'px';
          pin.style.top  = (window.scrollY + r.top - 12) + 'px';
        } else {
          pin.style.left = (window.scrollX + c.coords.x) + 'px';
          pin.style.top  = (window.scrollY + c.coords.y) + 'px';
        }
      } catch {
        pin.style.left = c.coords.x + 'px';
        pin.style.top  = c.coords.y + 'px';
      }
      pin.dataset.fbId = c.id;
      pin.addEventListener('click', (e) => {
        e.preventDefault();
        openPopover({ x: e.clientX, y: e.clientY, ...c }, c);
      });
      document.body.appendChild(pin);
    });
  }
  window.addEventListener('resize', renderPins);
  window.addEventListener('scroll', renderPins, { passive: true });

  // ---------- PANEL ----------
  let panel;
  function renderPanel() {
    if (!panel) {
      panel = document.createElement('aside');
      panel.className = 'proto-fb-panel';
      document.body.appendChild(panel);
    }
    const here = location.pathname.split('/').pop() || 'index.html';
    const onThisPage = comments.filter(c => c.page === here);
    const otherPages = comments.filter(c => c.page !== here);

    panel.innerHTML = `
      <header>
        <strong>Feedback</strong>
        <span class="proto-fb-count">${comments.length}</span>
        <button data-fb-panel-close aria-label="Close">×</button>
      </header>
      <div class="proto-fb-panel-body">
        ${commentMode ? '<div class="proto-fb-hint">Click any element to pin a comment.</div>' : ''}
        ${onThisPage.length === 0 && otherPages.length === 0
          ? '<p class="proto-fb-empty">No comments yet. Click 💬 then click any element.</p>'
          : ''}
        ${renderGroup('This page', onThisPage)}
        ${renderGroup('Other pages', otherPages)}
      </div>
      <footer>
        <button data-fb-mode class="${commentMode ? 'is-on' : ''}">
          ${commentMode ? 'Cancel pin' : '+ Add comment'}
        </button>
        <button data-fb-export ${comments.length === 0 ? 'disabled' : ''}>Export JSON</button>
        <button data-fb-copy ${comments.length === 0 ? 'disabled' : ''}>Copy</button>
        <button data-fb-clear ${comments.length === 0 ? 'disabled' : ''} class="proto-fb-danger">Clear</button>
      </footer>
    `;

    panel.querySelector('[data-fb-panel-close]').addEventListener('click', () => panel.classList.remove('visible'));
    panel.querySelector('[data-fb-mode]').addEventListener('click', () => {
      commentMode ? exitCommentMode() : enterCommentMode();
      renderPanel();
    });
    panel.querySelector('[data-fb-export]').addEventListener('click', exportJSON);
    panel.querySelector('[data-fb-copy]').addEventListener('click', copyJSON);
    panel.querySelector('[data-fb-clear]').addEventListener('click', () => {
      if (confirm('Delete all feedback for this session?')) { comments = []; save(); renderPanel(); }
    });
    panel.querySelectorAll('[data-fb-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.fbDel);
        comments = comments.filter(c => c.id !== id);
        save(); renderPanel();
      });
    });
    panel.querySelectorAll('[data-fb-goto]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        location.href = a.getAttribute('href');
      });
    });
  }

  function renderGroup(title, items) {
    if (!items.length) return '';
    return `
      <h4>${title}</h4>
      <ul>
        ${items.map(c => `
          <li class="proto-fb-item proto-fb-type-${c.type}">
            <div class="proto-fb-meta">
              <span class="proto-fb-badge">${c.type}</span>
              <span class="proto-fb-page">${c.page}</span>
              <button data-fb-del="${c.id}" aria-label="Delete">×</button>
            </div>
            <p>${escapeHtml(c.note)}</p>
            <small>${escapeHtml(c.element_text || c.selector)}</small>
            <a data-fb-goto href="${c.shareable_url}">open ↗</a>
          </li>
        `).join('')}
      </ul>
    `;
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, ch => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[ch]));
  }

  // ---------- EXPORT ----------
  function buildExport() {
    return {
      prototype: document.title || 'untitled',
      session:   new Date().toISOString(),
      origin:    location.origin,
      comments,
    };
  }
  function exportJSON() {
    const data = JSON.stringify(buildExport(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `feedback-${stamp}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    window.State?.toast?.('Feedback exported');
  }
  function copyJSON() {
    const data = JSON.stringify(buildExport(), null, 2);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(data).then(() => window.State?.toast?.('Copied feedback JSON'));
    }
  }

  // ---------- WIRE ----------
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (!panel || !panel.classList.contains('visible')) {
        renderPanel();
        panel.classList.add('visible');
      } else {
        panel.classList.remove('visible');
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (commentMode) { exitCommentMode(); renderPanel(); return; }
      closePopover();
      panel?.classList.remove('visible');
    }
  });

  renderPins();
})();
