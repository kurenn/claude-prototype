# Skill test — onboarding builder brief (2026-07)

**Autonomous run, n=1 — not a substitute for a live user.** Exercised the `design-audits`
`/prototype` skill end-to-end against a real, unscripted brief, in Quick mode, with no
human in the loop for the discovery yes/tweak checkpoint. Every discovery decision below
is my own best judgment standing in for a user who wasn't there — flagged throughout, and
called out again at the end.

## The brief

> "I would like to create a design for an application in charge of user onboardings, for
> banking applications, or any type. My idea is to allow users to create workflows or
> onboardings, must be agentic first. Right now there are some players such as footprint
> or aiprise, but feel a bit clunky."

Built as **Rivet** — an agentic KYC/KYB onboarding builder. 3 screens (workflow dashboard +
template gallery, builder canvas, run/preview), technical tone, pine-on-warm-graphite
palette, Hanken Grotesk / IBM Plex Sans / JetBrains Mono. Output lives in `test-output/`
inside this worktree (gitignored, not part of this commit — see "What's committed" below).

## Method

1. Read `SKILL.md`, `reference/discovery.md`, `reference/type-pairings.md`,
   `reference/color-palettes.md`, `reference/build.md` in full before building anything.
2. Ran discovery myself (rich multi-paragraph brief → discovery.md Step 1 says skip the
   Quick/Discovery question and go straight to discovery — did that), wrote `PRODUCT.md`
   + `DESIGN.md` per Step 4's template.
3. Scaffolded from `templates/scaffold-base/` per Step 5's file-by-file instructions
   (copy-literally vs. copy-then-customize lists), then built all 3 screens per Step 6.
4. Ran `benchmark/score-output.sh` (Tier 1/2 automated checks) and `benchmark/render.sh`
   (headless Chrome screenshots at 1440/768/500px, plus manual passes at 390–500px and
   forced `?theme=`/`?persona=` URL states) to actually verify the build, not just read
   the code back.
5. Fixed the two concrete bugs this surfaced (below) in the worktree's `templates/` and
   `reference/`, then re-rendered to confirm.

## Did the interactive-flow guidance translate into buildable steps? — Yes, mostly

