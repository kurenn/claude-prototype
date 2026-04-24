/*
 * Persona switcher — third dimension alongside theme + layout.
 *
 * A "persona" is a state the prototype can be shown in: empty user,
 * active user, power user, first-time-onboarding, etc. Swapping the persona
 * swaps whatever data.js has defined under that key, plus any elements with
 * data-persona-show / data-persona-hide / data-persona-text attributes.
 *
 * Customize PERSONAS below. Names must match keys in js/data.js personas.
 *
 *   const PERSONAS = ['default', 'empty'];         // simplest
 *   const PERSONAS = ['sara-new', 'sara-shopping', 'sara-post-event'];  // lifecycle
 *   const PERSONAS = ['customer', 'admin', 'support'];  // role-based
 *
 * First entry is the default. Works with visible segmented controls:
 *   <button data-persona-option="<name>">Label</button>
 */
(function () {
  const PERSONAS = ['default', 'empty']; // CUSTOMIZE to match data.js
  const STORAGE_KEY = 'proto-persona';
  const root = document.documentElement;

  function getStored() { try { return localStorage.getItem(STORAGE_KEY); } catch { return null; } }
  function setStored(v) { try { localStorage.setItem(STORAGE_KEY, v); } catch {} }

  function applyPersona(name) {
    if (!PERSONAS.includes(name)) name = PERSONAS[0];
    root.dataset.persona = name;
    setStored(name);
    document.querySelectorAll('[data-persona-option]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.personaOption === name));
    });
    if (window.Data && window.Data.apply) window.Data.apply(name);
    if (window.State) window.State.set('persona', name === PERSONAS[0] ? null : name);
  }

  const params = new URLSearchParams(location.search);
  const fromUrl = params.get('persona');
  const stored  = getStored();
  const initial =
    (fromUrl && PERSONAS.includes(fromUrl)) ? fromUrl :
    (stored  && PERSONAS.includes(stored))  ? stored :
    PERSONAS[0];
  applyPersona(initial);

  document.querySelectorAll('[data-persona-option]').forEach(btn => {
    btn.addEventListener('click', () => applyPersona(btn.dataset.personaOption));
  });

  window.Persona = { apply: applyPersona, list: PERSONAS };
})();
