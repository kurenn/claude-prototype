# Discovery & spec (steps 1–4)

Read this before building. It covers mode selection, the discovery Q&A, the build
spec, and design shaping. Output of this phase is a confirmed one-paragraph summary
plus a per-prototype `DESIGN.md`.

## Step 1: Mode check

First message to the user:

> **Quick or Discovery?**
> - **Quick** — I'll scaffold a prototype with sensible defaults in about a minute. You describe it in one or two sentences.
> - **Discovery** — I'll ask you 5–7 questions (tone, inspiration, audience, scope, content) to get the vibe right before I build.

If the user already has a rich brief (multiple paragraphs, attached references), skip
the question and go straight to discovery. If they say "quick", collapse the Q&A into a
single combined prompt.

## Step 2: Discovery Q&A

Ask one at a time, conversational, not as a form:

1. **What are you prototyping?** — one-sentence product summary. Drives content, not just structure.
2. **Tone?** — presets: *playful · corporate · technical · editorial · bold-experimental · minimal*. Free-text welcome. Tone selects the recommended **font pairing** (`reference/type-pairings.md`) and **color palette** (`reference/color-palettes.md`): auto-pick in Quick mode; recommend and offer to adjust in Discovery mode.
3. **Inspiration** — URLs or images that capture the vibe. "Share 1–3 references, or skip." WebFetch public URLs for mood notes (palette words, typography feel, layout density); read images via multimodal. Use as vibes context only — never copy.
4. **Audience & use case** — *sales demo · internal review · client pitch · design exploration*.
5. **Scope** — how many screens, what's the core flow. Drives SPA-vs-multi-page.
6. **Content** — *real (user provides) · realistic placeholder · loose lorem-ish*. Default to realistic placeholder; never actual lorem ipsum.

After answers, confirm a one-paragraph summary before building — the cheap
course-correction point.

## Step 3: Refine the spec

**Detection:** look for `prompt-refiner` in the available-skills list. If present, invoke
it via the Skill tool with the Q&A answers — don't synthesize inline. If absent,
synthesize inline.

The spec must include:
- Product name + one-line pitch
- Tone descriptors (3–5 adjectives)
- Screens list (name + one-line purpose each)
- Primary user flow (sequence of screens)
- Theme names (3 by default, e.g. "studio" / "terminal" / "mono"; 2 if user prefers simple light/dark)
- **Layout variants** — 2–4 chosen for THIS prototype (see "Choosing layouts" below). Never a generic "2col / 3col".
- Content domain for realistic copy
- Notable interactions (modals, tabs, toasts)

### Choosing layouts

Layouts are per-prototype, not a template default. Pick 2–4 that reflect how real
products in the category change information density or view mode. Match the
inspiration gathered in discovery.

| Product type | Good layout options | Why |
|---|---|---|
| Photo-forward marketplace (Airbnb, Etsy) | `grid` / `gallery` / `list` | Grid scans, gallery features visuals, list is dense |
| Content site (blog, editorial) | `reading` / `with-sidebar` | Reading mode vs. navigable |
| Dashboard / tool (Linear, Notion) | `compact` / `comfortable` / `spacious` | Density for different tasks |
| Inbox / messaging | `list-only` / `split-view` / `preview` | View-mode |
| E-commerce catalog | `grid-2` / `grid-3` / `grid-4` | Density in a uniform grid |
| Data tables / analytics | `condensed` / `standard` / `roomy` | Row height density |
| File browser | `grid` / `list` / `details` | Classic OS metaphor |

Rules of thumb:
- **2 options minimum.** One option is no toggle — delete it.
- **4 options maximum.** More is choice paralysis.
- **Use the category's real vocabulary.** "Grid / Gallery / List" beats "Mosaic / Cards / Rows."
- **Make the differences real.** Switching must visibly change rendering, not nudge padding by 4px.
- **Pick from inspiration.** Linear shared → density. Airbnb shared → grid/gallery/list.

## Step 4: Design shaping — write PRODUCT.md + DESIGN.md

Both files live **in the prototype folder** (write them during scaffold, Step 5, once the
folder exists), not globally. Each prototype has its own. You have everything you need from
the spec — write them directly. **Do not run `impeccable teach`**: it's an interactive Q&A
that stalls Quick mode. Writing PRODUCT.md yourself satisfies impeccable's required setup
gate (see Step 7), so the audit can run without it asking to set up context.

### PRODUCT.md (required by impeccable — without it, Step 7's audit silently falls back)

Short but real (>200 chars, no `[TODO]` placeholders). From the spec:

```markdown
# <Product name>

register: product   # "product" for app UI / dashboards / tools; "brand" for landing/pitch pages

## Product purpose
<one-line pitch + what it does>

## Users
<who uses it, their context, what they need — from the audience answer>

## Brand & tone
<the 3–5 tone adjectives, made concrete: voice, density, formality>

## Anti-references
<what it must NOT look like — e.g. "not a consumer toy", "no generic dark-SaaS purple">

## Strategic principles
<2–3 bullets on what good looks like for this product>
```

Pick `register` honestly: most prototypes (dashboards, app shells, tools) are **product**;
a sales pitch page or marketing landing is **brand**. It changes which impeccable reference
(brand vs product) the audit applies.

### DESIGN.md (palette, typography, spacing, motion)

Generate inline with these defaults (or run `$impeccable shape "<spec>"` if impeccable is
loaded — it now finds PRODUCT.md and won't trigger `teach`):
- **Color** — pick the palette for the tone from `reference/color-palettes.md` (OKLCH-tinted neutrals + one accent, each avoiding its category cliché). **Tint every neutral** toward the palette hue (chroma 0.005–0.015); never flat gray, `#000`, or `#fff`. Commit to a strategy (restrained → drenched; most product UI is restrained, accent ≤10%). Dark themes elevate with lighter surfaces, not shadow, and desaturate the accent. Run the **category-reflex check** — finance→navy, health→teal, crypto→neon means rework it.
- **Typography** — choose the pairing for the tone from `reference/type-pairings.md` (curated Google-Fonts pairings, all off the reflex-reject list — never Inter/Roboto/Open Sans/Lato/Montserrat). Commit to the **1.25** scale `16 / 20 / 25 / 31 / 39 / 49` (fixed rem for UI; `clamp()` for the hero only); add a third **mono/utility** family when the product is data- or code-heavy. The scaffold ships the scale tokens + polish (`tabular-nums`, `text-wrap`, optical-sizing, `.eyebrow` tracking) — build on them.
- **Spacing** — 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64.
- **Radius** — 0 / 4 / 8 / 16 across the theme moods.
- **Motion** — ease-out only (`--ease-out-quart` for UI, `--ease-out-expo` for reveals; never `ease`/linear/bounce). Durations 150 / 250 / 400ms (`--motion-fast/-/-slow`), exits ~75% of entrances. Animate transform + opacity only; heights via `grid-template-rows: 0fr→1fr`. `prefers-reduced-motion` is mandatory. Scroll-driven effects (`animation-timeline`) and View Transitions go behind a reduced-motion + Firefox fallback. Pacing by tone: technical/minimal snappy, corporate/editorial calm, playful/bold expressive.
