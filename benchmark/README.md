# Benchmark

A way to know whether changes to this skill actually make it **better**, not just
different. Two independent dimensions, because a skill edit can move them in opposite
directions:

1. **Output quality** — does a prototype the skill produces still pass its own promises?
   (`score-output.sh`)
2. **Context cost** — how many tokens load when the skill fires?
   (`context-cost.sh`)

The goal of the progressive-disclosure refactor was to cut dimension 2 **without**
dropping dimension 1. You need both numbers to prove that.

---

## Dimension 1 — output quality

`score-output.sh` runs objective, automatable checks against a generated prototype
folder in **two tiers**, reporting a subtotal for each plus a combined total:

- **Tier 1 — regression floor** ("did we break the basics?"). Present/absent checks
  derived from SKILL.md's constraints and `checks/builtin-lint.md`: all eight JS files,
  serve.py, docs; the control bar (present on every page, segmented, `flex-wrap:nowrap`);
  three-dimensional switching wired; interaction states (loading, toast, empty, skeleton);
  anti-slop content (no lorem, no placeholder names, no purple gradients); no build tooling;
  alt text; dead-link signal. A competent run **saturates this near 100%** — that's by
  design. Its job is to catch the mechanical failures a refactor breaks quietly: a missing
  `layout.js`, a wrapped bar, lorem ipsum that slipped in.

- **Tier 2 — depth / integrity** ("is it actually wired correctly?"). Cross-file
  consistency checks that do **not** saturate, because subtle mismatches are easy to ship:
  every theme/layout/persona name matched across `*.js` + `styles.css` + control-bar
  buttons (a typo here silently breaks the toggle); layouts actually customized (not the
  `layout-a`/`layout-b` placeholder); script load order correct on every screen; modals
  carry `role=dialog` + `aria-modal`; `:focus-visible` defined; at least one non-default
  persona. This tier is the **discriminating signal** between skill versions — a rushed
  build that leaves placeholder layouts or mismatches names loses Tier 2 points while
  still passing Tier 1.

It prints both subtotals + a combined total out of ~168 and exits non-zero below the
threshold (default 80%). Not a substitute for impeccable or human taste — it's the
automatable floor + integrity layer you can track across skill changes.

### Run it

```bash
# 1. Generate prototypes from the fixed briefs (in a scratch dir, one Claude session each):
/prototype          # paste benchmark/briefs/saas-dashboard.md, Quick mode
/prototype          # paste benchmark/briefs/marketplace.md
/prototype          # paste benchmark/briefs/fintech-app.md

# 2. Score each output folder:
benchmark/score-output.sh ./pulse
benchmark/score-output.sh ./tend --json > tend-score.json
```

### Methodology — A/B against a baseline

To prove a skill change helps rather than hurts, score the **same brief** built two ways
and compare:

- **Baseline run** — generate with the *previous* version of the skill (e.g. `git stash`
  or check out the prior commit into a separate skills dir).
- **Candidate run** — generate with your changed skill.

Run all three briefs through both. Average the scores. The candidate should be **≥** the
baseline on output quality. Because LLM output varies run-to-run, do 2–3 runs per brief
per side and compare averages, not single runs. Record results in `results/` (gitignored
scratch is fine) so trends are visible across skill versions.

---

## Dimension 2 — context cost

`context-cost.sh` measures what the skill costs in tokens and compares trigger-time cost
against the pre-split baseline in `baseline.json`.

```bash
benchmark/context-cost.sh
benchmark/context-cost.sh --json
```

- **Trigger-time cost** = `SKILL.md` alone — loaded *every* time the skill fires. This is
  the number progressive disclosure is meant to shrink.
- **Full cost** = `SKILL.md` + all `reference/*.md` — the worst case if a single run reads
  every phase file. Should stay within a reasonable bound (roughly the old inline size),
  since the content didn't disappear, it relocated.

If you grow a `reference/*.md` file, trigger-time cost is unaffected (good — that's the
point). If you grow `SKILL.md`, trigger-time cost rises and the script shows it.

---

## Dimension 3 — design quality (rendered)

Dimensions 1–2 never look at the rendered page, so they're blind to *taste* — hierarchy,
spacing, color discipline, polish, AI-slop. Two prototypes can both score ~168/168 and look
nothing alike (one can even ship a layout defect grep can't see). Tier 3 closes that gap by
**rendering the prototype and judging the pixels**. Full protocol in `design-judge.md`.

```bash
benchmark/render.sh <prototype-dir>          # → <dir>/.shots/*.png (desktop + tablet)
benchmark/check-overflow.sh <prototype-dir>  # objective: no horizontal overflow at true 390px
# then stage two builds into neutral A/ and B/ dirs and run a blind pairwise judge
# (see design-judge.md) — never tell the judge which side is baseline vs candidate.
```

> Screenshots are faithful only at ≥500px (Chrome headless clamps narrower windows). For
> phone-width overflow, trust `check-overflow.sh` (true 390px viewport), not a `-w390` shot.

- `render.sh` — headless-Chrome screenshots of every screen at desktop + mobile widths.
  No npm deps; Chrome must be installed (`$CHROME` to override the path).
- `design-judge.md` — the blind pairwise rubric (10 lenses, randomized A/B, win-rate).
- A **tie is the success condition** for a context-cost refactor: it means relocating
  guidance into `reference/` didn't hurt the output a judge can see. This is the regression
  test for progressive disclosure's one real risk — detail in `reference/` getting skipped.

Taste is noisy: n=1/brief shows direction, not proof. For a real claim, render 2–3 builds
per side per brief and compare win-rate. Record runs in `results/` (gitignored).

---

## What "improving" means here

| You changed… | Output quality should… | Trigger-time cost should… |
|---|---|---|
| Split inline detail into `reference/` | stay equal | drop |
| Tightened a constraint / added a check | rise or hold | barely move |
| Added a new required pattern to a phase file | rise or hold | hold (lives in reference/) |
| Added a new rule to SKILL.md body | rise or hold | rise a little (justify it) |

A change that drops trigger-time cost while holding output quality is a clean win. A
change that raises output quality is worth some trigger-time cost. A change that drops
output quality is a regression regardless of how lean it made the skill.

---

## Files

- `score-output.sh` — objective output-quality scorer (run on a generated prototype dir).
- `context-cost.sh` — trigger-time vs full token cost vs baseline.
- `render.sh` — render a prototype dir to desktop + tablet screenshots (Tier 3).
- `check-overflow.sh` — objective horizontal-overflow guard at a true 390px viewport (exits non-zero on overflow).
- `design-judge.md` — blind pairwise design-quality rubric (Tier 3).
- `baseline.json` — pre-refactor trigger-time cost, for the comparison.
- `briefs/` — three fixed briefs (SaaS dashboard, marketplace, fintech) to generate from.
- `results/` — gitignored scratch for recorded A/B runs.
