# DEMO.md — presenter walkthrough

A click-through script for showing the `claude-prototype` landing page to a stakeholder, contributor, or interview audience. Five minutes, narrated.

## Setup

```
cd docs
python3 serve.py
# open http://localhost:8000 in your browser
```

Make sure the URL bar reads `http://localhost:8000/` with no `?theme=...` or `?persona=...` parameters. Default state should be `terminal` theme + `comfortable` layout + `new` persona.

If you want a clean reset:

```js
// in DevTools console
localStorage.clear(); location.href = '/';
```

---

## 1. Land and read the hero (0:00–0:30)

**Open** `http://localhost:8000/`.

**What the visitor sees:** dark surface, monospaced wordmark `/prototype` upper-left, sticky nav across the top with five anchor links, a 64px Inter display headline on a 70ch line.

**What to say:**
> "This is the `claude-prototype` landing page. The whole thing is one HTML file plus four small JS files. No React, no build step, no bundler. It's the same output the skill itself ships when you ask it to generate a prototype."

The eyebrow `Claude Code skill · MIT · v0.1` sets context in three tokens. Sub-text spells out exactly what the skill does. Two CTAs: primary copies the install command directly, secondary opens GitHub.

---

## 2. Copy the install command (0:30–1:00)

**Click** "Copy install command" in the hero.

The page smoothly scrolls to the `INSTALL` section. (No reload, no flash of unstyled content — the scroll is `IntersectionObserver`-tracked and the nav highlights `Install` automatically.)

**Click** the copy button on the first install code block.

A toast appears at the bottom: `Copied to clipboard`. Paste into a terminal to confirm — the `$ ` prefix is rendered via CSS, so it's not in the clipboard.

**What to say:**
> "Three install paths because developers use different workflows. Quick clone for first-time users. Symlinking install.sh for contributors. Manual `ln -s` for people who already cloned somewhere. Every code block has a copy button. Every command is real."

---

## 3. Switch personas (1:00–1:45)

**Click** the `Installed` button in the bottom-center control bar.

The page subtly flashes (150ms opacity dip) and rewrites:
- Hero headline becomes "You're set. Here's what's new, and how to invoke."
- Eyebrow shifts to `v0.1 · you're already set`.
- CTAs become `Jump to roadmap` + `Contribute`.
- Nav loses "Install" and gains "Roadmap".
- The Install section collapses to a single `Reinstall commands` disclosure.

**What to say:**
> "This is the persona switcher. Same page, different reader. A first-time visitor sees install front and center. Someone who already installed sees the reference material instead. The skill encourages this pattern: don't ship one page that's wrong for half your audience. Ship the same page parameterized."

**Click** `New` to flip back.

---

## 4. Switch themes (1:45–2:30)

In the control bar, click `Paper`.

The whole page transitions to a warm cream surface with a Fraunces serif headline. The accent color shifts from CRT-phosphor green to dusty brick red. Hairline rules between sections become a softer warm tone.

**What to say:**
> "Three themes. Each represents a physical scene where someone might read this page. Terminal: late-night desk, terminal open. Paper: weekend iPad on the kitchen counter. Mono: a senior engineer printing it for team review."

**Click** `Mono`.

Pure black on near-white. No accent color at all — the buttons are black-filled with white text. Letter-spacing carries emphasis.

**What to say:**
> "Mono is the discipline test. The skill says it can switch themes without breaking. The proof is a theme that removes the accent color entirely and still works."

**Click** `Terminal` to return.

---

## 5. Toggle layout (2:30–2:45)

In the control bar, click `Compact`.

Section padding tightens. Line-height drops. Content max-width shrinks from 720 to 640px.

**What to say:**
> "Two layouts. Comfortable for reading. Compact for scanning. The /prototype skill picks layout vocabulary from the product's category, so a marketplace gets Grid/Gallery/List, a dashboard gets Compact/Comfortable/Spacious. Same machinery."

**Click** `Comfortable` to return.

---

## 6. Open the modal (2:45–3:15)

**Scroll** to the OUTPUT section ("What a generated prototype looks like").

**Click** `Preview the control bar →`.

A modal opens, dimming the page. Inside: an annotated mock of the control bar with sample option names from a real prototype, plus a `python3 serve.py` snippet to run it locally.

**What to say:**
> "Every prototype the skill generates ships with this exact control bar at the bottom of every screen. Theme, layout, persona, share, feedback. Reviewers see all options at a glance instead of click-to-reveal."

**Press Escape** to close.

---

## 7. Click the Share button (3:15–3:45)

**Click** the 🔗 `Share` button in the control bar.

Toast: `Link copied`.

**Open** a new tab and paste. The page loads with the same theme + layout + persona + scroll position as the original. (Try it with the modal open — share, paste in new tab, modal opens on land.)

**What to say:**
> "Every interactive state is in the URL. Share the URL, reproduce the screen. Bookmark the screen, come back to it. This is what URL-state does for prototypes — every persona, every modal, every tab is a stable address."

---

## 8. Open Feedback (3:45–4:30)

**Click** the 💬 `Feedback` button in the control bar.

The cursor turns into a crosshair. Click on any element on the page (the hero headline, an install command, a feature row). A popover appears asking for a comment. Type something, save.

A numbered pin appears anchored to the element. Click it to reopen the comment.

**What to say:**
> "Always-on feedback. Reviewers don't need a flag in the URL or a special build. Every prototype the skill generates ships with this pinned to the bottom-right of every screen. They pin comments, export the JSON, hand it back to you. You run `/prototype apply-feedback file.json` and the skill applies each fix in place."

---

## 9. Hit 404 (4:30–4:45)

**Navigate** to `http://localhost:8000/anything-broken`.

The 404 page renders in the current theme. `HTTP 404 · NOT FOUND` eyebrow, "This page isn't part of the skill" headline, two recovery actions.

**What to say:**
> "Even the 404 inherits the theme. That's a small detail but reviewers notice. The skill bakes in interaction states the way a real product does."

---

## 10. Wrap (4:45–5:00)

> "Everything you just saw — the control bar, the persona swap, the URL state, the feedback overlay, the no-cache dev server, the design tokens, the responsive breakpoints — is auto-generated by the `/prototype` skill on first invocation. This page is itself a prototype produced by the skill. The pitch is meta: the skill ships its own demo."

**Show** the GitHub link. Done.

---

## Notes for the presenter

- Don't open DevTools during the demo unless someone asks. The page is meant to feel like a finished product, not a craft showcase.
- If the network is slow, Google Fonts may flash. Reload before starting.
- The `Shift + ?` shortcut opens the recent-screens history drawer (lower-right). Skip unless someone asks about it.
- If an attendee wants to see the raw HTML, paste this into the URL bar:
  ```
  view-source:http://localhost:8000/
  ```
  ~360 lines. Half is HTML, half is inline data attributes for the persona swap. No mystery.
