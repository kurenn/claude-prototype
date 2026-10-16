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
- **Void theme — Resend** (`resend.md`): canvas `#000000`, cards `#0a0a0c` / `#101012`, ink
  `#fcfdff`, mute `#a1a4a5`, ash `#888e90`, hairline `rgba(255,255,255,.14)`, the white pill CTA.

## Color
One accent per theme, spent as a fill: Mint's mint (always with ink on it; it's ~1.9:1 as text
on white, so never text) and Void's white pill (a monochrome inversion). Links and focus use ink.
No gradients. The live demo keeps its own token block (Cardinal Coffee's palette) and its
"alive" states use the demo's own accent.

## Typography
Manrope 400–800, tracking −0.035 to −0.045em on display (Cal.com's tight-tracking signature),
fixed rem in UI, `clamp()` on the hero only. JetBrains Mono for code, labels, numbers, the
wordmark and the margin notes. Scale: the committed 1.25 ratio in `css/styles.css`.

## Layout & shape
72rem column; on ≥1100px a 14rem right column holds the margin notes. Sections separate with a
hairline and space, never boxes. Radius 8px; buttons are pills in Mint (Mintlify) and 8px in Void
(Resend). Shadows near-zero (Mint) or none (Void).

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
Theme Mint / Void · Layout Editorial / Index (feature grid 2-up vs 3-up; library cards roomy vs
dense; design pages stacked vs palette-and-type side by side) · Persona Live / New (New shows
first-run explainers and the demo's empty state) · Motion · Loading · Share · Feedback.
