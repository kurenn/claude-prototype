# claude-prototype landing page

The single-page landing site for [`claude-prototype`](https://github.com/kurenn/claude-prototype). Lives at https://kurenn.github.io/claude-prototype/.

This folder is a self-contained static site. No build step.

## Run locally

Three options. Pick one.

```
# 1. The shipped no-cache server (recommended for iteration)
python3 serve.py
# http://localhost:8000

# 2. Plain Python HTTP server
python3 -m http.server 8000

# 3. Anything else
npx serve .
```

`serve.py` disables the browser cache so edits show up on reload. It's local-only, never pushed to the live site (GitHub Pages serves static files through its own CDN and ignores `.py`).

## Deploy to GitHub Pages

This site is served from `main` → `/docs`. To set it up the first time:

1. Commit and push `docs/`.
2. Repo Settings → Pages → Source → `main` branch, `/docs` folder. Save.
3. Within ~60 seconds the site is live at `https://kurenn.github.io/claude-prototype/`.

After the initial setup, every push to `main` rebuilds the Pages deployment automatically. No CI required.

If you'd rather use a `gh-pages` branch:

```
git subtree push --prefix docs origin gh-pages
```

Then point Settings → Pages at `gh-pages` (root) instead.

## File map

```
docs/
├── index.html          # the landing page
├── 404.html            # themed not-found page
├── css/
│   ├── styles.css      # tokens (terminal/paper/mono), layouts, components
│   └── feedback.css    # pin-to-element overlay (from the scaffold)
├── js/
│   ├── state.js        # URL state + share + Shift+? history drawer
│   ├── theme.js        # data-theme switcher (terminal default)
│   ├── layout.js       # data-layout switcher (comfortable default)
│   ├── data.js         # personas (new / installed) + content swap
│   ├── persona.js      # data-persona switcher
│   ├── ui.js           # toast, skeleton, loading helpers
│   ├── app.js          # copy-to-clipboard, smooth scroll, modal, nav active state
│   └── feedback.js     # pin-to-element feedback overlay
├── assets/images/      # currently empty (no illustrations by design)
├── serve.py            # local dev server (not deployed)
├── DESIGN.md           # tokens, type, motion, anti-patterns
└── README.md           # this file
```

## Themes, layouts, personas

The control bar at the bottom of every page is a real, working set of three switchers:

- **Theme** — `terminal` (dark, default) · `paper` (warm cream, serif headings) · `mono` (high-contrast editorial, no accent)
- **Layout** — `comfortable` (default, generous whitespace) · `compact` (tighter, reference-feel)
- **Persona** — `new` (default, install CTA prominent) · `installed` (returning visitor, install collapses, roadmap rises)

Each setting persists to localStorage and serializes to the URL. Click 🔗 Share to copy a URL that reproduces the exact theme + layout + persona + modal-state someone is looking at.

## What's real, what's not

- All copy is verbatim from the canonical README at the project root or tightened editorial paraphrase.
- Install commands are the live, working three-options paragraph from the README.
- Every link goes somewhere real (GitHub repo, impeccable.style, prompt-refiner repo, CONTRIBUTING.md).
- Every code block has a working copy-to-clipboard button with a toast confirmation.
- The "Preview the control bar" modal is a static mock with sample option names; the real control bar at the bottom of every page is the live switcher.
- The roadmap items are aspirational and labeled as such.

## Iteration commands

This page was generated with [`/prototype`](https://github.com/kurenn/claude-prototype). To iterate:

```
/prototype apply-feedback feedback-YYYY-MM-DD.json
```

Reviewers can pin comments via the 💬 Feedback button (it's always available — no `?feedback=1` flag needed). Export the JSON, drop it in `docs/`, and the skill applies each fix in place.

```
/prototype variant "more compressed, less hero"
```

Forks `docs/` into `docs/variants/<slug>/` so you can A/B-pitch a different vibe without touching this one.

## Known gaps

- The page assumes a desktop-first reader. Mobile layouts are tested at 375 / 414 / 768 but the Fraunces serif on the `paper` hero looks best at ≥720px.
- The control bar uses the platform's pill aesthetic (`border-radius: 999px`); it intentionally doesn't inherit the page's `--radius` token so the chrome reads as platform-shipped rather than page-designed. If that bothers you, override `#proto-controls > .proto-bar` in `styles.css`.
- No analytics. Add Plausible / Fathom / GoatCounter to `<head>` if you want page-load metrics.

## License

MIT, same as the parent repo.
