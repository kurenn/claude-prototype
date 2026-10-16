/*
 * design.html — one vendored DESIGN.md, drawn from docs/designs/<slug>.json.
 * The page frame stays the site's; the preview pane switches to the file's own
 * palette and fonts (free substitutes for proprietary faces, loaded from Google Fonts).
 * File content is untrusted text: everything goes in via textContent / esc(), and
 * CSS values are scrubbed before they reach a style attribute.
 */
(function () {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // Token values land in style="" — allow plain CSS values only (no url(), no breakouts).
  const css = v => String(v == null ? '' : v).replace(/url\s*\(|expression|[;{}<>"'\\]/gi, '');
  const GENERIC = /^(serif|sans-serif|monospace|system-ui|cursive|ui-\w+)$/i;

  if (!State.get('f')) { location.replace('designs.html'); return; }
  const slug = State.get('f').toLowerCase().replace(/[^a-z0-9.\-]/g, '');
  const human = k => String(k || '').replace(/-/g, ' ').replace(/^./, c => c.toUpperCase());
  const BRIEF = {
    'AI & LLM Platforms': 'a chat assistant', 'Developer Tools & IDEs': 'a developer tool landing page',
    'Backend, Database & DevOps': 'a database dashboard', 'Productivity & SaaS': 'a team workspace',
    'Design & Creative Tools': 'a design tool', 'Fintech & Crypto': 'a banking app',
    'E-commerce & Retail': 'an online store', 'Media & Consumer Tech': 'a product launch page',
    'Automotive': 'a car configurator', 'Retro Web · DESIGN.md Nostalgia': 'a retro homepage',
  };

  // ---- fonts: each family in its own <link> so one missing family can't sink the rest ----
  const fontCache = {};
  function loadFont(fam) {
    if (!fam || GENERIC.test(fam)) return Promise.resolve(false);
    if (fontCache[fam]) return fontCache[fam];
    const url = axes => 'https://fonts.googleapis.com/css2?family=' +
      encodeURIComponent(fam).replace(/%20/g, '+') + axes + '&display=swap';
    const attach = href => new Promise(res => {
      const l = document.createElement('link');
      l.rel = 'stylesheet'; l.href = href;
      l.onload = () => res(true); l.onerror = () => { l.remove(); res(false); };
      document.head.appendChild(l);
    });
    return (fontCache[fam] = attach(url(':wght@400;500;600;700'))
      .then(ok => ok || attach(url('')))           // some families lack a weight: retry plain
      .then(ok => ok && document.fonts.load('16px "' + fam + '"').then(f => f.length > 0))
      .catch(() => false));
  }
  const genericOf = stack => (String(stack || '').split(',').map(s => s.trim()).find(s => GENERIC.test(s)) || 'sans-serif');
  function fontCss(t) {
    if (!t || typeof t !== 'object') return '';
    return [
      t.preview && `font-family:'${css(t.preview)}', ${css(genericOf(t.fontFamily))}`,
      t.fontSize && `font-size:min(${css(t.fontSize)}, 12vw)`,
      t.fontWeight && `font-weight:${css(t.fontWeight)}`,
      t.lineHeight && `line-height:${css(t.lineHeight)}`,
      t.letterSpacing && `letter-spacing:${css(t.letterSpacing)}`,
    ].filter(Boolean).join(';');
  }
  function styleOf(spec) {
    if (!spec) return '';
    return [
      spec.backgroundColor && `background:${css(spec.backgroundColor)}`,
      spec.textColor && `color:${css(spec.textColor)}`,
      spec.rounded && `border-radius:${css(spec.rounded)}`,
      spec.padding && `padding:${css(spec.padding)}`,
      spec.height && `min-height:${css(spec.height)}`,
      spec.borderColor && `border:1px solid ${css(spec.borderColor)}`,
      spec.border && `border:${css(spec.border)}`,
      fontCss(spec.typography),
    ].filter(Boolean).join(';');
  }

  // ---- picking roles out of free-form token names ----
  const isHex = v => typeof v === 'string' && /^#[0-9a-f]{3,8}$/i.test(v);
  function pick(map, keys) {
    for (const k of keys) if (isHex(map[k])) return map[k];
    return null;
  }
  function role(typo, re) {
    const k = Object.keys(typo).find(n => re.test(n));
    return k ? typo[k] : null;
  }
  function comp(components, re, not) {
    const k = Object.keys(components).find(n => re.test(n) && !(not && not.test(n)));
    return k ? [k, components[k]] : [null, null];
  }
  function firstSentence(s) { return (String(s).match(/^[^.]*[.]?/) || [''])[0].trim(); }
  function tagline(summary) {   // "Anthropic's AI assistant. Warm terracotta…" → the design half
    const parts = String(summary).split('. ');
    return (parts.length > 1 ? parts.slice(1).join('. ') : parts[0]).replace(/\.$/, '') + '.';
  }

  // ---- preview: the file's tokens, drawn ----
  function surfaces(d) {
    const C = d.tokens.colors || {};
    const byGroup = re => (d.colors.find(c => re.test(c.group) || re.test(c.name)) || {}).hex;
    const light = {
      bg: pick(C, ['canvas', 'background', 'surface', 'bg', 'page', 'paper', 'base', 'white']) || byGroup(/surface|background|canvas|neutral/i) || '#ffffff',
      ink: pick(C, ['ink', 'text', 'foreground', 'on-surface', 'on-background', 'body-strong', 'body', 'black']) || byGroup(/text|ink/i) || '#111111',
      muted: pick(C, ['muted', 'body', 'text-secondary', 'ink-muted', 'gray']),
    };
    const darkBg = pick(C, ['surface-dark', 'canvas-dark', 'background-dark', 'dark', 'surface-dark-elevated']);
    const dark = darkBg && {
      bg: darkBg,
      ink: pick(C, ['on-dark', 'text-on-dark', 'ink-on-dark', 'canvas', 'background', 'white']) || '#ffffff',
      muted: pick(C, ['on-dark-soft', 'on-dark-muted', 'muted-on-dark']),
    };
    return { light, dark };
  }

  function renderPreview(d, mode) {
    const s = surfaces(d)[mode] || surfaces(d).light;
    const T = d.typography, K = d.components;
    const display = role(T, /^(display|headline|hero|h1)/i);
    const title = role(T, /^(title|heading|h2|h3|subhead)/i);
    const body = role(T, /^body/i) || role(T, /^(text|paragraph)/i);
    const caption = role(T, /^(caption|label|eyebrow|overline)/i);
    const dark = mode === 'dark';
    const STATE = /pressed|active|disabled|hover|focus/i;
    let [pName, primary] = comp(K, /^button-primary$|^button$|^cta-button$/i);
    if (!primary) [pName, primary] = comp(K, /^button-primary/i, STATE);  // e.g. button-primary-pill
    if (!primary) [pName, primary] = comp(K, /^button-/i, new RegExp(STATE.source + '|ghost|outline|secondary|on-dark|mini', 'i'));
    // Dark mode prefers the file's on-dark variants, else falls back to the light ones.
    let [sName, secondary] = dark ? comp(K, /^button-.*on-dark/i) : [null, null];
    if (!secondary) [sName, secondary] = comp(K, /^button-(secondary|outline|ghost|tertiary)$/i);
    let [cName, card] = dark ? comp(K, /card.*dark|dark.*card/i) : [null, null];
    if (!card) [cName, card] = comp(K, /^feature-card$/i);
    if (!card) [cName, card] = comp(K, /(^|-)card$|^card/i, /dark|cookie|featured|coral/i);
    const [iName, input] = comp(K, /^(text-)?input$|^text-input$|^input-field$/i);
    const badges = Object.keys(K).filter(n => /^(badge|tag|chip|pill)/i.test(n)).slice(0, 3);
    const spec = (name, c) => c ? [c.backgroundColor && 'bg ' + c.backgroundColor, c.rounded && 'radius ' + c.rounded, c.padding && 'pad ' + c.padding].filter(Boolean).join(' · ') : '';

    const el = $('[data-df-preview]');
    el.style.cssText = `background:${css(s.bg)};color:${css(s.ink)}`;
    el.innerHTML = `
      <div class="dfp-stack">
        ${caption ? `<p class="dfp-caption" style="${fontCss(caption)};${s.muted ? 'color:' + css(s.muted) : ''}">${esc(d.category)}</p>` : ''}
        <h3 class="dfp-display" style="${fontCss(display || title)}">${esc(tagline(d.summary))}</h3>
        <p class="dfp-body" style="${fontCss(body)};${s.muted ? 'color:' + css(s.muted) : ''}">${esc(firstSentence(d.description) || d.summary)}</p>
        <div class="dfp-row">
          ${primary ? `<span class="dfp-btn" style="${styleOf(primary)}">Get started</span>` : ''}
          ${secondary ? `<span class="dfp-btn" style="${styleOf(secondary)}">Learn more</span>` : ''}
        </div>
        ${badges.length ? `<div class="dfp-row">${badges.map(b => `<span class="dfp-badge" style="${styleOf(K[b])}">${esc(human(b))}</span>`).join('')}</div>` : ''}
      </div>
      <div class="dfp-side">
        ${card ? `<div class="dfp-card" style="${styleOf(card)}">
            <p class="dfp-card-title" style="${fontCss(title || body)}">${esc(human(cName))}</p>
            <p class="dfp-card-meta">${esc(cName)} · ${esc(spec(cName, card))}</p>
          </div>` : ''}
        ${input ? `<span class="dfp-input" style="${styleOf(input)}">Email address</span>` : ''}
      </div>`;

    const used = [pName && primary, sName && secondary, cName && card, iName && input].filter(Boolean).length + badges.length;
    $('[data-df-preview-note]').textContent = d.structured && used
      ? `Drawn from ${[pName, sName, cName, iName, ...badges].filter(Boolean).join(', ')} in the file's tokens.`
      : 'This file lists colours and type in prose only, so the preview uses its palette and fonts without component specs.';
  }

  // ---- palette ----
  function renderPalette(d) {
    const groups = {};
    d.colors.forEach(c => (groups[c.group] = groups[c.group] || []).push(c));
    $('[data-df-palette]').innerHTML = `<p class="df-note">Click a colour to copy its hex.</p>` + Object.entries(groups).map(([g, cs]) => `
      <h3 class="df-h3">${esc(g)}</h3>
      <ul class="df-swatches">${cs.map(c => `
        <li class="df-swatch">
          <button type="button" class="df-chip-color" style="background:${css(c.hex)}" data-copy="${esc(c.hex)}" data-copy-success="✓" aria-label="Copy ${esc(c.name)} ${esc(c.hex)}"></button>
          <div class="df-swatch-text">
            <p class="df-swatch-name">${esc(c.name)} <span class="df-mono">${esc(c.hex)}</span></p>
            ${c.role ? `<p class="df-swatch-role">${esc(c.role)}</p>` : ''}
          </div>
        </li>`).join('')}
      </ul>`).join('');
  }

  // ---- type ----
  function renderType(d) {
    const fams = {};
    Object.values(d.typography).forEach(t => {
      const orig = String(t.fontFamily || '').split(',')[0].trim();
      if (orig && !GENERIC.test(orig)) fams[orig] = t.preview || orig;
    });
    $('[data-df-fonts]').innerHTML = Object.keys(fams).length ? `<ul class="df-fonts">${
      Object.entries(fams).map(([orig, prev]) => `
        <li class="df-font" data-font="${esc(prev)}">
          <p class="df-font-name" style="font-family:'${css(prev)}', serif">${esc(orig)}</p>
          <p class="df-font-status" data-font-status>${orig === prev ? 'checking Google Fonts…' : 'proprietary · shown in ' + esc(prev) + ', its named free substitute'}</p>
        </li>`).join('')}</ul>${d.substitutesNote ? `<blockquote class="df-quote">${esc(d.substitutesNote.replace(/\*\*/g, ''))}</blockquote>` : ''}`
      : `<p class="df-note">${d.substitutesNote ? esc(d.substitutesNote.replace(/\*\*/g, '')) : 'This file names its fonts in prose only; see the full file below.'}</p>`;

    $$('[data-font]').forEach(li => loadFont(li.dataset.font).then(ok => {
      const st = li.querySelector('[data-font-status]');
      if (!ok) st.textContent = 'not on Google Fonts · shown in a fallback face';
      else if (st.textContent.startsWith('checking')) st.textContent = 'free on Google Fonts · shown as itself';
    }));

    const sample = d.summary ? tagline(d.summary) : d.name;
    $('[data-df-scale]').innerHTML = Object.keys(d.typography).length ? `<ul class="df-scale">${
      Object.entries(d.typography).map(([name, t], i) => `
        <li class="df-scale-row${i >= 4 ? ' is-extra' : ''}">
          <p class="df-mono df-scale-spec">${esc(name)} · ${esc(t.fontSize || '')}${t.lineHeight ? ' / ' + esc(t.lineHeight) : ''} · ${esc(t.fontWeight || '')}${t.letterSpacing && t.letterSpacing !== '0' ? ' · ' + esc(t.letterSpacing) : ''}</p>
          <p class="df-scale-sample" style="${fontCss(t)}">${esc(/^(body|caption|label|code|mono)/i.test(name) ? firstSentence(d.description) || sample : sample)}</p>
        </li>`).join('')}</ul>` : '';
    const n = Object.keys(d.typography).length;
    if (n > 4) {
      const more = document.createElement('button');
      more.type = 'button';
      more.className = 'btn btn-ghost btn-sm df-scale-more';
      more.setAttribute('aria-expanded', 'false');
      more.textContent = `Show all ${n} roles`;
      more.addEventListener('click', () => {
        const all = $('.df-scale').classList.toggle('is-all');
        more.setAttribute('aria-expanded', String(all));
        more.textContent = all ? 'Show four roles' : `Show all ${n} roles`;
      });
      $('[data-df-scale]').appendChild(more);
    }
  }

  // ---- the file ----
  function renderFile(d, md) {
    $('[data-df-raw]').textContent = md;
    $('[data-df-size]').textContent = '(' + Math.round(md.length / 1024) + ' KB)';
    const copy = $('[data-df-copy]');
    copy.disabled = false;
    copy.addEventListener('click', () => UI.copyButton(copy, md));
    const dl = $('[data-df-download]');
    dl.href = 'designs/' + d.slug + '.md';
    dl.setAttribute('download', d.slug + '-DESIGN.md');
    $('[data-df-original]').href = d.source;
    const brief = `${BRIEF[d.category] || 'a landing page'} that feels like ${d.name}`;
    $('[data-df-brief]').textContent = brief;
    const bc = $('[data-df-brief-copy]');
    bc.addEventListener('click', () => UI.copyButton(bc, '/prototype ' + brief, 1200));
    $('[data-df-disclaimer]').textContent =
      `${d.name}'s name, marks and visual identity belong to its owner. This page shows a public analysis of its website by VoltAgent and isn't affiliated with or endorsed by ${d.name}.`;
  }

  function setMode(d, mode) {
    $$('[data-df-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.dfMode === mode)));
    renderPreview(d, mode);
    State.set('mode', mode === 'light' ? null : mode);
  }

  function fail(msg) {
    $('[data-df="name"]').textContent = 'Design file not found';
    $$('.df-hero .hero-cta, .df-hero .mnote').forEach(e => (e.hidden = true));
    $('[data-df-error-msg]').textContent = msg;
    $('[data-df-error]').hidden = false;
    $('#df-main').setAttribute('aria-busy', 'false');
  }

  Promise.all([
    fetch('designs/' + slug + '.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }),
    fetch('designs/' + slug + '.md').then(r => r.ok ? r.text() : ''),
  ]).then(([d, md]) => {
    document.title = d.name + ' · Design files · claude-prototype';
    $('[data-df="name"]').textContent = d.name;
    $('[data-df="category"]').textContent = 'Design file · ' + d.category;
    $('[data-df="summary"]').textContent = d.summary;
    $('[data-df="owner"]').textContent = `${d.name} owns its identity; no affiliation`;

    // Fonts first so the preview paints in them; never block on a slow font.
    new Set(Object.values(d.typography).map(t => t.preview)).forEach(loadFont);
    const hasDark = !!surfaces(d).dark;
    $('[data-df-modes]').hidden = !hasDark;
    $$('[data-df-mode]').forEach(b => b.addEventListener('click', () => setMode(d, b.dataset.dfMode)));
    renderPreview(d, hasDark && State.get('mode') === 'dark' ? 'dark' : 'light');
    if (hasDark && State.get('mode') === 'dark') setMode(d, 'dark');
    renderPalette(d);
    renderType(d);
    renderFile(d, md);
    $$('[data-df-ready]').forEach(e => (e.hidden = false));
    $('#df-main').setAttribute('aria-busy', 'false');
  }).catch(() => fail(`There's no design file called "${slug}". The link may be mistyped, or the file was removed upstream.`));
})();
