---
name: prototype
description: Build production-feel HTML prototypes for sales demos, stakeholder reviews, and design exploration. Runs a discovery Q&A, scaffolds a zero-dep static site (HTML + Tailwind CDN + CSS variables + theme switcher + layout switcher + URL-state + feedback overlay + always-visible control bar), and runs a design-quality assessment loop. Use when the user says "prototype", "mockup", "demo", "pitch page", "sales demo", "click-through", or describes a UI they want to show someone without building the real thing. Also handles /prototype variant "<vibe>" (fork a variant) and /prototype apply-feedback <file> (apply pinned feedback JSON).
---

# /prototype

Build prototypes people can actually click through, share URLs to specific screens, comment on, and iterate on — without a build step or backend. Output is plain HTML + Tailwind CDN + a few small vanilla JS files.

## When to use

- User asks for a prototype, mockup, demo, pitch page, or sales click-through.
- User describes a UI they want to show stakeholders without building the real product.
- User wants to explore visual directions before committing to an implementation.

## When NOT to use

- User is building a real production feature (use the app's actual stack).
- User wants a one-off component or snippet (just write it inline).
- User wants a design system (use `/design-consultation` or `/teach-impeccable`).

## Commands

```
/prototype                          → full flow: discover → build → assess → ship
/prototype variant "<vibe>"         → fork current prototype into variants/<slug>/
/prototype apply-feedback <file>    → read feedback JSON, apply each comment, re-assess
```

## The flow at a glance

```
0. Preflight        → ensure-deps.sh auto-installs impeccable + prompt-refiner
1. Mode check       → quick or discovery?
2. Discovery Q&A    → tone, inspiration, audience, scope, content
3. Refine spec      → prompt-refiner (auto-installed if missing)
4. Design shaping   → impeccable teach + shape (auto-installed if missing)
5. Scaffold         → copy templates, wire theme/layout/state/feedback
6. Build screens    → realistic content, dead-end sweep, responsive by default
7. Assess           → impeccable audit/detect/critique; builtin-lint only if install failed
8. Browser QA       → claude-in-chrome screenshots if installed, else manual steps
9. Handoff docs     → generate DEMO.md + README.md inside the prototype
10. Ship            → offer Vercel deploy, suggest share-URL usage
```

## Skill detection protocol

**Step 0 (preflight) auto-installs the essential companion skills.** After preflight, check the current session's skill list (listed in `<system-reminder>` messages as the "available skills") and deferred-tool list (loadable via `ToolSearch`). Do this detection explicitly — do not assume from memory.

| Skill / tool | Used for | Fallback (only if auto-install failed) |
|---|---|---|
| `prompt-refiner` (skill) | Turn Q&A answers into a tight build spec | Use raw answers |
| `impeccable` (skill, with `audit` / `detect` / `critique`) | Deep design assessment | `checks/builtin-lint.md` |
| `teach-impeccable` (skill, setup only) | Design direction (`DESIGN.md`) | Generate inline with built-in defaults |
| `mcp__claude-in-chrome__*` (MCP tools, deferred) | Screenshot + console QA | Print local-server instructions + manual checklist |

**If a skill is detected, you MUST invoke it.** Not a preference, not a judgment call. The fallback path is only for when auto-install failed (no npx/Node, no network, etc.). Skipping an available skill to "save time" or "avoid friction" is wrong and produces a worse prototype.

Note: the skill list in `<system-reminder>` messages is captured at session start and doesn't refresh mid-session. If preflight just installed a new skill, the skill is present on disk at `~/.claude/skills/<name>/` and invokable via Bash for CLI skills, even if the Skill tool doesn't see it until the next session. Check the filesystem, not just the reminder.

Never fail because an optional skill is missing — mention it in the final report as an enhancement path.

---

## Step 0: Preflight — ensure companion skills

Before anything else, run the preflight script to auto-install essential companion skills if they're missing:

```
bash ~/.claude/skills/prototype/ensure-deps.sh --yes
```

This installs:
- **impeccable** (via `npx -y skills add pbakaus/impeccable`) — deep design assessment
- **prompt-refiner** — if missing, prints install guidance (can't auto-install without canonical source)

The script is idempotent and safe to re-run; if both are already installed it exits cleanly in a fraction of a second. Do not skip this step. If npx or Node is unavailable, the script prints a guidance message and continues — `/prototype` falls back to built-in checks but note this in the final ship report.

After preflight succeeds, proceed to Step 1.

## Step 1: Mode check

First message to the user:

> **Quick or Discovery?**
> - **Quick** — I'll scaffold a prototype with sensible defaults in about a minute. You describe it in one or two sentences.
> - **Discovery** — I'll ask you 5–7 questions (tone, inspiration, audience, scope, content) to get the vibe right before I build.

If the user clearly has a rich brief already (multiple paragraphs, attached references), skip the question and jump to discovery. If they say "quick", collapse the Q&A to a single combined prompt.

## Step 2: Discovery Q&A

Ask these one at a time, conversational tone, not as a form:

1. **What are you prototyping?** — one-sentence product summary. Used for content, not just structure.
2. **Tone?** — offer presets: *playful · corporate · technical · editorial · bold-experimental · minimal*. Free-text welcome.
3. **Inspiration** — URLs or images that capture the vibe. "Share 1–3 references, or skip." WebFetch public URLs to extract mood notes (palette words, typography feel, layout density). Read images via multimodal. **Do not copy** — use as vibes context only.
4. **Audience & use case** — *sales demo · internal review · client pitch · design exploration*.
5. **Scope** — how many screens, what's the core user flow. Drives SPA-vs-multi-page decision.
6. **Content** — *real content (user provides) · realistic placeholder · loose lorem-ish*. Favor realistic placeholder by default; never actual lorem ipsum.

**Not asked — baseline requirements (always true):**
- Every prototype is **interactive**. Every screen clickable, every CTA wired, modals open, tabs select, composers compose, filters filter. "Static mockup" is not a valid output of this skill. If the user wants static visuals without interactivity, redirect them to `/design-shotgun` or `/design-html`.
- Every prototype has an **always-visible control bar** with theme switcher (all options shown) + layout switcher (all options shown) + share button + **feedback toggle**.
- **Feedback is always visible.** Reviewers can comment on any prototype without URL hacks or hidden flags. The 💬 Feedback button ships enabled on every screen.

After the user answers, confirm a one-paragraph summary before building. This is the point where they can course-correct cheaply.

## Step 3: Refine the spec

**Detection:** look for `prompt-refiner` in the available-skills list.

- If present → you MUST invoke it via the Skill tool with the Q&A answers as input. Do not synthesize the spec inline when the skill is available.
- If absent → synthesize inline.

The spec must include:
- Product name + one-line pitch
- Tone descriptors (3–5 adjectives)
- Screens list (name + one-line purpose each)
- Primary user flow (sequence of screens)
- Theme names (3 by default: e.g., "studio", "terminal", "mono" — or 2 if user prefers simple light/dark)
- **Layout variants** — 2–4 options chosen for THIS prototype based on tone + inspiration + content type (see "Choosing layouts" below). Never default to a generic "2col / 3col".
- Content domain for realistic copy
- Notable interactions (modals, tabs, toasts)

### Choosing layouts

Layouts are per-prototype, not a template default. Pick 2–4 options that reflect how real products in the same category let users change information density or view mode. Match the inspiration you gathered in discovery.

Common UI/UX patterns to pick from:

| Product type | Good layout options | Why |
|---|---|---|
| Photo-forward marketplace (Airbnb, Etsy) | `grid` / `gallery` / `list` | Grid scans, gallery features visuals, list is dense |
| Content site (blog, editorial) | `reading` / `with-sidebar` | Reading mode vs. navigable |
| Dashboard / tool (Linear, Notion) | `compact` / `comfortable` / `spacious` | Density for different tasks |
| Inbox / messaging | `list-only` / `split-view` / `preview` | View-mode |
| E-commerce catalog | `grid-2` / `grid-3` / `grid-4` | Density in a uniform grid |
| Data tables / analytics | `condensed` / `standard` / `roomy` | Row height density |
| File browser | `grid` / `list` / `details` | Classic OS metaphor |

Rules of thumb:
- **2 options** minimum. One option is no toggle — just delete it.
- **4 options** maximum. More than 4 is choice paralysis.
- **Don't invent exotic modes.** Use the vocabulary real products in the category use. "Grid / Gallery / List" is better than "Mosaic / Cards / Rows."
- **Make the differences real.** Switching layouts must visibly change the rendering — not just tweak a padding by 4px.
- **Pick based on inspiration.** If the user shared Linear as inspiration, density makes sense. If they shared Airbnb, grid/gallery/list makes sense.

## Step 4: Design shaping

If `teach-impeccable` / impeccable skill is loaded, run `impeccable teach` then `impeccable shape` with the spec + inspiration to produce a per-prototype `DESIGN.md` with tokens (palette, typography, spacing, motion).

Otherwise generate a `DESIGN.md` inline with these defaults:
- **Color** — one accent, one neutral ramp (9 steps), one surface color. Each theme remaps the ramp.
- **Typography** — one heading font + one body font from Google Fonts. Scale: 12 / 14 / 16 / 20 / 24 / 32 / 48.
- **Spacing** — 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64.
- **Radius** — 0 / 4 / 8 / 16 for the three theme moods.
- **Motion** — 150ms ease-out default, reveal-on-scroll only where it earns attention.

The `DESIGN.md` lives in the prototype folder, not globally. Each prototype has its own.

## Step 5: Scaffold

Create the new prototype folder (default: `$(pwd)/<slug>/`) and populate it from `templates/scaffold-base/` + `templates/feedback-overlay/`.

Template files fall into two categories:

**Copy literally, no edits:**
- `templates/scaffold-base/js/state.js` → `js/state.js` — URL state utility. Product-agnostic.
- `templates/scaffold-base/js/ui.js` → `js/ui.js` — interaction helpers (loading button, toast, declarative `[data-loading]` / `[data-toast]` / `[data-confirm]` attributes). Product-agnostic.
- `templates/feedback-overlay/feedback.js` → `js/feedback.js` — feedback overlay. Product-agnostic.
- `templates/feedback-overlay/feedback.css` → `css/feedback.css` — feedback overlay styles. Product-agnostic.

**Copy then customize:**
- `templates/scaffold-base/js/theme.js` → `js/theme.js` — update the `THEMES` array and `STORAGE_KEY` to match your `DESIGN.md`.
- `templates/scaffold-base/js/layout.js` → `js/layout.js` — update `LAYOUTS` array to match the spec's layout names.
- `templates/scaffold-base/js/persona.js` → `js/persona.js` — update `PERSONAS` array to match data.js persona keys.
- `templates/scaffold-base/js/data.js` → `js/data.js` — populate personas + shared data for this prototype.
- `templates/scaffold-base/js/app.js` → `js/app.js` — keep the core wiring (modals, tabs, composer, hydrate) and add product-specific handlers as needed.
- `templates/scaffold-base/css/styles.css` → `css/styles.css` — replace the 3 default `html[data-theme="X"]` blocks with tokens from your `DESIGN.md`. Add product-specific component classes (`.card`, `.chip`, `.status-*`, `.kpi`, etc.). Keep the `.proto-grid`, `.proto-seg`, `#proto-controls`, `.proto-toast`, `.is-loading`, and `.empty-state` blocks as-is — they're part of the platform.
- `templates/scaffold-base/404.html` → `404.html` — substitute tokens, replace nav/footer with the product's chrome.
- `templates/scaffold-base/serve.py` → `serve.py` — no-cache dev server. Copy as-is, no edits. Shipping this with every prototype means reviewers who clone+run don't hit the browser-caching "my changes aren't showing" confusion.

**Structural reference, not a copy:**
- `templates/scaffold-base/index.html` — this is a *starting layout* with placeholder tokens like `{{PRODUCT_NAME}}`. Do NOT copy and substitute — write `index.html` and all other screens fresh, using the template as a structural reference for the head/nav/footer/**control-bar** pattern.

Baseline every screen needs:
- `<html data-theme="<default>" data-layout="<default>" data-persona="<default>">` with defaults from the spec.
- Tailwind CDN + inline config extending CSS vars so `bg-surface`, `text-accent`, `border-muted` work.
- **Visible control bar** (see below) — not a click-to-reveal pill.
- Scripts loaded in order at the bottom of `<body>`: `state.js` → `theme.js` → `layout.js` → `data.js` → `persona.js` → `ui.js` → `app.js` → `feedback.js`. Data must load before persona (persona reads it). UI must load before app (app may use `UI.toast`).

### Visible control bar — REQUIRED pattern

Reviewers should see **every theme and layout option at a glance**, not click-click-click-through a cycling button to discover them. Use this exact pattern on every screen:

```html
<div id="proto-controls">
  <div class="proto-bar">
    <div class="proto-bar-section">
      <span class="proto-bar-label">Theme</span>
      <div class="proto-seg-group">
        <button class="proto-seg" data-theme-option="<name1>" aria-pressed="true">Name 1</button>
        <button class="proto-seg" data-theme-option="<name2>" aria-pressed="false">Name 2</button>
        <button class="proto-seg" data-theme-option="<name3>" aria-pressed="false">Name 3</button>
      </div>
    </div>
    <div class="proto-bar-section">
      <span class="proto-bar-label">Layout</span>
      <div class="proto-seg-group">
        <button class="proto-seg" data-layout-option="<layout1>" aria-pressed="true">Layout 1</button>
        <button class="proto-seg" data-layout-option="<layout2>" aria-pressed="false">Layout 2</button>
      </div>
    </div>
    <div class="proto-bar-section">
      <span class="proto-bar-label">Persona</span>
      <div class="proto-seg-group">
        <button class="proto-seg" data-persona-option="<persona1>" aria-pressed="true">Persona 1</button>
        <button class="proto-seg" data-persona-option="<persona2>" aria-pressed="false">Persona 2</button>
      </div>
    </div>
    <div class="proto-bar-section">
      <button class="proto-seg" data-share>🔗 Share</button>
      <button class="proto-seg" data-feedback-toggle>💬 Feedback</button>
    </div>
  </div>
  <p class="proto-hint">Shift + ? · recent screens</p>
</div>
```

Styling for `#proto-controls`, `.proto-bar*`, `.proto-seg*` ships in `templates/scaffold-base/css/styles.css` — do not restyle. The bar is positioned bottom-center (not bottom-right) so it's discoverable and doesn't fight with right-side content sidebars.

### Control bar — unbreakable constraints

The bar is visible on every screen and is load-bearing for reviewer confidence. These CSS rules ship in the scaffold and MUST NOT be removed or weakened:

- **`flex-wrap: nowrap`** on `.proto-bar` — the bar NEVER wraps to a second line. A wrapped bar has broken once and the reviewer notices.
- **`overflow-x: auto` + hidden scrollbar** — if content overflows at very narrow viewport widths, the bar scrolls sideways instead of breaking.
- **`flex-shrink: 0`** on `.proto-bar-section` — sections keep their intrinsic width and never get squeezed unevenly.
- **Uppercase labels (`THEME` / `LAYOUT` / `PERSONA`) hide at ≤960px** via media query. Segmented buttons themselves stay readable (they show the actual option names like "Ivory", "Grid", "Planning").
- **The `.proto-hint` line ("Shift + ? · recent screens") has its own `backdrop-blur` background** so it never paints on top of page content. It's also hidden at ≤960px.
- **Do not add new sections** without first verifying the bar still fits at 1440px viewport with room to spare. If 3 sections + 2 actions don't fit, the new section needs shorter labels or an icon-only variant.

If you customize the bar (e.g. add a fourth dimension), run this check manually: resize browser to 375/768/1440/1920; the bar is always a single row at all four widths, scrollable sideways only at the narrowest.

### Data layer — REQUIRED pattern

Every prototype has a single `js/data.js` file with all product content. No hardcoding names, prices, dates, or lists in HTML — HTML references data via `data-persona-text`, `data-persona-show`, `data-persona-hide`.

The data file contains:
- **personas** — 2–4 states the prototype can be shown in (new user, active, power user, post-conversion, etc.). Each persona defines the per-user fields that change: name, initials, counts, lists of entities they have access to.
- **shared** — entities that are the same across personas (catalog, navigation labels, copy that doesn't change).

When the user toggles persona in the control bar, `Data.apply(personaName)` walks the DOM and updates text, shows/hides elements. Empty states, loaded states, and lifecycle states all come from swapping personas.

### Persona switcher — REQUIRED pattern (alongside theme + layout)

Personas are the THIRD control-bar dimension. Use them to demonstrate different lifecycle moments in one prototype:

| Product type | Example personas |
|---|---|
| Marketplace | `new-buyer` · `active-buyer` · `frequent-buyer` |
| SaaS tool | `empty-trial` · `active-trial` · `paid-team` |
| Internal app | `new-hire` · `manager` · `admin` |
| Content platform | `first-visit` · `returning` · `subscribed` |

2–3 personas is usually right — enough to show the product's range without overwhelming. Always include at least ONE empty/new state (that's the hardest to design and the most often forgotten).

### Interaction states — REQUIRED pattern

Every interactive element needs a non-trivial response. "Submit" that does nothing kills a demo. Baseline checklist on every prototype:

- **Loading state** — any primary CTA (book, submit, save, send) uses `data-loading="<text>"` and optionally `data-toast="<msg>"`. Click briefly shows the loading text with a spinner, fires the toast, then navigates or modal-opens. The ui.js helper wires this automatically.
- **Success toast** — any action that "succeeds" shows a confirmation toast: message sent, changes saved, booking confirmed. Use `UI.toast('Saved', 'success')` or the declarative `data-toast` attribute.
- **Empty state** — every list/grid has an `.empty-state` wrapper shown when the persona's list is empty. Include a headline, one-line explainer, and a primary action ("Browse vendors", "Create your first…"). Ship empty states for AT LEAST the primary collection view on each side.
- **Error state / 404** — `404.html` ships with the scaffold. Link at least one "broken" affordance to it so reviewers see you considered it. Form validation errors render inline under the field, not as dismissable alerts.
- **Form state persistence** — inputs in multi-step flows should save to localStorage and restore on reload. Low-cost win: makes the demo feel alive across refreshes.
- **Skeleton loaders** — any list/grid that changes in response to user action (filter chips, pagination, persona switch, page load) should briefly swap to placeholder silhouettes before the new content lands. Mark the container with `data-skeleton-on-filter` (auto-wires to filter-chip events) or call `UI.fakeLoad(container, 650, { count: 6 })` programmatically. Sells the illusion that the prototype is actually querying data. The `.skeleton` CSS class + shimmer animation ships in styles.css; tune placeholder shape with `.skeleton.is-text` / `.is-text-lg` / `.is-block` / `.is-circle` modifiers.

### Layout system — REQUIRED pattern

Every prototype has a layout toggle alongside theme. Number of layouts, their names, and what they do comes from the spec (see "Choosing layouts" above). Not fixed to column counts.

Implementation:
1. Update `LAYOUTS` array in `js/layout.js` to match the spec (e.g., `['grid', 'gallery', 'list']`).
2. Add CSS rules in `css/styles.css` keyed off `html[data-layout="X"]`:
   ```css
   html[data-layout="grid"]    .proto-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
   html[data-layout="gallery"] .proto-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
   html[data-layout="list"]    .proto-grid { grid-template-columns: 1fr; }
   /* For view-mode changes beyond column count: */
   html[data-layout="list"]    .proto-grid > .card { flex-direction: row; }
   html[data-layout="list"]    .proto-grid > .card .photo { width: 200px; }
   ```
3. Update the control bar buttons to match: `<button data-layout-option="grid" aria-pressed="true">Grid</button>`, etc.
4. Tag any listing / card-grid / gallery section with `class="proto-grid"` — it responds to `data-layout`.
5. Non-listing containers (KPI rows, form fields) stay with their own Tailwind classes and don't respond to the toggle — layouts apply to *content surfaces*, not chrome.

The layout names in the spec, `layout.js`, CSS rules, and control-bar buttons MUST match exactly. A typo here silently breaks the toggle.

File tree produced:

```
<slug>/
├── index.html
├── <screen>.html           # one file per screen from the spec
├── css/
│   ├── styles.css
│   └── feedback.css
├── js/
│   ├── theme.js
│   ├── state.js
│   ├── feedback.js
│   └── app.js
├── assets/
│   └── images/             # placeholder images go here
├── DESIGN.md
├── DEMO.md
└── README.md
```

## Step 6: Build screens

One HTML file per screen. Each screen:

- **Duplicate the nav + footer** across pages. Do NOT introduce a build step to DRY this up — prototypes die when they get a build step.
- **Realistic content only.** Never lorem ipsum. Generate names, dates, numbers, copy that fit the product domain from the spec. Fintech → realistic merchants and amounts. HR → realistic roles and org structures. Every name, every number, every label should feel plausible.
- **Every link goes somewhere.** Run a dead-end sweep: enumerate every `<a href>` and `<button>`, make sure each navigates to a page, opens a modal, or triggers a visible toast. A sales demo with a dead button kills the pitch.
- **Responsive by default.** Design at 1440, verify at 768 and 375. Use Tailwind's responsive variants. Never horizontal scroll at 375px.
- **URL state for interactive bits.** Modals, tabs, accordions — all wired through `State.set()` so state is in the URL. A user opening `?modal=signup` lands with the modal open. A user clicking the Share button copies a URL that reproduces the exact screen.
- **Theme-safe.** Every color reference uses CSS vars or Tailwind classes mapped to vars. Switching themes changes everything cleanly. Verify by flipping all themes.

Place the floating control pill bottom-right with three buttons: theme switcher · share · feedback (feedback only visible when `?feedback=1`).

## Step 7: Assess

**Detection:** look for `impeccable` in the available-skills list. Note: `teach-impeccable` alone (one-time setup) does not count — Step 7 needs the full impeccable with `audit` / `detect` / `critique` subcommands.

If `impeccable` is present → you MUST run, in order:
- `impeccable audit` — overall pass against design tokens + Nielsen heuristics
- `impeccable detect` — 25 anti-pattern rules (purple gradients, gradient text, nested cards, etc.)
- `impeccable critique` — UX critique with scored dimensions

Collect findings, fix them, re-run until clean. Commit each fix batch atomically.

If `impeccable` is absent, run the built-in checker in `checks/builtin-lint.md`:
- Purple gradients
- Gradient text
- Low contrast on body text
- Dead buttons / links
- Text overflow at 375px width
- Console errors on page load
- Missing alt text
- Nested cards more than 2 deep

Report findings, fix them, re-verify. Note in the output: *"For deeper design assessment, install impeccable: https://impeccable.style/"*.

## Step 8: Browser QA

**Detection:** look for `mcp__claude-in-chrome__*` tools in the deferred-tool list. If present, you MUST use them. Do not default to the manual-server fallback just because 81 screenshots feel like a lot — sample intelligently instead.

If claude-in-chrome tools are present:
1. Call `mcp__claude-in-chrome__tabs_context_mcp` first with `createIfEmpty: true`.
2. Start a local server in the prototype folder: `python3 -m http.server <port>` (background).
3. **Screenshot budget** — don't try to cover every combination. Minimum viable: at 1440 width, capture the default theme on every page (N screens). Then capture the two non-default themes on 2–3 representative pages (hero, a content-heavy page, a form-heavy page). That's ~N + 6 screenshots, not N × themes × breakpoints.
4. Separately resize to 375 and screenshot the top 2–3 pages for mobile-rendering spot-checks.
5. Read console messages on each page with `onlyErrors: true, pattern: "error|Error|failed|Failed"` — any error fails the check and must be fixed before shipping.
6. Save screenshots under `<slug>/screenshots/` with names like `index-ivory-1440.png`, `category-obsidian-375.png`.

If tools are absent, print:
```
cd <slug> && python3 serve.py
# then open http://localhost:8000
```
Plus a manual checklist: desktop/tablet/mobile, every theme, click every button.

## Step 9: Handoff docs

Generate two files inside the prototype:

**`DEMO.md`** — click-through walkthrough for the presenter. Render from `templates/demo-docs/DEMO.md.template`. Format: numbered steps, one screen per step, with a one-sentence narrative ("Start on landing. Click 'Get started' — this opens the signup modal, preloaded with a plausible email").

**`README.md`** — how to run locally (3 options: python3, npx serve, double-click), what the themes are, what's fake vs real, known gaps.

## Step 10: Ship

Final message to the user:

- Summary of what was built (screen count, themes, notable interactions).
- `cd <slug> && python3 serve.py` — the run command.
- Share-URL tip: "Click 🔗 in the floating control pill to copy a URL to any screen with its exact state."
- Feedback tip: "Append `?feedback=1` to any URL to enable the comment overlay. Export JSON and run `/prototype apply-feedback <file>` to apply the notes."
- Offer Vercel deploy (optional, only if user seems ready to share): *"Want me to add a `vercel.json` and deploy? Say deploy."*
- Point to optional skills not used this run: *"For deeper QA, run /qa-only. For a designer's-eye pass, run /design-review."*

---

## Subcommand: /prototype variant "<vibe>"

Fork the current prototype into a new sibling folder to explore an alternative direction.

1. Detect the current prototype folder (cwd or ask).
2. Copy it to `variants/<slugified-vibe>/`.
3. Update the spec's tone descriptors based on `<vibe>` (e.g., "more corporate" → swap playful adjectives for measured ones).
4. Re-shape `DESIGN.md` (tokens, type, palette) for the new vibe. Re-apply to CSS vars.
5. Run the same build → assess loop on the variant.
6. Keep the original untouched. Output: "Original at `<slug>/`, variant at `<slug>/variants/<vibe>/`."

## Subcommand: /prototype apply-feedback <file>

1. Read the feedback JSON. Validate the structure.
2. Group comments by page.
3. For each comment:
   - **type: "bug"** — locate element via `selector`, fix the broken interaction. Verify by navigating to `shareable_url` and reproducing.
   - **type: "change"** — apply the visual/layout/copy change.
   - **type: "question"** — write an inline answer in `feedback-responses.md` (do not change code).
4. After all comments applied, re-run impeccable audit + builtin lint.
5. Re-screenshot affected screens (if chrome available).
6. Archive the applied JSON to `feedback/applied/<timestamp>.json` with a summary of what changed per comment.
7. Atomic commit: *"apply feedback batch YYYY-MM-DD: N items"*.

---

## Output discipline

- **Don't ask more than one question per turn** during discovery. Conversational, not a form.
- **Don't build anything** until the user sees the one-paragraph summary and agrees.
- **Always interactive.** Every button, link, modal, tab, composer, filter must work. No dead buttons. No static mockup output — if the user wants that, redirect to `/design-shotgun` or `/design-html`.
- **Always show every theme + layout option.** The control bar is a visible segmented control, never a click-to-reveal pill. Reviewers see all options at a glance.
- **The control bar never wraps.** `flex-wrap: nowrap` + `overflow-x: auto` is load-bearing. A two-line control bar is a visible defect that breaks reviewer trust — if it wraps once, everything else in the prototype comes into question.
- **Don't skip the dead-end sweep.** Sales demos with dead buttons are worse than no demo.
- **Never lorem ipsum.** Ever.
- **Don't introduce build tools** (webpack, vite, etc.). Tailwind CDN only. This is load-bearing for "anyone can run it".
- **Don't ship 8 screens when asked for 4.** Respect scope.
- **Don't hardcode paths or user names** — this is open source.
- **Don't fabricate skill availability** — actually check the system-reminder list before calling an optional skill.
- **Don't shortcut an available skill.** If `prompt-refiner`, `impeccable`, or `claude-in-chrome` is present in the session, invoking it is not optional. Using the fallback path when the skill is available is a worse prototype.

## References

- Impeccable: https://impeccable.style/
- Scaffold templates: `templates/scaffold-base/`
- Feedback overlay: `templates/feedback-overlay/`
- Handoff doc templates: `templates/demo-docs/`
- Built-in lint rules: `checks/builtin-lint.md`
