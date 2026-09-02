<!-- Recipes adapted from Hallmark (github.com/Nutlope/hallmark), MIT. -->

# Microinteractions — small-moment recipes for prototype screens

These are the moments that make a prototype feel *made* instead of generated: a copy
button that confirms itself, an undo that saves a confirm dialog, a tooltip that
doesn't flash on every mouse pass. None of this needs a library — every recipe below
is vanilla JS/CSS that either already ships in `templates/scaffold-base/js/ui.js` or
is a small enough snippet to paste into a screen's own script.

This file is scoped to **app UI**, not landing-page motion — no marquees, no
counter-reveals, no hero choreography. If you're shaping a marketing/pitch page's
motion instead, that's a different problem; this file is about buttons, toasts,
tabs, and forms behaving like a real product.

Keep everything here inside the doctrine already set in `reference/build.md` and
`reference/discovery.md`: ease-out only (`--ease-out-quart` / `--ease-out-expo`,
never bare `ease`, never bounce/elastic), `prefers-reduced-motion` respected on every
recipe, animate `transform` + `opacity` only, and heights animate via
`grid-template-rows: 0fr → 1fr`, never `height`/`max-height`.

## Recipes

### Copy-to-clipboard as a label swap

**Rationale:** a toast for "copied the thing you just clicked copy on" is redundant —
the user's eyes are already on the button. Swapping the button's own label is the
same information with zero extra visual noise, and it disappears on its own instead
of needing to be read-then-ignored like a toast would.

**No toast.** The inline label change *is* the feedback.

```js
// Declarative — no JS needed on the screen:
// <button data-copy="npm install acme-cli">Copy</button>
// ui.js's delegated click listener wires this automatically.

// Programmatic, when the value isn't known until click time:
copyBtn.addEventListener('click', () => UI.copyButton(copyBtn, shareUrl));
```

