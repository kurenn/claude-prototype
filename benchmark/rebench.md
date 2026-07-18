# Re-bench: `main` vs `design-audits`, done to spec

This is the exact, repeatable procedure for a real A/B claim between two skill versions —
not the shortcuts `results/capstone-2026-07.md` had to take (n=1, 2 scoped screens). It
exists so re-running the benchmark is cheap enough to actually happen, instead of getting
re-scoped down again under session-length pressure.

**This file is the procedure. It is not itself a benchmark run.** Running it in full is
2 sides × 3 briefs × 2–3 builds = 12–18 `/prototype` builds, each a multi-screen build —
budget it as its own session (or several), not a side effect of a tooling PR. See
`results/capstone-2026-07.md` for why the shortcuts taken there don't satisfy this spec,
and the "Cost" section below for what a real run costs.

## What "to spec" means (the gaps the capstone run flagged)

| Capstone run (2026-07) | This spec |
|---|---|
| n=1 per brief | **n=2–3 builds per side per brief** |
| 2 screens scoped down from the brief | **full screen count as written in the brief** (4 for Pulse/Ledgerline, 3 for Tend) |
| No check that "distinctive" survives repetition | **monoculture check**: same tone, multiple builds, confirm they aren't twins |
| Judge notes only | **win-rate table + human spot-check on any close call** (a brief that isn't a clean sweep) |

---

## 0. Prerequisites

- A scratch directory per run — worktrees and builds both live here, **outside**
  `~/.claude/skills/`. `~/.claude/skills/` is where the README's recommended install
  lives (a clone at `~/.claude/skills/prototype`), and anything placed under it
  auto-registers as a skill by directory name. Landing a worktree there would silently
  create a second, unwanted skill entry before you've even symlinked anything:

  ```bash
  mkdir -p /tmp/rebench-2026-XX/{main,candidate}
  ```

- Two clean worktrees of this repo, one per side, so both skill versions exist on disk at
  once and neither build can leak context from the other session — created under the
  scratch directory above, not under `~/.claude/skills/` and not as repo-adjacent
  `../bench-*` dirs (same footgun if this repo happens to live under `~/.claude/skills/`):

  ```bash
  git worktree add /tmp/rebench-2026-XX/bench-main main
  git worktree add /tmp/rebench-2026-XX/bench-candidate design-audits
  ```

- Both worktrees' `SKILL.md` declare `name: prototype` in frontmatter — that name, not
  the directory name, is what Claude Code resolves skills by. Symlinking them in as-is
  would register two skills that both claim the name `prototype`, colliding silently.
  Before symlinking, edit each worktree's own `SKILL.md` frontmatter `name:` field so it
  matches the skill name you're about to link it as. This edit is made directly in the
  worktree (not the main checkout) and is never committed — it only needs to survive on
  disk for the duration of the run:

  ```bash
  # in /tmp/rebench-2026-XX/bench-main/SKILL.md,      change `name: prototype` -> `name: prototype-main`
  # in /tmp/rebench-2026-XX/bench-candidate/SKILL.md, change `name: prototype` -> `name: prototype-candidate`
  ```

- Install **both** as distinct skills so you can invoke either by name in the same Claude
  Code environment:

  ```bash
  ln -s /tmp/rebench-2026-XX/bench-main      ~/.claude/skills/prototype-main
  ln -s /tmp/rebench-2026-XX/bench-candidate ~/.claude/skills/prototype-candidate
  ```

  Restart Claude Code (or `/help`) and confirm **both** `prototype-main` and
  `prototype-candidate` appear as distinct entries before starting any builds — that's
  the check that the frontmatter edit above actually took, not just that the symlinks
  exist. From here, `/prototype-main` builds with `main`'s SKILL.md and
  `/prototype-candidate` builds with `design-audits`'s — same session, no ambiguity about
  which version produced which folder.

  > Do **not** symlink either one to the plain `~/.claude/skills/prototype` name while
  > benchmarking — that's the name your own daily driver may resolve to, and a stray
  > `/prototype` invocation during the run would silently pick whichever side is
  > currently linked there.

## 1. Build matrix

For **each** of the 3 briefs in `benchmark/briefs/` (`saas-dashboard.md`,
`marketplace.md`, `fintech-app.md`), for **each** side (`main`, `candidate`), generate
**2–3 independent builds** — fresh Claude Code session per build, same brief text pasted
verbatim, Quick mode, **do not scope the screen count down**. Build the number of screens
the brief specifies (4 / 3 / 4), not a subset.

```
/tmp/rebench-2026-XX/
  main/pulse-1/  main/pulse-2/  main/pulse-3/
  main/tend-1/   main/tend-2/   main/tend-3/
  main/ledger-1/ main/ledger-2/ main/ledger-3/
  candidate/pulse-1/ ... (same layout)
```

That's up to 18 builds (3 briefs × 2 sides × 3 runs). Each build is its own Claude Code
session — don't reuse a session across builds, or later builds can anchor on earlier
output and stop being independent samples.

## 2. Score every build (objective floor, cheap)

Run these on all 12–18 folders as they land — they're fast and catch broken builds before
they reach the expensive judging step:

```bash
for d in /tmp/rebench-2026-XX/*/*/; do
  benchmark/score-output.sh "$d" --json > "$d/score.json"
  benchmark/check-overflow.sh "$d" 390   > "$d/overflow.txt" || true
done
```

A build that fails Tier 1 (missing files, broken control bar) or genuinely overflows at
390px is a broken sample, not a design-quality data point — note it and rebuild that one
slot rather than silently averaging it in. Tier 1/2 saturating near-equal on both sides
(as the capstone run found) is expected; it's not what this run is measuring.

## 3. Render + blind judge (the real signal)

```bash
for d in /tmp/rebench-2026-XX/*/*/; do
  benchmark/render.sh "$d"
done
```

Then, per `design-judge.md`, for each brief pair up **all** matching-index build pairs
(main/pulse-1 vs candidate/pulse-1, main/pulse-2 vs candidate/pulse-2, ...). For every
pair:

1. Copy both `.shots/` sets into neutral `A/` and `B/` folders — **never named
   `main`/`candidate`**.
2. Flip which side is `A` per pair (coin flip, not "always main is A") — the mapping goes
   in your results file, never in the judge prompt.
3. Hand a **fresh subagent** (no build context, hasn't seen the source or either
   SKILL.md) the anonymized screenshots + `design-judge.md`'s 10 lenses. It picks a
   winner per lens and an overall winner per pair.
4. Record the per-lens tally for every pair.

Do this for every pair in the matrix (up to 9 pairs: 3 briefs × 3 runs).

**Human spot-check:** for any brief where the pairs don't agree (e.g. 2 pulse pairs go
candidate, 1 goes main), or any single pair that's a near-tie (one-lens margin), look at
the screenshots yourself before writing the verdict. Don't let a split decision get
smoothed into a win-rate number without a human eyeball on the disagreement — that's
exactly the kind of close call (`Ledgerline 3–2`) the capstone run flagged as unresolved.

