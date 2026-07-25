# Capstone A/B — `main` vs `design-audits` (2026-07)

**Directional result, n=1 per brief — NOT a definitive claim.** Recorded per `design-judge.md`,
with its own caveats applied honestly.

## Method
- 3 briefs (Pulse / Tend / Ledgerline), 2 sides: baseline = `main` skill (via git worktree),
  candidate = `design-audits` skill (via worktree). **2 scoped screens each** (the briefs specify
  3–4 — see caveats).
- Blind pairwise judge (fresh vision agent, no build context). Anonymized Design-1 / Design-2 with a
  **position-flipped** mapping (candidate was Design-1 in two briefs, Design-2 in one).
- Tier 1/2 (`score-output.sh`) saturated on both sides (the density-layout check dips a couple builds
  either way; not discriminating here).

## Blind verdict
Candidate (new skill) won all three: **Pulse 4–1, Tend 4–2, Ledgerline 3–2** (closest). The judge,
blind, attributed the win to distinctive **mono/tabular typography** and **tinted, category-reflex-avoiding
palettes**, and found **no cream+serif+terracotta and no flat untinted gray** on either side.

## Why this is directional, not proof
- **n=1 per brief.** Three wins at n=1 has a ~12.5% coin-flip probability. `design-judge.md` itself says
  n=1 is noisy and demands 2–3 builds/side for a claim stronger than "no regression."
- **Out of spec.** Builds were 2 screens, not the briefs' full 3–4 — halving the surface where dense
  screens (settings, funnels, approvals) historically differentiate.
- **Rubric overlap.** The judge's lenses are the same doctrine the candidate now hard-codes, so part of
  the win measures rubric-compliance rather than independent stakeholder taste.
- **Build-agent variance.** One build per side per brief cannot separate skill effect from run lottery
  (the earlier `results/design-ab-2026-06-08.md` run concluded variance dominated at n=1).
- **Defaults only.** `render.sh` shoots the default theme/layout/persona above-the-fold; the switcher
  isn't judged.
- **The interactive flow is untested here** (fixed briefs, Quick mode, no user).

## Honest read
Suggestive that the audits help, and it clearly kills the terracotta / flat-gray failure mode the prior
run exhibited. But a real claim needs **2–3 builds/side across the full 4-screen briefs**, with a human
spot-check on close calls (Ledgerline 3–2). Not yet run.
