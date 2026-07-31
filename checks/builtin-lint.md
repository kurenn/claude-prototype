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
grep -rE 'class="[^"]*bg-accent[^"]*text-(ink[23]?|muted)([" /]|$)' <prototype>/ --include="*.html"
grep -rE 'class="[^"]*text-(ink[23]?|muted)[^"]*bg-accent' <prototype>/ --include="*.html"
```

Also read every `.btn`/CTA rule in `styles.css` and check its `color:` token against its
`background:` token (the grep is HTML-only).

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
heading have no break opportunity at small viewports and overflow at 390px. This is a
**build-content** risk, not a property every heading needs — a short, ordinary headline
(the scaffold's own `{{HERO_HEADLINE}}`) has nothing to break on and isn't a finding.

```
grep -rEn "<h1|class=\"[^\"]*(hero|display|section__title)" <prototype>/ --include="*.html"
```

For each match, don't flag on the class/tag alone. Flag only when **either**:
- the heading's actual text contains a long unbroken token (a URL, hash, slug, or
  compound-word string ≥ ~20 characters with no space/hyphen break opportunity), **or**
- `benchmark/check-overflow.sh <prototype-dir> 390` confirms that screen overflows at
  390px.
For a flagged heading, confirm its CSS rule sets `overflow-wrap: anywhere` (or
`word-break: break-word`) and, if it's a grid/flex item, `min-width: 0`.

**Fix:** add `overflow-wrap: anywhere;` to the display-heading selector(s) in `styles.css`.
(The scaffold itself doesn't ship this baseline yet — that's tracked as a separate
follow-up, not something this rule should paper over by flagging every heading.)

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
`align-items: stretch` is the flex box's **initial value** (not something a row
"inherits" from a parent) — so an unstyled flex row defaults to it. In a nav, toolbar,
CTA cluster, or icon+text row that mixes a fixed-height element (icon, avatar, badge,
button) with a text sibling, that default lets the taller child stretch and breaks the
shared baseline. This rule targets **interactive bars**, not every flex container on the
page — a flex row with same-height text-only children has nothing to break.

```
grep -rEn 'class="[^"]*\bflex\b[^"]*"' <prototype>/ --include="*.html"
```

Narrow matches to nav bars, toolbars, CTA clusters, and icon+text rows (skip generic
layout flex containers). For each, confirm `items-center` (Tailwind) or
`align-items: center` (custom CSS) is present. Also check `line-height: 1` on the row
(or its icon/text children) — a default `line-height` taller than the icon's box adds
invisible vertical padding that misaligns the baseline even with `align-items: center` set.

**Fix:** add `items-center` (or `align-items: center`) to the row, and `line-height: 1`
where a default line-height is throwing off the visual center.

---

## Forms & inputs

### 27. Input-state craft
Inputs are where "almost right" UIs lose. Fail on **any** of:
- **Focus changes border width** — default / hover / focus / error must all keep the
  same `border-width`. Focus should read via `box-shadow` / `outline` /
  `background-color`, never a wider border (that reflows layout). A `border: 2px solid …`
  declared fresh inside a `:focus`/`:focus-visible` block is the same violation even when
  it's not spelled `border-width` — it's still a width change that reflows.
- **Input height ≠ adjacent button height** — inputs and buttons in the same row must
  share one base height (44px floor).
- **Helper/error text slot collapses on a build-introduced field** — a field the build
  adds needs a reserved `min-height` on its `.hint` / `.error` slot (even when empty) if
  the error text appearing shifts sibling content. The scaffold's own `.form-field .hint`
  / `.error` (see `styles.css`) are a **sanctioned baseline** — they follow the
  inline-error-on-blur pattern documented in `reference/build.md` and are not a finding
  by themselves; a scaffold `min-height` baseline is tracked separately. Flag a
  build-introduced field only when it both lacks reserved space *and* its error's
  appearance visibly shoves sibling content.
- **Disabled is opacity-only** — disabled state needs `opacity` **and**
  `cursor: not-allowed` **and** the native `disabled` attribute (or
  `aria-disabled="true"`).

```
grep -rnB6 "border-width" <prototype>/ --include="*.css" | grep -E ':(focus|focus-visible|hover)'
grep -rn "\.hint\|\.error" <prototype>/ --include="*.css"
grep -rnE "\[disabled\]|:disabled" <prototype>/ --include="*.css" -A2
```

The first grep looks 6 lines back from every `border-width` declaration for a
`:focus` / `:focus-visible` / `:hover` selector opening — real (multiline, formatted)
CSS almost never puts the selector and the declaration on one line, so a line-anchored
`:focus\s*\{[^}]*border-width` pattern never matches actual files. Make sure this covers
`:focus-visible`, not just `:focus` — many builds use `:focus-visible` exclusively.

**Fix:** move focus indication off `border-width` (and off any border shorthand that
changes width); equalize input/button heights; reserve `min-height` on a build-introduced
hint/error slot that shoves layout; add `cursor: not-allowed` + the `disabled` attribute
alongside opacity.

---

## Token & content discipline

### 28. Inline color outside the token block
Every color must flow from a `:root` / `[data-theme]` token — a raw hex, `rgb()`, or
`oklch()` literal anywhere else means the palette was improvised mid-build instead of
chosen once. This rule binds on **colors the build introduces** — flag any literal not
already present in `templates/scaffold-base/css/styles.css` or
`templates/feedback-overlay/feedback.css`.

**Sanctioned platform literals — do not flag** (they ship in the scaffold on purpose):
the modal scrim `[data-modal] { background: rgb(0 0 0 / .45) }` (deliberately not
ink-derived — dark themes would invert it into a light scrim); the
`.proto-toast.is-error` / `.is-success` status fills; `--shadow-*` values inside the
token blocks; anything in `css/feedback.css` or under `#proto-controls` (review chrome,
not product UI).