`reference/build.md`'s file tree, "copy literally, no edits" vs. "copy then customize"
lists, script load order, and the control-bar markup-as-source-of-truth approach all
translated directly into a working build with **zero improvisation** on the platform
plumbing (state/theme/layout/persona/ui wiring). `score-output.sh` came back **171/171
(100%)** on both tiers once the two bugs below were fixed. The **signature-move**
discipline (discovery.md Step 4: "name it in DESIGN.md, make sure at least one screen
delivers it") worked especially well in practice — DESIGN.md's committed "live agent
trace" concept mapped cleanly onto one reusable `.trace-rail` CSS block and one
`renderTrace()` JS function, delivered on both the builder (collapsed) and run (full)
screens exactly as promised, not just described.

Two places where following the docs literally produced a broken build, not a buildable
one — found only by actually rendering the pages, not by reading the code:

### Bug 1 (fixed) — `[data-modal]` has JS behavior but no shipped CSS
`app.js` ships full modal *behavior* (`openModal`/`closeModal` toggle an `open` class +
`aria-hidden`, `state.js` hydrates `?modal=<name>` from the URL, and `SKILL.md`'s
non-negotiable a11y floor requires `role="dialog"` + `aria-modal` + focus trap + Escape on
every modal) — but grepping the entirety of `templates/` turned up **no CSS anywhere**
that actually shows/hides a `[data-modal]` element. Following `build.md` word-for-word
("keep core wiring... modals... add product handlers") gives a modal that's either
invisible forever or permanently on-screen, depending on the browser's default `display`
for a bare `<div>`. This is exactly the kind of thing `score-output.sh` cannot catch (it
checks `role=dialog` + `aria-modal` are present, not whether the element actually becomes
visible) and screenshotting the URL-hydrated modal state was what caught it.
**Fix:** added a `[data-modal]` / `[data-modal].open` display block to
`templates/scaffold-base/css/styles.css` (dim backdrop, centered flex, opacity
transition, reduced-motion-safe) and added it to `build.md`'s "keep as-is — platform"
list with an explicit note that there's no per-screen equivalent to fall back on.

### Bug 2 (fixed) — `data-skeleton-on-load` silently erases JS-rendered lists
`build.md`'s skeleton-loader guidance describes marking a container
`data-skeleton-on-load` to "auto-wire on page load." The auto-wiring's actual mechanic
(`ui.js`) **stashes the container's current `innerHTML`, shows skeleton silhouettes for
the timer duration, then restores the stashed snapshot.** That's correct when the
container already holds real static HTML the skeleton temporarily covers. It's silently
wrong for a container that starts **empty** in the HTML and gets filled by a persona- or
data-driven render function later in `app.js` (exactly the pattern `build.md` itself
recommends for personas with different list lengths, e.g. 0/4/6 workflows): the stash
captures the *empty* pre-render markup, and the restore then overwrites the real rendered
list with that emptiness a few hundred ms after load. Caught this because the first
headless screenshot pass (captured at the 3s virtual-time-budget mark, past the wipe)
showed a completely empty "Your workflows" section that had rendered correctly moments
earlier in a manual check — the list wasn't missing, it was erased.
**Fix:** stopped marking the two JS-rendered containers (`#workflow-list`,
`#node-canvas`) `data-skeleton-on-load`; instead each has its own
`skeletonThenRender()` helper in `app.js` that shows skeletons, then calls the render
function directly (not `hideSkeletons`) and clears the `skeletonActive` /
`stashedContent` dataset flags afterward (otherwise a later persona-switch skeleton call
on the same container silently no-ops forever, since `showSkeletons` bails early when
that flag is still `'1'`). Documented the gotcha and the fix pattern in `build.md`'s
skeleton-loader bullet so the next build doesn't have to rediscover it.

**Why this matters for the benchmark:** `capstone-2026-07.md` already flagged "the
interactive flow is untested here" as a caveat on its A/B result. This run is a concrete
demonstration of why that caveat matters — both bugs above pass every existing automated
check (`score-output.sh` Tier 1 + Tier 2 both check for *presence and wiring*, not
*runtime behavior*) and would ship silently in any brief scored only that way.

## Was the tone → menu selection unambiguous? — Yes

"technical" tone maps to exactly one row in each menu (`type-pairings.md`,
`color-palettes.md`) — no guesswork about which row applied. Concretely:

- **Palette:** `technical` → "pine on warm graphite · restrained." The brief's own ask
  ("feel a bit clunky" about Footprint/AiPrise, implicitly "make it feel considered") plus
  the explicit instruction to dodge the dev-tool-blue reflex pointed at the same row the
  menu already recommends avoiding for its category-reflex check — pine green is neither
  the fintech navy/gold reflex nor the dev-tool blue-on-black reflex, so no hue-shift
  negotiation was needed beyond confirming the row was right.
- **Type:** `technical` row offers 3 rotating displays (Space Grotesk · Hanken Grotesk ·
  Schibsted Grotesk). The doc explicitly flags Space Grotesk as the new common pick for
  this tone ("rotate to an alternate when you can") — picked Hanken Grotesk instead, which
  is a real rotation decision the doc asks for, not a coin flip; the menu structure made
  that instruction actionable rather than just aspirational.
- **Mono:** added JetBrains Mono per the "add a mono family when the product is data- or
  code-heavy" rule — genuinely earned here (trace timestamps, confidence scores, node
  IDs), not decorative, matching the doc's own anti-reflex warning against mono as a
  costume.

No ambiguity found in the mapping itself. The one soft spot: **the design-review
checkpoint is only as good as who's reviewing it.** In a real Discovery-mode run, Step 2
says to "present the committed design direction... and get a yes-or-tweak" — here, I was
both the proposer and the approver, so this run cannot test whether a real user pushes
back on "pine on warm graphite" or wants a different hue-shift. That checkpoint's value is
unverified by this test.

## Other findings

- **Skill-detection naming collision (`audit`/`critique`).** `SKILL.md`'s detection table
  says: "if `impeccable` (`audit` + `critique`; needs `PRODUCT.md`) is present, invoke it —
  not a preference." My session's available-skills list did contain skills literally named
  `audit` and `critique`. Invoking `audit` against the built prototype showed it is a
  **generic frontend-quality audit skill** (contrast/a11y/performance/anti-pattern scan,
  routes fixes to `/normalize` `/optimize` `/harden` etc.) with no reference to
  `PRODUCT.md` or impeccable.style anywhere in its own instructions — a different tool
  that happens to share a name with the one `SKILL.md`'s table is describing. The
  detection protocol identifies the companion by **skill name string**, which isn't
  namespaced against same-named skills from an unrelated marketplace. This is a real
  ambiguity for any environment where a generically-named `audit`/`critique` skill is
  installed alongside (or instead of) the actual impeccable.style product — the protocol
  has no way to tell them apart short of reading the invoked skill's own returned
  instructions, which is what surfaced this. Worth a firmer detection signal in `SKILL.md`
  (e.g., checking for the `teach-impeccable` skill specifically, since that name is far
  less likely to collide, before trusting bare `audit`/`critique`).
