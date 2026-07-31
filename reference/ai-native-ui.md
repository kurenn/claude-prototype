# AI-native UI — components for agent & LLM interfaces

Half the inspiration corpus (`reference/inspiration.md`) is about one emerging genre: interfaces
where an **agent or model is a first-class actor** — it thinks, streams, calls tools, proposes
actions, and asks for approval. If the prototype is an AI product (chat, agent console, copilot,
LLM tool), reach for this vocabulary the way a dashboard reaches for KPI cards. All of it is
zero-dep and rides the scaffold engine you already have (`js/ui.js`: `fakeLatency`, `withLoader`,
`announce`, `data-skeleton-*`; motion tiers on `html[data-motion]`).

**Read this when** `DESIGN.md` register is an AI/agent product. **Register defaults for it:** motion
tier **calm or standard** (these are tools — cinematic motion is friction; the *one* exception is a
brand/landing page *about* an AI product, which goes expressive); icon stance **functional**; the
"signature move" is usually one of the states below done unusually well, not a decorative flourish.

## The inventory (the checklist)

Pulled from aicss.dev + beautiful-ui + orbs. Treat as an à-la-carte menu — build the ones the
product actually shows, skip the rest (respect scope).

| Component | What it is | Zero-dep mechanic |
|---|---|---|
| **Thinking / reasoning** | agent is working, before output | see state taxonomy below; optional collapsible reasoning trace |
| **Streaming text** | tokens arriving live | reveal word-groups on a timer + a blinking caret; run through `fakeLatency('stream')` |
| **Tool-call / action state** | agent runs a tool (search, read file, run cmd, gen image) | a labeled card: pending → running (spinner/shimmer) → result; `withLoader` around the fake work |
| **Approval card** | agent proposes an action, needs a yes | summary + diff/preview + Approve/Reject; optimistic-with-undo on Approve |
| **Tool chips** | compact inline status | small pill: icon + label + state dot (queued/running/done/error) |
| **Task rows / plan** | agent's to-do list, live | rows with a per-item status (○ pending · ◐ running · ✓ done); check them off on a timer |
| **Agent composer** | the input | textarea + model/mode pickers + attach + send; disabled→busy→ready; ⌘↵ to send |
| **Structured output** | tables the model emitted | the scaffold `.table` inside `.proto-table-wrap` (the 390px overflow guard); records / comparison / diff / filter are content patterns, not separate classes |
| **Citations / context cards** | sources behind an answer | inline superscript links + a source card (favicon + title + domain) |
| **Insight / recommendation card** | a suggestion with confidence | claim + a confidence chip + a sparkline or a one-number reason |

## Thinking is not one spinner — it's a named taxonomy

`orbs` names six agent states — **Working · Searching · Solving · Listening · Composing · Shaping** —
each a distinct animation in a labeled pill. That's the lesson: a generic spinner says "loading";
a *named* state ("Searching the web…", "Reading `auth.ts`…", "Composing the reply…") tells the user
what's happening and reads as a real system. Give the current step a **specific label**, not "Loading."

- **Ambient indicator** (zero-dep, no WebGL): a small pulsing dot-ring, a shimmering glyph, or a
  3-dot bounce — one per state, tinted with the accent. A CSS dot-sphere or `conic-gradient` spinner
  carries the same read as the WebGL orb without the dependency.
- **Reasoning trace** (optional): a collapsible "Thought for 4s ▸" that expands to a muted,
  monospace list of steps. Collapsed by default. This is aicss's "Thinking + Reasoning" block.
- **A11y:** the thinking region sets `aria-busy="true"` on itself and posts each state label through
  the scaffold's `announce()` (its polite live region); clear `aria-busy` and announce the result when
  the answer lands. Note `announce()` only *speaks* — managing `aria-busy` is yours here (the scaffold
  toggles it automatically only for `data-skeleton` containers, not a custom thinking region).

## Streaming text — the mechanic

Reveal in **word groups**, not per-character (per-char is slower to read and jankier). A caret
(`▍`) blinks at the tail while streaming, removed when done. Gate it on `data-motion`: **calm**
skips the animation and paints the full text (respect the scanning user); `prefers-reduced-motion`
always paints instantly. Drive the cadence through `fakeLatency('stream')` so the Loading Speed
control in the tweaks bar scales it (Instant paints immediately).

## Tool-call & action states — the pattern

Every tool call is a tiny three-state lifecycle: **pending → running → result|error**. Model it as a
card (or chip) that:
1. mounts in *running* with a labeled shimmer ("Searching the web…"),
2. resolves via `withLoader(fakeWork, …)` so the spinner-delay + min-visible discipline applies
   (no flash on fast calls),
3. lands on a **result** (search hits, a file diff with red/green gutter, a generated-image frame)
   or a **scoped error + Retry** (the `.state--error` component).

This is the AI-native application of the loading/state engine already in the scaffold — reuse it,
don't reinvent it.

## Approval & the human-in-the-loop

When the agent proposes a mutation (send email, run migration, place order), show an **approval card**:
a plain-language summary + a preview/diff + **Approve / Reject**. On Approve, use
**optimistic-with-undo** (`UI.undoToast`) rather than a blocking confirm — the action appears done
with a 5s Undo, matching the microinteractions doctrine. Destructive proposals name the consequence
in the button ("Approve & send"), never a bare "OK".

## Demo content — make the agent's world real

Never "lorem" an AI demo — the fake content is what sells it. Give the agent a **specific domain**
(beautiful-ui themes its whole demo around a coffee roaster) and write real-sounding intermediate
work: actual file paths in the diff, plausible search results with real-looking domains, a to-do
list with domain tasks ("Scaffold the component registry", "Wire up Stripe checkout"). Generic
"Task 1 / Task 2" content is the tell that this isn't a real product.

## Anti-slop for AI UIs

- **No purple/violet "AI gradient."** The lazy signifier for "this is AI" is a violet→blue glow —
  it's the #1 tell (`color-palettes.md`). An AI product earns its look like any other; one accent,
  tinted neutrals.
- **One spinner style, named.** Don't scatter three different loaders; pick one thinking indicator
  and label its states.
- **Don't fake streaming on static text** that was never generated (a nav label, a heading) — it
  reads as a gimmick. Stream only what the model would actually produce.
- **Monospace with intent.** Mono belongs on code, diffs, file paths, token counts — not the whole
  UI (see `type-pairings.md`: "mono is not a costume").
