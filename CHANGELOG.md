# Changelog

## v0.6.0 — 2026-07-31

The **app-shell release** — first-class support for the most common prototype shape (tools,
consoles, dashboards), plus two motion/loading defaults that were being left on the table.

### App-shell archetype
- **App-shell is now a documented archetype** (`build.md` → Page archetypes) with its structure
  (top bar + optional rail + inner-scrolling main + pinned footer/composer) and the two gotchas that
  break it: the top bar overflowing at 390px (lint rule 37) and the control-bar clearance.
- **`.proto-app-shell` scaffold helper** (`styles.css`) — a full-`100dvh` flex column that reserves
  control-bar clearance via a new **`--proto-controls-safe`** token, so a pinned composer/footer never
  hides under the floating control bar (the collision surfaced by the agent-console dogfood).

### Motion / loading defaults
- **Scroll-reveals are now a default for brand / expressive landings** (`build.md`) — put `.reveal` on
  major sections so the page animates in; a static-scrolling landing reads as unfinished for that
  register. (Still section-level, never every card.)
- **The Loading control auto-hides when there's nothing to replay** (`loading.js` + `UI.hasLoaders()`)
  — no `[data-skeleton-on-load]` region and no registered loader → the ⟳ Replay + Speed control hides
  itself instead of sitting inert and reading as broken. Re-shows if a loader registers later.

## v0.5.0 — 2026-07-31

The **inspiration-intake release** — the skill can now *learn from the web on an ongoing basis*
instead of studying a reference once and forgetting it. Seeded from a deep intake of ten premium
design sites (the Jakub Antalik showcase set, aicss, canvasui, beautiful-ui, originkit, agentation,
transitions.dev, landingfolio).

### The ongoing loop — intake → corpus → graduate
- **A living inspiration corpus** (`reference/inspiration.md`, new) — a dated/sourced/tagged ledger
  that persists a reference's distilled DNA (not screenshots) so each build compounds on the last.
  On-demand, so the always-loaded router is untouched (SKILL.md stays at ~2598/2600 tokens).