- **Persona default is set by `persona.js`'s array order, not the HTML's `data-persona`
  attribute.** The scaffold's own screen sets `data-persona="default"` on `<html>` as a
  static attribute, but `persona.js` overwrites it on load using `PERSONAS[0]` (URL param
  → localStorage → array order). The two need to agree for the file to read sensibly, but
  nothing in `build.md` calls out that the HTML attribute is purely cosmetic before
  first paint. I initially wrote `data-persona="active-builder"` in the HTML while
  `persona.js`'s array still had `first-workflow` first — functionally harmless (JS wins),
  but confusing to read, and an easy trap for a build that eyeballs "looks consistent"
  without knowing which side actually governs. Reordered the array to match. A one-line
  note in `build.md`'s "Baseline every screen needs" bullet (state which side is
  load-bearing) would prevent this in future builds.
- **Positive:** the "copy literally, no edits" vs. "copy then customize" split in
  `build.md` Step 5 was accurate and sufficient — `state.js`, `ui.js`, `feedback.js`/`css`,
  `serve.py` needed zero changes; `theme.js`/`layout.js`/`persona.js`/`data.js`/`app.js`/
  `styles.css` all needed exactly the customization the doc described, nothing more,
  nothing less.
- **Positive:** the "never ship without" mobile-overflow / color-restraint / a11y-floor
  section paying off in practice — writing `.proto-actions` on every header/toolbar row
  and wrapping the one data table in `.proto-table-wrap` from the start meant the 500px
  and 768px passes needed zero rework.

## What wasn't tested (honest gaps)

- **No real live user.** This is the single biggest gap. Every "yes/tweak" discovery
  checkpoint, every hue/pairing choice, was made by the same agent that then built it —
  there was no independent judgment applied at the one point in the flow designed to
  catch a bad direction before building 3 screens around it. A genuine live-user pass
  through Discovery mode (not Quick-mode-shaped autonomy) is still needed to validate that
  checkpoint actually works as a course-correction point and not just a formality.
- **`prompt-refiner` not invoked.** It appeared in my available-skills list per
  `SKILL.md`'s detection table, but I synthesized the spec inline instead of routing the
  Q&A answers through it — a corner cut for this test, not something the skill itself
  told me to skip. A faithful run should invoke it.
- **True 390px viewport unverified.** `benchmark/render.sh`'s own comments flag that
  headless Chrome clamps to a ~500px layout floor, so this run's overflow checks only
  cover 500px and up (plus a visual read of the 768/1440 shots). No horizontal overflow
  found at any width actually tested, but the narrowest real phone width is unverified by
  this run specifically — `design-judge.md`'s iframe probe technique (referenced but not
  invoked here) would close that gap.
- **`impeccable.style` itself (the actual product) never verified.** See the naming-
  collision finding above — this run cannot say whether the real impeccable.style
  companion, when genuinely present, produces the register-aware assessment `SKILL.md`
  describes; only that a same-named generic skill exists and would be wrongly matched by
  the current detection logic.

## Score

`benchmark/score-output.sh test-output/onboard-agent` (post-fix): **Tier 1 112/112
(100%)**, **Tier 2 59/59 (100%)**, combined **171/171 (100%)**. This confirms the fixes
didn't regress anything mechanical — it does **not** confirm the fixes were necessary,
since (per the findings above) this scorer cannot detect either bug it just passed
through cleanly before the fix.

## What's committed vs. what isn't

Per the task brief, the built prototype (`test-output/onboard-agent/`) is a test artifact
and is **not** part of this commit — it's excluded via `.gitignore` in this worktree. This
report and the two skill fixes (`templates/scaffold-base/css/styles.css`'s new
`[data-modal]` block, `reference/build.md`'s modal + skeleton-loader guidance updates) are
the committed output of this test.
