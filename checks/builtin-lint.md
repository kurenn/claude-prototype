# Built-in lint rules

Used when the impeccable skill is NOT installed. These are a minimum bar — impeccable covers far more. Every rule below is something Claude can verify by reading the scaffold files, running `grep`, or inspecting via claude-in-chrome.

For each finding, produce a `LINT.md` report inside the prototype folder with: rule, location (file:line or URL), severity (error / warn), and a suggested fix.

After fixing, re-run the full list until clean.

---

## Color & visual

### 1. No purple gradients
Purple-to-pink-to-blue gradients are the #1 AI-design tell. Never ship.

```
grep -rE "from-(purple|violet|fuchsia|pink)" <prototype>/ --include="*.html"
grep -rE "linear-gradient.*(purple|#a0|#b0)" <prototype>/ --include="*.css"
```

**Fix:** replace with solid accent color or a single-hue ramp from the DESIGN.md palette.

### 2. No gradient text on body copy
OK on a single hero headline, never elsewhere. Gradient body text is unreadable and screams AI.

```
grep -rE "(text-transparent|bg-clip-text)" <prototype>/ --include="*.html"
```

Allow only inside one explicitly-marked hero element. Flag otherwise.

### 3. Contrast minimum on body text
Every text element must hit ≥4.5:1 against its background (WCAG AA). Check by:
- Pulling the computed color + background from DESIGN.md tokens per theme
- Running contrast math (relative luminance → ratio)
- Walking each theme; a passing contrast ratio must hold in ALL themes

**Fix:** raise `--ink2` (secondary text) or lower `--surface` to hit ratio.

### 4. No nested cards > 2 deep
A card inside a card inside a card is slop.

```
grep -rE "rounded-(proto|xl|2xl|lg).*border.*rounded-" <prototype>/ --include="*.html"
```

Flag any element that has ≥3 ancestors with a card-like class chain (`rounded-*` + `border` or `shadow`).

---

## Interaction

### 5. No dead buttons or links
Every `<a href>` must resolve to a file or `#`-anchor that exists; every `<button>` must trigger a visible effect.

For each screen:
1. Enumerate all `<a>` — check `href` points to a real `.html` in the folder, a valid `#id`, or a modal/state URL handled by `state.js`.
2. Enumerate all `<button>` — trace to an event listener in `app.js` or inline attribute. Flag any without one.

**Fix:** wire the handler, link to a plausible target, or remove the element.

### 6. Modal ARIA state
Modals must have `role="dialog"`, `aria-modal="true"`, and `aria-hidden` that flips with open state. Focus must trap inside. Escape must close.

### 7. Focus visible
`:focus-visible` ring must be defined for all interactive elements. Quick check: add `<button>Tab here</button>` anywhere, tab into it, verify a visible outline appears.

---

## Responsive

### 8. No horizontal scroll at 375px
Walk every page at 375×812 viewport. Zero horizontal scrollbar. Any overflow → fix.
Common culprits and fixes: wide `<table>` → wrap in `.proto-table-wrap`; header/filter
button rows → `proto-actions` / `flex-wrap`; fixed multi-col stat strips → responsive grid.
Also confirm the last row of content isn't hidden under the fixed control bar (the scaffold
reserves `body { padding-bottom }`; app-shell layouts that scroll an inner `<main>` must
mirror it there).

### 9. Readable text at 375px
Minimum 14px body on mobile. Headings should NOT overflow. Buttons min 44×44 target size.

### 10. No fixed widths on layout elements
```
grep -rE "w-\[[0-9]+px\]|width:\s*[0-9]+px" <prototype>/
```
Flag any fixed pixel widths on containers, cards, or layout grids. Percent, rem, or Tailwind fluid widths only.

---

## Content

### 11. No lorem ipsum
```
grep -ri "lorem ipsum\|dolor sit amet" <prototype>/
```
Any match = automatic fail. Replace with realistic placeholder appropriate to the product domain.

