# Changelog

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
