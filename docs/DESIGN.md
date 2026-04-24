# DESIGN.md — claude-prototype landing

> A single-page technical-editorial site. Three themes, two layouts, two personas, one tight aesthetic. No illustrations. No gradients. Hairlines and monospace do the work.

## Register

**Brand.** The design IS the product here: this page is the only pre-install experience a skeptical developer has with claude-prototype. Restraint earns trust.

## Physical scenes (theme justification)

- **terminal** (default): a developer at their desk after 10pm, terminal window open beside the browser, skimming a skill they might install before bed. Screen brightness reduced; eyes tired from reading code all day.
- **paper**: the same developer on a Saturday morning, iPad on the kitchen counter, coffee first, catching up on tools that passed through Hacker News this week. Unhurried.
- **mono**: a senior engineer evaluating the skill for their team, printing sections to review with colleagues Monday. No aesthetic arguments; just information.

## Color strategy

Restrained across all three themes. No drenched surfaces, no full palettes. `mono` runs zero accent on purpose.

All neutrals tinted toward each theme's hue. No pure `#000` or `#fff`. WCAG AA contrast verified for every ink role on its surface (lowest pass: ink3 at 5.65:1, comfortably above the 4.5:1 small-text threshold).

### Tokens (rgb-channel format, scaffold convention)

| Token | terminal | paper | mono |
|---|---|---|---|
| `--surface` | `18 22 19` | `249 244 234` | `252 252 253` |
| `--elevated` | `24 28 24` | `241 234 221` | `248 247 249` |
| `--elevated-2` | `32 37 33` | `232 223 206` | `238 237 240` |
| `--ink` | `237 233 223` | `40 33 23` | `29 28 32` |
| `--ink2` | `182 177 165` | `96 87 72` | `98 98 103` |
| `--ink3` | `135 148 135` | `105 96 80` | `100 100 107` |
| `--accent` | `149 196 163` | `165 77 49` | `29 28 32` (= ink) |
| `--accent-ink` | `18 22 19` | `250 246 237` | `252 252 253` |
| `--hairline` | `46 52 47` | `211 201 181` | `218 217 221` |
| `--muted` | `73 81 75` | `163 151 130` | `174 173 178` |

### Why these numbers

- **terminal** hue is yellow-green (155-ish), not cyan-green. CRT phosphor, not neon. Accent saturation kept moderate (chroma in OKLCH ~0.09) so the ink-green reads as muted, not glowing.
- **terminal** ink hue 85 (warm): off-white tinted warm so it reads like paper under tungsten light, not fluorescent clinical.
- **paper** surface chroma is pushed deliberately warm (hue 85): real cream paper has more tint than "off-white." Softens the page even on a cool monitor.
- **paper** accent at hue 40 lands on dusty brick-red. Hue 25 would be too orange, hue 55 olive; 40 is the earth-red of old technical journals.
- **mono** chroma is whisper-low (0.002–0.004): satisfies "no `#000`/`#fff`" without visibly tinting. Hue 270 (slight cool lean) reads as good paper under daylight rather than warm.
- **mono** `--accent` resolves to `--ink`. The accent role still exists in CSS (buttons, active state) but renders as pure ink. Discipline as aesthetic.

## Typography

| Role | Family | Used in |
|---|---|---|
| Heading (terminal, mono) | Inter 600/700 | All h1–h4 |
| Heading (paper) | Fraunces 500/600 (optical-sized) | All h1–h4 |
| Body | Inter 400/500 | Paragraphs, lists, buttons |
| Mono | JetBrains Mono 400/500 | Code blocks, file tree, eyebrows, meta lines |

Loaded via Google Fonts CDN with `font-display: swap`. System fallback: `-apple-system, BlinkMacSystemFont, "Segoe UI"` for sans; `ui-serif, Georgia` for Fraunces; `ui-monospace, "SF Mono", Menlo` for JetBrains Mono.

### Type scale

