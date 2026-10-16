# LINT.md — claude-prototype site (2026-10-16)

Assessed with **impeccable** (audit + critique), plus browser QA over CDP on every page:
`index.html`, `designs.html`, `404.html` and all 84 `design.html?f=<slug>` pages, at 390 and 1440px.

## Audit (impeccable `audit`), after fixes — 16/20, Good

| Dimension | Score | Note |
|---|---|---|
| Accessibility | 3 | Focus ring now ink (was the mint accent, ~1.9:1). Text floors ≥11px for UI, ≥12px for notes. Shared control-bar labels stay at scaffold sizes. |
| Performance | 3 | No build, Tailwind CDN (prints its production warning). Per-file JSON fetched on demand. |
| Responsive | 3 | No horizontal scroll at 390 on any page. Nav links wrap to their own row on phones. |
| Theming | 4 | Every colour is a token. Mint, Linen and Void all checked. The demo carries its own token block. |
| Implementation integrity | 3 | Detector findings 70 → 5, all verified below. |

## Detector (`detect.mjs`): 5 remaining, all verified

- `overused-font` (Roboto) and `marketing-buzzword` ("Empower your workflow"): the deliberate
  "Generic AI output" sample on the landing page. Intentional.
- `flat-type-hierarchy` ×3: the 10.4–11.5px steps come from the shared control bar (scaffold
  chrome). The page content uses the committed scale.
- Earlier false positives, not counted above: `broken-image` hits on `<img>` inside CSS comments, and the
  scaffold's `--spring` easing, used only by the Expressive motion tier.

## Critique (impeccable `critique`), dual-agent — 28/40 before fixes

Assessment A (design review) and B (detector + browser evidence) ran as isolated agents.

**Fixed from the critique:**
- **P1** Horizontal overflow under 1100px (632px at 390): the `.has-notes` and `.demo-body` grid
  tracks are now `minmax(0, 1fr)`. Found by both assessments; my first QA missed it, because
  mobile emulation widens the layout viewport to fit overflow.
- **P1** Focus ring on the mint accent → ink.
- **P2** Demo labels on its orange accent were 3.7:1 → dark accent-ink.
- **P2** The page's own claims weren't all true. Accent is now spent only on the two CTAs, as the
  note says. The generic card's tags describe what it actually shows.
- **P2** 404 and not-found states were outside the system. 404 now has the full shell. A missing
  file hides its copy/download actions; `.btn:disabled` is styled. `design.html` with no `?f=`
  goes to the library.
- **P2** Preview read like debug output. The labels are readable now, raw token names sit only in
  the meta line, the type scale shows 4 roles plus a "Show all" toggle, and the palette has a
  "click to copy" hint. Embedded token references (`1px solid {colors.hairline}`) now resolve.
- Line length capped at 70ch on design-page notes. Void's primary and accent buttons are no longer
  identical. Six features instead of seven, so no card sits alone on its row.

**Accepted / not changed:**
- The control bar's density and hidden labels on narrow screens are scaffold behaviour, required on
  every prototype.
- Kicker eyebrows above section headings are deliberate.
- Library data quirks come from upstream (1win's category, a "Stripi's" typo): fix them upstream, not
  here.
- The "New here?" explainer shows only with Persona = New, as a first-run state.
