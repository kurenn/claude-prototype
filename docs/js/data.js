/*
 * Data layer — centralized content + personas.
 *
 * This landing page uses personas to demonstrate one of the skill's own selling
 * points live: the embedded demo device swaps between its POPULATED state and its
 * FIRST-RUN (empty) state when the control bar's Persona toggle flips — real
 * content swapping, not just chrome. The demo regions carry data-persona-show /
 * data-persona-hide; Data.apply() (below) walks the DOM and toggles them.
 */
(function () {
  const DATA = {
    personas: {
      'default': {
        // "Live" — the demo shows a running dashboard with real activity.
        stateLabel: 'Live',
        demoCaption: 'Cardinal Coffee · roastery dashboard, running on demo data',
      },
      'empty': {
        // First-run — the demo shows its designed empty state, not a blank grid.
        stateLabel: 'First run',
        demoCaption: 'Cardinal Coffee · brand-new workspace, first-run state',
      },
    },

    // Shared (not persona-specific) content the demo renders.
    demo: {
      // Recent subscription activity — realistic names + amounts, recent dates.
      recent: [
        { who: 'Marisol Vega',    init: 'MV', plan: 'Monthly · Ethiopia Guji', amt: '$24.00', live: true },
        { who: 'Dev Ramchandani', init: 'DR', plan: 'Bi-weekly · House blend', amt: '$18.00', live: false },
        { who: 'Priya Nair',      init: 'PN', plan: 'Monthly · Decaf Colombia', amt: '$22.00', live: false },
      ],
      // Shipments per weekday (last week) — the mini bar chart.
      shipments: [
        { d: 'M', v: 38 }, { d: 'T', v: 52 }, { d: 'W', v: 44 },
        { d: 'T', v: 61 }, { d: 'F', v: 73 }, { d: 'S', v: 29 }, { d: 'S', v: 17 },
      ],
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
