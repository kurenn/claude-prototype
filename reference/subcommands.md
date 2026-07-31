# Subcommands

## /prototype variant "<vibe>"

Fork the current prototype into a sibling folder to explore an alternative direction.

1. Detect the current prototype folder (cwd or ask).
2. Copy it to `variants/<slugified-vibe>/`.
3. Update the spec's tone descriptors from `<vibe>` (e.g. "more corporate" → swap playful adjectives for measured ones).
4. Re-shape `DESIGN.md` (tokens, type, palette) for the new vibe. Re-apply to CSS vars.
5. Run the same build → assess loop on the variant.
6. Leave the original untouched. Output: "Original at `<slug>/`, variant at `<slug>/variants/<vibe>/`."

## /prototype intake <url…>

Absorb one or more sites into the living inspiration corpus (`reference/inspiration.md`) so future
builds get smarter. This is the "ongoing" half of the skill — run it whenever you see something good.

1. For each URL, open it in a **fresh** browser tab (never reuse the user's active tab — it clobbers
   their work). Use the session's browser tooling (claude-in-chrome, or the user's harness). If no
   browser is available, fall back to fetching the HTML and note that the read is structure-only.
2. **Intake the whole thing, not a few clicks** — full-page screenshot(s) + structural extraction
   (headings, nav, CTAs, computed body bg/color, font families, canvas/video counts, page height).
   Scroll long or lazy-loaded pages so below-the-fold and scroll-triggered content actually render.
3. Distill to **DNA, not pixels** (`reference/discovery.md` → "Reading a shared reference"): register,
   motion tier, ground+accent, type, the one signature move, what's zero-dep **Steal**-able, what does
   **not** transfer (needs a build / WebGL / a backend).
4. Append an entry using the schema at the top of `reference/inspiration.md` (dated, sourced, tagged).
   Group it under the right family, or start a new one.
5. If a move now recurs (**≥3 entries** for a cross-site pattern, or a single self-contained move
   that's obviously right), propose graduating it into the menus and add a row to the graduation
   ledger. Don't silently rewrite the menus — surface the promotion for a yes first.
6. **Privacy:** only intake the URLs given. If a tab lands on the user's own content (a logged-in app,
   a private repo), discard it and re-navigate — never absorb it into the corpus.

## /prototype apply-feedback <file>

1. Read the feedback JSON. Validate the structure.
2. Group comments by page.
3. For each comment:
   - **type: "bug"** — locate the element via `selector`, fix the broken interaction. Verify by navigating to `shareable_url` and reproducing.
   - **type: "change"** — apply the visual / layout / copy change.
   - **type: "question"** — write an inline answer in `feedback-responses.md` (no code change).
4. After all comments applied, re-assess (Step 7): `impeccable audit .` if present (PRODUCT.md/DESIGN.md ship in the folder, so the gate is satisfied), else builtin-lint.
5. Re-screenshot affected screens (if chrome available).
6. Archive the applied JSON to `feedback/applied/<timestamp>.json` with a per-comment summary.
7. Atomic commit: *"apply feedback batch YYYY-MM-DD: N items"*.