## 4. Monoculture / design-diversity check

The design-audits skill's `type-pairings.md` and `color-palettes.md` both claim explicit
anti-monoculture rotation: "a menu of one produces a monoculture — two 'technical'
prototypes would come out twins." This is a testable claim, not a mechanical scoring
check, so `score-output.sh` can't verify it — this run does it directly.

This reuses the step-1 build matrix — it is not an additional round of builds. Step 1
already produced 2–3 fresh-session, same-brief builds per side per brief
(`candidate/<brief>-1..3` and `main/<brief>-1..3`), which is exactly the input this check
needs. Only build something new if a matrix slot from step 1 had to be rebuilt (e.g. it
failed Tier 1 in step 2).

**Procedure:**

1. Pick **one brief and one tone** (e.g. `saas-dashboard.md`, tone "technical, calm,
   confident" as written) and use its existing `candidate/<brief>-1..3` builds from step 1.
2. For each of those builds, record: the type pairing chosen (display + body font), the
   accent hue / palette family, and the one named "distinctive signature move" (per the
   Distinctiveness lens in `design-judge.md`).
3. Compare across the 2–3 builds. **Pass** = at least the type pairing *or* the palette
   family differs across every pair (no two builds share both), and the signature moves
   are independently nameable, not the same idea restated. **Fail (monoculture)** = two or
   more builds converge on the same display font + same hue family — the rotation guidance
   existed on paper but the building agent didn't apply it.
4. Repeat for **one more brief**'s existing `candidate/<brief>-1..3` builds (different
   tone) as a second data point, not because one brief settles it. Two briefs × 2–3 builds
   is enough to say "the rotation guidance works" or "it doesn't" without a third
   dimension of variance to control for.