```
grep -rnE '((style|fill|stroke)="[^"]*#[0-9a-fA-F]{3,8}|\[#[0-9a-fA-F]{3,8}\])' <prototype>/ --include="*.html"
grep -rnE "(color|background(-color)?|border(-(top|right|bottom|left))?(-color)?|fill|stroke):\s*[^;]*(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|oklch\([^)]*\))" <prototype>/ --include="*.css" | grep -vE "var\(--|:root|\[data-theme"
```

The HTML grep is deliberately narrow: a bare `#[0-9a-fA-F]{3,8}` also matches numeric
entities (`&#8212;`) and `#anchor` hrefs, so it's constrained to `style=`/`fill=`/`stroke=`
attribute values and bracketed Tailwind arbitrary-value classes (`[#hex]`). The CSS grep
now covers `border` shorthand and sides (`border-left`, `border-color`, …), not just
`border(-color)?` — the old pattern missed `border-left: 3px solid #e64545`, a real
literal, entirely.

**Fix:** lift the value into the token block as a new named `--variable`, or replace it
with an existing token.

### 29. No re-drawn browser / phone / IDE chrome
A hand-built fake browser toolbar (URL pill + traffic-light dots), phone frame (rounded
rectangle + notch), or IDE chrome (file tabs + sidebar around a code block) reads as set
decoration, not product — and is one of the strongest "this is AI-generated" tells.

```
grep -rniE "(browser-bar|url-bar|traffic-light|window-dots|phone-notch|fake-browser|mock-browser|ide-chrome|editor-chrome|terminal-chrome)" <prototype>/ --include="*.html" --include="*.css"
```