### 12. No placeholder names like "John Doe" or "User 1"
```
grep -riE "(John Doe|Jane Doe|User [0-9]+|Item [0-9]+|Example Corp)" <prototype>/
```
Flag and replace with plausible names.

### 13. Dates should be recent and realistic
Flag dates older than 2 years or in the far future (unless the product is a calendar/planner).

---

## Performance & polish

### 14. No console errors
Load every page, watch the devtools console. Zero errors on initial load.

### 15. All images have alt text
```
grep -rE "<img(?![^>]*\balt=)" <prototype>/ --include="*.html" -P
```
Every `<img>` without `alt=` is a flag. Alt="" is acceptable for decorative images; explicit alt text for meaningful ones.

### 16. No broken image paths
For each `<img src="...">`, verify the file exists in `assets/images/`. Broken images are instant "this is fake" signals.

### 17. Theme switcher works in every theme
For each defined theme:
- Switch to it
- Visual scan: does any element become unreadable, invisible, or mis-colored?
- Flag any theme-specific breakage

### 18. URL state round-trips
- Open a modal → copy URL via 🔗 → close all → paste URL in new tab → modal opens at load.
- Same for tabs, theme.

---

## Scope discipline

### 19. Screen count matches spec
If the spec said 4 screens, there should be exactly 4. Extra screens = scope creep, flag and ask.

### 20. No build tooling
Zero `package.json`, zero `node_modules/`, zero `vite.config.*`. Tailwind CDN only. If something in the output needs a build step, it doesn't belong in a prototype.

---

### 21. Signature move named in DESIGN.md
Beautiful design commits to one memorable, on-brief detail. DESIGN.md should name a **signature
move** — a distinctive nav, an editorial hero, a considered data-viz treatment, a motion moment.
If none is named, the design is probably a template.
```
grep -i "signature" <prototype>/DESIGN.md
```
Flag if absent.

<!-- Slop gates adapted from Hallmark (github.com/Nutlope/hallmark), MIT. -->

---

## Contrast — button & fill

### 22. Button text ≈ fill contrast
Rule 3 checks text against the *page* background — but a button's own fill can still
swallow its label (e.g. `--ink` text on a `--accent` fill that computes to nearly the
same lightness). Reuse rule 3's contrast math, this time pairing the button's text
color against its own fill, per theme.
- For every button/CTA-like element (`.btn`, `[type="submit"]`, anything with a solid
  `bg-accent`-style fill), find the applied text token and the fill token, per theme.
- Run the same luminance → ratio math as rule 3 for that pair: ≥4.5:1 for normal text,
  ≥3:1 for large/bold (≥18px bold or ≥24px regular).
- Walk every theme — a token pairing that passes in one theme (e.g. `--accent` /
  `--accent-ink`) can fail in another if a theme redefines one side without the other.

```
grep -rE 'class="[^"]*\bbg-accent\b[^"]*\btext-(ink2?|muted)\b' <prototype>/ --include="*.html"
```

**Fix:** pair every `bg-accent` fill with `text-accent-ink` (never `text-ink` /
`text-muted`), and confirm `--accent-ink` clears the ratio against `--accent` in every
theme's token block.

---

## Layout & grid

### 23. `minmax(0, 1fr)` on image/media grid tracks
Grid tracks holding an `<img>`, `<picture>`, or `.media` block need `minmax(0, 1fr)`, not
bare `1fr`. Bare `1fr` resolves to `minmax(auto, 1fr)` — the `auto` minimum takes the
image's intrinsic width as the track floor, which can blow the layout past the viewport
on phones.

```
grep -rn "grid-template-columns" <prototype>/ --include="*.css" --include="*.html"
```

For each match with a bare `1fr` (not already wrapped in `minmax(0, …)`), check whether
that grid's children include an image or `.media` block. If so, flag it.

**Fix:** wrap the track — `1fr` → `minmax(0, 1fr)`.

