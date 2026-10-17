/*
 * Data layer — personas.
 *
 * The library and design-file pages use the Persona toggle for a first-run state:
 * "New" reveals the "what is a DESIGN.md" explainers (data-persona-show="empty").
 * Data.apply() (below) walks the DOM and toggles them. Page content itself comes
 * from docs/designs/*.json, not from here.
 */
(function () {
  const DATA = {
    personas: {
      'default': {},  // "Live" — the pages as a returning visitor sees them
      'empty': {},    // "New" — first-run explainers shown
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
      const value = resolve(persona, el.dataset.personaText);
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
