# Scaffold & build screens (steps 5–6)

How to lay down the scaffold from `templates/` and build out each screen. Read
`reference/discovery.md` first — this assumes you have a spec and a `DESIGN.md`.

## Step 5: Scaffold

Create the prototype folder (default `$(pwd)/<slug>/`) and populate it from
`templates/scaffold-base/` + `templates/feedback-overlay/`.

**Copy literally, no edits** (product-agnostic platform code):
- `scaffold-base/js/state.js` → `js/state.js` — URL state utility.
- `scaffold-base/js/ui.js` → `js/ui.js` — interaction helpers (loading button, toast, declarative `[data-loading]` / `[data-toast]` / `[data-confirm]`).
- `feedback-overlay/feedback.js` → `js/feedback.js` — feedback overlay.
- `feedback-overlay/feedback.css` → `css/feedback.css` — feedback overlay styles.
- `scaffold-base/serve.py` → `serve.py` — no-cache dev server. Shipping it means reviewers who clone+run don't hit the browser-cache "my changes aren't showing" trap.

**Copy then customize:**
- `scaffold-base/js/theme.js` → `js/theme.js` — set `THEMES` and `STORAGE_KEY` to match `DESIGN.md`.
- `scaffold-base/js/layout.js` → `js/layout.js` — set `LAYOUTS` to match the spec's layout names.
- `scaffold-base/js/persona.js` → `js/persona.js` — set `PERSONAS` to match `data.js` persona keys.
- `scaffold-base/js/data.js` → `js/data.js` — populate personas + shared data (see "Data layer").
- `scaffold-base/js/app.js` → `js/app.js` — keep core wiring (modals, tabs, composer, hydrate); add product handlers.
- `scaffold-base/css/styles.css` → `css/styles.css` — replace the 3 default `html[data-theme="X"]` blocks with `DESIGN.md` tokens; add product classes (`.card`, `.chip`, `.status-*`, `.kpi`). **Keep** `.proto-grid`, `.proto-seg`, `#proto-controls`, `.proto-toast`, `.is-loading`, `.skeleton`, `.empty-state` as-is — platform.
- `scaffold-base/404.html` → `404.html` — substitute tokens, swap in the product's nav/footer.

**Structural reference, not a copy:**
- `scaffold-base/index.html` — a starting layout with `{{PRODUCT_NAME}}`-style tokens. Write `index.html` and every other screen fresh, using this file as the structural reference for head / nav / footer / control-bar / script-order.

### File tree produced

```
<slug>/
├── index.html
├── <screen>.html           # one file per screen from the spec
├── 404.html
├── css/
│   ├── styles.css
│   └── feedback.css
├── js/
│   ├── state.js            # URL state + share + history drawer (Shift+?)
│   ├── theme.js            # data-theme switcher
│   ├── layout.js           # data-layout switcher
│   ├── data.js             # personas + shared content
│   ├── persona.js          # data-persona switcher
│   ├── ui.js               # loading / toast / skeleton / confirm helpers
│   ├── app.js              # page interactions (modals, tabs, filters, composer)
│   └── feedback.js         # pin-to-element overlay (always on)
├── assets/images/          # placeholder images
├── serve.py                # no-cache dev server
├── DESIGN.md
├── DEMO.md
└── README.md
```

### Baseline every screen needs
- `<html data-theme="<default>" data-layout="<default>" data-persona="<default>">` with spec defaults.
- Tailwind CDN + inline config extending CSS vars so `bg-surface`, `text-accent`, `border-muted` work.
- The visible control bar (below) — not a click-to-reveal pill.
- Scripts loaded in this order at the end of `<body>`: `state.js` → `theme.js` → `layout.js` → `data.js` → `persona.js` → `ui.js` → `app.js` → `feedback.js`. Data loads before persona (persona reads it); ui before app (app may call `UI.toast`).

### Visible control bar

The exact markup ships in `templates/scaffold-base/index.html` (the `#proto-controls`
block) — that template is the source of truth. Copy it onto every screen and edit only
the `data-theme-option` / `data-layout-option` / `data-persona-option` buttons to match
this prototype's themes, layouts, and personas. Styling for `#proto-controls`,
`.proto-bar*`, and `.proto-seg*` ships in `css/styles.css` — do not restyle.

The bar is bottom-**center** (not bottom-right) so it's discoverable and doesn't fight
right-side content sidebars. Reviewers see every theme and layout option at a glance
instead of cycling a button to discover them.

**Unbreakable constraints** (these CSS rules ship in the scaffold — do not remove or weaken):
- `flex-wrap: nowrap` on `.proto-bar` — the bar NEVER wraps to a second line. A wrapped bar reads as broken and the reviewer stops trusting the rest of the prototype.
- `overflow-x: auto` + hidden scrollbar — at very narrow widths the bar scrolls sideways instead of breaking.
- `flex-shrink: 0` on `.proto-bar-section` — sections keep intrinsic width, never squeezed unevenly.
- Uppercase labels (`THEME` / `LAYOUT` / `PERSONA`) hide at ≤960px; the segmented buttons stay readable (they show real option names like "Ivory", "Grid", "Planning").
- `.proto-hint` has its own `backdrop-blur` background so it never paints over page content; hidden at ≤960px.
- Don't add a section without checking the bar still fits at 1440px with room to spare. If it doesn't, the new section needs shorter labels or icon-only.

