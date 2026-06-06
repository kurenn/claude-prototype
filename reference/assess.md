# Assess & browser QA (steps 7–8)

Quality gate before handoff. Find issues, fix them, re-verify.

## Step 7: Assess

**Detection:** look for `impeccable` in the available-skills list. `teach-impeccable`
alone (one-time setup) does NOT count — this step needs full impeccable with the
`audit` / `detect` / `critique` subcommands.

If `impeccable` is present, run in order:
- `impeccable audit` — overall pass against design tokens + Nielsen heuristics.
- `impeccable detect` — 25 anti-pattern rules (purple gradients, gradient text, nested cards, etc.).
- `impeccable critique` — UX critique with scored dimensions.

Collect findings, fix them, re-run until clean. Commit each fix batch atomically.

If `impeccable` is absent, run the built-in checker in `checks/builtin-lint.md` (20
rules: purple gradients, gradient text, low contrast, dead buttons/links, 375px
overflow, console errors, missing alt text, nested cards, lorem ipsum, placeholder
names, scope/screen count, build tooling, theme integrity, URL round-trip, etc.).
Produce `LINT.md`, fix all errors, re-verify. Note in the output: *"For deeper design
assessment, install impeccable: https://impeccable.style/"*.

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

If tools are absent, print:
```
cd <slug> && python3 serve.py
# then open http://localhost:8000
```
Plus a manual checklist: desktop / tablet / mobile, every theme, click every button.