The grep only catches self-labeling class names — a hand-built toolbar that isn't named
`fake-browser` etc. sails through with near-zero recall. Where claude-in-chrome is
available (already within this file's stated verification bar — line 3), visually check
each screenshot for a traffic-light dot triplet or a URL pill sitting above content; that
catches re-drawn chrome the grep can't name.

**Fix:** use a real screenshot inside a `<picture>` / `<figure>`, or drop the chrome and
let the content stand on its own.

### 30. No invented precise metrics
A suspiciously precise, unsourced stat presented as real ("99.98% uptime", "10,432
active users", "trusted by 12,000+ teams") fabricates facts about the product. This
applies to **marketing/proof claims** — uptime %, social-proof counts, comparison
stats ("3x faster") — sitting outside the product surface (hero, footer, testimonial
strip). It does **not** apply to in-product demo data inside KPI tiles, tables, or
charts — rules 11–13 require that data look plausible and realistic, and a plausible
number like a `42.5%` chart value or a `.stat-value` tile is exactly what those rules
ask for, not a violation of this one.

```
grep -rniE "(9[0-9](\.[0-9]{1,2})?\s*%\s*(uptime|sla|accuracy)|[0-9]{1,3},[0-9]{3}\+?\s+([a-z]+\s+){0,2}(users|customers|teams|downloads|members)|[0-9]+[x×]\s*(faster|cheaper|better))" <prototype>/ --include="*.html"
```

The previous pattern both false-negatived on its own example (an adjective between the
count and the noun — "10,432 **active** users" — broke a bare `,[0-9]{3}\+?\s*(users|…)`
match) and false-positived on ordinary chart/KPI data (any `NN.N%` value, in-product or
not, matched). The replacement requires an uptime/SLA/accuracy word after a 90s-range
percentage, allows up to two adjectives between a count and its noun, and adds the
"Nx faster/cheaper/better" comparison-stat shape — all scoped to the marketing-claim
context this rule is actually about.

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
grep -rnE '<h[1-6][^>]*class="[^"]*\bitalic\b' <prototype>/ --include="*.html"
```

The likeliest real case — a Tailwind `italic` utility class straight on the heading tag
(`<h1 class="italic …">`) — was missing from the original two greps entirely; the third
grep catches it. Note the second grep is same-line only (it won't catch an `<em>`/`<i>`
wrapping heading text that spans multiple lines in the markup).

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
as feature/step/pricing-tier **icons**, is an AI-default tell. This is a companion check
to the reicon.dev single-weight rule in [`reference/build.md`](../reference/build.md) —
that rule covers *weight*; this one covers *library and emoji mixing*. It targets
emoji standing in for a product icon, not every emoji character in the build.

**Do not flag** anything under `#proto-controls` or in `css/feedback.css` — the
scaffold's own control bar uses 🔗/💬 as review-chrome affordances (`index.html`'s
Share/Feedback buttons), not product feature icons, and is sanctioned as-is.

`✓` / `✕` (U+2600–27BF) are ambiguous — they're legitimate as inline status glyphs
(a checklist mark, a close button) as often as they're a lazy icon substitute. Treat a
match there as needing human eyeballing in context, not an automatic fail.

The arrow range (U+2190–21FF) from the original pattern has been dropped entirely — it
was a port invention with no basis in the hallmark source this rule is adapted from.
The hallmark check bans emoji standing in for feature/step icons; it does not ban
typographic arrows. A `→` used inline as a link affordance or `↑ 12%` as a KPI delta
are legitimate typography, not slop, and shouldn't fail this rule.

```
grep -rniE "(feather-icons|lucide|heroicons|material-icons|font-awesome|phosphor-icons)" <prototype>/ --include="*.html"
grep -rnP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" <prototype>/ --include="*.html"
```

`-P` (PCRE) isn't available on every `grep` (notably BSD grep on macOS without a PCRE
build). Where `-P` fails, fall back to a literal alternation for the common
feature-icon offenders:
```
grep -rn "✨\|🚀\|⚡\|🔥\|🎯\|✅" <prototype>/
```

