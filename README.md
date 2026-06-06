# claude-prototype

> A Claude Code skill for building clickable HTML prototypes — sales demos, stakeholder reviews, design explorations — with zero build step, a live feedback loop, and design assessment baked in.

**Repo:** https://github.com/kurenn/claude-prototype

Invoke with `/prototype` in any Claude Code session. Answer 6 questions. Get a folder of plain HTML, Tailwind (via CDN), and a handful of vanilla JS files that run with `python3 serve.py` — no build, no Node, no framework.

## What you get

Most AI-generated prototypes look like every other AI-generated prototype: purple gradients, gradient text, nested cards, lorem ipsum, dead buttons, no lifecycle states. This skill bakes in the opposite:

- **Discovery Q&A** before building — tone, inspiration, audience, scope, content. No generic "modern SaaS" output.
- **prompt-refiner** turns the answers into a tight build spec (auto-installed).
- **impeccable teach + shape** produces a per-prototype `DESIGN.md` with tokens, then **audit + detect + critique** verify after build (auto-installed).
- **Always-visible control bar** with three runtime switchers and two actions:
  - **Theme** — 3 per-prototype themes (design tokens flip at runtime, URL-shareable)
  - **Layout** — 2–4 per-prototype layout variants (Grid / Gallery / List, or density, or grid-N, chosen per product)
  - **Persona** — 2–4 lifecycle states (new user / active / power, or empty / busy) with data-driven content swap
  - **🔗 Share** — copies a URL reproducing the exact screen (theme + layout + persona + modal + tab)
  - **💬 Feedback** — always-on pin-to-element commenting, exports JSON
- **Interaction states** — loading spinners, toasts, empty states, 404 page. Declarative via `data-loading`, `data-toast`, `data-confirm` attributes. Skeleton loaders on filter changes + first load.
- **URL state** — every interactive screen state lives in the URL. Share the URL, reproduce the screen.
- **Apply-feedback workflow** — `/prototype apply-feedback <file>` reads the pinned-comment JSON and applies each fix in place.
- **Variants** — `/prototype variant "more corporate"` forks into `variants/<slug>/` so you can A/B-pitch.
- **No-cache dev server** — `serve.py` ships with every prototype; prevents the "my edits aren't showing" browser cache trap.
- **Zero build step** — Tailwind via CDN, vanilla JS. Runs anywhere a browser opens.

## Install

Claude Code loads skills from `~/.claude/skills/<name>/`. Pick any of three:

### 1. Quickest — `git clone` into the skills dir

```
git clone https://github.com/kurenn/claude-prototype ~/.claude/skills/prototype
```

### 2. Recommended for contributors — `./install.sh`

Clone somewhere you'll hack on it, then run the install script:

```
git clone https://github.com/kurenn/claude-prototype ~/code/claude-prototype
cd ~/code/claude-prototype
./install.sh            # symlinks — edits to your clone flow through instantly
# or: ./install.sh copy — independent copy, re-run to sync
```

The symlink default means `SKILL.md` edits in your working copy are live for future `/prototype` invocations with no reinstall step. Best for development.

### 3. Manual one-liner

```
ln -s /absolute/path/to/claude-prototype ~/.claude/skills/prototype
```

### Verify

Restart your Claude Code session (or run `/help`), then type `/prototype` or describe a prototype idea. The skill's description triggers automatically on "prototype", "mockup", "demo", "pitch page", "click-through".

To uninstall:
```
rm ~/.claude/skills/prototype
```

## Companion skills — auto-installed on first use

`/prototype` runs a preflight step (`ensure-deps.sh`) on every invocation that ensures these companion skills are available. Missing ones are installed automatically:

