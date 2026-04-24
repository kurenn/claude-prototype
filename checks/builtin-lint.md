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

## Report format

Produce `LINT.md` at the prototype root:

```markdown
# Lint Report — {{timestamp}}

**Rules checked:** 20  ·  **Passing:** N  ·  **Findings:** M

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