**Fix:** pick one icon source (reicon.dev, one weight) for the whole prototype; replace
emoji-as-icon with an inline SVG, or drop the icon and lead with typography.

### 34. AI-editorial composition
Dodging the obvious purple-gradient slop (rule 1) and the domain's own category reflex
(a podcast site skipping Spotify-green) isn't enough on its own — a build can still land
squarely in the "tasteful AI editorial" cluster, which is now its own cross-domain
"a machine made this" tell. Flag any of:
- a small-caps letterspaced **eyebrow → hairline rule → oversized serif display
  headline** hero, especially with a large empty adjacent column;
- a row of **≥3 equal-weight, identically-styled outlined/bordered cards** with no
  size or weight hierarchy (a "card wall");
- the DESIGN.md-named **signature move buried below** a generic serif hero, instead of
  the signature move *being* the hero.

This rule is **part-heuristic**, like rules 29 and 32 — grep finds candidate structure,
but confirming "oversized," "equal-weight," "no hierarchy," and "buried below" needs a
screenshot or DOM read (via claude-in-chrome), not just text matching.

```
grep -rnE 'class="[^"]*\beyebrow\b[^"]*"' <prototype>/ --include="*.html"
grep -rnE "<hr\b|class=\"[^\"]*(hairline|rule)[^\"]*\"" <prototype>/ --include="*.html"
grep -rniE "font-family:\s*[\"']?(Fraunces|Newsreader|Instrument Serif|Playfair)" <prototype>/ --include="*.css"
```

Where an `.eyebrow` and an `<hr>`/hairline sit immediately above an `h1` styled with a
display serif, check the screenshot for a large empty column beside that hero — that's
the eyebrow→rule→giant-serif template. Separately, scan any row of siblings sharing one
card-like class chain (the same `rounded-* + border` chain rule 4 checks): ≥3 with
identical border weight, radius, and padding and no dominant card is a card wall. Finally,
`grep -i "signature" <prototype>/DESIGN.md` (rule 21), then read the DOM order — does the
section implementing that signature move sit below a generic eyebrow/serif hero, or does
the hero *be* the signature move?

**Fix:** lead with the signature move instead of parking it below a generic hero; give one
card in any card row real dominance (size, weight, or position) instead of shipping ≥3
identical siblings; break the eyebrow → hairline rule → oversized-serif template — vary
the hero shape, drop the hairline, or size the headline down and let something else carry
the page.

---

## State completeness

### 35. State-matrix completeness
A primary list / table / collection region that ships **only a happy path** — a full grid
with no empty state and no error affordance anywhere near it — reads as a mockup, not a
product. Real regions can be empty (first-run, no-results, cleared) or fail (the call
errored), and each needs its own scoped face: an `.empty-state` / `.state.state--empty`
with a primary action, and a `.state.state--error` with a plain-language message + a
`[data-retry]`. See `reference/build.md` → "The state matrix — every data region ships all
of it" for the full per-region matrix (including the three distinct empties).

**This rule is part-heuristic** — grep can find the *candidate* regions and whether any
state markup sits nearby, but confirming a region is a *primary* collection (vs. an
incidental grid of, say, footer links) and that its empty/error copy is actually correct
needs a screenshot or DOM read (via claude-in-chrome), not text matching alone. Treat a
grep miss as "look closer," not "pass."

```
# Candidate primary collections:
grep -rnE 'class="[^"]*(proto-grid|\btable\b)[^"]*"' <prototype>/ --include="*.html"
grep -rnE '<table\b' <prototype>/ --include="*.html"
grep -rnE '<ul\b|<ol\b' <prototype>/ --include="*.html"
# State faces present anywhere in the same file:
grep -rnE 'class="[^"]*(empty-state|state--empty|state--error)[^"]*"' <prototype>/ --include="*.html"
grep -rn "data-retry" <prototype>/ --include="*.html"
```

