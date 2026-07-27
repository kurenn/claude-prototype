# Type pairings — font selection by tone

The skill picks fonts by **tone**, not at random. Each tone has a vetted display + body
(+ optional mono) pairing — all Google Fonts, all off the reflex-reject list. This keeps
generated prototypes distinctive instead of defaulting to the invisible sans everyone uses.

## How the skill uses this

1. Discovery Step 2 captures the **tone**. Map it to a row below.
2. **Quick mode** — pick a display from the tone's row (vary it across runs — don't always grab the first) plus its body.
3. **Discovery mode** — state the recommendation in one line and offer the alternate or a free
   choice, e.g. *"For an editorial tone I'd pair Instrument Serif headings with Newsreader body —
   or Fraunces + DM Sans if you want more warmth. Sound good?"* Recommend, don't interrogate.
4. Write the chosen families into the prototype's `DESIGN.md` and the `{{HEADING_FONT}}` /
   `{{BODY_FONT}}` (+ mono) tokens in each screen's Google-Fonts `<link>`. Load only the weights
   you use.

## Pairings — rotate, don't converge

**These are starting points, not a default to settle on.** A menu of one produces a monoculture —
two "technical" prototypes would come out twins. Rotate the display across projects, and never
ship the same pairing twice in a row. Pick one display + one body (+ mono only when the product is
data/code-heavy).

| Tone | Display (rotate) | Body | Mono / utility | Reads as |
|---|---|---|---|---|
| **technical** | Space Grotesk · Hanken Grotesk · Schibsted Grotesk | IBM Plex Sans / Public Sans | JetBrains Mono / IBM Plex Mono | dev-tool, precise |
| **carbon** | IBM Plex Sans *(600 head / 400 body — one family, weights only)* | same family | IBM Plex Mono *(dense data tables)* | enterprise IT, systematic |
| **corporate** | Plus Jakarta Sans · Outfit · Onest | Public Sans / Source Sans 3 | — | trustworthy B2B, not-Inter |
| **editorial** | Instrument Serif · Newsreader · Fraunces | Newsreader / DM Sans | — | magazine, literary |
| **ledger** | Newsreader | Public Sans | IBM Plex Mono *(filing/reference numbers only)* | regulated record, filing-cabinet formal |
| **playful** | Bricolage Grotesque · Gabarito · Syne | Work Sans / DM Sans | — | friendly, contemporary |
| **bold-experimental** | Syne · Unbounded · Archivo | Archivo | Space Mono | high-contrast, confident |
| **minimal** | Manrope · Instrument Sans · Hanken Grotesk *(one family, weights only)* | same family | — | quiet, Swiss |
| **quiet** | Instrument Sans *(one family, weights only)* | same family | IBM Plex Mono *(metadata/eyebrows only)* | hushed, bone-quiet minimal |

**Watch the new reflexes.** Space Grotesk (technical) and Fraunces (editorial) are now the *common*
pick for their tone — fine, but rotate to an alternate when you can. Avoid **Geist**: it is Vercel's
own typeface, so using it for a "reads like Vercel" brief copies the category leader — the opposite
of distinctive.

**Family variants — same tone, different register.** Three presets sit inside an existing tone as a
deliberate alternate, not a replacement. **ledger** (editorial) swaps the Instrument Serif / Newsreader
/ Fraunces rotation for Newsreader heads + Public Sans body: Newsreader reads as a screen-native
newspaper serif (record, not boutique-Didone drama), and Public Sans is the U.S. federal interface
face — exact for a regulated document. **carbon** (technical) swaps the grotesque-display rotation
for IBM Plex Sans throughout, weights only — Carbon's own systematic face, dense data over developer
flourish. **quiet** (minimal) commits to Instrument Sans alone, a quiet neo-grotesque — deliberately
not Geist, and not reaching for the menu's already-common Public Sans / Hanken Grotesk either. All
three (plus IBM Plex Mono) are Google Fonts and already off the reflex-reject list below.

Free-text tones: map to the nearest row or combine deliberately (e.g. "warm + technical" → a
grotesque display with a humanist body like IBM Plex Sans). One family in several weights often
beats two competing typefaces — only add a second face for genuine contrast.

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
