# Iterate — per-screen refinement loop

Beautiful design is iterative, not one-shot. After the first build — and after every change —
offer to refine, like a design review, not a form.

## The loop

1. **Offer it explicitly, don't wait to be asked.** After the build (and after assess), say:
   *"Want to refine any screen? Tell me the page and how it should change — the feel, the layout,
   the content, or a specific element."*
2. **Scope to the screen named.** Change only that screen. Don't silently restyle the whole
   prototype off one comment. If a change is genuinely global (a token, the palette, the type
   pairing), say so and confirm before propagating it everywhere.
3. **Interpret feeling, not just literal instructions.** Translate the vibe into concrete moves:
   - *"make it feel calmer"* → lower density, soften contrast, slow the motion, more whitespace
   - *"more premium"* → tighten tracking, refine spacing, one restrained accent, drop a font weight
   - *"more energetic"* → a bolder display size, a committed accent fill, a staggered reveal
   - *"it feels generic"* → change the palette off its category reflex, add the signature move
4. **Re-verify the changed screen** — render it, check 390px overflow, console clean, all themes hold.
5. **Loop** until they're happy. Each pass is cheap — that's the whole point of a zero-build prototype.

## Modes of iteration

- **Live, in-session (default)** — the user reacts in chat; apply and re-verify immediately.
- **Pinned feedback** — the 💬 overlay exports JSON; `/prototype apply-feedback <file>` replays each
  comment against its pinned element. Good for async / stakeholder rounds.
- **Variant fork** — *"try a bolder version"* → `/prototype variant "<vibe>"` forks a copy so the
  original stays intact for side-by-side comparison.

## Keep the taste bar

Every iteration still obeys the doctrine: tinted neutrals, one accent, the committed type scale,
ease-out motion, the anti-slop bans (`reference/type-pairings.md`, `reference/color-palettes.md`).
*"Make it pop"* is not license to add a gradient — it's a cue to sharpen hierarchy and commit the
accent. Preview any direction live in `design-lab/index.html`.
