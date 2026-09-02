---
name: prototype
description: Build production-feel HTML prototypes for sales demos and reviews. Runs a discovery Q&A, scaffolds a zero-dep static site (HTML + Tailwind CDN + theme/layout switchers + URL-state + feedback overlay + control bar) and runs a design-quality loop. Use when the user says "prototype", "mockup", "demo", "pitch page", "sales demo", "click-through", or describes a UI they want to show someone without building the real thing. Also handles /prototype variant "<vibe>" (fork a variant) and /prototype apply-feedback <file> (apply pinned feedback JSON).
---

# /prototype

Build prototypes people can click through, share URLs to specific screens, comment on,
and iterate on — no build step, no backend. Output is plain HTML + Tailwind CDN + a few
small vanilla JS files.

## When to use
- User asks for a prototype, mockup, demo, pitch page, or sales click-through.
- User wants to show stakeholders a UI without building the real product.
- User wants to explore visual directions before committing to an implementation.

## When NOT to use
- A real production feature — use the app's actual stack.
- A one-off component or snippet — just write it inline.
- A design system — use `/teach-impeccable`.

## Commands
```
/prototype                          → full flow: discover → build → assess → ship
/prototype variant "<vibe>"         → fork current prototype into variants/<slug>/
/prototype apply-feedback <file>    → read feedback JSON, apply each comment, re-assess
/prototype intake <url…>            → add sites to the inspiration corpus
```

## The flow at a glance
```
0. Preflight    → ensure-deps.sh auto-installs impeccable
1–4. Discover   → mode check, Q&A, refine spec, design shaping   →  reference/discovery.md
5–6. Build      → scaffold templates, control bar, data layer, screens  →  reference/build.md
7–8. Assess     → impeccable (or builtin-lint) + browser QA      →  reference/assess.md
9. Handoff      → DEMO.md + README.md inside the prototype
10. Ship        → run command, share-URL tip, optional Vercel deploy
```

The detailed how-to for each phase lives in `reference/`. Read the relevant file when you
reach that phase — don't keep it all in context at once. This router holds the sequence,
the skill-detection protocol, and the non-negotiable constraints.

## Step 0: Preflight — ensure companion skills

Before anything else, auto-install missing companions (idempotent, safe to re-run):
```
bash ~/.claude/skills/prototype/ensure-deps.sh --yes
```
Installs **impeccable** (deep design assessment) — a third-party companion from its marketplace; it fetches remote code (drop `--yes` to review first). If
npx/Node or network is unavailable it prints guidance and continues — `/prototype` falls
back to built-in checks and notes it in the final report.

## Skill detection protocol

Preflight installs the essential companions; after it, check the **current session's**
skill list (in `<system-reminder>` messages) and deferred-tool list (loadable via
`ToolSearch`). Detect explicitly — never assume from memory.

| Skill / tool | Used for | Fallback (only if auto-install failed) |
|---|---|---|
| `impeccable` (`audit` + `critique`; needs `PRODUCT.md`) | Deep design assessment | `checks/builtin-lint.md` |
| `teach-impeccable` (setup only) | Design direction (`DESIGN.md`) | Generate `DESIGN.md` inline |
| `mcp__claude-in-chrome__*` (deferred MCP tools) | Screenshot + console QA | Local-server instructions + manual checklist |

**If a skill is detected, invoke it** — not a preference. The fallback is only for genuine
auto-install failure (no npx/Node, no network). Shortcutting an available skill produces a
worse prototype.

Note: the `<system-reminder>` skill list is captured at session start and doesn't refresh
mid-session. If preflight just installed a skill it's on disk and invokable via Bash even if
the Skill tool lags a session — resolve where with `ensure-deps.sh --path=<name>` (roots vary
by installer), and trust the filesystem over the reminder. Never fail for a missing optional
skill; note it in the final report.

## The phases

1. **Discover (steps 1–4)** → `reference/discovery.md`. Quick-vs-discovery mode, the 6-question
   Q&A, write the build spec, shape a per-prototype `DESIGN.md`.
   Probe how it should **feel** (mood / physical scene), then present the committed **design
   direction** (mood + named palette & type pairing + one signature move) and wait for a real yes-or-tweak (never self-approve)
   before building — a design review, not a form.
2. **Build (steps 5–6)** → `reference/build.md`. Scaffold from `templates/`, wire the visible
   control bar (theme + layout + persona + motion + loading + share + feedback), the data layer, interaction
   states, and the layout system; then build one HTML file per screen. Before writing each
   screen, self-score it with the pre-emit critique in `reference/assess.md`; any axis < 3
   → revise before the next screen.
3. **Assess (steps 7–8)** → `reference/assess.md`. Run impeccable (or `checks/builtin-lint.md`),
   fix findings, then browser QA via claude-in-chrome (or manual checklist).
