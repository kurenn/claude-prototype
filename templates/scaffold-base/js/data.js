/*
 * Data layer — centralized content + personas.
 *
 * Every piece of content that appears in the prototype (user names, entity
 * lists, counts, copy that changes per user state) lives here — NOT
 * hardcoded in HTML. That way:
 *   - Personas can swap whole states at once (empty / active / power user)
 *   - Vendor names / prices / dates change in one place
 *   - Future variants stay clean
 *
 * Customize for your prototype:
 *   1. Define 2–4 personas under `personas`. Each is a state the demo can
 *      be shown in (empty, active, post-conversion, etc.).
 *   2. Put shared data (not persona-dependent) at the top level.
 *   3. In HTML, reference data via these attributes:
 *        data-persona-text="user.name"   → replace textContent
 *        data-persona-show="active"      → show only on that persona
 *        data-persona-show="active power" → show on multiple
 *        data-persona-hide="empty"       → hide on that persona
 *   4. Coordinate the persona keys with js/persona.js PERSONAS array.
 */
(function () {
  const DATA = {
    personas: {
      'default': {
        user:  { name: 'Customer Name', initials: 'CN' },
        badge: '',
        // prototype-specific fields go here
      },
      'empty': {
        user:  { name: 'New User',      initials: 'NU' },
        badge: 'new',
      },
    },

    // Shared (not persona-specific) — edit per prototype.
    // Examples:
    //   vendors: [ { id: '...', name: '...', ... } ],
    //   bookings: [ { id: '...', status: '...', ... } ],
  };

  function getPersona(name) {
    return DATA.personas[name] || DATA.personas[Object.keys(DATA.personas)[0]];
  }

  // Resolve a dotted path on an object: "user.name" → persona.user.name
  function resolve(obj, path) {
    return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }

  function apply(personaName) {
    const persona = getPersona(personaName);

    // Text substitution
    document.querySelectorAll('[data-persona-text]').forEach(el => {
      const path = el.dataset.personaText;
      const value = resolve(persona, path);
      if (value !== undefined && value !== null) el.textContent = String(value);
    });

    // Show only on listed personas
    document.querySelectorAll('[data-persona-show]').forEach(el => {
      const targets = el.dataset.personaShow.split(/\s+/).filter(Boolean);
      const shouldHide = !targets.includes(personaName);
      el.classList.toggle('proto-hidden', shouldHide);
      el.hidden = shouldHide;
    });

    // Hide on listed personas
    document.querySelectorAll('[data-persona-hide]').forEach(el => {
      const targets = el.dataset.personaHide.split(/\s+/).filter(Boolean);
      const shouldHide = targets.includes(personaName);
      el.classList.toggle('proto-hidden', shouldHide);
      el.hidden = shouldHide;
    });

    // Also expose a CSS hook: html[data-persona="<name>"] { ... }
    // Set by persona.js itself; here we just emit a custom event for
    // any listeners that want to re-render.
    document.dispatchEvent(new CustomEvent('persona:applied', { detail: { name: personaName, data: persona } }));
  }

  window.Data = { all: DATA, personas: DATA.personas, get: getPersona, apply };
})();
