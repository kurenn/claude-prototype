# Tier 3 — rendered design judge

The output scorer (`score-output.sh`) checks **mechanical correctness** (files present)
and **structural integrity** (names wired consistently). It never looks at the rendered
page, so it saturates at ~100% and is blind to *taste*: hierarchy, spacing, color
discipline, polish, AI-slop. Two prototypes can both score 168/168 and look nothing alike
— one can even ship a layout defect (e.g. a fixed control bar occluding content) that grep
will never catch.

Tier 3 closes that gap by **rendering the prototype and judging the pixels**.

## Why this is the test that matters for progressive disclosure

Progressive disclosure's one real risk: design guidance that used to live inline in
`SKILL.md` now lives in `reference/build.md` and `reference/assess.md`, read **only if the
building agent opens them**. If relocating that detail makes agents skip it, design quality
drops — and Tiers 1–2 stay green. A rendered design judge is the regression test that
catches "progressive disclosure quietly made the output worse." A **tie** here is the
success condition for the refactor, not a disappointment.

## Method — blind pairwise comparison

Absolute 0–10 design scores drift run-to-run and across judges. **Pairwise preference**
("which of these two is better, and why") is far more stable for taste. So Tier 3 compares
**the same brief built two ways** and asks a judge to pick a winner per lens.

### 1. Render both sides

```bash
benchmark/render.sh <baseline-proto-dir>   # → <dir>/.shots/*.png
benchmark/render.sh <candidate-proto-dir>
```

Each produces desktop (`-w1440`) and tablet (`-w768`) screenshots of every screen — both
faithful, because they're ≥ Chrome headless's ~500px layout-viewport floor.

> **Do not judge phone-width (390px) overflow from `render.sh`.** Chrome `--headless=new`
> lays any sub-500px window out at 500px and captures the left slice, which *looks* clipped
> even when the page is perfectly fine at a real 390px. This produced false "mobile overflow"
> verdicts in an early run. Measure phone overflow the real way ↓.

### 1b. Measuring real mobile overflow (true 390px)

Embed the screen in a same-origin iframe sized to a real 390px and read its layout — this
gets a genuine 390 CSS-px viewport (verified: `innerWidth=390`), unlike a clamped window.

```bash
# Drop this probe in the prototype dir (same origin → it can read the iframe), one per screen.
cat > <proto-dir>/_probe.html <<'HTML'
<!doctype html><meta charset=utf8><style>body{margin:0;font:30px monospace;padding:16px}
#f{width:390px;height:260px;border:1px solid #ccc;display:block}</style>
<div id=o>measuring…</div><iframe id=f src="approvals.html"></iframe>
<script>f.onload=function(){var d=f.contentDocument,w=f.contentWindow;
o.textContent="innerW="+w.innerWidth+" scrollW="+d.documentElement.scrollWidth+
" "+(d.documentElement.scrollWidth>w.innerWidth?"OVERFLOW":"OK")}</script>
HTML
benchmark/render.sh <proto-dir>   # render the probe page; read the text off the .shots PNG
```

`scrollW > innerW` → real horizontal overflow at 390px. `scrollW <= innerW` → fine, even if
a `-w390` window-size screenshot looked clipped. Swap `src=` per screen. Delete `_probe.html` after.

### 2. Anonymize + randomize (critical for blindness)

- Do **not** tell the judge which side is baseline vs candidate.
- Label them only **A** and **B**, and **flip which is A** randomly per brief (so a judge
  that favors "the first one shown" doesn't bias every brief the same way). Record the
  mapping in the results file, not in the judge prompt.
- Judge the **same screen at the same width** side by side (index-vs-index, not index-vs-settings).

### 3. Score each lens

For each brief, the judge compares A vs B across these lenses and picks **A / B / tie**
with a one-sentence justification grounded in what's visible:

| Lens | What "better" means |
|---|---|
| **Visual hierarchy** | Eye lands on the right thing first; clear primary vs secondary; no flat wall of equal-weight elements |
| **Spacing & rhythm** | Consistent gaps, aligned edges, breathing room; not cramped, not sparse |
| **Typography** | Sensible scale, readable line-length, restrained weights; not 6 sizes fighting |
| **Color discipline** | Restrained palette, purposeful accent, sufficient contrast; **no random gradients, no AI-slop purple-on-black** |
| **Component craft** | Cards/tables/charts/buttons feel intentional; states and affordances read clearly |
| **Content quality** | Real domain copy and plausible numbers; **no lorem, no "John Doe", no placeholder labels** |
| **Cohesion** | Screens feel like one product; themes/layouts hold together |
| **Layout integrity** | Nothing occluded, clipped, overlapping, or wrapping badly — including the fixed control bar over page content |
| **Gut check** | "Would I put this in front of a stakeholder as-is?" |

> **Clipping caveat:** judge "clipped at the right edge" only on **≥768px** shots, or via the
> true-390 probe (§1b). A sub-500px `render.sh` screenshot that looks clipped is almost always
> the headless-clamp artifact, **not** a real defect — confirm with the probe before scoring it.

### 4. Aggregate

- Per brief: the side winning **more lenses** wins that brief (ties allowed).
- Across briefs: report a **win-rate** (e.g. candidate won 1, baseline 0, 2 ties → no
  regression, slight candidate edge). Don't average lens scores into a fake precision —
  report the tally and the judge's notes.

### 5. Sample size

One pair per brief is **n=1** and taste is noisy. For a claim stronger than "no
regression," generate **2–3 prototypes per side per brief** (vary the run, not the brief)
and report win-rate across all pairs. A 6-of-6 or 5-of-6 candidate win is a real signal; a
3–3 split means the refactor is quality-neutral (which, for a context-cost refactor, is a
pass).

## Who judges

The judge is a vision-capable agent (or a human). To reduce self-bias when the same model
that *built* a side also judges it, prefer either a **fresh subagent** with no build
context, or a human spot-check on the closest calls. Feed it only the anonymized
screenshots + this rubric; never the source or the skill version.

## What Tier 3 does *not* do

- It's not a substitute for `impeccable` or human taste — it's a repeatable A/B signal.
- It judges first-impression viewports, not full-page scroll or interaction flows.
- It can't certify accessibility beyond what's visible (use Tier 2 + builtin-lint for the
  structural a11y checks).

## Record results

Write each run to `benchmark/results/` (gitignored scratch) as a short markdown table:
the A/B→side mapping, per-lens verdicts per brief, and the aggregate win-rate, so trends
are visible across skill versions.