4. **Handoff (step 9)** — generate two files in the prototype:
   - `DEMO.md` from `templates/demo-docs/DEMO.md.template` — numbered presenter click-through, one screen per step.
   - `README.md` from `templates/demo-docs/README.md.template` — how to run (python3 / npx serve / double-click), themes, what's fake vs real, known gaps.
5. **Ship (step 10)** — final message: what was built (screens, themes, interactions); the run
   command `cd <slug> && python3 serve.py`; share-URL tip (🔗 copies a URL reproducing the
   screen); feedback tip (💬 is always on, export JSON → `/prototype apply-feedback <file>`);
   offer Vercel deploy only if the user seems ready to share.

**Iterate (any time after the first build)** → `reference/iterate.md`. Proactively offer to refine
any screen — ask which page and how it should change (feel, layout, content, a specific element),
apply it to just that screen, re-verify, and loop until they're happy. A prototype earns its keep
by being iterated, not shipped once.

Subcommands (`variant`, `apply-feedback`, `intake`) → `reference/subcommands.md`.

## Non-negotiable constraints

These are load-bearing — they're what separates this from generic AI output.

- **Always interactive.** Every button, link, modal, tab, composer, filter works. No dead buttons. A "static mockup" is not a valid output — if that's genuinely what the user wants, say so before building rather than shipping dead buttons.
- **Always-visible control bar.** A bottom-center segmented control showing every theme + layout + persona + motion + loading option at once, plus share + feedback — never a click-to-reveal pill. Reviewers judge options they can see.
- **The control bar never wraps.** `flex-wrap: nowrap` + `overflow-x: auto` is load-bearing: a two-line bar reads as broken, and once one thing looks broken the reviewer doubts everything else.
- **Feedback is always on.** The 💬 button ships enabled on every screen — no URL flags, no hidden modes.
- **Ask before building — a hard gate.** Never write a screen until the user gives a real yes (or tweak) to the committed **design direction**. This holds in *every* mode — a rich brief or Quick mode does not waive it. Don't self-approve or infer consent from a detailed brief: a brief says *what*, the confirm settles *how it looks*. Discovery prevents generic output.
- **Never lorem ipsum.** Realistic, domain-matched content only — fake-looking content reads as "this isn't real." Craft rules + banned vocabulary: `reference/copywriting.md`.
- **No build tools** (webpack, vite, npm). Tailwind CDN + vanilla JS only — load-bearing for "anyone can clone and run it."
- **Respect scope.** 4 screens asked → 4 screens shipped. Extra screens are scope creep.
- **Don't shortcut an available skill.** If `impeccable` / `claude-in-chrome` is in the session, using it is required, not optional — and never ship without the assess artifacts (LINT.md + self-critique stamps).
- **One topic per turn** during discovery — conversational, not a form (tone and how it should *feel* are one topic).
- **No hardcoded paths or user names** — this is open source.

### Never ship without (check on every screen before assess)

These three are kept here in the always-loaded router on purpose: blind design review
repeatedly caught them being dropped when their detail lived only in `reference/`. The
how-to is still in `reference/build.md` / `reference/assess.md` — but the rule lives here.

- **No horizontal scroll at 390px — including toolbars.** Not just tables (`.proto-table-wrap`): search bars, filter-chip rows, and header action clusters must wrap (`.proto-actions` / `flex-wrap`) so no primary action lands off-screen. A clipped "Approve"/"Book" button is a blocker.
- **Color restraint — one accent, no gradient fills** (a single-hue neutral wash — the `.media` image placeholder — is the one sanctioned exception). No multi-hue card faces, no purple/violet-on-black, no gradient text. Generic gradients are the #1 "AI-generated" tell and read as off-brand on a serious product.
- **a11y floor.** The scaffold ships `:focus-visible` rings + `aria-live` toasts. Every modal carries `role="dialog"` + `aria-modal`, moves focus into itself on open, traps Tab, and restores focus on close; Esc closes.

## References
- Phase detail: `reference/discovery.md` · `reference/build.md` · `reference/assess.md` · `reference/iterate.md` · `reference/subcommands.md`
- Design menus (tone → pairing / palette / voice) + workbench: `reference/type-pairings.md` · `reference/color-palettes.md` · `reference/copywriting.md` · `design-lab/index.html`
- Scaffold templates: `templates/scaffold-base/` (control-bar markup + script order live here)
- Feedback overlay: `templates/feedback-overlay/`
- Handoff doc templates: `templates/demo-docs/`
- Built-in lint rules (impeccable fallback): `checks/builtin-lint.md`
- Benchmark (verify changes improve output + context cost): `benchmark/README.md`
- Impeccable: https://impeccable.style/
