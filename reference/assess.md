# Assess & browser QA (steps 7–8)

Quality gate before handoff. Find issues, fix them, re-verify.

## Pre-emit self-critique (runs during Step 6, before Step 7)

<!-- Pre-emit self-critique adapted from Hallmark (github.com/Nutlope/hallmark), MIT. -->

Before writing each screen, score it 1–5 on six axes — no tools, no rendering, judgment
against the brief only. Run this on your own planned output during Step 6, before Step 7
(impeccable, or the builtin-lint fallback) and Step 8 (browser QA) below. (Distinct from the
post-hoc pairwise judge in `benchmark/design-judge.md`: this runs pre-emit, scored alone
against the brief.)

| # | Axis | What you're scoring on this screen |
|---|---|---|
| **A** | **Philosophy** | Is there a clear point of view for how this screen serves its user's task — or is it just a layout with widgets dropped in? |
| **B** | **Hierarchy** | In 2 seconds, can you tell what's primary, secondary, tertiary — the one action or number that matters vs. supporting chrome? |
| **C** | **Execution** | Are the details (spacing scale, focus states, empty/loading/error states, contrast) in spec, or is there sloppiness even where the layout is right? |
| **D** | **Specificity** | Does this look like *this product's* screen — real domain data, terms, and workflows — or a generic admin/dashboard template that could belong to anyone? |
| **E** | **Restraint** | Have you removed everything not earning its place — decorative cards, redundant labels, padding-for-padding's-sake? |
| **F** | **Variety** | Shared nav / footer / control bar is required cohesion, not a fingerprint — score F on the content region: a dashboard, a detail view, and a settings screen must not be the same card-grid template with relabeled data. The first screen passes F trivially (nothing to compare yet). |

**Gate:** any axis scoring below 3 → revise before writing the next screen; all screens pass
before Step 7. Two passes is normal; three means re-check the brief, not the pixels.

**Stamp it:** record the six scores as an HTML comment at the top of each screen file,
updated after any revision pass — e.g. `<!-- prototype · pre-emit: P4 H4 E3 S5 R4 V4 -->`
(letters are axis initials: Philosophy, Hierarchy, Execution, Specificity, Restraint, Variety).

## Step 7: Assess

**Detection:** look for `impeccable` in the available-skills list. `teach-impeccable`
alone (one-time setup) does NOT count — this step needs full impeccable.

**Precondition (this is what makes impeccable actually run vs. silently fall back):**
impeccable's setup is non-optional — it requires `PRODUCT.md` at the prototype root and
loads context before any command. Step 4 already wrote `PRODUCT.md` + `DESIGN.md` into the
folder, so the gate is satisfied. Verify from the prototype folder:
```bash
node ~/.agents/skills/impeccable/scripts/load-context.mjs   # expect "hasProduct": true
```
If `hasProduct` is false, impeccable will try to run its interactive `teach` and you'll end
up on the fallback — write `PRODUCT.md` first (see discovery.md Step 4), don't run `teach`.

If `impeccable` is present, run its real commands (invoke the `impeccable` skill with the
command as the first word, or `$impeccable <command>` if pinned). impeccable auto-loads
PRODUCT.md/DESIGN.md — don't pass them manually:
- `audit .` — technical quality checks (a11y, contrast, performance, responsive) **incl.
  anti-pattern detection** (purple/gradient slop, nested cards, etc.). *(There is no
  separate `detect` command — it's folded into `audit`.)*
- `critique .` — UX design review with heuristic scoring across dimensions.

Collect findings, fix them, re-run until clean. Commit each fix batch atomically.

If `impeccable` is genuinely absent (auto-install failed — no npx/Node/network), run the
built-in checker in `checks/builtin-lint.md` (purple gradients, gradient text,
low contrast, dead buttons/links, 375px overflow, console errors, missing alt text, nested
cards, lorem ipsum, placeholder names, scope/screen count, build tooling, theme integrity,
URL round-trip, etc.). Produce `LINT.md`, fix all errors, re-verify. Note in the output:
*"For deeper design assessment, install impeccable: https://impeccable.style/"*.

## Step 8: Browser QA

**Detection:** look for `mcp__claude-in-chrome__*` tools in the deferred-tool list. If
present, use them — don't default to the manual fallback just because many screenshots
feel like a lot. Sample intelligently.

If claude-in-chrome tools are present:
1. Call `mcp__claude-in-chrome__tabs_context_mcp` first with `createIfEmpty: true`.
2. Start a local server in the prototype folder: `python3 -m http.server <port>` (background).
3. **Screenshot budget** — don't cover every combination. Minimum viable: at 1440 width, the default theme on every page (N screens); then the two non-default themes on 2–3 representative pages (hero, a content-heavy page, a form-heavy page). ~N + 6 shots, not N × themes × breakpoints.
4. Resize to 375 and screenshot the top 2–3 pages for mobile spot-checks.
5. Read console on each page with `onlyErrors: true, pattern: "error|Error|failed|Failed"` — any error fails the check and must be fixed before shipping.
6. Save under `<slug>/screenshots/` with names like `index-ivory-1440.png`, `category-obsidian-375.png`.
7. **Keyboard-nav + screen-reader spot-check** — on any page with a modal, drive it by keyboard, not the mouse: open with Enter/Space on the trigger, confirm focus lands inside the modal, press Tab repeatedly and confirm it loops within the modal (never reaches the page behind it), press Shift+Tab from the first focusable element and confirm it wraps to the last, then press Esc and confirm focus returns to the trigger. Use `read_page` (or the accessibility tree) to confirm the modal exposes `role="dialog"` + `aria-modal="true"` and that its accessible name/label is non-empty — that's what a screen reader announces on open. One modal instance covers the pattern; you don't need to repeat this per screen.

If tools are absent, print:
```
cd <slug> && python3 serve.py
# then open http://localhost:8000
```
Plus a manual checklist: desktop / tablet / mobile, every theme, click every button, and — for
any modal — Tab through it with the mouse untouched: focus should land inside on open, loop
without escaping to the page behind it, and return to the trigger button on Esc.
