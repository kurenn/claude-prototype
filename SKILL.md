---
name: prototype
description: Build production-feel HTML prototypes for sales demos, stakeholder reviews, and design exploration. Runs a discovery Q&A, scaffolds a zero-dep static site (HTML + Tailwind CDN + CSS variables + theme switcher + layout switcher + URL-state + feedback overlay + always-visible control bar), and runs a design-quality assessment loop. Use when the user says "prototype", "mockup", "demo", "pitch page", "sales demo", "click-through", or describes a UI they want to show someone without building the real thing. Also handles /prototype variant "<vibe>" (fork a variant) and /prototype apply-feedback <file> (apply pinned feedback JSON).
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
- A design system — use `/design-consultation` or `/teach-impeccable`.

## Commands
```
/prototype                          → full flow: discover → build → assess → ship
/prototype variant "<vibe>"         → fork current prototype into variants/<slug>/
/prototype apply-feedback <file>    → read feedback JSON, apply each comment, re-assess
```

## The flow at a glance
```
0. Preflight    → ensure-deps.sh auto-installs impeccable + prompt-refiner
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
Installs **impeccable** (deep design assessment) and **prompt-refiner** (Q&A → spec). If
npx/Node or network is unavailable it prints guidance and continues — `/prototype` falls
back to built-in checks and notes it in the final report. Then proceed to Step 1.

## Skill detection protocol

Preflight installs the essential companions; after it, check the **current session's**
skill list (in `<system-reminder>` messages) and deferred-tool list (loadable via
`ToolSearch`). Detect explicitly — never assume from memory.

| Skill / tool | Used for | Fallback (only if auto-install failed) |
|---|---|---|
| `prompt-refiner` (skill) | Q&A answers → tight build spec | Synthesize the spec inline |
| `impeccable` (with `audit` / `detect` / `critique`) | Deep design assessment | `checks/builtin-lint.md` |
| `teach-impeccable` (setup only) | Design direction (`DESIGN.md`) | Generate `DESIGN.md` inline |
| `mcp__claude-in-chrome__*` (deferred MCP tools) | Screenshot + console QA | Local-server instructions + manual checklist |

**If a skill is detected, invoke it** — not a preference. The fallback path is only for
when auto-install genuinely failed (no npx/Node, no network). Shortcutting an available
skill produces a worse prototype.

Note: the `<system-reminder>` skill list is captured at session start and doesn't refresh
mid-session. If preflight just installed a skill, it's on disk at `~/.claude/skills/<name>/`
and invokable via Bash even if the Skill tool doesn't see it until next session — check the
filesystem, not just the reminder. Never fail because an optional skill is missing; mention
it in the final report as an enhancement path.

## The phases

1. **Discover (steps 1–4)** → `reference/discovery.md`. Quick-vs-discovery mode, the 6-question
   Q&A, refine the spec (prompt-refiner if present), shape a per-prototype `DESIGN.md`.
   Confirm a one-paragraph summary with the user before building.
2. **Build (steps 5–6)** → `reference/build.md`. Scaffold from `templates/`, wire the visible
   control bar (theme + layout + persona + share + feedback), the data layer, interaction
   states, and the layout system; then build one HTML file per screen.
3. **Assess (steps 7–8)** → `reference/assess.md`. Run impeccable (or `checks/builtin-lint.md`),
   fix findings, then browser QA via claude-in-chrome (or manual checklist).
4. **Handoff (step 9)** — generate two files in the prototype:
   - `DEMO.md` from `templates/demo-docs/DEMO.md.template` — numbered presenter click-through, one screen per step.
   - `README.md` from `templates/demo-docs/README.md.template` — how to run (python3 / npx serve / double-click), themes, what's fake vs real, known gaps.
5. **Ship (step 10)** — final message: what was built (screens, themes, interactions); the run
   command `cd <slug> && python3 serve.py`; share-URL tip (🔗 copies a URL reproducing the exact
   screen); feedback tip (💬 is always on, export JSON → `/prototype apply-feedback <file>`);
   offer Vercel deploy only if the user seems ready to share; point to `/qa-only` and `/design-review`
   for deeper passes.

Subcommands (`variant`, `apply-feedback`) → `reference/subcommands.md`.

## Non-negotiable constraints

These are load-bearing — they're what separates this from generic AI output.

- **Always interactive.** Every button, link, modal, tab, composer, filter works. No dead buttons. A "static mockup" is not a valid output — if that's what the user wants, redirect to `/design-shotgun` or `/design-html`.
- **Always-visible control bar.** A bottom-center segmented control showing every theme + layout + persona option at once, plus share + feedback — never a click-to-reveal pill. Reviewers judge options they can see.
- **The control bar never wraps.** `flex-wrap: nowrap` + `overflow-x: auto` is load-bearing: a two-line bar reads as broken, and once one thing looks broken the reviewer doubts everything else.
- **Feedback is always on.** The 💬 button ships enabled on every screen — no URL flags, no hidden modes.
- **Ask before building.** The user sees and approves the one-paragraph summary first. Discovery prevents generic output.
- **Never lorem ipsum.** Realistic, domain-matched content only — fake-looking content reads as "this isn't real."
- **No build tools** (webpack, vite, npm). Tailwind CDN + vanilla JS only — load-bearing for "anyone can clone and run it."
- **Respect scope.** 4 screens asked → 4 screens shipped. Extra screens are scope creep.
- **Don't shortcut an available skill.** If `prompt-refiner` / `impeccable` / `claude-in-chrome` is in the session, using it is required, not optional.
- **One question per turn** during discovery — conversational, not a form.
- **No hardcoded paths or user names** — this is open source.

## References
- Phase detail: `reference/discovery.md` · `reference/build.md` · `reference/assess.md` · `reference/subcommands.md`
- Scaffold templates: `templates/scaffold-base/` (control-bar markup + script order live here)
- Feedback overlay: `templates/feedback-overlay/`
- Handoff doc templates: `templates/demo-docs/`
- Built-in lint rules (impeccable fallback): `checks/builtin-lint.md`
- Benchmark (verify changes improve output + context cost): `benchmark/README.md`
- Impeccable: https://impeccable.style/