`\btable\b` false-positives on Tailwind's own `table-auto` / `table-cell` / `table-fixed`
utility classes (a word-boundary regex still matches "table" right up to the `-`) — treat a
hit there as noise, not a candidate, unless the element is also an actual `<table>`. The
class grep also misses semantic markup that never carries a `proto-grid`/`table` class at
all — a plain `<table>` or a `<ul>`/`<ol>` feed — hence the two added element-level greps.
None of this replaces judgment: still confirm by reading the matched element, not the grep
alone.

For each screen that matches a candidate grep (a `.proto-grid`, a real `<table>`, or a
`<ul>`/`<ol>` feed — filtering out `table-*` utility-class noise), confirm the same file
**also** matches the state-face greps — an empty state for that region and, for anything
that "loads" or "fails," an error affordance (`.state--error` + `data-retry`). Flag a
primary collection that ships neither. A region genuinely incapable of being empty or
failing (a fixed 3-up feature strip, a static pricing table) is not a finding — note *why*
it's exempt rather than bolting on an unreachable empty state.

**Fix:** author the missing face(s) — `.state.state--empty` (distinguish first-run /
no-results / cleared) and/or `.state.state--error` with a working `[data-retry]` — and wire
them to a persona or the `data-skeleton-on-load` / `UI.fakeCall` flow so they're reachable
in the demo, not dead markup. A `[data-retry]` grep hit is not itself a pass: presence ≠
wired — confirm the button actually re-runs something (ui.js ships a generic default that
replays the nearest region's loader; a real prototype should still wire it to the actual
retry) rather than sitting inert.

---

## Vertical rhythm

### 36. Tight-leading display type overlaps its neighbor
An oversized display heading or wordmark set with `line-height` below ~1 (`leading-none`,
`leading-[0.8]`, `line-height: .85`, etc.) reserves *less* vertical space than its glyph ink
actually occupies — descenders (p, y, g, q, j, comma, period) drop below the line box, and
ascenders push above it. When the next paragraph or section sits flush underneath with no
reserved clearance, its box overlaps those glyphs. This is a **vertical** overlap — distinct
from horizontal overflow (rule 24, `overflow-wrap` on display headings) and from all-caps
cap-collision-on-wrap (rule 25). Tight leading itself isn't the bug; tight leading *with a
flush neighbor and no reserved clearance* is.

**This rule is part-heuristic**, like rules 29/33/35 — grep finds candidate tight-leading
display elements, but confirming the glyph ink actually crosses into the next element's box
needs a screenshot or a DOM read (via claude-in-chrome). Tight leading is legitimate whenever
clearance is reserved; don't flag on the class/property alone.

```
grep -rnE 'class="[^"]*(leading-none|leading-\[0?\.[0-9]+)' <prototype>/ --include="*.html"
grep -rnE 'line-height:\s*(0?\.[0-9]+|0)([^0-9]|;|$)' <prototype>/ --include="*.css"
```

For each match, confirm it's an oversized display heading/wordmark (large font-size), not an
incidental `line-height: 1` on a chip, button, or icon row (those have no descenders to clip
and aren't display type). Then check whether the element is immediately followed by other
content with no `padding-bottom` / `margin-bottom` clearance reserved on the tight-leading
element. Where claude-in-chrome is available, screenshot the boundary (or read computed
geometry) to confirm the glyph ink — not just the line box — crosses into the next block.

**Fix:** reserve descender/ascender clearance on the display element — add `padding-bottom`
(~0.15–0.25em of its font-size) and/or `margin-bottom`, or raise `line-height` toward 1 — so
the neighboring block never touches a glyph. Tight leading is fine *with* clearance; the bug
is tight leading with a flush neighbor and no clearance.

---

## Report format

Produce `LINT.md` at the prototype root:

```markdown
# Lint Report — {{timestamp}}

**Rules checked:** 36  ·  **Passing:** N  ·  **Findings:** M

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
