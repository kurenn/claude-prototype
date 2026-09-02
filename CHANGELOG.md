# Changelog

## v0.7.4 — 2026-09-02

**Preflight was reinstalling impeccable on every single run.** Reproduced on a machine with
impeccable already installed:

```
~/.agents/skills/impeccable/SKILL.md   exists
$ ensure-deps.sh --check
  ✗ impeccable — MISSING
```

`npx skills add --global` installs into `~/.agents/skills`, but `ensure-deps.sh` only ever
searched `~/.claude/skills` (where its own `git clone` puts prompt-refiner). Claude Code
loads from both roots, so the companion worked — preflight just couldn't see it, and paid
a network round-trip to reinstall it every time.

### Fixed
- **`ensure-deps.sh` searches both roots.** New `skill_path()` returns where a skill actually
  is; `status` now prints it. This also retires the old `have_skill`, whose
  `[ A ] || [ B ] && [ C ]` parsed as `([ A ] || [ B ]) && [ C ]` — not what its comment said.
- **`reference/assess.md` no longer hardcodes `~/.agents/skills/impeccable/...`**, which broke
  under the other installer and violated SKILL.md's own "no hardcoded paths" constraint.
- **New `ensure-deps.sh --path=<skill>`** prints a companion's location (exit 1 if absent), so
  callers resolve a path instead of guessing a root. The roots are now written down once.

### Guard
`checks/consistency.sh` gains check 4: no file outside `ensure-deps.sh` may hardcode a
companion skill root. Negative-tested.

SKILL.md trigger cost: 2581 → 2592 tokens (ceiling 2600).

## v0.7.3 — 2026-09-02

Cleanup pass. Three of the five deletion candidates from the v0.7.1 review held up on
inspection; the other two were wrong and are documented below so they don't get proposed again.

### Removed
- **`theme.js`'s legacy cycle-button path** (`[data-theme-switch]` + `[data-theme-label]`) —
  zero HTML in the repo uses either attribute. It was "kept for backwards compat" in a
  greenfield template that has no back to be compatible with.
- **`benchmark/results/skill-test-onboarding.md`** — a superseded run cited by nothing.

### Fixed: the tier list had drifted in the copy nobody updated
The latency tiers were written down in three places — `ui.js`, `build.md` and
`microinteractions.md`. When the `stream` tier was added to `ui.js` in v0.5, **neither doc
picked it up**, so both told a build that four tiers exist while `ai-native-ui.md` used
`fakeLatency('stream')` in four places. `build.md` (the build-phase doc) is now the single
written record and lists all five; `microinteractions.md` keeps the rationale and recipes
and points there for the numbers.

### Deliberately NOT removed
- **`.empty-state`** was proposed for deletion as "superseded by `.state--empty`". It isn't:
  `build.md` lists it in the keep-as-is platform set and instructs its use on every list/grid,
  and `builtin-lint.md` rule greps for it. The styles.css comment saying it "stays as-is for
  existing builds" reads as legacy but the class is live in current guidance.
- **`benchmark/rebench.md`** was proposed for a 260 → 30 line trim. It's cited by
  `README.md` as the repeatable A/B procedure and by `design-ab-2026-07-25.md` for the
  n=2–3 × 4-brief spec — it's the standard the capstone's shortcuts were measured against.
  Gutting it would delete the yardstick and leave two dangling citations.
- **`design-ab-2026-06-08.md` / `-rerun-`** stay: `capstone-2026-07.md` cites them as the
  evidence that variance dominates at n=1.

## v0.7.2 — 2026-09-02

The **say-what-you-ship release** — the follow-ups listed as known-and-deferred in v0.7.1.
Docs now describe the scaffold that actually ships, and one real fix that had been living
only in the demo site graduates into the template.

### README described the v0.2 scaffold
- **The control bar is drawn as one row.** The ASCII diagram illustrating "it never wraps"
  was itself drawn wrapped onto two lines, and showed three of the six sections. Now one
  row with all six, plus the `overflow-x: auto` half of the rule it demonstrates.
- **Motion and Loading are documented.** Both have shipped in the bar since v0.4/v0.6 and
  appeared in neither the diagram nor the bullet list.
- **The anatomy tree lists all 11 scripts, in load order** — `vt.js`, `motion.js` and
  `loading.js` were missing.
- The CI description now mentions `checks/consistency.sh`.

### One phone floor instead of two
`SKILL.md` and `benchmark/check-overflow.sh` said 390px; `builtin-lint.md` rules 8–9,
`assess.md` and `CONTRIBUTING.md` said 375px — so a prototype could pass lint and fail the
mechanical guard. Everything is 390px now (the value the contract and the tool already used).

### SKILL.md stops naming commands it doesn't ship
`/design-consultation`, `/design-shotgun`, `/design-html`, `/qa-only` and `/design-review`
don't exist in this repo and aren't in the skill-detection table. Worst case was the static-mockup
redirect firing inside the *fallback* path — the one entered precisely because companion skills
failed to install. Removed; the constraint now states the rule instead of delegating it.
Trigger-time cost drops 2598 → 2581 tokens.

