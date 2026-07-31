# Scaffold & build screens (steps 5–6)

How to lay down the scaffold from `templates/` and build out each screen. Read
`reference/discovery.md` first — this assumes you have a spec and a `DESIGN.md`.

## Step 5: Scaffold

Create the prototype folder (default `$(pwd)/<slug>/`) and populate it from
`templates/scaffold-base/` + `templates/feedback-overlay/`.

First, write the two context files from the spec (discovery.md Step 4): **`PRODUCT.md`**
and **`DESIGN.md`** at the folder root. PRODUCT.md is required — Step 7's impeccable audit
silently falls back to builtin-lint without it. Don't run `impeccable teach`; write it yourself.

**Copy literally, no edits** (product-agnostic platform code):
- `scaffold-base/js/state.js` → `js/state.js` — URL state utility.
- `scaffold-base/js/ui.js` → `js/ui.js` — interaction helpers (loading button, toast, declarative `[data-loading]` / `[data-toast]` / `[data-confirm]`, modal focus trap, opt-in `UI.withViewTransition`) **plus the timing engine** (`UI.fakeLatency` / `UI.fakeCall` / `UI.withLoader` / `UI.setSpeed` / `UI.replayLoading` / `UI.announce`) that gives simulated loads real, non-uniform latency + spinner-delay/min-visible discipline. See "Interaction states → Simulated loading".
- `scaffold-base/js/loading.js` → `js/loading.js` — the tweaks-bar demo controls for that engine: ⟳ Replay (`data-loading-replay`) + the 3-way Speed segmented control (`data-speed-option`), speed persisted in localStorage like theme. Loads **after `ui.js`** in the script order.
- `scaffold-base/js/motion.js` → `js/motion.js` — the tweaks-bar **Motion** control: the 3-way tier segmented control (`data-motion-option="calm|standard|expressive"`), applied as `data-motion` on `<html>` and persisted in localStorage like theme. The three tiers are platform (fixed) — no per-prototype edits; the skill just picks the default in `DESIGN.md`. Loads **after `theme.js`** in the script order. See "Motion tiers".
- `feedback-overlay/feedback.js` → `js/feedback.js` — feedback overlay.
- `feedback-overlay/feedback.css` → `css/feedback.css` — feedback overlay styles.
- `scaffold-base/js/vt.js` → `js/vt.js` — cross-document View Transitions (default-on root transition + dormant list→detail hero-morph machinery). Works as-is; the only optional edit is tuning `idFromUrl` when you wire a hero morph with a non-default detail-URL scheme (see "Page transitions"). Loads **non-deferred in `<head>`**, not at body-end.
- `scaffold-base/serve.py` → `serve.py` — no-cache dev server. Shipping it means reviewers who clone+run don't hit the browser-cache "my changes aren't showing" trap.

