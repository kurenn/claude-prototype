# claude-prototype site — DESIGN.md

Direction: **"the site that shows its work."** Minimal and quiet: white space, hairlines and one
family. Approved by the maintainer on 2026-10-16, with the palette taken from two more design files.

## Sources (from `reference/designs/`, via the skill's design-file index)
- **Type — Cal.com** (`cal.md`, primary match for "clean, minimal, developer"): Cal Sans is
  proprietary; its named free substitutes are Inter and Manrope. Inter is on the skill's
  reflex-reject list, so **Manrope**. Body would be Inter (rejected), so the `minimal` menu row
  applies: one family, weights only. Mono: **JetBrains Mono**, named by the file as itself.
- **Mint theme — Mintlify** (`mintlify.md`): canvas `#ffffff`, surfaces `#fafafa` / `#f7f7f7`,
  ink `#0a0a0a`, slate `#3a3a3c`, steel `#5a5a5c`, hairline `#e5e5e5`, mint `#00d4a4`.
- **Linen theme — Oura** (`oura.md`): canvas `#f7f1e8`, white cards, ink `#1c1b1a`, stone
  `#4a4741`, clay `#6b443d` for the faintest text (its ash `#838280` is ~3.5:1 on paper), hairline
  `#e1dcd3`, and its blue primary `#2a72de` as the one accent, with white on it (4.6:1).
- **Void theme — Resend** (`resend.md`): canvas `#000000`, cards `#0a0a0c` / `#101012`, ink
  `#fcfdff`, mute `#a1a4a5`, ash `#888e90`, hairline `rgba(255,255,255,.14)`, the white pill CTA.

## Color
One accent per theme, spent as a fill: Mint's mint (always with ink on it; it's ~1.9:1 as text
on white, so never text), Linen's blue with white on it, and Void's white pill (a monochrome inversion). Links and focus use ink.
No gradients. On the landing page the accent is spent once, on the install Copy button.

## Typography
Manrope 400–800, tracking −0.035 to −0.045em on display (Cal.com's tight-tracking signature),
fixed rem in UI, `clamp()` on the hero only. JetBrains Mono for code, labels, numbers, the
wordmark and the margin notes. Scale: the committed 1.25 ratio in `css/styles.css`.

## Layout & shape
72rem column; on ≥1100px a 14rem right column holds the margin notes. Sections separate with a
hairline and space, never boxes. Radius 8px (12px in Linen); buttons are pills in Mint (Mintlify) and Linen
(Oura), 8px in Void (Resend). Shadows near-zero (Mint) or none (Void).

## Landing page
One screen, after opensop.ai's simplicity: headline, a two-line lead, the install command (the
one accent), five points, three links. The live demo, facts strip, feature cards, comparison and
teaser were cut; flipping the page's own Theme is the demo now, and the design-file pages carry the proof.

## Signature move
**Margin notes** (`.mnote`): small monospace notes beside each section that explain the page's
own design decisions and cite the files they came from. Always open on wide screens, folded behind
"why" on narrow ones (`js/site.js`). The design-file pages extend it: the frame is this site, and
the preview panel is painted only in the file's tokens.

## Motion
Calm by default (a reading site): fades only, instant entrances, micro-feedback kept. Standard and
Expressive stay one click away in the control bar.

## Icons & imagery
Icons: sparingly functional (arrows on links only). Imagery: none; colour strips and type carry
the library. No brand logos anywhere.

## Control bar
Theme Mint / Linen / Void · Layout Editorial / Index (feature grid 2-up vs 3-up; library cards roomy vs
dense; design pages stacked vs palette-and-type side by side) · Persona Live / New (New shows
first-run explainers) · Motion · Loading · Share · Feedback. The landing page shows only Theme,
Motion, Share and Feedback: a one-screen page has no layout, persona or loading state to change,
and a control that changes nothing is a dead button.

The bar loads open on every page; its chevron tucks it into a bottom-left corner button,
remembered per visitor (`js/ui.js`).
