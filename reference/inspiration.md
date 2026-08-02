# Inspiration corpus — a living, graduating ledger

The skill already reads a **shared reference's DNA** per build (`reference/discovery.md` →
"Reading a shared reference"). This file is where that reading **persists** so each build gets
smarter than the last. It is a staging area, not a style to copy: entries are distilled to
*lessons*, and proven lessons **graduate** into the always-consulted menus.

The loop is **intake → corpus → graduate**:

1. **Intake** — study a site (by hand, or `/prototype intake <url…>`, see `reference/subcommands.md`).
   Append a distilled entry below. Never copy a site; extract what's transferable.
2. **Corpus** — **consulting this is mandatory within discovery** (`reference/discovery.md` → "The
   living corpus"), not an optional skim: pull the entries whose **register/genre** matches and fold
   their moves into the direction *before* it's confirmed. Tier 2 adds a live search of the matching
   source sites when a browser is available. The file is on-demand, so it costs the router nothing.
3. **Graduate** — when a move recurs across **≥3 entries** (or is just obviously right), promote it
   into the menu the skill *always* reads (`color-palettes.md`, `type-pairings.md`, `build.md`,
   `microinteractions.md`, `ai-native-ui.md`) and tick it in the **graduation ledger** at the bottom.
   The corpus is the memory; the menus are the muscle.

**Entry schema** (keep it this tight — lessons, not screenshots):

```
### <name> — <url>   (studied YYYY-MM-DD)
Register: <product|brand> + genre (dev-tool / editorial / AI-native / …) · Motion: <calm|standard|expressive> · Ground: <…> · Type: <…>
Signature: <the one memorable structural/interaction move>
Steal: <transferable, zero-dep moves>
Avoid: <what does NOT transfer — usually "needs a build / WebGL / a real backend">
Graduates → <file(s) it fed, or "pending">
```

> A note on the reflex faces. Several entries below run **Inter/Geist + a mono** — families the skill
> normally rejects (`type-pairings.md`). That is not a contradiction to wave through: those faces are
> banned *as a default*, and these sites earn them by spending the whole distinctiveness budget
> elsewhere (tinted near-black ground, a mono-label companion, one signature motion moment). The
> lesson that graduated is the **discipline**, not "Inter is fine now" — see the dev-tool notes in
> `type-pairings.md` and `color-palettes.md`.

---

## Family ① — Indie-dev single-artifact showcase

The recurring template across the Jakub Antalik set: pure, OKLCH-tinted near-black, one system sans,
centered, **one hero live demo**, then `Installation / Usage / Playground` where **variant toggles +
a slider regenerate a copy-paste snippet in real time**. The effect *is* the content; the chrome
disappears. GitHub+X icon pair top-right, "Made by —" footer. Reads as a real indie product, not a
pitch.

### beam (Border Beam) — beam.jakubantalik.com   (studied 2026-07-31)
Register: dev-tool/brand · Motion: expressive · Ground: near-black #070707, accent = the gradient beam (only color on the page) · Type: Inter
Signature: single-artifact showcase — the animated border travels an AI-composer input; a live Playground (Type/Color/Strength) rewrites the code below as you toggle.
Steal: the playground-regenerates-code pattern; accent-as-a-single-moving-event on mono; the GitHub/X pair + "Made by" footer as legitimacy tells.
Avoid: the beam itself is fine in pure CSS (conic-gradient + mask), but keep it to ONE surface.
Graduates → build.md ("single-artifact showcase" archetype + playground pattern)

### metal (Liquid Metal) — metal.jakubantalik.com   (studied 2026-07-31)
Register: dev-tool/brand · Motion: expressive · Ground: near-black #070707, no flat accent (the chrome shader IS the color) · Type: Inter
Signature: same showcase template; Playground adds Style/Type/Color/Strength + on/off Options (No Glow / No Reflection) → live `<MetalFx preset…>` code.
Steal: option *toggles as boolean chips* alongside variant pickers; a metallic sheen is approximable with an animated gradient + blend mode.
Avoid: the real thing is a WebGL shader — not zero-dep. Approximate or skip; don't import three.js.
Graduates → build.md (playground pattern)

### orbs (Thinking Orbs) — orbs.jakubantalik.com   (studied 2026-07-31)
Register: dev-tool/brand · Motion: expressive · Ground: near-black #070707 · Type: Inter
Signature: a 6-cell grid of **AI thinking-states** (Working · Searching · Solving · Listening · Composing · Shaping), each a distinct particle animation in a status pill; Playground toggles State/Size/Speed.
Steal: the *named taxonomy of agent states* — treat "thinking" as many distinct, labeled moments, not one spinner. Directly seeds `ai-native-ui.md`.
Avoid: particle spheres are WebGL; a CSS/canvas-2D dot-ring or pulsing glyph carries the same read.
Graduates → ai-native-ui.md (thinking/working state taxonomy)

### transitions.dev — transitions.dev   (studied 2026-07-31)
Register: product + genre dev-tool · Motion: expressive · Ground: near-black #121212 · Type: Inter + Saans
Signature: the catalog form of the same author — ~36 micro-interaction tiles, each a live demo with an "Animate" trigger, a **name + one-line mechanic** ("Distance falloff with bouncy return"), and a copy button; Pro items badged.
Steal: the **naming discipline** (every effect gets a name AND a one-sentence mechanic); tiles as quiet frames so motion reads; Pro-badge as a legitimacy tell.
Avoid: it's a paid catalog — don't reproduce it; mine it for individual effects.
Graduates → microinteractions.md (number pop-in, spinner→check morph, dissolve-on-remove, card-stack fan)

---

## Family ② — AI-native component catalog

Dark, a system-sans (most **+ a mono for labels** — originkit sets *every* label in mono; aicss is the
one that stays sans-only), category-labeled grids of **live** demos (never screenshots), "built for
agents", shadcn/copy-paste install. Together
they define an emerging genre the skill now has words for (`ai-native-ui.md`).

### aicss — aicss.dev   (studied 2026-07-31)
Register: dev-tool/product · Motion: standard · Ground: near-black #0a0a0a, one faint blue on the logo · Type: Inter
Signature: two-tone headline (white line + grey line), pill eyebrow, single CTA, then category-labeled card grids (Thinking · Tool & Action States · Text Outputs · Structured Outputs · Rich & Interactive) each a real running block.
Steal: the AI-native component *categories* as a checklist; category label + count on the right of each band; monochrome cards with subtle borders.
Avoid: —
Graduates → ai-native-ui.md (component taxonomy)

### canvasui — canvasui.dev   (studied 2026-07-31)
Register: dev-tool/brand · Motion: expressive · Ground: near-black, lab() color space · Type: Geist Sans + Geist Mono
Signature: "Creative components, in a new dimension" — numbered how-it-works (01/02/03), shadcn-CLI install, WebGL hero showcase card, FAQ.
Steal: numbered install/steps *when the content is genuinely sequential*; Geist+GeistMono as the honest modern-dev register (with the reflex caveat).
Avoid: the components are live WebGL — the *page craft* transfers, the canvas components don't.
Graduates → type-pairings.md (dev-tool register note)

### beautiful-ui — beautiful-ui-five.vercel.app   (studied 2026-07-31)
Register: product/dev-tool · Motion: standard · Ground: #1b1c1e · Type: Inter + JetBrains Mono
Signature: a long left-TOC catalog of AI-native primitives (Loading · Thinking · Streaming Text · Approval Card · Tool Chips · Task Rows · Chat · Recommendation · Context Cards · Diff/Records/Filter tables), demoed on **real editorial data** (coffee/flavors — same instinct as our Cardinal Coffee demo).
Steal: the primitive list is the single best inventory of AI-native components; sparkline-in-a-card; status pills; "New components, in your inbox" capture.
Avoid: —
Graduates → ai-native-ui.md (primitive inventory)

### originkit — originkit.dev   (studied 2026-07-31)
Register: product + genre dev-tool · Motion: expressive · Ground: #1e1e1f, orange accent (logo + one link only) · Type: Roboto Mono for ALL labels
Signature: an app-shell component browser — left rail with categories + counts (Text 61 · Button 5 · Image 14 · Cursor 6 …), ⌘K search, grid of dark video thumbnails.
Steal: **mono-for-every-label** as a deliberate developer register; category+count sidebar; ⌘K as the search affordance (already in the nav catalog).
Avoid: the components are generative/WebGL showpieces; the shell + mono-label discipline is what transfers.
Graduates → type-pairings.md (mono-label signal)

---

## Family ③ — Editorial / meta

### agentation — agentation.com   (studied 2026-07-31)
Register: editorial/brand · Motion: standard · Ground: light/white, red accent used *only* on wordmark + one hand-drawn underline · Type: Inter + IBM Plex Serif + SF Mono
Signature: **documentation-as-landing** — a technical product typeset as a beautiful document: left TOC, script-cursive wordmark as the one flourish, numbered how-to, inline code chips, an embedded *working* demo (live buttons/inputs to annotate), "Made by / Colophon" footer.
Steal: the whole "docs page that is also the landing" archetype for technical/dev products; the ONE expressive flourish (script wordmark) on an otherwise-neutral face; hand-drawn underline as a warm accent; live-demo-embedded-in-prose.
Avoid: the annotation tooling is a real product; the *presentation* is the lesson.
Graduates → build.md ("documentation-as-landing" archetype)

### landingfolio — landingfolio.com/inspiration/landing-page   (studied 2026-07-31)
Register: product (a resource, not a design to copy) · Motion: calm · Ground: white, oklch() · Type: Plus Jakarta Sans
Signature: a filterable gallery — thumbnails **tagged (industry/color/device) + dated + sourced**, left-rail filters, lazy-loaded grid.
Steal: this is the model for *this file itself* — inspiration stored as tagged, dated, sourced entries you can filter by register. Use as an ongoing *source* to intake from, not a look to reproduce.
Avoid: it's a directory; don't clone its chrome.
Graduates → (meta) informed the corpus schema

---

## Graduation ledger

| Move | From (entries) | Graduated to | Status |
|---|---|---|---|
| Single-artifact showcase archetype | beam, metal, orbs | `build.md` → Page archetypes | ✅ 2026-07-31 |
| Playground: toggles + slider → regenerated code | beam, metal, orbs | `build.md` → Page archetypes | ✅ 2026-07-31 |
| Documentation-as-landing archetype | agentation | `build.md` → Page archetypes | ✅ 2026-07-31 |
| Live component-catalog archetype | aicss, transitions, beautiful-ui, originkit | `build.md` → Page archetypes | ✅ 2026-07-31 |
| Near-black *earned* vs blue-on-black *reflex* | 8/10 entries | `color-palettes.md` → dev-tool near-black | ✅ 2026-07-31 |
| Inter/Geist + mono-label = dev-tool register (with reflex caveat) | canvasui, originkit, aicss, beautiful-ui | `type-pairings.md` → dev-tool register | ✅ 2026-07-31 |
| AI-native UI vocabulary (thinking/streaming/tool-call/approval…) | aicss, beautiful-ui, orbs, agentation | `ai-native-ui.md` (new) | ✅ 2026-07-31 |
| New micro-interactions (number pop-in, spinner→check, dissolve-on-remove, card-stack fan) | transitions.dev | `microinteractions.md` | ✅ 2026-07-31 |
| npm-install snippet · Pro badge · GitHub/X pair · Colophon = legitimacy tells | family ①+② | `build.md` → Page archetypes → Legitimacy tells | ✅ 2026-07-31 |
| Validated thinking-orb + streaming recipes (zero-dep) | dogfood: agent-console build | `ai-native-ui.md` → Starter recipes | ✅ 2026-07-31 |
| App-shell top bar overflows at 390px | dogfood: agent-console build | `checks/builtin-lint.md` rule 37 + `build.md` | ✅ 2026-07-31 |

*Rows sourced "dogfood: …" came from building with the skill, not a corpus site — the loop also
graduates what our own output surfaces.*
