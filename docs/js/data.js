/*
 * Content + personas for the claude-prototype landing page.
 *
 * new:       visitor hasn't installed. Install CTA + outcomes copy.
 * installed: visitor already runs /prototype. Section re-frames to reference.
 */
(function () {
  const DATA = {
    personas: {
      'new': {
        hero: {
          eyebrow: 'Claude Code skill · MIT · v0.1',
          headline: 'Build clickable HTML prototypes your team can actually review.',
          sub: 'A Claude Code skill that scaffolds a zero-build-step site with a runtime theme / layout / persona switcher, URL-shareable state, and pin-to-element feedback. For sales demos, stakeholder reviews, and design explorations.',
          primaryCta: 'Copy install command',
          secondaryCta: 'View on GitHub',
        },
        installBadge: 'Install',
        installIntro: 'Claude Code loads skills from `~/.claude/skills/<name>/`. Pick any of three.',
        roadmapBadge: 'See also',
        ctaIntent: 'primary',
      },
      'installed': {
        hero: {
          eyebrow: 'v0.1 · you\'re already set',
          headline: 'You\'re set. Here\'s what\'s new, and how to invoke.',
          sub: 'Skip past install. Jump to the roadmap, the companion-skill reference, or learn how to fork a variant and apply pinned feedback.',
          primaryCta: 'Jump to roadmap',
          secondaryCta: 'Contribute',
        },
        installBadge: 'Reinstall',
        installIntro: 'You already have `/prototype` installed. Reinstall options, kept here for reference.',
        roadmapBadge: 'Roadmap',
        ctaIntent: 'secondary',
      },
    },
  };

  function getPersona(name) {
    return DATA.personas[name] || DATA.personas[Object.keys(DATA.personas)[0]];
  }

  function resolve(obj, path) {
    return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }

  function apply(personaName) {
    const persona = getPersona(personaName);

    document.querySelectorAll('[data-persona-text]').forEach(el => {
      const path = el.dataset.personaText;
      const value = resolve(persona, path);
      if (value !== undefined && value !== null) el.textContent = String(value);
    });

    document.querySelectorAll('[data-persona-show]').forEach(el => {
      const targets = el.dataset.personaShow.split(/\s+/).filter(Boolean);
      const shouldHide = !targets.includes(personaName);
      el.classList.toggle('proto-hidden', shouldHide);
      el.hidden = shouldHide;
    });

    document.querySelectorAll('[data-persona-hide]').forEach(el => {
      const targets = el.dataset.personaHide.split(/\s+/).filter(Boolean);
      const shouldHide = targets.includes(personaName);
      el.classList.toggle('proto-hidden', shouldHide);
      el.hidden = shouldHide;
    });

    document.dispatchEvent(new CustomEvent('persona:applied', { detail: { name: personaName, data: persona } }));
  }

  window.Data = { all: DATA, personas: DATA.personas, get: getPersona, apply };
})();