### Graduated: per-region skeleton shapes
`resolveSkeletonTemplate` + `data-skeleton-template="<id>"` let a container point at a same-document
`<template>` for its loading silhouette, instead of every region falling back to the generic card.
It was added to `docs/js/ui.js` and never made it back to `templates/scaffold-base/js/ui.js`, so the
fix existed only in the demo — exactly the drift `checks/consistency.sh` was added to surface. A
generic card standing in for a table row is itself the layout shift skeletons exist to prevent.

### Also
- `install.sh` joins the CI shellcheck run (`benchmark/*.sh`, `checks/*.sh`, `ensure-deps.sh`).

## v0.7.1 — 2026-09-02

The **drift release** — five bugs that shipped into every generated prototype, two that broke
the tooling's own failure paths, and a CI guard so the next three don't accumulate silently.

### Scaffold bugs (each one shipped in every prototype)
- **`?` no longer opens the history drawer while you're typing.** The global keydown handler in
  `state.js` had no `input`/`textarea`/`contenteditable` guard, so a reviewer typing a question
  into the always-on feedback textarea got the debug drawer over their comment.
- **Icon buttons survive `loadingButton` / `copyButton`.** Both saved and restored `textContent`,
  which permanently deleted the `<svg>` from any `<button><svg/>Save</button>` on first click.
  They now round-trip `innerHTML` and still write the *label* as text, so a label string can
  never inject markup. Dropped the write-only `dataset.originalText` along the way.
- **`localStorage` keys are namespaced per prototype.** All eight keys were fixed `proto-*`
  strings on the shared `localhost` origin, so prototype B read prototype A's theme, persona
  and — worst — feedback comments, which `/prototype apply-feedback` would then ingest. Screens
  now carry `data-proto-app="<slug>"` and the anti-FOUC script defines `window.PROTO_NS` from it
  before any `js/*.js` loads.
- **The stored theme is validated before first paint.** The anti-FOUC script whitelisted
  `data-motion` but applied `data-theme` raw, so a stale key from a renamed theme set flashed
  undefined tokens until `theme.js` corrected it. It now checks `THEMES` the way motion already did.
- **`serve.py` binds `127.0.0.1`, not every interface.** It printed `http://localhost:PORT` while
  publishing the prototype to the LAN.

### Tooling failure paths that failed
- **`check-overflow.sh` reaches its `inconclusive` verdict.** Under `set -o pipefail` a
  non-matching `grep` (Chrome failed, probe never rendered) aborted the run at the first bad
  screen — silently, with no summary — making the branch built for exactly that case dead code.
- **A failed `prompt-refiner` install no longer aborts preflight.** `install_impeccable` was
  guarded; its sibling wasn't, so a `git clone` failure with no network killed the whole script
  under `set -eu` — contradicting the graceful-degradation promise in SKILL.md.

### New: `checks/consistency.sh` (wired into CI)
Three cheap guards for the drift this repo actually accumulates — no browser, no Claude run:
1. **Cited paths exist** — every `reference/` / `templates/` / `checks/` / `benchmark/` path named
   in the living docs resolves. (`CHANGELOG.md` and `benchmark/results/` are excluded: historical
   records are *expected* to name files that have since moved.)
2. **The benchmark covers every scaffold script** — `score-output.sh`'s file list and load order are
   derived from `templates/scaffold-base/`, not hardcoded, so adding a script can't silently stop
   being scored. This caught real drift on the first run: `score-output.sh` still scored the 8-file
   v0.2 scaffold, so a prototype missing the entire motion tier, loading engine and View Transitions
   scored 100% on Tier 1. Now 11 files and the correct 10-script body order.
3. **`docs/` hasn't forked the scaffold** — `docs/` is a hand-maintained prototype, so most of it is
   expected to differ, but `state.js`, `vt.js`, `serve.py` and `feedback.js` carry no per-prototype
   customization. When they drift, a scaffold fix has landed in only one of the two copies.

All three are negative-tested. Note the script is deliberately `set -uo pipefail` *without* `-e`:
every check should report before exiting — the same failure mode `check-overflow.sh` had.

## v0.7.0 — 2026-08-02

The **always-on inspiration release** — consulting the corpus stops being something the agent might
remember and becomes a mandatory, two-tier step wired to the moment it's needed.

### Corpus consult is now mandatory + reliably triggered
- **Consulting `reference/inspiration.md` is a hard step within discovery**, not "skim if you remember"
  (`discovery.md` + the corpus header). Still register-gated — a brief matching no entry correctly pulls
  nothing; the mandate is "consult," never "must find something."
- **It now fires *before* the design-direction confirm, so corpus moves are in what the user approves —
  never a post-yes override.** Keyed off the emerging register/genre (clear from the tone + scope Q&A),
  with a **Step-4 backstop checkpoint** so a rich-brief path can't skip it. If a corpus move would change
  an already-confirmed direction, it's re-presented for a fresh yes. Closes the old timing seam (the
  instruction used to key off `register`, set only at Step 4, so it could silently no-op).

### New: Tier 2 — search the source sites live
- Beyond reading distilled entries, the skill now **goes back to the source**: when a browser is
  available and the app matches a corpus genre (or the user shared reference URLs), it opens the 1–3
  best-matching sites and **searches within them for the specific components this app needs** (⌘K /
  component grids / landingfolio's industry filter). Reuses the `intake` browse protocol + privacy
  guard, is bounded and transparent, and falls back to Tier 1 alone when no browser is available —
  never blocks a build. Findings can feed back into the corpus (the graduate loop).

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