- **`/prototype intake <url…>`** (new subcommand) — browse a site in full, distill its DNA, and
  append a corpus entry; privacy-guarded (only the given URLs, never the user's own tabs).
- **A graduation ledger** — proven moves (recurring across ≥3 entries) promote from the corpus into
  the menus the skill always reads. Discovery now reads *from* and feeds *back into* the corpus.

### What graduated from the first ten
- **AI-native UI is now a first-class genre** (`reference/ai-native-ui.md`, new) — a zero-dep, à-la-carte
  vocabulary wired to the existing loading engine: a *named* thinking-state taxonomy (Working /
  Searching / Solving / Listening / Composing / Shaping, not one spinner), streaming text, tool-call
  states, approval cards, tool chips, task rows, agent composer, plus AI-specific anti-slop (no violet
  "AI gradient").
- **Three page archetypes beyond the app-shell** (`build.md`) — *single-artifact showcase*, *live
  component catalog*, and *documentation-as-landing* — plus the **playground pattern** (variant
  toggles + slider → regenerated copy-paste code) and a few honest "legitimacy tells".
- **Two sharpened registers, reconciled with the anti-slop rules** — a *dev-tool near-black* ground
  (`color-palettes.md`) that draws the exact line between the mastered version and the `blue-on-black`
  reflex it already bans; and a *dev-tool / AI-native* type register (`type-pairings.md`) that explains
  when the reflex faces (Inter/Geist) are *earned* — the real signature being mono-for-labels, not the
  sans.
- **Four new micro-interactions** (`microinteractions.md`) — number pop-in / rolling counter,
  spinner→check morph, dissolve-on-remove, and card-stack fan-on-hover — each motion-tier- and
  reduced-motion-gated.

### Validated by dogfooding
Built a coding-agent console with the new system end-to-end; two learnings graduated straight back:
- **Validated zero-dep recipes** in `ai-native-ui.md` — the thinking-orb (conic-gradient ring) and
  the streaming-text function, proven in a real build, are now copy-paste starters (not just prose).
- **Lint rule 37** (`checks/builtin-lint.md`) + a `build.md` note — the app-shell top bar (brand +
  nav + right-side chip) is the 390px overflow the toolbar rule misses; hide the chip on narrow.

## v0.4.0 — 2026-07-29

### Motion tiers
- **Motion is now a context-suggested stance** (#49). The skill picks **calm / standard /
  expressive** from register + tone + screen types, states it in `DESIGN.md` (like the
  signature-move / icon / imagery stances), and gates transition intensity off
  `html[data-motion="…"]`:
  - **calm** (dashboards, dense tools) — a fast root crossfade only: no directional slide, no
    list→detail hero morph, instant `.enter`/`.reveal` — while deliberately keeping press /
    hover / focus feedback (motion is friction when the task is scanning).
  - **standard** *(default)* — the v0.3 behavior unchanged.
  - **expressive** (marketing, landing, pitch) — standard plus a gentle `linear()` `--spring`
    on entrances (with a real-overshoot cubic-bezier fallback) and scroll-driven `.reveal`
    where supported.
- Demoable via a compact **Motion: Calm / Std / Exp** control in the tweaks bar (symmetry with
  the loading Speed control). Fully zero-dep, degrades cleanly, and `prefers-reduced-motion`
  wins over every tier.

## v0.3.0 — 2026-07-29

The **premium-feel release** — motion and loading, researched deeply (Emil Kowalski /
Rauno Freiberg / Family / IBM Carbon / web.dev / NN/g) and scoped hard to zero-dep
(CSS + vanilla JS + Tailwind CDN, no build). Every addition degrades cleanly where
unsupported.

### Motion & transitions
- **Cross-document View Transitions** (#44) — a default-on root crossfade/slide gives every
  multi-page prototype real page-to-page transitions, and a naming convention + `js/vt.js`
  (`data-vt-item`/`data-vt-detail`/`data-vt-hero`) drives an opt-in **list→detail hero morph**
  via `pageswap`/`pagereveal`, with persistent chrome held still, `object-fit` fix,
  reduced-motion → crossfade-only, and a plain-navigation fallback in Firefox. Same-document
  swaps (tab/filter) crossfade rather than slide.
- **Motion floor-raisers** (#47) — named easing curves (`--ease-in-out-strong`, `--ease-ios`)
  + a distance-keyed duration scale (`--dur-press/-fast/-base/-slow`) coexisting with the old
  `--motion-*` scale; a zero-JS `@starting-style` `.enter` mount entrance with a capped stagger;
  a sharpened doctrine (ease-out dominance, duration ∝ travel, enter ≠ exit); and a **theme-switch
  fix** that suppresses transitions for one frame so the palette snaps instead of smearing.

### Loading & perceived performance
- **A fake-latency timing engine** (#45) — tiered, ±45%-jittered per-action latency scaled by a
  global demo speed, wrapped in a **spinner-delay + minimum-visible-duration** discipline so
  loaders never flash or blink; the existing skeleton/loading-button paths run through it.
- **A tweaks-bar Loading control** (#45) — a compact **⟳ Replay** + **Instant / Real / Slow**
  speed toggle, so the transient load choreography is demoable (like Theme/Persona).
- **The state matrix** (#45) — a `.state`/`.state--empty`/`.state--error` component + per-region
  guidance (first-run vs no-results vs cleared empties; scoped error + Retry) + an `aria-busy`/
  live-region a11y spine + lint rule 35 (state-matrix completeness).
- **Skeleton-restore fix** (#46) — `data-skeleton-on-load` regions no longer get stuck showing
  skeletons forever (the restore guard now compares the DOM-serialized markup).

## v0.2.0 — 2026-07-28

The **anti-slop release**. Everything since the initial `v0.1.0`: a real design-quality
loop, craft additions, and design decisions the skill now makes *on purpose* instead of by
accident. Several ideas were adapted from [Hallmark](https://github.com/Nutlope/hallmark)
(MIT) — see the per-file attribution comments.

### Design intelligence
- **Tone-keyed font & palette menus** with anti-monoculture rotation
  (`reference/type-pairings.md`, `reference/color-palettes.md`).
- **Three reference-grounded theme presets** studied from real design sources — **Ledger**
  (warm editorial, from visualjournal.it), **Carbon** (cool IBM-systematic, from IBM
  Carbon's tokens), **Quiet** (warm-bone minimal, from mnmm.xyz) (#38).
- **Category-reflex checks**, plus a guard against the **AI-editorial reflex** — the
  warm + display-serif + amber cluster that's now its own "a machine made this" tell (#39).

### Anti-slop quality loop
- **Pre-emit self-critique** — a hostile-reviewer 6-axis score per screen (Philosophy ·
  Hierarchy · Execution · Specificity · Restraint · Variety), stamped into each file, with a
  **reconcile-against-lint** loop so an inflated score can't survive (#28, hardened #36).
- **12 precise slop gates** (button-text≈fill contrast, `minmax(0,1fr)` image tracks,
  input-state craft, re-drawn-chrome ban, invented-metrics, italic-header / eyebrow / mixed-icon
  tells) + 2 blind-judge lenses (#31).
- **Assess is non-skippable** — a completion gate: a build with no `LINT.md` and no
  self-critique stamps is unfinished (#40).
- **Blind pairwise design judge** + a repeatable A/B benchmark harness (#34, #35).

### Craft
- **Anti-fingerprint nav catalog** — ⌘K / search-pill / floating-pill / side-rail, to break
  the reflex wordmark-left+links+button-right nav (#30).
- **Microinteraction pack** — copy-as-label-swap (no toast), optimistic-with-undo, tooltip
  hover/focus timing, layout-safe toasts, `grid-template-rows` height transitions
  (`reference/microinteractions.md`, `UI.copyButton` / `UI.undoToast`) (#32).
- **Scaffold typography hardening** — heading `overflow-wrap`, reserved form-message slots (#33).
- **Theme-flash (FOUC) fix** — an inline anti-FOUC `<head>` script so multi-page navigation
  no longer flashes the default theme (#37).

### Decisions made explicit (named in `DESIGN.md`)
- **Signature move** — one memorable, on-brief detail every prototype must name (#28).
- **Icon stance** — register-driven: *product* → functional icons; *brand* → earned, not
  default; reicon.dev at one weight (#41).
- **Imagery stance** — real photos / `data-scene` / typographic-block / none, with a
  register-agnostic "ask for photos first" trigger and a `.media` hook even for placeholder
  covers (#42).

### Discovery
- **Reference-study protocol** (4-axis DNA extraction) + a curated, output-routed set of
  inspiration galleries, with URL-refusal and untrusted-HTML safety rules (#29).
- Interactive discovery with a hard **"confirm the design direction before building"** gate.

### Infrastructure
- Progressive-disclosure architecture (a lean always-loaded `SKILL.md` router + on-demand
  `reference/`), kept under a CI token ceiling.
- **CI skill-checks** — context-cost regression guard, scaffold JS + `serve.py` syntax
  checks, shellcheck, frontmatter sanity.
- **390px overflow guards** (`benchmark/check-overflow.sh`) and a rendered design-judge tier.

## v0.1.0 — 2026-04-24
- Initial release of the `claude-prototype` skill.
