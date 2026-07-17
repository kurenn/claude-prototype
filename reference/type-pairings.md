# Type pairings — font selection by tone

The skill picks fonts by **tone**, not at random. Each tone has a vetted display + body
(+ optional mono) pairing — all Google Fonts, all off the reflex-reject list. This keeps
generated prototypes distinctive instead of defaulting to the invisible sans everyone uses.

## How the skill uses this

1. Discovery Step 2 captures the **tone**. Map it to a row below.
2. **Quick mode** — silently use that tone's **primary** pairing.
3. **Discovery mode** — state the recommendation in one line and offer the alternate or a free
   choice, e.g. *"For an editorial tone I'd pair Instrument Serif headings with Newsreader body —
   or Fraunces + DM Sans if you want more warmth. Sound good?"* Recommend, don't interrogate.
4. Write the chosen families into the prototype's `DESIGN.md` and the `{{HEADING_FONT}}` /
   `{{BODY_FONT}}` (+ mono) tokens in each screen's Google-Fonts `<link>`. Load only the weights
   you use.

## Pairings

| Tone | Display | Body | Mono / utility | Reads as | Alternate |
|---|---|---|---|---|---|
| **technical** | Space Grotesk | IBM Plex Sans | JetBrains Mono | dev-tool, precise (Linear/Vercel) | Geist + Geist Mono |
| **corporate** | Plus Jakarta Sans | Public Sans | — | trustworthy B2B, not-Inter | Outfit + Source Sans 3 |
| **editorial** | Instrument Serif | Newsreader | — | magazine, literary | Fraunces + DM Sans |
| **playful** | Bricolage Grotesque | Work Sans | — | friendly, contemporary | Syne + DM Sans |
| **bold-experimental** | Syne | Archivo | Space Mono | high-contrast, confident | Unbounded + Archivo |
| **minimal** | Manrope *(one family, weights only)* | Manrope | — | quiet, Swiss | Instrument Sans (solo) |

Free-text tones: map to the nearest row, or combine deliberately (e.g. "warm + technical" →
Space Grotesk display with a humanist body like IBM Plex Sans). One family in multiple weights
often beats two competing typefaces — only add a second face for genuine contrast.

## Reflex-reject list — never ship these for distinctive work

**Inter · Roboto · Open Sans · Lato · Montserrat · Arial · raw `system-ui` as the brand face.**
Fine for docs or a pure tool where personality isn't the goal; wrong for a prototype meant to
impress. Two anti-reflexes:

- **Mono is not a costume.** Use a monospace for numbers/code/eyebrows, never as lazy "developer
  vibes" across the whole UI.
- A **technical** brief does not need a serif "for warmth"; a **modern** brief does not need a
  geometric sans. The most modern move is not using the font everyone else is using.

## Scale — committed 1.25 major third

`16 / 20 / 25 / 31 / 39 / 49` — shipped as `--text-base … --text-4xl` rem tokens in
`css/styles.css`; hero uses `--text-display: clamp(2.5rem, 6vw, 4rem)`. Fewer sizes, more
contrast — thin the crammed 12–16 cluster. **Fixed rem** for product UI; **fluid `clamp()`** for
the hero headline only (no major design system uses fluid type inside product UI).

## Polish (ships in the scaffold — floor, applies on top of any pairing)

- `tabular-nums` on numeric cells / KPIs (`.tabular` or `[data-tabular]`).
- `text-wrap: balance` on headings, `text-wrap: pretty` on prose.
- `font-optical-sizing: auto` for variable fonts (Fraunces, Bricolage Grotesque, Manrope).
- All-caps labels / eyebrows: `letter-spacing: .05–.12em` (`.eyebrow`).
- Light-on-dark type needs compensation on three axes: line-height +0.05–0.1, tracking
  +0.01–0.02em, weight +1 step.

## Loading

Google Fonts CDN with `preconnect` + `display=swap` (already in the scaffold `<head>`). Request
only the weights you use. For 3+ weights of one family, the variable font file is smaller than
separate static weights.

## Preview

`design-lab/index.html` renders every pairing in situ (type your product name, flip light/dark,
compare) — the visual companion to this table.