### 24. `overflow-wrap: anywhere` on display headings
Long unbroken strings (compound product names, uppercase brand names, URLs) in a large
heading have no break opportunity at small viewports and overflow at 390px.

```
grep -rEn "<h1|class=\"[^\"]*(hero|display|section__title)" <prototype>/ --include="*.html"
```

For each match, confirm the heading's CSS rule sets `overflow-wrap: anywhere` (or
`word-break: break-word`) and, if it's a grid/flex item, `min-width: 0`.

**Fix:** add `overflow-wrap: anywhere;` to the display-heading selector(s) in `styles.css`.

### 25. All-caps heading line-height floor
Uppercase glyphs have no descenders, so their cap-tops sit at the very top of the line
box. Below `line-height: 1.0`, a wrapped all-caps heading's second line visibly collides
with the first line's baseline or trailing punctuation.

```
grep -rnB2 -A2 "text-transform:\s*uppercase" <prototype>/ --include="*.css"
```

Flag any match where the same rule (or an inherited `line-height` / `--lh-tight`) is
below `1.0` on a display-size element.

**Fix:** bump `line-height` to ≥1.0 (1.02–1.08 recommended) for that selector, or drop
the uppercase transform on headings that can wrap.

### 26. Flex vertical-centering baseline
Default flex layouts inherit `align-items: stretch`. An icon+text row (or any row mixing
a fixed-height element with a text sibling) without `align-items: center` lets the taller
child stretch and breaks the shared baseline.

```
grep -rEn 'class="[^"]*\bflex\b[^"]*"' <prototype>/ --include="*.html"
```

For each flex row combining an icon/avatar/badge with text, confirm `items-center`
(Tailwind) or `align-items: center` (custom CSS) is present.

**Fix:** add `items-center` (or `align-items: center`) to the row.

---

## Forms & inputs

### 27. Input-state craft
Inputs are where "almost right" UIs lose. Fail on **any** of:
- **Focus changes border width** — default / hover / focus / error must all keep the
  same `border-width`. Focus should read via `box-shadow` / `outline` /
  `background-color`, never a wider border (that reflows layout).
- **Input height ≠ adjacent button height** — inputs and buttons in the same row must
  share one base height (44px floor).
- **Helper/error text slot collapses** — the `.hint` / `.error` slot needs a reserved
  `min-height` even when empty, so an appearing error doesn't shove the page down.
- **Disabled is opacity-only** — disabled state needs `opacity` **and**
  `cursor: not-allowed` **and** the native `disabled` attribute (or
  `aria-disabled="true"`).

```
grep -rnE ":focus\s*\{[^}]*border-width" <prototype>/ --include="*.css"
grep -rn "\.hint\|\.error" <prototype>/ --include="*.css"
grep -rnE "\[disabled\]|:disabled" <prototype>/ --include="*.css" -A2
```

**Fix:** move focus indication off `border-width`; equalize input/button heights;
reserve `min-height` on the hint/error slot; add `cursor: not-allowed` + the `disabled`
attribute alongside opacity.

---

## Token & content discipline

### 28. Inline color outside the token block
Every color must flow from a `:root` / `[data-theme]` token — a raw hex, `rgb()`, or
`oklch()` literal anywhere else means the palette was improvised mid-build instead of
chosen once.

```
grep -rnE "#[0-9a-fA-F]{3,8}" <prototype>/ --include="*.html"
grep -rnE "(color|background(-color)?|border(-color)?|fill|stroke):\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|oklch\([^)]*\))" <prototype>/ --include="*.css" | grep -vE "var\(--|:root|\[data-theme"
```

**Fix:** lift the value into the token block as a new named `--variable`, or replace it
with an existing token.

### 29. No re-drawn browser / phone / IDE chrome
A hand-built fake browser toolbar (URL pill + traffic-light dots), phone frame (rounded
rectangle + notch), or IDE chrome (file tabs + sidebar around a code block) reads as set
decoration, not product — and is one of the strongest "this is AI-generated" tells.