| Skill | What it adds | Auto-install command |
|---|---|---|
| [impeccable](https://impeccable.style/) | Design direction + 3-pass assessment (audit / detect / critique) — 23 subcommands | `npx -y skills add pbakaus/impeccable --global --yes` |
| [prompt-refiner](https://github.com/kurenn/prompt-refiner-skill) | Q&A answers → structured build spec | `git clone https://github.com/kurenn/prompt-refiner-skill ~/.claude/skills/prompt-refiner` |
| claude-in-chrome (MCP) | Screenshot grid across themes + breakpoints, console error check | Not auto-installed — configured in Claude Code MCP settings |

If auto-install fails (no `npx`, no network, etc.), `/prototype` falls back to built-in checks (see `checks/builtin-lint.md`) and notes it in the final report.

You can also run the preflight manually anytime:

```
bash ~/.claude/skills/prototype/ensure-deps.sh          # prompts before installing
bash ~/.claude/skills/prototype/ensure-deps.sh --yes    # non-interactive
bash ~/.claude/skills/prototype/ensure-deps.sh --check  # report status only
```

## Usage

### Build a prototype

```
/prototype
```

Answer the Q&A (or say "quick" to skip it). Output is a new folder in your working directory with all screens, docs, and a `serve.py` ready to run.

### Fork a variant

```
/prototype variant "editorial, serif-forward, less corporate"
```

Creates `variants/<slug>/` with the new vibe re-applied across tokens, typography, and palette. Original untouched.

### Apply pinned feedback

Someone reviewed your prototype with the 💬 Feedback button, pinned comments to elements, and exported a JSON. Drop that file in the prototype folder:

```
/prototype apply-feedback feedback-2026-04-24.json
```

Claude applies each comment in place, re-runs assessment, and archives the JSON under `feedback/applied/`.

## What a generated prototype looks like

```
acme-demo/
├── index.html
├── <screen>.html
├── 404.html
├── css/
│   ├── styles.css       # theme tokens + control bar + skeleton + empty states
│   └── feedback.css
├── js/
│   ├── state.js         # URL state + share + history drawer (Shift+?)
│   ├── theme.js         # data-theme switcher
│   ├── layout.js        # data-layout switcher
│   ├── data.js          # personas + shared content
│   ├── persona.js       # data-persona switcher
│   ├── ui.js            # loading / toast / skeleton / confirm helpers
│   ├── app.js           # page interactions (modals, tabs, filter chips, composer)
│   └── feedback.js      # pin-to-element overlay (always on)
├── assets/images/
├── serve.py             # no-cache dev server
├── DESIGN.md            # tokens + rationale
├── DEMO.md              # presenter click-through with persona map
└── README.md            # how to run, what's fake, iteration commands
```

Run it:

```
cd acme-demo
python3 serve.py
# open http://localhost:8000
```

Then click through the control bar at the bottom to toggle theme, layout, and persona. Click 🔗 to copy a URL reproducing the current screen. Click 💬 to pin feedback on any element.

## Repo layout

```
claude-prototype/
├── SKILL.md                       # the skill router Claude reads on trigger
├── reference/                     # phase detail, loaded on demand (progressive disclosure)
│   ├── discovery.md               # steps 1–4: mode, Q&A, spec, design shaping
│   ├── build.md                   # steps 5–6: scaffold, control bar, data, screens
│   ├── assess.md                  # steps 7–8: assessment + browser QA
│   └── subcommands.md             # variant + apply-feedback
├── install.sh                     # symlink or copy install
├── ensure-deps.sh                 # auto-installs impeccable + prompt-refiner
├── templates/
│   ├── scaffold-base/             # starter HTML/CSS/JS + serve.py + 404
│   ├── feedback-overlay/          # feedback.js + feedback.css
│   └── demo-docs/                 # DEMO.md + README.md templates
├── checks/
│   └── builtin-lint.md            # fallback rules when impeccable absent
├── benchmark/                     # objective output + context-cost benchmark
├── CONTRIBUTING.md
├── LICENSE                        # MIT
└── README.md
```

## Principles the skill enforces

- **Ask before building.** Discovery Q&A is load-bearing — prevents generic output.
- **No lorem ipsum, ever.** Realistic content matched to the product domain.
- **Every button goes somewhere.** Dead buttons in a sales demo kill the pitch.
- **Always interactive.** Loading states, toasts, empty states, 404. Skeleton loaders on data-changing interactions.
- **Control bar never wraps.** `flex-wrap: nowrap` is load-bearing — a two-line bar breaks reviewer trust.
- **Responsive by default.** Verified at 375 / 768 / 1440.
- **No build step.** Tailwind CDN only. If a prototype needs webpack, it's not a prototype.
- **Theme-safe colors.** Every color reference is a CSS var — flipping themes never breaks layout.
- **Persona-aware content.** Names, counts, lists driven from `js/data.js`, not hardcoded in HTML.
- **URL state is shareable.** Share a URL, reproduce the exact screen (theme + layout + persona + modal + tab).
- **Scope discipline.** 4 screens asked → 4 screens shipped.

## Roadmap

- Sample `examples/` prototypes for common verticals (SaaS, e-commerce, fintech, internal tool).
- Keyboard shortcuts for theme / layout / persona cycling.
- Form state persistence (inputs survive reload).
- QR-code share for live mobile demos.
- Per-prototype favicon generation.

## Credits

- [impeccable](https://impeccable.style/) — the design assessment skill this flow integrates with. Strongly recommended.
- [prompt-refiner](https://github.com/kurenn/prompt-refiner-skill) — the Q&A → spec refiner.
- Vanilla JS, Tailwind CDN, Google Fonts — nothing else.

## License

MIT — see [LICENSE](LICENSE).
