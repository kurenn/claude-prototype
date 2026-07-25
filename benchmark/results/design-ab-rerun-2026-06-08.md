> ## ⚠️ CORRECTION (2026-06-09) — the "mobile overflow" signal was a tooling artifact
> A true-390px iframe probe (`innerW=390, scrollW=375, OK`) showed **neither** candidate
> build actually overflowed at phone width. `render.sh --window-size=390` was clamped by
> Chrome's ~500px headless floor and captured the left 390px of a 500px layout — **fake
> clipping.** Every "mobile overflow / Approve off-screen" verdict below (a *decisive* lens
> in the judging) was based on those unfaithful shots. Re-reading without the artifact:
> the Mobile lens should have been ~tie, not a baseline win. The genuine remaining signal
> is much thinner — a mild candidate tendency toward **color slop (gradient/purple)** and
> **a11y omissions (focus-visible, modal aria)**, both real and both addressed by PR #4 /
> the post-fix rebuild (`candidate2`: no purple 6/6, focus-visible 4/4). Net: the refactor
> is roughly **design-neutral**, not a regression. `render.sh` and `design-judge.md` were
> fixed to stop judging sub-500px screenshots and to measure true-390 overflow via the probe.

# Design A/B — re-run on the FIXED scaffold (post issue #2)

Date: 2026-06-08, evening. Both sides built on the **same fixed scaffold** (current `main`,
with the overflow + control-bar fixes). Only variable: monolithic SKILL.md (baseline2) vs
progressive-disclosure SKILL.md + reference/ (candidate). This isolates the refactor.

Note: the full 3-brief × 2-side fan-out (6 builds) hit the session token limit. Only the
**Ledgerline** pair completed — the hardest brief (4 screens, dense tables, the screen where
the amount column went off-screen before), so the most discriminating single test.

## Did the overflow fix work?

**Yes, for tables.** Both builds wrapped every `<table>` in `.proto-table-wrap` (scorer 3/3),
and at 390px the tables now scroll inside their card instead of blowing out the page. The
Tier-2 guard catches regressions (it still flags the old unwrapped `baseline/pulse` at 0/3).

**Partially, for everything else.** The candidate's **search/filter toolbar** still overflowed
390px (it wrapped the table but not the toolbar), pushing the primary **Approve** button
off-screen on approvals-w390. The fix gave agents the tools (`.proto-actions`, guidance); the
candidate agent didn't apply them to the non-table rows.

## Blind judge — Ledgerline (A=baseline, B=candidate, hidden from judge)

**Winner: baseline, 4–2 (3 ties).** Baseline won typography, color discipline, cohesion, and
the decisive Mobile lens. Candidate won spacing and component craft. Candidate's losses:
- Mobile: filter toolbar overflow + Approve button off-screen at 390px (blocker).
- Color: five gradient card faces drifting toward AI-slop on a corporate finance tool.
- Plus an a11y miss the scorer caught: `:focus-visible` absent (Tier-2 0/4 → total 167 vs 171).

## Cross-run tally (4 pairs, 1 run each — suggestive, not proof)

| Brief (run) | Scaffold | Winner | Candidate's deciding weakness |
|---|---|---|---|
| pulse (1) | old | baseline | anti-slop purple + mobile toggle off-screen |
| tend (1) | old | baseline | leaked template placeholders |
| ledgerline (1) | old | candidate | — (candidate cleaner that run) |
| ledgerline (2) | **fixed** | baseline | mobile toolbar overflow + gradient slop + focus-visible miss |

**Baseline 3, candidate 1.**

## Honest interpretation — this revises the earlier "no regression" read

The candidate's losses are **not random taste** — they cluster on a stable set of categories:
**mobile responsiveness, anti-slop color restraint, and a11y completeness (focus-visible,
modal aria).** These are exactly the kind of "don't forget" guardrails the monolithic SKILL.md
kept inline and always-in-context, and which the refactor relocated to `reference/build.md` /
`reference/assess.md` — read once, or skimmed, or skipped.

So the evidence now **leans toward a modest design-quality cost from progressive disclosure**,
concentrated in detail categories, even though aesthetic lenses (hierarchy, content) stay even.
This is the documented risk of progressive disclosure materializing — not proof (n=1/brief,
setup changed between runs), but a consistent enough signal to act on.

## Recommended mitigation (keep the context win, restore the guardrails)

Pull the few highest-leverage "never ship without" rules UP into the SKILL.md body as a short
non-negotiable checklist — leaving the detailed how-to in `reference/`:
- No horizontal scroll at 390px — including toolbars/filter rows, not just tables.
- Anti-slop color: one accent, no gradient fills / no purple-on-black.
- a11y floor: `:focus-visible`, modals carry `role=dialog` + `aria-modal`.

That costs ~10–15 lines of trigger-time context (keeps most of the −73% win) but puts the
exact rules the judge keeps catching back into always-loaded context. Then re-run the A/B.

## To raise confidence

Complete the pulse + tend pairs on the fixed scaffold (4 more builds, ~560k tokens — batch to
avoid the session limit), and do 2–3 runs/brief/side. If baseline keeps winning on the same
categories, implement the mitigation and re-test for a true before/after.
