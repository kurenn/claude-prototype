<div align="center">

# claude-prototype

**Clickable HTML prototypes for sales demos, stakeholder reviews, and design exploration — straight from a Claude Code prompt.**

Zero build step. A live pin-to-element feedback loop. Real design assessment baked in.

[![skill-checks](https://github.com/kurenn/claude-prototype/actions/workflows/skill-checks.yml/badge.svg)](https://github.com/kurenn/claude-prototype/actions/workflows/skill-checks.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Claude Code skill](https://img.shields.io/badge/Claude%20Code-skill-d97757)
![Build step](https://img.shields.io/badge/build%20step-none-success)

</div>

---

```
You:    /prototype
Claude: Quick or Discovery?  →  a few questions  →  builds a folder
You:    cd acme-demo && python3 serve.py
        # a real, clickable, themeable, shareable prototype at localhost:8000
```

Output is plain **HTML + Tailwind (CDN) + a handful of vanilla JS files**. No webpack, no Node, no framework. It runs anywhere a browser opens, and deploys to any static host as-is.

<details>
<summary><b>Contents</b></summary>

- [Why it's different](#why-its-different)
- [Quickstart](#quickstart)
- [The signature: an always-visible control bar](#the-signature-an-always-visible-control-bar)
- [How it works](#how-it-works)
- [Usage](#usage)
- [Anatomy of a generated prototype](#anatomy-of-a-generated-prototype)
- [The quality system](#the-quality-system)
- [Companion skills](#companion-skills)
- [Repo layout](#repo-layout)
- [Principles the skill enforces](#principles-the-skill-enforces)

</details>

## Why it's different

Most AI-generated prototypes look like every other one: purple gradients, gradient text, nested cards, lorem ipsum, dead buttons, no lifecycle states. This skill is built to do the opposite — and it *checks itself* before handing the work back.

| Generic AI output | What this skill ships |
|---|---|
| "Modern SaaS" with no questions asked | A short **discovery Q&A** (tone, inspiration, audience, scope) drives real, domain-matched content |
| Lorem ipsum, "John Doe", `Example Corp` | Realistic copy and data, persona-driven from `js/data.js` |
| Dead `href="#"` buttons | Every button, modal, tab, and filter actually works |
| One static screen | **Theme · Layout · Persona** switchers + interaction states (loading, toast, empty, skeleton, 404) |
| No way to give feedback | **Pin-to-element commenting** that exports JSON you can apply with one command |
| "Looks done" but unaudited | An **impeccable** `audit` + `critique` pass (or a built-in linter fallback) before handoff |

## Quickstart

**Install** — Claude Code loads skills from `~/.claude/skills/<name>/`:

```bash
git clone https://github.com/kurenn/claude-prototype ~/.claude/skills/prototype
```

> Hacking on the skill? Clone anywhere and run `./install.sh` to symlink it (edits go live with no reinstall), or `./install.sh copy` for an independent copy.

**Build** — start a new Claude Code session and type:

```
/prototype
```

Answer the questions (or say *"quick"* to skip them). You get a new folder in your working directory with every screen, the docs, and a `serve.py` ready to run:

```bash
cd acme-demo
python3 serve.py        # → http://localhost:8000
```

The skill triggers automatically on **"prototype", "mockup", "demo", "pitch page", "sales demo",** or **"click-through"** — you don't have to type the slash command.

## The signature: an always-visible control bar

Every prototype ships a single, always-visible bar at the bottom — not a hidden settings pill. Reviewers judge the options they can *see*:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  THEME  Slate · Obsidian · Paper   │   LAYOUT  Grid · List   │  🔗   💬   │
│  PERSONA  New · Active · Power                                            │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Theme** — 3 per-prototype themes; design tokens flip at runtime, URL-shareable.
- **Layout** — 2–4 variants chosen for *this* product (Grid/Gallery/List, density, grid-N…).
- **Persona** — 2–4 lifecycle states (new / active / power, or empty / busy) that swap the data, not just the chrome.
- **🔗 Share** — copies a URL reproducing the exact screen (theme + layout + persona + open modal + active tab).
- **💬 Feedback** — always-on; click any element to pin a comment, then export JSON.

It never wraps to a second line (`flex-wrap: nowrap` is load-bearing — a broken-looking bar costs you the reviewer's trust), and stays unobtrusive on every screen.

## How it works

`/prototype` runs four phases. The skill uses **progressive disclosure** — `SKILL.md` is a lean router; each phase's detail loads from `reference/` only when reached.

```
0. Preflight  →  ensure impeccable + prompt-refiner are installed
1. Discover   →  Quick-or-Discovery, Q&A, refine spec, write PRODUCT.md + DESIGN.md
2. Build      →  scaffold from templates, wire control bar + data + interaction states, build each screen
3. Assess     →  impeccable audit + critique (or built-in lint), fix findings, browser QA
4. Ship       →  DEMO.md + README.md handoff, run command, optional deploy
```

## Usage

**Build a prototype**
```
/prototype
```

**Fork a variant** — explore a different direction without touching the original:
```
/prototype variant "editorial, serif-forward, less corporate"
```
Creates `variants/<slug>/` with the new vibe re-applied across tokens, typography, and palette.

**Apply pinned feedback** — a reviewer used the 💬 button and exported a JSON; drop it in the folder:
```
/prototype apply-feedback feedback-2026-04-24.json
```
Each comment is applied in place, the prototype is re-assessed, and the JSON is archived under `feedback/applied/`.

## Anatomy of a generated prototype

```
acme-demo/
├── index.html
├── <screen>.html
├── 404.html
├── css/
│   ├── styles.css       # theme tokens · control bar · skeletons · empty states
│   └── feedback.css
├── js/
│   ├── state.js         # URL state + share + history drawer (Shift+?)
│   ├── theme.js         # data-theme switcher
│   ├── layout.js        # data-layout switcher
│   ├── data.js          # personas + shared content (single source of truth)
│   ├── persona.js       # data-persona switcher
│   ├── ui.js            # loading / toast / skeleton / confirm helpers
│   ├── app.js           # page interactions (modals, tabs, filters, composer)
│   └── feedback.js      # pin-to-element overlay (always on)
├── assets/images/
├── serve.py             # no-cache dev server (kills the "my edits aren't showing" trap)
├── PRODUCT.md           # users · tone · register — context for the design audit
├── DESIGN.md            # tokens + rationale
├── DEMO.md              # presenter click-through with a persona map
└── README.md            # how to run · what's fake vs real · iteration commands
```

Deploy it anywhere static — Vercel, Netlify, GitHub Pages, S3 — no build required.

## The quality system

The skill doesn't just generate; it's backed by a benchmark so changes to *the skill itself* can be proven to help, not just differ. Three independent dimensions:

| Dimension | Tool | Catches |
|---|---|---|
| **Output quality** | `benchmark/score-output.sh` | Missing files, unwired switchers, slop content, cross-file name mismatches, placeholder layouts |
| **Mobile overflow** | `benchmark/check-overflow.sh` | Real horizontal overflow at a true 390 px viewport (a clipped primary button = blocker) |
| **Design taste** | `benchmark/render.sh` + `design-judge.md` | Hierarchy, spacing, color discipline, AI-slop — via blind pairwise review of rendered screenshots |
| **Context cost** | `benchmark/context-cost.sh` | Trigger-time token bloat in `SKILL.md` |

A **GitHub Action** ([`skill-checks.yml`](.github/workflows/skill-checks.yml)) runs the browser-free guards on every PR: context-cost ceiling, shellcheck, JS/Python syntax of the scaffold, and `SKILL.md` frontmatter sanity. See [`benchmark/README.md`](benchmark/README.md) for the full methodology.

## Companion skills

`/prototype` runs a preflight (`ensure-deps.sh`) that makes these available — auto-installing what's missing:

| Skill | What it adds | Auto-install |
|---|---|---|
| [impeccable](https://impeccable.style/) | Design direction + assessment (`audit` + `critique`) | `npx -y skills add pbakaus/impeccable --global --yes` |
| [prompt-refiner](https://github.com/kurenn/prompt-refiner-skill) | Q&A answers → structured build spec | `git clone … ~/.claude/skills/prompt-refiner` |
| claude-in-chrome (MCP) | Screenshot grid + console-error QA | Configured in Claude Code MCP settings |

If auto-install fails (no `npx`, no network), `/prototype` falls back to [`checks/builtin-lint.md`](checks/builtin-lint.md) and says so in its report. Run the preflight manually anytime:

```bash
bash ~/.claude/skills/prototype/ensure-deps.sh --check    # report status only
bash ~/.claude/skills/prototype/ensure-deps.sh --yes      # install non-interactively
```

## Repo layout

```
claude-prototype/
├── SKILL.md              # the lean router Claude reads on trigger
├── reference/            # phase detail, loaded on demand (progressive disclosure)
│   ├── discovery.md      #   1: mode · Q&A · spec · PRODUCT.md + DESIGN.md
│   ├── build.md          #   2: scaffold · control bar · data · screens
│   ├── assess.md         #   3: impeccable audit/critique · browser QA
│   └── subcommands.md    #   variant + apply-feedback
├── templates/            # scaffold-base · feedback-overlay · demo-docs
├── checks/builtin-lint.md# fallback assessment when impeccable is absent
├── benchmark/            # output · overflow · design · context-cost guards
├── .github/workflows/    # CI: skill-checks.yml
├── install.sh · ensure-deps.sh
└── CONTRIBUTING.md · LICENSE
```

## Principles the skill enforces

- **Ask before building.** The discovery Q&A is load-bearing — it's what prevents generic output.
- **No lorem ipsum, ever.** Realistic content matched to the product domain.
- **Every button goes somewhere.** A dead button in a sales demo kills the pitch.
- **Always interactive.** Loading, toasts, empty states, 404 — and skeletons on data-changing actions.
- **The control bar never wraps.** A two-line bar reads as broken and breaks reviewer trust.
- **No horizontal scroll at 390 px** — including toolbars, not just tables. A clipped action reads as broken.
- **Color restraint.** One accent, no gradient fills, no purple-on-black — the #1 "AI made this" tell.
- **Theme-safe colors.** Every color is a CSS var; flipping themes never breaks layout.
- **Persona-aware content.** Names, counts, and lists come from `js/data.js`, never hardcoded.
- **Shareable URL state.** Share a URL, reproduce the exact screen.
- **Scope discipline.** 4 screens asked → 4 screens shipped.
- **No build step.** Tailwind CDN only. If it needs webpack, it isn't a prototype.

## Contributing

Issues and PRs welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). CI runs the skill-checks suite on every PR; `benchmark/README.md` explains how to prove an output-quality change before merging.

## Credits & license

Built on [impeccable](https://impeccable.style/) (design assessment) and [prompt-refiner](https://github.com/kurenn/prompt-refiner-skill) (Q&A → spec). Vanilla JS, Tailwind CDN, Google Fonts — nothing else.

MIT — see [LICENSE](LICENSE).
