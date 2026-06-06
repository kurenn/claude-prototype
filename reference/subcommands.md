# Subcommands

## /prototype variant "<vibe>"

Fork the current prototype into a sibling folder to explore an alternative direction.

1. Detect the current prototype folder (cwd or ask).
2. Copy it to `variants/<slugified-vibe>/`.
3. Update the spec's tone descriptors from `<vibe>` (e.g. "more corporate" → swap playful adjectives for measured ones).
4. Re-shape `DESIGN.md` (tokens, type, palette) for the new vibe. Re-apply to CSS vars.
5. Run the same build → assess loop on the variant.
6. Leave the original untouched. Output: "Original at `<slug>/`, variant at `<slug>/variants/<vibe>/`."

## /prototype apply-feedback <file>

1. Read the feedback JSON. Validate the structure.
2. Group comments by page.
3. For each comment:
   - **type: "bug"** — locate the element via `selector`, fix the broken interaction. Verify by navigating to `shareable_url` and reproducing.
   - **type: "change"** — apply the visual / layout / copy change.
   - **type: "question"** — write an inline answer in `feedback-responses.md` (no code change).
4. After all comments applied, re-run impeccable audit + builtin lint.
5. Re-screenshot affected screens (if chrome available).
6. Archive the applied JSON to `feedback/applied/<timestamp>.json` with a per-comment summary.
7. Atomic commit: *"apply feedback batch YYYY-MM-DD: N items"*.