**Copy then customize:**
- `scaffold-base/js/theme.js` → `js/theme.js` — set `THEMES` and `STORAGE_KEY` to match `DESIGN.md`.
- `scaffold-base/js/layout.js` → `js/layout.js` — set `LAYOUTS` to match the spec's layout names.
- `scaffold-base/js/persona.js` → `js/persona.js` — set `PERSONAS` to match `data.js` persona keys.
- `scaffold-base/js/data.js` → `js/data.js` — populate personas + shared data (see "Data layer").
- `scaffold-base/js/app.js` → `js/app.js` — keep core wiring (modals, tabs, composer, hydrate, reveal-on-scroll); add product handlers.
- `scaffold-base/css/styles.css` → `css/styles.css` — replace the 3 default `html[data-theme="X"]` blocks with `DESIGN.md` tokens; add product-specific classes beyond the shared set below (e.g. `.status-*` badges, a `.kpi` variant if `.stat` doesn't fit). **Keep** `.card`, `.chip`, `.table`, `.form-field`, `.stat`, `.reveal`, `.proto-grid`, `.proto-seg`, `#proto-controls`, `.proto-toast`, `.is-loading`, `.skeleton`, `.empty-state`, `[data-modal]` as-is — platform. `[data-modal]` is the *only* CSS driving the modal JS in `app.js` (which toggles the `open` class) — don't skip it assuming Tailwind utility classes on the modal markup will cover it; there's no per-screen equivalent.
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
│   ├── motion.js           # data-motion tier switcher (calm / standard / expressive)
│   ├── layout.js           # data-layout switcher
│   ├── data.js             # personas + shared content
│   ├── persona.js          # data-persona switcher
│   ├── ui.js               # loading / toast / skeleton / confirm helpers + timing engine
│   ├── loading.js          # tweaks-bar Replay + Speed controls for the timing engine
│   ├── vt.js               # cross-doc View Transitions (loads in <head>, non-deferred)
│   ├── app.js              # page interactions (modals, tabs, filters, composer)
│   └── feedback.js         # pin-to-element overlay (always on)
├── assets/images/          # real photos for photo-forward products (Step 6) — ask first
├── serve.py                # no-cache dev server
├── PRODUCT.md               # impeccable context (users, tone, register) — required for Step 7 audit
├── DESIGN.md
├── DEMO.md
└── README.md
```

### Baseline every screen needs
- `<html data-theme="<default>" data-layout="<default>" data-persona="<default>">` with spec defaults. `data-persona` here is cosmetic before first paint — `persona.js` overwrites it on load from `PERSONAS[0]` (URL param → localStorage → array order), so the array order is what actually governs the default; keep them in agreement.
- The inline anti-FOUC `<script>` from `scaffold-base/index.html`'s `<head>`, copied verbatim onto every screen, placed before the stylesheet `<link>`s and the Tailwind CDN script — it sets `data-theme` from localStorage/`prefers-color-scheme` before first paint so navigating between screens on a non-default theme doesn't flash.
- `<script src="js/vt.js"></script>` in `<head>`, **non-deferred**, right after the anti-FOUC script and before the Tailwind CDN script — it wires cross-document View Transitions (`pagereveal` fires before first paint, so a deferred/body-end load would miss it). This is separate from the body-end script list below.
- The persistent `<header>` and `#proto-controls` bar each carry a distinct `view-transition-name` (`app-header` / `app-controls`, set in both `styles.css` and inline) so the chrome holds still across navigations. Keep the two names distinct on any screen where both exist. `styles.css` scopes the name to `body > header` (the top-level header only, a direct child of `<body>`) — not bare `header` — so it doesn't also pick up an unrelated nested `<header>` (the feedback overlay's panel has its own, and a builder's `<article><header>` would too); a second element claiming the same name aborts the whole transition.
- Tailwind CDN + inline config extending CSS vars so `bg-surface`, `text-accent`, `border-muted` work.
- The visible control bar (below) — not a click-to-reveal pill.
- Scripts loaded in this order at the end of `<body>`: `state.js` → `theme.js` → `motion.js` → `layout.js` → `data.js` → `persona.js` → `ui.js` → `loading.js` → `app.js` → `feedback.js`. Data loads before persona (persona reads it); ui before app (app may call `UI.toast`); `loading.js` after `ui.js` (it wires the tweaks-bar Speed/Replay controls to `UI.setSpeed` / `UI.replayLoading`); `motion.js` after `theme.js` (mirrors it — reads `proto-motion` from localStorage / a `?motion=` param and syncs the tier control). The inline anti-FOUC `<head>` script also sets `data-motion` before first paint, so the tier is correct even before `motion.js` runs.

### No horizontal overflow at 390px

The page must not scroll sideways on a phone — a clipped primary button or an
off-screen amount column reads as broken. The scaffold reserves space for the fixed
control bar (`body { padding-bottom }`) and ships two utilities; use them:
- **Tables:** wrap every `<table>` in `<div class="proto-table-wrap">` so the table scrolls
  inside its card instead of pushing the whole page wider. (Tailwind `overflow-x-auto` works too.)
- **Toolbar / filter / header-action rows:** give the flex container `class="proto-actions"`
  (or Tailwind `flex flex-wrap`) so button clusters wrap to a second line rather than overflowing.
- **Stat / KPI strips:** use `proto-grid` or `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` — never a
  fixed multi-column row that can't reflow.
- **App-shell layouts** that scroll an inner `<main>` instead of the page: mirror the control-bar
  `padding-bottom` on that scroll container, or the last row hides under the bar.

Verify: at a 390px viewport, nothing clips off the right edge and the page has no horizontal
scrollbar. `benchmark/render.sh` captures a `-w390` shot of every screen for this check.

### Visible control bar

The exact markup ships in `templates/scaffold-base/index.html` (the `#proto-controls`
block) — that template is the source of truth. Copy it onto every screen and edit only
the `data-theme-option` / `data-layout-option` / `data-persona-option` buttons to match
this prototype's themes, layouts, and personas. The **Loading** section (⟳ Replay +
Instant/Real/Slow Speed) and the **Motion** section (Calm/Std/Exp tier) are platform — copy
them verbatim, don't edit them (the motion *default* is chosen in `DESIGN.md`, not by removing
a button). Styling for `#proto-controls`, `.proto-bar*`, and `.proto-seg*` ships in
`css/styles.css` — do not restyle.

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