If you customize the bar, verify manually: resize to 375 / 768 / 1440 / 1920; it stays a
single row at all four, scrollable sideways only at the narrowest.

### Data layer

One `js/data.js` per prototype holds all product content. Don't hardcode names, prices,
dates, or lists in HTML — HTML references data via `data-persona-text`,
`data-persona-show`, `data-persona-hide`.

- **personas** — 2–4 states the prototype can be shown in. Each defines per-user fields that change: name, initials, counts, lists of entities.
- **shared** — entities the same across personas (catalog, nav labels, static copy).

When the user toggles persona, `Data.apply(personaName)` walks the DOM and updates
text / shows / hides. Empty, loaded, and lifecycle states all come from swapping personas.

### Persona switcher — the third control-bar dimension

Use personas to show different lifecycle moments in one prototype:

| Product type | Example personas |
|---|---|
| Marketplace | `new-buyer` · `active-buyer` · `frequent-buyer` |
| SaaS tool | `empty-trial` · `active-trial` · `paid-team` |
| Internal app | `new-hire` · `manager` · `admin` |
| Content platform | `first-visit` · `returning` · `subscribed` |

2–3 personas is usually right. Always include at least ONE empty/new state — it's the
hardest to design and the most often forgotten.

### Interaction states

Every interactive element needs a non-trivial response. A "Submit" that does nothing
kills a demo. Baseline checklist:

- **Loading state** — primary CTAs (book, submit, save, send) use `data-loading="<text>"` (+ optional `data-toast="<msg>"`). Click shows loading text + spinner, fires the toast, then navigates or opens a modal. ui.js wires this.
- **Success toast** — anything that "succeeds" shows a confirmation: `UI.toast('Saved', 'success')` or `data-toast`.
- **Empty state** — every list/grid has an `.empty-state` wrapper for when the persona's list is empty: headline + one-line explainer + primary action ("Browse vendors", "Create your first…"). Ship at least the primary collection view's empty state on each side.
- **Error state / 404** — `404.html` ships with the scaffold. Link at least one "broken" affordance to it. Form validation errors render inline under the field, not as dismissable alerts.
- **Form state persistence** — multi-step inputs save to localStorage and restore on reload. Cheap win; makes the demo feel alive across refreshes.
- **Skeleton loaders** — any list/grid that changes on user action (filter chips, pagination, persona switch, page load) briefly swaps to placeholder silhouettes. Mark the container `data-skeleton-on-filter` (auto-wires to filter events) or call `UI.fakeLoad(container, 650, { count: 6 })`. The `.skeleton` class + shimmer ships in styles.css; shape with `.is-text` / `.is-text-lg` / `.is-block` / `.is-circle`.

### Layout system

Number of layouts, names, and behavior come from the spec (see "Choosing layouts" in
`reference/discovery.md`). Not fixed to column counts.

1. Set `LAYOUTS` in `js/layout.js` to match the spec (e.g. `['grid', 'gallery', 'list']`).
2. Add CSS keyed off `html[data-layout="X"]`:
   ```css
   html[data-layout="grid"]    .proto-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
   html[data-layout="gallery"] .proto-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
   html[data-layout="list"]    .proto-grid { grid-template-columns: 1fr; }
   /* view-mode changes beyond column count: */
   html[data-layout="list"]    .proto-grid > .card { flex-direction: row; }
   html[data-layout="list"]    .proto-grid > .card .photo { width: 200px; }
   ```
3. Update control-bar buttons to match: `<button data-layout-option="grid" aria-pressed="true">Grid</button>`.
4. Tag any listing / card-grid / gallery section `class="proto-grid"` — it responds to `data-layout`.
5. Non-listing containers (KPI rows, form fields) keep their own Tailwind classes — layouts apply to *content surfaces*, not chrome.

The layout names in the spec, `layout.js`, CSS, and control-bar buttons MUST match
exactly. A typo silently breaks the toggle.

## Step 6: Build screens

One HTML file per screen. Each screen:

- **Duplicate nav + footer** across pages. Do NOT add a build step to DRY this up — prototypes die when they get a build step.
- **Realistic content only**, matched to the product domain. Fintech → real merchants and amounts. HR → real roles and org structures. Every name, number, and label should feel plausible. Never lorem ipsum.
- **Every link goes somewhere.** Run a dead-end sweep: enumerate every `<a href>` and `<button>`; each must navigate, open a modal, or fire a visible toast. A dead button kills the pitch.
- **Responsive by default.** Design at 1440, verify at 768 and 375. Never horizontal scroll at 375.
- **URL state for interactive bits.** Modals, tabs, accordions wired through `State.set()`. Opening `?modal=signup` lands with the modal open; the Share button copies a URL reproducing the exact screen.
- **Theme-safe colors.** Every color uses a CSS var or a Tailwind class mapped to one. Flip all themes to verify nothing breaks.