5. Do the same comparison on the existing `main/<brief>-1..3` builds for at least one
   brief, as the control — `main` has no equivalent rotation guidance, so builds
   converging there isn't a bug, it's the expected baseline the candidate is supposed to
   improve on. If `main` *also* diversifies on its own (LLM sampling variance alone),
   that's worth knowing too: it would mean the rotation files are lower-leverage than
   assumed.

Record the raw comparison (a small table: build → font pairing → palette family → named
signature move) in the results file, not just a pass/fail — the "why" is the useful part
here, same as everywhere else in this benchmark.

## 5. Recording results

Write a dated file to `benchmark/results/` (committed; raw builds/screenshots stay
gitignored, they never leave `/tmp`). Follow the shape of the existing files in that
directory — method, blind mapping, per-lens tally, honest caveats section, verdict. Name
it `design-ab-<yyyy-mm-dd>.md` (or `-rerun-` if superseding a same-day file, matching the
existing `design-ab-2026-06-08.md` / `design-ab-rerun-2026-06-08.md` pair). Include:

- The full build matrix actually completed (don't silently drop a slot that failed Tier 1
  — note it and say whether it was rebuilt).
- Win-rate per brief across all n pairs, not just the first pair.
- The monoculture-check table from step 4.
- An explicit "why this is/isn't proof" section — n=2–3 is a real signal but still not
  n=10; say so, the way every prior results file in this directory does.

## Cost (why this isn't run in this PR)

Each `/prototype` build (Quick mode, 3–4 screens) is a full multi-file agentic session —
scaffold, discovery-driven content, control bar, three switchers, interaction states, a
built-in lint pass. Historical runs in this repo have hit session token/length limits
completing even a *single* 3-brief × 2-side × n=1 fan-out (see the "hit the session token
limit" note in `design-ab-rerun-2026-06-08.md`). At n=2–3 across full-length briefs this
is a **12–18 build** run, plus up to 9 blind-judge passes — the monoculture check (§4)
adds no new builds, it re-reads the same 12–18 outputs, but the build + judging pass
alone is realistically several sessions of work, not one. That's why this issue
documents the procedure and makes it cheap to *start*, rather than executing it inline.

## Quick reference

```bash
# setup (once)
git worktree add /tmp/rebench-2026-XX/bench-main main
git worktree add /tmp/rebench-2026-XX/bench-candidate design-audits
# edit name: prototype -> prototype-main / prototype-candidate in each worktree's SKILL.md
ln -s /tmp/rebench-2026-XX/bench-main      ~/.claude/skills/prototype-main
ln -s /tmp/rebench-2026-XX/bench-candidate ~/.claude/skills/prototype-candidate
# restart Claude Code / run /help, confirm both names appear before building

# per build (repeat per brief × side × run)
/prototype-main         # or /prototype-candidate — paste a benchmark/briefs/*.md verbatim, Quick mode

# per build, once generated
benchmark/score-output.sh <dir> --json
benchmark/check-overflow.sh <dir> 390
benchmark/render.sh <dir>

# then: blind-judge pairs per design-judge.md, monoculture check per §4 above,
# write benchmark/results/design-ab-<date>.md
```