- **The eight states.** Every button and input covers default / hover / focus / active / disabled / loading / error / success. The scaffold ships a global `:focus-visible` ring + an `:active` press; keep custom `:hover` styles behind `@media (hover:hover)` (touch can't hover). Forms validate on blur with the error inline below the field; prefer an undo toast over a confirm dialog.

- **Loading state** — primary CTAs (book, submit, save, send) use `data-loading="<text>"` (+ optional `data-toast="<msg>"`). Click shows loading text + spinner, fires the toast, then navigates or opens a modal. ui.js wires this.
- **Success toast** — anything that "succeeds" shows a confirmation: `UI.toast('Saved', 'success')` or `data-toast`.
- **Empty state** — every list/grid has an `.empty-state` (or `.state.state--empty`) wrapper for when the persona's list is empty: headline + one-line explainer + primary action ("Browse vendors", "Create your first…"). Ship at least the primary collection view's empty state on each side. **Distinguish first-run vs no-results vs cleared** — see "The state matrix" below; they're three different copies + actions, not one generic "Nothing here."
- **Error state / 404** — `404.html` ships with the scaffold (whole-page not-found). For a *region* that fails, use `.state.state--error` — scoped to the region, plain language, a **Retry** (`[data-retry]`) that re-runs the call and preserves input (see "The state matrix" below). `404.html` still handles broken navigations: link at least one "broken" affordance to it. Form validation errors render inline under the field, not as dismissable alerts.
- **Form state persistence** — multi-step inputs save to localStorage and restore on reload. Cheap win; makes the demo feel alive across refreshes.
- **Skeleton loaders** — any list/grid that changes on user action (filter chips, pagination, persona switch, page load) briefly swaps to placeholder silhouettes. Mark a container `data-skeleton-on-load` (auto-wires on page load; tune with `data-skeleton-count` / `data-skeleton-duration`), and for filter/pagination/persona changes call `UI.fakeLoad(container, 650, { count: 6 })` from the relevant handler in `app.js`. The `.skeleton` class + shimmer ships in styles.css; shape with `.is-text` / `.is-text-lg` / `.is-block` / `.is-circle`. `fakeLoad` now runs the timing engine underneath — spinner-delay (a sub-300ms load shows no skeleton), min-visible (a shown skeleton can't blink), `aria-busy` + a polite announcement, and speed-awareness when you omit the duration; the ⟳ Replay control re-runs the whole choreography. See "Simulated loading — the timing engine" below. `hideSkeletons` only restores the pre-skeleton snapshot if the container still shows the exact skeleton markup it injected — if a render function (e.g. a persona-driven list renderer) already filled the container with real content before the timer fires, the restore is skipped, so JS-rendered containers are safe to use with `data-skeleton-on-load` without any manual cleanup.
- **Modal focus trap** — every modal needs `role="dialog"`, `aria-modal="true"`, and an `aria-hidden` that flips with open state (author these on the modal markup itself); `app.js`'s `openModal`/`closeModal` already call `UI.trapFocus(modalEl, triggerEl)` on open and `UI.releaseFocus(modalEl)` on close. That helper (in `ui.js`) moves focus to the first focusable element inside, loops Tab/Shift+Tab within the modal so it can't leak to the page behind it, and restores focus to whatever triggered the modal when it closes. `app.js` also wires Esc to close whichever modal is open. Keep passing the trigger element (usually the clicked button) into `openModal` — it's what focus returns to. See `checks/builtin-lint.md` rule 6.

#### The state matrix — every data region ships all of it

A "data region" is any list, table, grid, feed, or collection that could plausibly be
loading, full, or empty. Shipping only the happy path (a full grid) is the single most
common "this is a mockup, not a product" tell. Each such region needs the **whole**
matrix — author the markup for all of them, then toggle via persona / the engine:

| State | What it is | Craft notes |
|---|---|---|
| **default** | the region with real content | realistic data (build.md Step 6), never lorem |
| **loading** | skeleton silhouettes of that content | `data-skeleton-on-load` (page load) or `UI.fakeLoad(region, …)` (filter/paginate/persona); spinner-delay + min-visible ship free (below) |
| **empty** | no content — but *distinguish the reason* | three different empties, three different copies + actions (below) |
| **error** | the call failed | `.state.state--error`: scoped to the region, plain language, a **Retry** (`[data-retry]`) that re-runs the call and **preserves any input** — never a raw stack trace or a whole-page takeover |
| **success** | the action landed | often *silent* (the change is visible) — see "Silent success" in microinteractions.md; toast only when the effect is off-screen or the region can't show it |

**The three empties are not the same state** — collapsing them into one generic "Nothing
here" is a tell:
- **first-run** (the user has never added anything) → onboarding voice + a *primary create*
  action: "Create your first report." This is the empty you design hardest; it's the one
  reviewers judge.
- **no-results** (a filter/search matched nothing) → "No invoices match *Overdue*." + a
  *clear-filters* escape hatch. The data exists; the query is too narrow.
- **cleared** (the user emptied it themselves — archived the last item, marked all read) →
  a calm, done-state acknowledgement ("Inbox zero — nothing left to review."), not an error
  and not an onboarding prompt.

Use `.state.state--empty` (or the existing `.empty-state`) for empties and
`.state.state--error` for the failure face — both are token-driven, reserve vertical
space (`min-height`) so swapping between states doesn't shift surrounding layout, and give
one icon + title + body + a single action button. Wire the empties off personas
(build.md "Data layer") so the control bar's **Empty** persona actually shows them.

```html
<!-- error face for a region that failed to load; [data-retry] re-runs the fetch -->
<div class="state state--error" role="alert">
  <span class="state-icon"><!-- inline SVG, one weight --></span>
  <p class="state-title font-heading">Couldn't load invoices</p>
  <p class="state-body">Something went wrong on our end. Your filters are still applied.</p>
  <div class="state-actions"><button class="…" data-retry>Retry</button></div>
</div>
```

`[data-retry]` isn't dead markup out of the box — `ui.js` ships a default delegated click
handler that replays the nearest region's loader (its `[data-skeleton-on-load]` ancestor, or
the `.state`/`.state--error` box itself) through the timing engine, so Retry → loading is
demoable without any wiring. A real prototype should still replace this with logic that
re-runs the actual failed call and preserves input — the default is a stand-in, not the fix.

`checks/builtin-lint.md` rule 35 (state-matrix completeness) flags a primary collection
region that ships only the happy path — no empty state, no error affordance nearby.

#### Simulated loading — the timing engine

Prototypes have no backend, so "loading" is *simulated*. Left alone that produces one of
two bad feels: **instant** (every read is free, nothing reads as real work) or **bare
spinner** (a loader that flashes on a fast call or blinks out on a slow one). `ui.js`
ships a small timing engine so simulated loads feel like a real product's, with nothing to
wire on the happy path:

- **`UI.fakeLatency(kind)`** — tiered, non-uniform latency (ms) with ±45% jitter so
  repeats never feel metronomic. Tiers: `nav` 220 · `read` 700 · `mutate` 380 ·
  `upload` 2200. Scaled by the global Speed multiplier.
- **`UI.fakeCall(kind, { failRate })`** — `await` a simulated call that resolves after
  `fakeLatency(kind)`, or rejects (to demo the error face) when `failRate` (0–1) fires.
- **`UI.withLoader(work, { show, hide, delay, minVisible })`** — the anti-flash
  discipline: don't show the loader until `work` has run `delay` ms (**300** default, so a
  sub-300ms call shows *no* loader), and once shown keep it up at least `minVisible`
  (**500** default, so it can't blink). `show`/`hide` toggle the visual **and** the a11y
  state (see below).
- **`UI.fakeLoad(region, duration, opts)` / `data-skeleton-on-load`** already run through
  `withLoader` + `fakeLatency('read')` — pass a number to pin the duration (back-compat,
  e.g. `UI.fakeLoad(grid, 650, { count: 6 })` from a filter handler) or omit it to let the
  engine time it. `[data-loading]` / `UI.loadingButton` run through `fakeLatency('mutate')`.
- **A11y spine.** When a region's loader shows, `ui.js` sets `aria-busy="true"` on it and
  announces "Loading…" through one shared polite live region (`UI.announce`, a lazily
  created `.sr-only role="status"` node); on done, `aria-busy="false"` + "Loaded." Skeleton
  bars stay decorative. Nothing to wire — it rides on `fakeLoad`.
- **Custom choreographies:** `UI.registerLoader(fn)` registers a load sequence so **Replay**
  re-runs it alongside the `data-skeleton-on-load` regions.

**The tweaks-bar demo control.** The engine runs by default; the control bar adds a compact
**Loading** section (in `#proto-controls`) to *demo* the transient loading — a **⟳ Replay**
button (`data-loading-replay` → `UI.replayLoading()`, re-runs every region's load sequence)
and a 3-way **Speed** segmented control (`data-speed-option="instant|real|slow"`, default
**Real**, persisted in localStorage) that scales every latency: **Instant** ≈ 0 (reads feel
free — and the spinner-delay means no skeleton even appears), **Slow** ×2.5 (watch the
choreography). `js/loading.js` wires it. Keep the section compact — the bar must stay one
row (it scrolls, never wraps).

For richer interaction recipes (copy-as-label-swap, optimistic-with-undo, tooltip timing, tab crossfade), see `reference/microinteractions.md`.

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

### Shared components

Beyond `.card`, `styles.css` ships four more classes so common surfaces (KPI strips,
filter rows, tables, forms) don't get reinvented per prototype. All four are
token-driven (surface/elevated/ink/accent/hairline/space/radius/shadow) — restyle them
per `DESIGN.md` by changing the tokens, not by overriding these rules with new colors.

- **`.stat`** — a KPI tile. Group 2–4 inside `.proto-grid` (or a Tailwind grid) so they
  reflow at 390px per the overflow rules above.
  ```html
  <div class="stat">
    <span class="stat-label">Active listings</span>
    <span class="stat-value tabular">128</span>
    <span class="stat-delta">+12 this week</span>
  </div>
  ```
- **`.chip`** — a filter pill / tag / status label. `.is-active` for the selected filter
  in a filter row; `.is-muted` for a disabled or inactive one.
  ```html
  <button class="chip is-active">All</button>
  <button class="chip">Pending</button>
  <span class="chip is-muted">Archived</span>
  ```
- **`.table`** — put on the `<table>` itself, nested in the existing
  `.proto-table-wrap` (that wrapper only handles the horizontal-scroll overflow guard;
  `.table` is the look — header row, row dividers, a subtle hover on pointer devices).
  ```html
  <div class="proto-table-wrap">
    <table class="table">…</table>
  </div>
  ```
- **`.form-field`** — label + control + optional hint/error, stacked. Add
  `.has-error` to the wrapper to show the inline error (pairs with the "form
  validates on blur" rule under "Interaction states" below).
  ```html
  <div class="form-field has-error">
    <label for="email">Email</label>
    <input id="email" type="email">
    <span class="error">Enter a valid email</span>
  </div>
  ```

Product-specific variants (a `.status-*` badge palette, a `.kpi` shape `.stat` doesn't
fit) still belong in the build's own `styles.css` additions — keep them token-driven too.

### Motion utilities (opt-in)

Three motion utilities ship in the scaffold but do nothing until a screen opts in by
adding the class or calling the helper. All are reduced-motion-safe and degrade to
"just show the correct end state" if unsupported — never gate correctness on any of
them running.

**The token system underneath** (`styles.css` `:root`) — ease-out dominant; never
`ease-in` / the default `ease` / `linear` for a discrete UI move (`linear` is for
continuous loops only: spinner, shimmer). Pick the **curve by the kind of move** —
`--ease-out-quart` (entrances, UI, controls, toasts), `--ease-out-expo` (reveals /
larger enters), `--ease-in-out-strong` (on-screen A→B repositions), `--ease-ios`
(drawers / sheets) — and the **duration by travel distance / element size**, bigger
move = longer, from `--dur-press` / `--dur-fast` / `--dur-base` / `--dur-slow`
(130 / 180 / 240 / 320ms). That scale is a finer-grained companion to the coarse
`--motion-fast/-/-slow` (150 / 250 / 400ms) that existing components use — **both are
live, don't diverge the shared ones**: new work reaches for `--dur-*`, existing
components keep `--motion-*`. **Enter ≠ exit**: an exit runs ~75% of its entrance and
can take a snappier curve. Animate transform + opacity only.

- **Reveal-on-scroll** — add `class="reveal"` to any element and `app.js` fades/slides
  it in the first time it scrolls into view (IntersectionObserver, `.reveal` rules in
  `styles.css`). Use sparingly — a hero section, a stat strip, maybe a testimonial —
  not every card in a long list (that just delays the user seeing content).
  ```html
  <section class="reveal">…</section>
  ```
  Reduced-motion-safe two ways: `prefers-reduced-motion` skips the observer in `app.js`
  and reveals everything immediately, and `styles.css` force-overrides `.reveal` to its
  visible state under the same media query as a backstop. Also falls back to "show it"
  if `IntersectionObserver` itself is unavailable.

  Static markup only — `app.js` scans for `.reveal` once at script load. Elements added
  to the DOM afterward (e.g. list/card markup hydrated from `data.js`) are never
  observed and stay stuck at opacity 0. Only add the class to markup that's already in
  the page when `app.js` runs.
- **Mount entrance (`.enter`)** — the zero-JS counterpart to `.reveal`. `.reveal` fires
  when an element scrolls *into view*; `.enter` fires the moment it *mounts/appears*,
  driven purely by CSS `@starting-style` — no JS, no IntersectionObserver, no hydration
  caveat. Add `class="enter"` for a tasteful fade+rise on first paint, and
  `style="--i:0|1|2…"` on siblings for a capped stagger (`--i × 40ms`, capped at 8 so a
  long list doesn't crawl):
  ```html
  <div class="stat enter" style="--i:0">…</div>
  <div class="stat enter" style="--i:1">…</div>
  <div class="stat enter" style="--i:2">…</div>
  ```
  `@starting-style` is Chrome 117+ / Safari 17.5+ / FF 129+; where unsupported the
  element just appears at its correct end state (no motion). Reduced motion forces the
  end state via the global block in `styles.css`. Use sparingly — a hero, a stat strip —
  **not every card** (same guidance as `.reveal`). It's distinct from `.reveal`: mount
  vs scroll-into-view — pick `.enter` for above-the-fold content that's present on load,
  `.reveal` for content the user scrolls down to.
- **Same-doc View Transitions** — wrap a DOM update (tab switch, filter re-render,
  persona swap) in `UI.withViewTransition()` (`ui.js`) so it cross-fades where the
  browser supports the API:
  ```js
  UI.withViewTransition(() => selectTab(name));
  ```
  Falls back to calling the function directly — same result, no animation — on
  older Safari or with `prefers-reduced-motion` set (Firefox shipped same-document support
  in Firefox 144 — it's *cross-document* View Transitions, below, that Firefox still lacks).
  `app.js`'s tab wiring already does this; use it as the reference call site.

### Page transitions (View Transitions)

Cross-document (page-to-page) View Transitions ship **default-on**, so navigating between
screens crossfades + slides instead of hard-cutting. There is nothing to wire for the root
transition: `@view-transition { navigation: auto }` in `styles.css` opts in every screen,
and `js/vt.js` (loaded **non-deferred in `<head>`**, after the anti-FOUC script, before the
Tailwind CDN script — `pagereveal` fires before the incoming page's first paint, so a
deferred or body-end load would miss it) drives the optional hero morph. **Graceful
degradation:** browsers without *cross-document* View Transition support (Firefox, mid-2026
— same-document support shipped separately, in Firefox 144, and already works via
`UI.withViewTransition` above) just do a plain instant navigation — never gate correctness
on the transition running.

**List → detail hero morph** (opt-in; the machinery ships dormant). When a prototype has a
list of things that open a detail page, you can make the clicked thumbnail *morph* into the
detail hero. Wire four attributes and the rest is automatic:

- **List card** — the link wraps the thumbnail: `data-vt-item="<id>"` on the `<a>`,
  `data-vt-hero` on the image inside it. **`<id>` must equal what `idFromUrl` extracts from
  the `href`** — with the default regex that's the *whole* last path segment before `.html`,
  not just a trailing number:
  ```html
  <a href="listing-42.html" data-vt-item="listing-42"><img data-vt-hero src="assets/images/listing-42.jpg" alt="Sunlit loft"></a>
  ```
- **Detail page** — the page root carries the id, and its hero image is tagged:
  ```html
  <main data-vt-detail="listing-42">
    <img data-vt-hero src="assets/images/listing-42.jpg" alt="Sunlit loft">
    …
  </main>
  ```
- **Tune `idFromUrl` in `vt.js`** to your detail-URL scheme. The default matches the last
  path segment before `.html` (`/listing-42.html` → `listing-42`); change the regex for
  `?id=<id>`, `/p/<slug>`, etc. (The detail page can skip the URL guess entirely — it reads
  its id from `data-vt-detail`.) Whatever scheme you pick, the id must be a valid CSS
  identifier/attribute-selector value and unique on the page — a duplicate `data-vt-item`
  just means the first match in document order wins, silently.

**Gotchas (all handled by the shipped machinery — don't undo them):**

- **Only the clicked item is named.** `vt.js` sets `view-transition-name: hero-<id>` on just
  the clicked card (on `pageswap`) and the matching detail hero (on `pagereveal`), then clears
  it when the transition finishes. Do **not** statically put a `view-transition-name` on every
  card — duplicate active names abort the transition (console error), not just that element's
  animation.
- **Persistent chrome must hold still.** The `<header>` (`app-header`) and `#proto-controls`
  (`app-controls`) get their own view-transition-names so they don't slide with the page.
  Two chrome elements can't share one active name — keep the two names distinct on any screen
  where both exist.
- **`object-fit: cover` on the morphing image** (already in `styles.css`) stops the
  aspect-ratio "taffy" stretch when a square thumbnail morphs into a wide hero.
- **~4s timeout.** The browser abandons a transition whose new page takes too long to render.
  Irrelevant for local static prototypes, but don't wire the morph across a slow async load.
- **Don't morph text or differently-shaped things.** Reserve the hero morph for the same
  image (thumb → hero). Two differently-shaped or text elements sharing a name just smears —
  let those crossfade with the root transition instead.
- **Reduced motion** drops the directional slide + hero fly and keeps a clean, short root
  crossfade — no blank flash — via the explicit `prefers-reduced-motion` override in
  `styles.css` (clamping animation-duration alone isn't enough; the root fade-in also
  carries an animation-delay that needs clamping, or you get a flash of blank page instead).

### Motion tiers (calm / standard / expressive)

One motion setting doesn't fit every prototype: a dense dashboard with cinematic hero-morphs
is *friction*; a landing page with only a crossfade *under-delivers*. So motion intensity is
gated by a **tier** on `html[data-motion="calm|standard|expressive"]` (default `standard`).
The tier is a **stance the skill decides and records in `DESIGN.md`** — from register + tone +
screen types (`reference/discovery.md` → "Motion tier") — not a feature to leave at default by
accident. It's set on `<html>` (by the inline anti-FOUC `<head>` script pre-paint, then by
`js/motion.js`) and is demoable live from the control bar's **Motion** segmented control.

Everything degrades cleanly: the tier only ever *scales* motion that already degrades on its
own (View Transitions, `@starting-style`, scroll-driven animation), so correctness never
depends on a tier. **`prefers-reduced-motion` wins over every tier**, expressive included.

| | Root page transition | List→detail hero morph | `.enter` / `.reveal` | Scroll-driven | Micro-interactions |
|---|---|---|---|---|---|
| **calm** | fast crossfade only (~130ms, no slide) | **off** | render instantly (visible end-state) | off | **kept** (`:active` press, hover, focus) |
| **standard** *(default)* | crossfade + directional slide | on | as authored (sparing) | off | kept |
| **expressive** | crossfade + directional slide | on | `.enter`: `--spring` + richer distance/duration · `.reveal`: as standard unless scroll-driven | `.reveal` upgraded to scroll-driven where supported | kept |

- **calm** — for dense tools/dashboards/data apps. Suppresses the directional slide (CSS
  overrides `::view-transition-*(root)` to a short fade), the hero morph (`vt.js` early-returns
  on `pageswap`/`pagereveal` — the root crossfade still runs via CSS), and all entrance/reveal
  animation (`.enter`/`.reveal` resolve to their visible end-state; `app.js` also skips the
  reveal observer). It deliberately **keeps** `:active` press, hover, and focus feedback — those
  are feedback, not decoration. (The Loading/Speed engine is a *separate* control, untouched by
  the tier.)
- **standard** — exactly today's default behavior; adds no CSS. See "Page transitions" above and
  the `.enter` / `.reveal` entries under "Motion utilities (opt-in)".
- **expressive** — for marketing/landing/pitch. Everything standard does, **plus** a subtle
  `--spring` easing token (gentle ~2–3% overshoot, `linear()` with a `cubic-bezier` fallback —
  reserved for entrances, never a trampoline) applied to `.enter`, slightly richer entrance
  distance/duration, and `.reveal` upgraded to a scroll-driven animation where
  `animation-timeline: view()` is supported (gated behind `prefers-reduced-motion: no-preference`).

### Nav patterns — break the reflex

<!-- Nav archetypes adapted from Hallmark (github.com/Nutlope/hallmark), MIT. -->

Wordmark-left + inline links + button-right (the exact shape in
`templates/scaffold-base/index.html`) is the reflex the model reaches for first —
and the single most recognizable "AI built this" tell. Prototypes are app-shells
(dashboards, internal tools), not marketing pages, so pick a shape real products
in that category actually ship instead of copying the scaffold nav verbatim:

- **Command-palette-first (⌘K)** — use when the audience is keyboard-first and
  navigation is "jump to X," not browsing a fixed link list (internal tools, dev/data products).
  ```html
  <div class="border-b border-hairline bg-surface mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
    <span class="font-heading font-bold">{{PRODUCT_NAME}}</span>
    <button class="rounded-proto border border-muted/30 px-3 py-2 text-sm text-ink2 flex items-center gap-2 hover:text-ink">
      <span>Search or jump to…</span><kbd class="text-xs border border-muted/30 rounded-proto px-1">⌘K</kbd>
    </button>
  </div>
  ```
  Wire the trigger to a `[data-modal]` command palette via `openModal` (focus trap ships free — see "Modal focus trap" above) and add a `⌘K` / `Ctrl+K` keydown listener in `app.js`; a dead ⌘K hint fails the dead-end sweep.
- **Inline search pill** — use when search is a primary action but a couple of links
  still earn a permanent spot (docs, catalogs, content libraries).
  ```html
  <nav class="border-b border-hairline bg-surface mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
    <span class="font-heading font-bold">{{PRODUCT_NAME}}</span>
    <button class="flex-1 min-w-[140px] max-w-sm rounded-proto border border-hairline bg-elevated px-3 py-2 text-sm text-ink2 flex items-center gap-2 hover:text-ink">
      <span>Search…</span><kbd class="ml-auto text-xs">⌘K</kbd>
    </button>
    <a href="#" class="rounded-proto bg-accent text-accent-ink px-4 py-2 text-sm">New</a>
  </nav>
  ```
  Same wiring as the command-palette trigger above — a dead search box fails the same sweep.
- **Floating pill nav** — use when the surface beneath is a dashboard background
  (or hero) that can carry a blurred pill; reads modern-minimal rather than corporate.
  ```html
  <nav class="fixed inset-x-3 top-3 z-20 mx-auto max-w-fit flex flex-wrap justify-center items-center gap-4 rounded-proto border border-hairline bg-surface/80 backdrop-blur px-4 py-2 shadow-[var(--shadow-sm)]">
    <span class="font-heading font-bold text-sm">{{PRODUCT_NAME}}</span>
    <a href="#" class="text-sm text-ink2 hover:text-ink">Overview</a>
    <a href="#" class="text-sm text-ink2 hover:text-ink">Reports</a>
    <a href="#" class="rounded-proto bg-accent text-accent-ink px-3 py-1.5 text-sm">New report</a>
  </nav>
  ```
  `fixed` leaves the flow — give the page's first block `pt-20` (more if the pill wraps at 390px) or the pill covers your h1. Keep the link list short — `flex-wrap` is the 390px overflow escape hatch, not license to add more; a pill spanning edge-to-edge is just a bar with rounded corners.
- **Side-rail nav** — use when the product is a dashboard/tool with a handful of
  top-level sections and the rail can carry the whole IA.
  ```html
  <div class="flex min-h-screen">
    <nav class="hidden md:flex md:sticky md:top-0 md:h-screen md:overflow-y-auto flex-col w-56 shrink-0 border-r border-hairline bg-surface p-4 gap-1">
      <span class="font-heading font-bold mb-4">{{PRODUCT_NAME}}</span>
      <a href="#" class="rounded-proto px-3 py-2 text-sm bg-accent/10 text-accent" aria-current="page">Overview</a>
      <a href="#" class="rounded-proto px-3 py-2 text-sm text-ink2 hover:bg-elevated">Reports</a>
    </nav>
    <main class="flex-1 min-w-0 px-4 sm:px-6 py-6"><!-- screen content --></main>
  </div>
  ```
  `hidden md:flex` drops the rail at 390px — ship a top bar or drawer as the mobile fallback, not a squeezed 56px column; `md:sticky` keeps the rail in view as the page scrolls.

**Accountability:** name the shape you picked in `DESIGN.md` ("Nav: side-rail,
because…") — don't land on wordmark-left + inline links + button-right by default;
land there only after deciding against the other three.

We skip a footer catalog on purpose: prototypes are app-shell, not marketing pages,
and are rarely footer-heavy enough to need one.

## Step 6: Build screens

One HTML file per screen. Each screen:

- **Duplicate nav + footer** across pages. Do NOT add a build step to DRY this up — prototypes die when they get a build step.
- **Realistic content only**, matched to the product domain. Fintech → real merchants and amounts. HR → real roles and org structures. Every name, number, and label should feel plausible. Never lorem ipsum.
- **Every link goes somewhere.** Run a dead-end sweep: enumerate every `<a href>` and `<button>`; each must navigate, open a modal, or fire a visible toast. A dead button kills the pitch.
- **Responsive by default.** Design at 1440, verify at 768 and 375. Never horizontal scroll at 375.
- **URL state for interactive bits.** Modals, tabs, accordions wired through `State.set()`. Opening `?modal=signup` lands with the modal open; the Share button copies a URL reproducing the exact screen.
- **Theme-safe colors.** Every color uses a CSS var or a Tailwind class mapped to one. Flip all themes to verify nothing breaks.
- **Spacing rhythm & the squint test.** Space with the `--space-*` scale via `gap` — tight within a group (8–12px), generous between sections (48–96px), never uniform padding. Then squint at each screen (or blur it): if the primary element still dominates, hierarchy holds; if it's mush, add contrast in size / weight / space.
- **Tight-leading display type needs clearance.** An oversized heading/wordmark with `line-height` below 1 (`leading-none`, `leading-[0.8]`, etc.) clips its own descenders/ascenders out of the line box — the glyphs are still there, just outside the box the layout thinks it reserved. Pair any such heading with `padding-bottom` (~0.15–0.25em of its font-size) or `margin-bottom` so a period or descender never collides with the next block. Tight leading is fine; tight leading with a flush neighbor and no clearance isn't.
- **Icons & imagery.** *Decide the icon role from the register — `DESIGN.md` names it (discovery.md Step 4) — don't leave density to chance.* **Product** register (dashboards, tools, app shells): icons are **functional** — they carry affordances (nav destinations, row/card actions, status, controls); a product screen with no action or nav icons is usually under-built. **Brand** register (landing, pitch, editorial): icons are **earned, not default** — lead with type and space, use an icon only where it removes ambiguity (a play control on an audio CTA), never decorative above headings; zero icons is a legitimate, deliberate outcome. Where you do use them: inline SVG copied from [reicon.dev](https://reicon.dev) (MIT, 2,700+, multiple weights) at **one** weight — never a big rounded icon above every heading. `brands.reicon.dev` covers real-looking logos. For photos, follow "Real imagery for photo-forward products" below — a glyph tile is a fallback, never the plan.

### Page archetypes — beyond the app-shell

Most prototypes are an app-shell (nav + screens). But three other whole-page shapes recur in the
best work (`reference/inspiration.md`) and fit specific briefs — pick the archetype in discovery, name
it in `DESIGN.md`, don't default to app-shell for everything:

- **Single-artifact showcase** (beam / metal / orbs) — the page *is* one component, shown off. Centered,
  quiet OKLCH-tinted near-black, one **hero live demo**, then `Installation → Usage → Playground`.
  For a pitch of a single feature, effect, or primitive. Its engine is the **playground pattern**
  below. Signature belongs on the artifact, not the chrome; GitHub/X pair + "Made by —" footer.
- **Live component catalog** (aicss / transitions.dev / beautiful-ui / originkit) — a category-labeled
  grid (or left-TOC list) of **real running demos**, never screenshots. Each tile: the live thing + a
  **name + one-line mechanic** + a copy affordance; band label + count on the right. For a library,
  design-system, or "here's everything it does" page. Keep tiles as quiet frames so the content reads.
- **Documentation-as-landing** (agentation) — a technical product typeset as a beautiful *document*:
  left TOC, numbered how-to, inline code chips, an **embedded working demo** inside the prose, one
  expressive flourish (a script wordmark) on an otherwise-neutral face, "Made by / Colophon" footer.
  For a dev tool / API / agent product where the audience is technical and prose is the pitch.

**The playground pattern** (the showcase's engine, reusable anywhere): variant **toggles** (pill
segmented controls) + a **slider** drive a live preview *and* regenerate a copy-paste code/spec block
in real time. It's the control-bar philosophy (`Visible control bar` above) applied to one element —
wire it through `State.set()` so the shown config and the emitted snippet never drift, and put a
copy-as-label-swap button (`UI.copyButton`) on the snippet.

**Legitimacy tells** (cheap, and they read as "a real team shipped this"): an `npm install …` line
with a copy button in the hero; a small **Pro** badge on premium items; a GitHub/X icon pair
top-right; a "Made by — / Colophon" footer; an inline "new stuff, in your inbox" capture. Use a few,
honestly — they're texture, not a checklist to spam.

**AI / agent products → `reference/ai-native-ui.md`.** If the prototype has an agent or model as an
actor (chat, copilot, agent console), that file is the component vocabulary — thinking-state taxonomy,
streaming text, tool-call states, approval cards, task rows — all zero-dep and wired to the loading
engine. Don't invent AI UI from scratch; it has its own genre now.

### Real imagery for photo-forward products

Marketplaces, listings, and profiles can't demo credibly on placeholders — a reviewer
clicks into a listing expecting a photo, and a gradient tile reads as unfinished. **This
fires whenever real imagery would materially change credibility — not only the named
categories, and regardless of `register`:** a `brand`/landing page that shows things off
(podcast covers, portfolio work, product shots, team photos) is cover-relevant too, so
don't let "it's just a landing page" skip it. Before building any such screen, **ask the
user for a handful of images** (3–8 covers most demos: a few products/venues/listings/covers
+ a couple of profile photos). Don't silently ship placeholders for a photo-forward product
and hope no one notices — and even when the chosen imagery stance is typographic or
placeholder, **wire the `.media` hook** so real art can drop in later without a rebuild.

1. **Ask, then wait.** One message: "This prototype is photo-forward — can you drop 3–8
   images into `assets/images/` (or share paths/links), or should I use placeholders for
   now?" Build the rest of the screen while you wait; wire images in once they land.
2. **Real photo, when you have one:** drop the file in `assets/images/` and reference it
   literally — no build step, no optimization pipeline:
   ```html
   <div class="media"><img src="assets/images/listing-1.jpg" alt="Sunlit loft living room"></div>
   ```
   `.media` sizes and crops (`object-fit: cover`) whatever `<img>` you give it — same
   markup for a 4000px photo or a 400px screenshot.
3. **Consented hotlink, if the user points you at URLs they have rights to** (their own
   site, a stock library they're licensed for): use the URL directly as `src`. Never
   hotlink imagery you found yourself to fill a gap — it's someone else's asset, and the
   link can rot mid-demo. If the user's links aren't reachable from this environment,
   say so rather than swapping in a silent placeholder.
4. **Generated images, if the user wants AI photos** and says so: generate or ask them to
   generate a small set, save to `assets/images/`, reference the same way as (2). Caption
   generated images honestly in `DEMO.md` if the reviewer might ask ("product photos are
   AI-generated placeholders").
5. **No images available yet:** use a `data-scene` placeholder — still better than a flat
   glyph, but say so in `DEMO.md` ("swap in real photos before a live demo"):
   ```html
   <div class="media" data-scene="still-life"></div>   <!-- marketplace / product listing -->
   <div class="media" data-scene="landscape"></div>    <!-- venue / real-estate / travel -->
   <div class="media" data-scene="portrait"></div>     <!-- profile card -->
   ```
   Never mix `data-scene` and a real `<img>` on the same `.media` — the photo should
   always win outright, not share the box with a mask.

**Fallback ladder, strongest to weakest:** real photo in `.media` → `data-scene` →
flat wash (bare `.media`, no attribute) → initials `.avatar` (people only, never for
objects or places). For a photo-forward product, landing on anything below "real
photo" without having asked the user first is the bug this section exists to prevent.

---

**Building is not the last step.** After the screens exist you are ~60% done — Step 7
(assess, `reference/assess.md`) is mandatory, not optional. A prototype with no `LINT.md`
(or an impeccable audit that actually ran) and no per-screen pre-emit self-critique stamp
is **unfinished**: do not proceed to handoff or ship until both exist and their findings
are fixed.