| Token | px | Use |
|---|---|---|
| `--text-xs` | 12 | Section labels (uppercase, tracked +0.12em), mono meta |
| `--text-sm` | 14 | Code, button labels, nav |
| `--text-base` | 16 | Body |
| `--text-md` | 18 | Lead paragraphs |
| `--text-lg` | 22 | h4 |
| `--text-xl` | 28 | h3 |
| `--text-2xl` | 36 | h2 |
| `--text-3xl` | 48 | h1 |
| `--text-display` | clamp(40, 6vw, 64) | Hero only |

Ratio ≈ 1.27 between adjacent steps. Hierarchy reinforced by weight contrast (400 → 500 → 600 → 700) and tracking (-0.02em on display + h1 + h2, -0.01em on h3 + h4, 0 on body, +0.12em on small-caps labels).

Body capped at 70ch (`comfortable`) or ~64ch (`compact`).

## Spacing scale

`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128`

Section padding (vertical): `--s-9 --s-10` on `comfortable`, `--s-7 --s-8` on `compact`. Container max-width 720px (`comfortable`) or 640px (`compact`).

## Radius scale

`0 / 4 / 8`. Nothing higher.

- 0: hairlines, table borders, section dividers, mono theme buttons
- 4: code blocks, copy button, input field, terminal/paper buttons
- 8: modal card, primary CTA in some states

## Motion

- `--motion-fast`: 150ms cubic-bezier(0.22, 1, 0.36, 1) — ease-out-quart
- `--motion-medium`: 300ms cubic-bezier(0.22, 1, 0.36, 1)

What animates:
- Button color/border on hover (fast)
- Modal open: opacity 0→1 + scale 0.98→1 (medium)
- Toast: translate-y 8px→0 + opacity 0→1 (medium)
- Copy button: icon swap to checkmark, hold 1500ms (fast)
- Persona switch: 150ms opacity flash on swapped nodes
- Skeleton shimmer: 1400ms ease-in-out infinite (scaffold default)

Never animates: width, height, margin, padding, top, left.

`prefers-reduced-motion: reduce` short-circuits all transitions and animations to 0ms.

## Components

### Code block (terminal-style `$` prefix)

`<pre>` containing `<code>` plus `<button class="copy-btn">`. The `$ ` prefix is rendered via CSS `::before` on `.cmd` lines so copy doesn't include it. Copy button has solid `--elevated` background plus left-side fade box-shadow so it stays legible over any horizontal scroll.

### Hairline rules

`hr.rule` between sections. Always 1px solid `--hairline`. Colored accents banned.

### Section labels

Small-caps uppercase, 12px Inter 500, tracked +0.12em, color `--ink3`. Sits 8px above the section's h2.

### Primary CTA

Inter 500, 14px text, padding 12 24, 1px border, radius 4 (or 0 on `mono`). Accent variant uses `--accent` background and `--accent-ink` text; on `mono` this resolves to ink-on-near-white.

### Sticky site nav

`position: sticky` with `backdrop-filter: blur(8px)` over `--surface / 0.92`. Functional, not decorative — keeps anchor links legible over scrolled content. Active section highlighted via `IntersectionObserver` with a `-35% / -55%` rootMargin band.

### Modal

Backdrop is straight ink-tinted opacity (no blur — glassmorphism reserved for the sticky nav). Card uses `--elevated` with 1px hairline border, radius 8. Open/close animated via opacity + scale, 300ms.

### Skeleton shimmer

Linear-gradient at `--muted / 0.18 / 0.32` moving across 200% width. 1400ms ease-in-out infinite. Variants `.is-text`, `.is-block`, `.is-circle` ship in the scaffold.

### Focus styles

Theme-aware `:focus-visible` outline on every interactive element: 2px solid `--accent`, 2px offset, radius 4. On `mono` this becomes ink-on-near-white (since accent = ink). Browser default rings are overridden everywhere.

## What this is NOT

- No illustrations, no hero graphic, no mascot
- No decorative SVG beyond four glyphs: caret, external-arrow, clipboard, checkmark
- No feature-card grid with icons. Features are a `<dl>` definition list
- No testimonials, no logos, no social proof
- No gradient text, no gradient backgrounds, no gradient borders
- No box-shadows for elevation. Elevation comes from surface-0/1/2 contrast
- No pill shapes, no fully-rounded buttons (only the platform control bar)