Ships as `UI.copyButton(btn, text, ms)` in `ui.js` — writes `text` to the clipboard
(Clipboard API, falling back to a hidden-textarea + `execCommand('copy')` for
`http://` contexts, same fallback `state.js`'s `copyShareUrl` already uses — and,
like that fallback, only swaps the label when the copy actually succeeded), then
swaps the button's own `textContent` to a success label (default `"Copied!"`,
override with `data-copy-success="…"`) for ~1.2s before reverting. Always copies on
click — a re-click mid-window re-copies and re-arms the revert timer rather than
being swallowed, so reverts never stack but a click never silently does nothing
either. The button also gets `aria-live="polite"` (if it doesn't already have one)
so the label swap — the *only* feedback here — is announced to screen readers, not
just visible.

### Simulated latency & skeleton discipline (the timing engine)

**Rationale:** a prototype has no backend, so every "load" is faked. Fake it with a bare
`setTimeout(…, 700)` and it feels wrong two ways: the same 700ms every time reads as
mechanical, and a loader shown for a call that "finishes" in 40ms *flashes* while one shown
then hidden 30ms later *blinks*. Real products have jittery, tiered latency and loaders that
refuse to flash. `ui.js` ships an engine so simulated loading gets both for free.

**Tiered, non-uniform latency.** Different actions take different amounts of time, and no two
identical actions take *exactly* the same time. `UI.fakeLatency(kind)` returns ms with ±45%
jitter, per tier:

```js
UI.fakeLatency('read')   // pick the tier that fits the action
// × the global Speed multiplier (Instant 0 · Real 1 · Slow 2.5)
```

The tier names and their base durations are listed once, in `reference/build.md` →
"Simulated loading — the timing engine". Deliberately not restated here: while they lived
in both files a fifth tier (`stream`) was added to `ui.js` and neither copy picked it up.

Await one directly with `UI.fakeCall(kind, { failRate })` — resolves after `fakeLatency(kind)`,
or rejects when `failRate` (0–1) fires, so the error face (build.md "state matrix") is
demoable without editing data:

```js
try { await UI.fakeCall('mutate'); showSaved(); }
catch { showRegionError(); }            // .state.state--error, with a [data-retry]
```

**Spinner-delay + minimum-visible-duration.** Two thresholds kill the flash/blink. Don't show
the loader until the work has run **300ms** (a faster call shows *nothing* — no flash); once
shown, keep it up at least **500ms** (it can't blink out). `UI.withLoader` bakes both in:

```js
UI.withLoader(
  () => UI.fakeCall('read'),            // the "work"
  { show: () => region.setAttribute('aria-busy','true'),   // fires only if work outlasts 300ms
    hide: () => region.setAttribute('aria-busy','false') } // never fires if show didn't; otherwise no sooner than 500ms after it
);
```

`UI.fakeLoad(region, duration, opts)` (and `data-skeleton-on-load`) already run through this —
skeletons get the delay/min-visible discipline, plus `aria-busy` and a polite "Loading…" /
"Loaded." announcement (one shared `UI.announce` live region), with **no per-screen wiring**.
Pass a `duration` to pin it (back-compat) or omit it for engine timing that honors the Speed
control. **Skeletons, not spinners, for shaped content** — see tell #6 below.

**Demoing the transient loading.** Because loaders are transient, they're hard to review — you
have to reload to see them again. The tweaks-bar **⟳ Replay** button (`UI.replayLoading()`)
re-runs every region's load sequence on demand, and the **Speed** control (Instant/Real/Slow)
scales the whole engine so a reviewer can freeze the choreography in slow-mo or confirm Instant
skips the skeleton entirely. Register a bespoke load sequence with `UI.registerLoader(fn)` so
Replay picks it up too.

### Optimistic update with Undo

**Rationale:** a confirm dialog ("Are you sure you want to archive this?") interrupts
the user's flow to ask permission for something reversible. Doing the thing
immediately and offering a few seconds to change their mind respects the 95% of
clicks that were intentional, without punishing the 5% that weren't.

Prefer this over `window.confirm()` for anything reversible (archive, delete-with-
recovery, remove-from-list, mark-read). Reserve an actual confirm for genuinely
destructive, irreversible actions — the `[data-confirm]` attribute `ui.js` already
wires stays for those.

```js
function archiveItem(item) {
  item.archived = true;              // mutate + re-render immediately — optimistic
  renderList();
  UI.undoToast(`Archived "${item.name}"`, () => {
    item.archived = false;           // rollback
    renderList();
  });
}
```

Ships as `UI.undoToast(message, onUndo, ms)` in `ui.js` — same `.proto-toast` element
`UI.toast()` uses, with an inline Undo action appended. Calls `onUndo` if the user
clicks Undo within the window (default 6s — longer than a normal toast's 1.6s dwell,
because the user has to actually read the offer and decide); otherwise it just
dismisses and the change stands. The dismiss timer pauses on hover or focus of the
Undo button and re-arms on mouseleave/blur, so it can't time out mid-decision (WCAG
2.2.1) — and Escape dismisses it early for anyone who's decided not to undo.

### Tooltip timing

**Rationale:** a tooltip that appears the instant the pointer grazes an icon on the
way to somewhere else is noise — most hovers are transit, not intent. A keyboard
user landing on the same element via Tab has already committed to being there; making
them wait is just latency with no payoff.

- **Mouse hover → 800ms delay.** Long enough that passing-through pointer movement
  never triggers it; short enough that a deliberate pause reads as instant.
- **Keyboard focus → 0ms.** Show immediately on `focus` — but only when that focus
  came from the keyboard. `focus` also fires on mouse click (clicking a trigger
  focuses it), so a naive `focus` listener shows the tooltip instantly on click too,
  defeating the 800ms hover-intent delay above. Guard with `:focus-visible`.
- Dismiss on `mouseleave` / `blur` / `Escape`. Cancel the pending hover timer on
  `mouseleave` before it fires, so a quick in-and-out never shows anything.
- **WCAG 1.4.13 (content on hover/focus):** a tooltip shown this way must also be
  hoverable (pointer can move onto the tooltip itself without it disappearing),
  persistent (stays until dismissed, not on a timer), and dismissible (Escape, as
  above). The snippet below covers timing/dismissal only — a full implementation
  also needs `role="tooltip"` on the tooltip element and `aria-describedby` on the
  trigger pointing to it; keep those out only if you're prototyping the visual
  timing in isolation, not shipping the real thing.

```js
function wireTooltip(trigger, tooltip) {
  let hoverTimer;
  const show = () => tooltip.classList.add('visible');
  const hide = () => { clearTimeout(hoverTimer); tooltip.classList.remove('visible'); };

  trigger.addEventListener('mouseenter', () => {
    hoverTimer = setTimeout(show, 800);       // hover-intent delay
  });
  trigger.addEventListener('mouseleave', hide);
  trigger.addEventListener('focus', () => {
    if (trigger.matches(':focus-visible')) show(); // keyboard only — not a mouse click
  });
  trigger.addEventListener('blur', hide);
  trigger.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
}
```

```css
.tooltip {
  opacity: 0;
  transition: opacity var(--motion-fast) var(--ease-out-quart);
  pointer-events: none;
}
.tooltip.visible { opacity: 1; }
@media (prefers-reduced-motion: reduce) { .tooltip { transition: none; } }
```

### Height changes via `grid-template-rows`

**Rationale:** animating `height` or `max-height` triggers layout on every frame and
requires knowing the target height up front (measuring, `scrollHeight` hacks). A
single-row CSS grid animating `grid-template-rows` from `0fr` to `1fr` animates
height without ever measuring anything — no `scrollHeight` hacks, just the
doctrine-sanctioned way to animate a height change (see tell #11 below: it's still
a layout property under the hood, so it isn't free, but it's the one height-adjacent
transition that doesn't need JS to compute a target value).

```css
.panel-collapse {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--motion) var(--ease-out-quart);
}
.panel-collapse.open { grid-template-rows: 1fr; }
.panel-collapse > .panel-collapse-inner { overflow: hidden; } /* required: grid child must clip */
@media (prefers-reduced-motion: reduce) { .panel-collapse { transition: none; } }
```

```html
<div class="panel-collapse" id="details">
  <div class="panel-collapse-inner">
    <!-- content whose height you never have to calculate -->
  </div>
</div>
```

Pairs with the scaffold's existing `UI.withViewTransition()` for the tab-switch
itself: `app.js`'s `selectTab` cross-fades the *content swap* via View Transitions,
while a `.panel-collapse` handles any *height change* that swap causes (e.g. a
shorter panel replacing a taller one). Use both together when a tab change also
changes panel height; use `grid-template-rows` alone for a plain accordion/disclosure
with no tab involved.

### Toast that doesn't shift layout

**Rationale:** a toast that inserts into document flow (prepended to a list, pushed
above content) shoves everything below it down, then springs it back up on dismiss —
a jarring reflow for a notification that's supposed to be peripheral.

The scaffold's `.proto-toast` (in `styles.css`, used by `UI.toast`) already does this
correctly — copy the pattern for any custom toast-like UI:

- `position: fixed` (never inserted into normal flow).
- State changes animate `opacity` + `transform` only (`translate(-50%, 8px)` →
  `translate(-50%, 0)`) — never `top`/`margin`/`height`.
- `pointer-events: none` at rest so an off-screen-transformed toast can't eat clicks
  meant for the page underneath. The Undo-toast variant never flips this on the
  toast itself (that would risk leaving an invisible click-blocker if something ever
  reset it late) — instead only the Undo `<button>` opts back into
  `pointer-events: auto`. A child can receive clicks while its parent stays
  `pointer-events: none`, so the toast stays click-through everywhere except the one
  control that needs to be clickable.

### Silent success

**Rationale:** if the user can already see the result of their action (a row
disappeared, a value updated, a field now shows the saved copy), a "Saved!" toast on
top of that is telling them something they already know. Reserve toasts for actions
whose effect is *not* visible on screen, and for failures — a failure always needs a
toast, because the user can't otherwise tell the action didn't work.

**Stay silent when:**
- The change is visible in the same viewport (list item updated in place, badge
  count changed, field now shows the new value).
- The action is low-stakes and frequent (toggling a checkbox, favoriting, reordering)
  — a toast on every one of these becomes noise the user starts ignoring, which
  defeats toasts for the times they matter.

**Still confirm (toast or otherwise) when:**
- The effect happens somewhere the user isn't looking (background export finished,
  invite email sent, a save from a screen that's about to navigate away).
- It failed. Errors always get a toast — silence on failure reads as "did that even
  work?" and erodes trust fast.
- It's undoable and time-limited — that's the Undo-toast case above, which is a
  toast whose job is the Undo affordance, not the confirmation itself.

### Number pop-in / rolling counter

**Rationale:** a KPI or total that *animates to* its value draws the eye to the one number that
changed — but only when it genuinely just changed (a live metric, a result landing). Animating every
number on page load is decoration.

**Mechanic (zero-dep):** count from a start to the target over ~500–800ms with `requestAnimationFrame`,
easing out; write `tabular-nums` so the width doesn't jitter mid-count. For a small +1/-1 (a badge),
skip the roll — just a quick scale pop (`transform: scale(1.15)→1` over 150ms). **Gate on motion:**
`calm` and `prefers-reduced-motion` paint the final number instantly; drive the duration through the
loading-speed engine so the tweaks bar scales it.

### Spinner → check morph

**Rationale:** when a loading action succeeds, morphing the *same* spinner into a checkmark (rather
than swapping in a separate success element) keeps the user's eye anchored on one spot and reads as
"this finished," not "something new appeared."

**Mechanic:** one SVG circle whose `stroke-dasharray` spins while pending, then on resolve stops and a
check path draws in (`stroke-dashoffset` 100→0 over 250ms). Pairs with `withLoader` (min-visible
discipline) so the check is actually seen on fast calls. On failure, morph to a shake + `.state--error`
instead — never a check. This is the AI-native tool-call "done" state (`reference/ai-native-ui.md`).
**Reduced-motion / calm:** skip the spin and the draw-in — swap straight to a static check (or error)
icon the moment the call resolves.

### Dissolve on remove

**Rationale:** deleting a row/card with a soft dissolve (rather than an instant vanish or a full
"smoky" particle effect) tells the user *which* thing left and where — the gap closing confirms the
delete without a toast. The particle/smoke version from the corpus needs canvas; the dissolve carries
the same read in pure CSS.

**Mechanic:** on remove, transition `opacity 1→0` + a slight `filter: blur(4px)` + `scale(0.98)` over
~200ms, then collapse the height via `grid-template-rows: 1fr→0fr` (see "Height changes" above) so
neighbors slide up. **Reduced-motion / calm:** skip straight to the height collapse, no blur.

### Card-stack fan on hover

**Rationale:** a stacked set (saved items, versions, a deck) that **fans slightly on hover** signals
"there's more than one here, and it's browsable" — a discoverability cue, not eye-candy. Only earn it
when the stack really holds multiple things the user can act on.

**Mechanic:** absolutely-stack the cards with a small `rotate`/`translate` offset per depth; on the
container's `:hover`/`:focus-within`, widen the offsets via `transform` (GPU-cheap). Keep it subtle
(≤6° / ≤12px) — a big fan reads as a toy. **Gate on motion:** `calm` shows the stack static with a
count badge instead; `prefers-reduced-motion` never fans.

## Motion tells to avoid

Named failure patterns — the visual signatures of un-crafted, generated-looking
motion. Treat any one of these in a build as a finding, same severity as a contrast
failure. Trimmed from Hallmark's fuller list to the ones that show up in app UI
(landing-page-only tells — marquees, hero counters, pricing-tier pulses — are out of
scope here).

1. **Reaching for a library when CSS would do.** A dependency pulled in for a
   crossfade, a tooltip, or a toast that `grid-template-rows`, `opacity` transitions,
   and a fixed-position `<div>` already solve. The scaffold is zero-dependency for a
   reason — every recipe above ships in plain JS/CSS.
2. **`transition-all` / animating everything.** Every property transitions,
   including ones that should be instant (`visibility`, focus rings). Name the
   properties you're animating; if you can't name them, cut the rule.
3. **Bouncy/elastic easing on UI elements.** `cubic-bezier(0.34, 1.56, 0.64, 1)` and
   similar overshoots. Reserve spring/overshoot for genuine physical interactions
   (drag release) — never on buttons, toasts, or panels. This scaffold is ease-out
   only; there is no bounce token to reach for.
4. **Everything animating at once.** A card that lifts, scales, shadows, and
   color-shifts on a single hover. Pick one signal per interaction.
5. **Universal `hover:scale-105` / hover-lift on every card.** No purpose, no easing
   decision, just AI's reflexive "make it feel interactive." A hover state should
   change because something about *this* element invites it, not because every
   clickable surface got the same treatment.
6. **Spinners where a skeleton belongs.** Content with a predictable shape (list,
   card grid, table) gets `UI.showSkeletons()` / `UI.fakeLoad()`, not a spinner —
   the skeleton previews the layout that's about to arrive; a spinner just says
   "wait" with no information.
7. **Confirmation dialogs for reversible actions.** See "Optimistic update with
   Undo" above — `window.confirm()` on an archive/delete-with-recovery/mark-read is
   the tell; an undo toast is the fix.
8. **Celebratory toasts for visible success.** See "Silent success" above — a
   "Saved!" toast for a change the user can already see on screen.
9. **Tooltips with the same delay on hover and focus.** Either both instant (flashes
   on every stray mouse pass) or both delayed (keyboard users wait for no reason).
   They're different intents; see "Tooltip timing" above.
10. **Toasts that shift layout.** Inserted into flow instead of `position: fixed`, or
    animating a layout property instead of `transform`/`opacity`. See "Toast that
    doesn't shift layout" above.
11. **Animating `height`/`max-height`/`padding`/`margin`.** Triggers layout every
    frame. Use `transform` for position/scale changes and
    `grid-template-rows: 0fr → 1fr` for height changes.

Before shipping any animation, ask: *if this were instant, would the user lose
information about what changed?* If no, cut it — most prototypes have too much
motion, not too little.