```
grep -rniE "(browser-bar|url-bar|traffic-light|window-dots|phone-notch|fake-browser|mock-browser|ide-chrome|editor-chrome|terminal-chrome)" <prototype>/ --include="*.html" --include="*.css"
```

**Fix:** use a real screenshot inside a `<picture>` / `<figure>`, or drop the chrome and
let the content stand on its own.

### 30. No invented precise metrics
A suspiciously precise, unsourced stat presented as real ("99.98% uptime", "10,432
active users") fabricates facts about the product.

```
grep -rnE "[0-9]{2,3}\.[0-9]{1,2}\s*%|[0-9]{1,3},[0-9]{3}\+?\s*(users|customers|teams|downloads|members)" <prototype>/ --include="*.html"
```

**Fix:** replace with a labelled placeholder ("metric to confirm") or rebuild the
section without the proof slot — don't invent a number to fill a stat-led layout.

---

## Named tells

### 31. No italic display headers
Italic on `h1`–`h6`, a hero title, wordmark, or stat figure is a top AI tell. Headers are
roman; emphasis comes from weight, accent color, or a drawn underline.

```
grep -rnE "font-style:\s*italic" <prototype>/ --include="*.css"
grep -rnE "<h[1-6][^>]*>.*(<em>|<i>)" <prototype>/ --include="*.html"
```

**Fix:** drop `italic` / `<em>` / `<i>` from headings; reserve italics for inline
emphasis inside running body copy only.

### 32. No eyebrow/tag left of the heading
A small eyebrow/tag/number placed in a column to the left (or right) of the section
heading — tag-left, header-right — is a templated-SaaS tell, regardless of class name.
**Not bypassable by "match the reference"** — if a reference design ships this pattern,
flatten it in the new build anyway.

```
grep -rnE 'class="[^"]*(eyebrow|kicker|pretitle)[^"]*"' <prototype>/ --include="*.html"
grep -rnE "grid-template-columns:\s*(auto\s+1fr|minmax\([^)]*\)\s+minmax\([^)]*\)|[0-9.]+fr\s+[0-9.]+fr)" <prototype>/ --include="*.css"
```

For any header/wrapper containing both an eyebrow and a heading, confirm it's
single-column (`display: block`, `flex-direction: column`, or
`grid-template-columns: 1fr`) — not a multi-column row.

**Fix:** stack the eyebrow directly above the heading in the same column; never
side-by-side.

### 33. One icon set, no emoji-as-icon
Icons drawn from more than one library on the same page, or emoji (✨ 🚀 ⚡ 🔥 🎯 ✅) used
as feature/step/pricing-tier icons, is an AI-default tell. This is a companion check to
the reicon.dev single-weight rule in [`reference/build.md`](../reference/build.md) — that
rule covers *weight*; this one covers *library and emoji mixing*.

```
grep -rniE "(feather-icons|lucide|heroicons|material-icons|font-awesome|phosphor-icons)" <prototype>/ --include="*.html"
grep -rnP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}\x{2190}-\x{21FF}]" <prototype>/ --include="*.html"
```

**Fix:** pick one icon source (reicon.dev, one weight) for the whole prototype; replace
emoji-as-icon with an inline SVG, or drop the icon and lead with typography.

## Report format

Produce `LINT.md` at the prototype root:

```markdown
# Lint Report — {{timestamp}}

**Rules checked:** 33  ·  **Passing:** N  ·  **Findings:** M

## Errors (N)

### 1. Purple gradient detected
- **File:** index.html:42
- **Rule:** No purple gradients
- **Found:** `class="bg-gradient-to-r from-purple-500 to-pink-500"`
- **Fix:** replaced with `bg-accent`

## Warnings (N)
...

## Passed
- No lorem ipsum ✓
- No dead buttons ✓
...
```

After fixing all errors, re-run. Warnings may be accepted case-by-case with a note in the report.
