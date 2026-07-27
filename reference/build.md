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
- `scaffold-base/js/ui.js` → `js/ui.js` — interaction helpers (loading button, toast, declarative `[data-loading]` / `[data-toast]` / `[data-confirm]`, modal focus trap, opt-in `UI.withViewTransition`).
- `feedback-overlay/feedback.js` → `js/feedback.js` — feedback overlay.
- `feedback-overlay/feedback.css` → `css/feedback.css` — feedback overlay styles.
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
│   ├── layout.js           # data-layout switcher
│   ├── data.js             # personas + shared content
│   ├── persona.js          # data-persona switcher
│   ├── ui.js               # loading / toast / skeleton / confirm helpers
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
- Tailwind CDN + inline config extending CSS vars so `bg-surface`, `text-accent`, `border-muted` work.
- The visible control bar (below) — not a click-to-reveal pill.
- Scripts loaded in this order at the end of `<body>`: `state.js` → `theme.js` → `layout.js` → `data.js` → `persona.js` → `ui.js` → `app.js` → `feedback.js`. Data loads before persona (persona reads it); ui before app (app may call `UI.toast`).

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

- **The eight states.** Every button and input covers default / hover / focus / active / disabled / loading / error / success. The scaffold ships a global `:focus-visible` ring + an `:active` press; keep custom `:hover` styles behind `@media (hover:hover)` (touch can't hover). Forms validate on blur with the error inline below the field; prefer an undo toast over a confirm dialog.

- **Loading state** — primary CTAs (book, submit, save, send) use `data-loading="<text>"` (+ optional `data-toast="<msg>"`). Click shows loading text + spinner, fires the toast, then navigates or opens a modal. ui.js wires this.
- **Success toast** — anything that "succeeds" shows a confirmation: `UI.toast('Saved', 'success')` or `data-toast`.
- **Empty state** — every list/grid has an `.empty-state` wrapper for when the persona's list is empty: headline + one-line explainer + primary action ("Browse vendors", "Create your first…"). Ship at least the primary collection view's empty state on each side.
- **Error state / 404** — `404.html` ships with the scaffold. Link at least one "broken" affordance to it. Form validation errors render inline under the field, not as dismissable alerts.
- **Form state persistence** — multi-step inputs save to localStorage and restore on reload. Cheap win; makes the demo feel alive across refreshes.
- **Skeleton loaders** — any list/grid that changes on user action (filter chips, pagination, persona switch, page load) briefly swaps to placeholder silhouettes. Mark a container `data-skeleton-on-load` (auto-wires on page load; tune with `data-skeleton-count` / `data-skeleton-duration`), and for filter/pagination/persona changes call `UI.fakeLoad(container, 650, { count: 6 })` from the relevant handler in `app.js`. The `.skeleton` class + shimmer ships in styles.css; shape with `.is-text` / `.is-text-lg` / `.is-block` / `.is-circle`. `hideSkeletons` only restores the pre-skeleton snapshot if the container still shows the exact skeleton markup it injected — if a render function (e.g. a persona-driven list renderer) already filled the container with real content before the timer fires, the restore is skipped, so JS-rendered containers are safe to use with `data-skeleton-on-load` without any manual cleanup.
- **Modal focus trap** — every modal needs `role="dialog"`, `aria-modal="true"`, and an `aria-hidden` that flips with open state (author these on the modal markup itself); `app.js`'s `openModal`/`closeModal` already call `UI.trapFocus(modalEl, triggerEl)` on open and `UI.releaseFocus(modalEl)` on close. That helper (in `ui.js`) moves focus to the first focusable element inside, loops Tab/Shift+Tab within the modal so it can't leak to the page behind it, and restores focus to whatever triggered the modal when it closes. `app.js` also wires Esc to close whichever modal is open. Keep passing the trigger element (usually the clicked button) into `openModal` — it's what focus returns to. See `checks/builtin-lint.md` rule 6.

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

Two scroll/transition utilities ship in the scaffold but do nothing until a screen
opts in by adding the class or calling the helper. Both are reduced-motion-safe and
degrade to "just show the correct end state" if unsupported — never gate correctness
on either running.

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
- **Same-doc View Transitions** — wrap a DOM update (tab switch, filter re-render,
  persona swap) in `UI.withViewTransition()` (`ui.js`) so it cross-fades where the
  browser supports the API:
  ```js
  UI.withViewTransition(() => selectTab(name));
  ```
  Falls back to calling the function directly — same result, no animation — on
  Firefox, older Safari, or with `prefers-reduced-motion` set. `app.js`'s tab wiring
  already does this; use it as the reference call site.

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
- **Icons & imagery.** *Decide the icon role from the register — `DESIGN.md` names it (discovery.md Step 4) — don't leave density to chance.* **Product** register (dashboards, tools, app shells): icons are **functional** — they carry affordances (nav destinations, row/card actions, status, controls); a product screen with no action or nav icons is usually under-built. **Brand** register (landing, pitch, editorial): icons are **earned, not default** — lead with type and space, use an icon only where it removes ambiguity (a play control on an audio CTA), never decorative above headings; zero icons is a legitimate, deliberate outcome. Where you do use them: inline SVG copied from [reicon.dev](https://reicon.dev) (MIT, 2,700+, multiple weights) at **one** weight — never a big rounded icon above every heading. `brands.reicon.dev` covers real-looking logos. For photos, follow "Real imagery for photo-forward products" below — a glyph tile is a fallback, never the plan.

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
