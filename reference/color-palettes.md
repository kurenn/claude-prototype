# Color palettes — palette selection by tone

Like the font pairings, the skill picks color by **tone**, not at random. Each tone has a
committed, OKLCH-tinted palette (never flat gray, never `#000`/`#fff`) with one accent, and
each deliberately dodges its category-reflex cliché. Preview them live in `design-lab/index.html`.

## How the skill uses this

1. Discovery Step 2 captures the **tone**. Map it to a palette below.
2. **Quick mode** — silently use that tone's palette.
3. **Discovery mode** — recommend it in one line and offer to shift hue/strategy, e.g.
   *"For an editorial tone I'd go signal-red on cool newsprint — deliberately not the
   terracotta-on-cream everyone uses. Want it warmer or cooler?"*
4. Each prototype's 2–3 **themes** are variations on the chosen palette (e.g. a light, a dark,
   and a mono). Write the values into `DESIGN.md` and the `html[data-theme="…"]` token blocks in
   `css/styles.css`. **Convert hex → space-separated RGB channels** for the scaffold (so Tailwind's
   `<alpha-value>` works): `#267b4c` → `--accent: 38 123 76;`.

## The rules (apply to every palette)

- **Tint every neutral** in OKLCH toward the palette hue, chroma `0.005–0.015`. Pure gray
  (chroma 0), `#000`, and `#fff` are banned — the "dead gray" tell.
- **One accent**, used sparingly. Restrained = accent ≤ ~10% of the surface.
- **Commit to a strategy** first: *restrained* (tinted neutrals + one accent — product default) ·
  *committed* (one color carries 30–60%) · *full-palette* (3–4 named roles) · *drenched* (the
  surface IS the color — brand/hero only).
- **Dark mode ≠ inverted light**: elevate with *lighter surfaces* (`surface` < `elevated` <
  `elevated-2`), not shadow; desaturate the accent; drop body weight a notch.
- **Category-reflex check**: if the palette is guessable from the domain (finance→navy/gold,
  health→teal/white, crypto→neon, dev-tool→blue-on-black), rework it.

## The menu (one palette per tone)

Token order: `surface · elevated · elevated-2 · ink · ink-2 · ink-3 · hairline · muted · accent · accent-ink`.

### technical — pine on warm graphite · restrained
Green on a warm off-white / warm graphite, no blue-on-black.
- **Light:** `#f9f7ef · #fefcf6 · #fffefa · #292620 · #5b5851 · #838079 · #e1ded5 · #f0ede4 · #267b4c · #f5fcf7`
- **Dark:** `#15140f · #1f1e19 · #292822 · #eae8e1 · #adaba3 · #88867f · #35332c · #26241e · #7fb390 · #0f1912`

### corporate — aubergine on warm stone · restrained
Confident and human, zero boardroom navy.
- **Light:** `#fbf6f2 · #fffcf8 · #fffefb · #2d2824 · #605955 · #88827e · #e5ded9 · #f2ebe6 · #853a77 · #fef8fc`
- **Dark:** `#131216 · #1e1c21 · #28272c · #eae6eb · #aea9af · #89848a · #363137 · #262227 · #c388b6 · #170e15`

### editorial — signal red on cool newsprint · committed
Deliberately the opposite of terracotta-on-cream.
- **Light:** `#f2f6fa · #f9fcff · #fcffff · #1b2025 · #4e5359 · #767b81 · #d8dde3 · #e6ecf2 · #c93029 · #fff9f8`
- **Dark:** `#0f1216 · #181c21 · #23272c · #e9edf2 · #aaaeb4 · #82878c · #2c3136 · #1f2328 · #d86353 · #150a08`

### playful — marigold on periwinkle paper · committed
One warm pop against a cool ground, not candy chaos. Accent is a **fill** (button bg + dark text); darken for text links.
- **Light:** `#f5f8fe · #fbfdff · #fdffff · #23262d · #545860 · #7d8088 · #dce0e8 · #eaeff8 · #e19005 · #24180a`
- **Dark:** `#14161b · #1f2228 · #2b2e34 · #e8ebf2 · #aaaeb6 · #868991 · #34383f · #26292f · #e5ab60 · #23180a`

### bold-experimental — acid lime on petrol teal · drenched
Loud and saturated, but a teal base — not neon-on-black. Lime is a **fill**; darken for text.
- **Light:** `#defaf8 · #e9fffe · #f3ffff · #113436 · #3a5c5e · #5f7e7f · #c5e1e1 · #d4f0f0 · #6a9708 · #001c1f`
- **Dark:** `#001c1e · #00282b · #023538 · #d2efec · #95bab7 · #709491 · #134244 · #003033 · #a5ce6f · #002225`

### minimal — monochrome ink-blue · restrained
Even the grays are a tinted ink-blue; the accent is a deeper shade of the same hue, not a second color.
- **Light:** `#f7f9fc · #fcfeff · #feffff · #181b1e · #4d5054 · #777b7e · #dde0e3 · #edf0f4 · #2e4a67 · #fafcfe`
- **Dark:** `#0c0f11 · #16191b · #202326 · #eceff1 · #a5a8ab · #7e8084 · #2b2e32 · #1d2023 · #a5bad1 · #0c1014`

Free-text tones: map to the nearest row or shift the hue deliberately; keep the tinting + one-accent discipline.

## Anti-slop — never ship these

Purple→blue gradients · gradient text · neon-on-near-black · **the cream + serif + terracotta
default** (the #1 tell) · gray text on a colored ground (use a tint of the ground instead).

## Contrast (verified, WCAG)

Body `ink` on `surface` clears 4.5:1 in both themes for all six. Two honest flags:
- **`ink-3`** (tertiary — timestamps, placeholders, captions) is AA-*Large* only in light mode.
  Never set body copy in it; use `ink-2` for anything essential.
- **playful marigold / bold lime** accents are **fill** roles (button background + `accent-ink`
  on top, which pass). As a text link on the surface they fail — darken to ~L0.55 for that use.
