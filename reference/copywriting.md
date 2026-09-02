# Copywriting — content that reads shipped, not generated

Color and type have doctrine files. Copy didn't — so `SKILL.md`'s "Never lorem ipsum"
constraint named the goal with nothing behind it. This is that missing half. Anthropic's own
`frontend-design` skill puts the stake plainly: *"Copy can make a design feel as templated as
the design itself."*

## The inversion — read this first

Every copywriting guide you have ever seen optimizes **persuasion for a real business**. This
is a different job: **verisimilitude for a product that does not exist**. The two invert on the
central question — real marketing forbids inventing numbers; a prototype *requires* it. There
is no customer to mislead. There is a reviewer deciding, in about four seconds, whether this
looks like a product or a mockup.

**Reviewers scan names, numbers, and dates before they read a sentence.** A perfect layout
carrying `$1,000.00`, `Acme Corp`, and `John Doe` reads as fake instantly. Sloppy copy is a
faster tell than sloppy design, and it is the cheaper one to fix.

## How the skill uses this

1. Discovery Step 6 captures the **content domain**; Step 3's spec records it.
2. Before writing screens (build.md Step 6), read §1 and §2 — they govern every surface.
3. Pick the voice for the prototype's **register** from §3 (`product` or `brand` — the same
   register already recorded in `PRODUCT.md`).
4. Run §4's banned list over what you wrote. `checks/builtin-lint.md` rule 39 greps it.

---

## §1 Data realism — the part that actually gives it away

This governs `js/data.js` and every table, card, feed, and stat in the build. It is the highest
-leverage section in this file, because it covers the surfaces copywriting advice never does.

**Numbers must not be round.** `$1,000` is a placeholder; `$1,847.20` is a transaction. Invoice
totals, balances, durations, and counts all carry the fingerprints of arithmetic that actually
happened. Round numbers survive only where a human chose them — a `$29/mo` price, a `50 GB`
tier, a `10`-seat plan.

**Distributions must be lumpy.** Real lists are not evenly spaced. Most rows cluster; a few are
outliers. Three invoices at `$2,400`, `$2,500`, `$2,600` is a generated sequence. `$412.50`,
`$2,480.00`, `$18.99`, `$2,391.75` is a ledger. The same holds for dates: activity bunches on
weekdays and business hours, then goes quiet — not one event neatly per day.

**Names must have range.** A list where everyone is `Sarah Chen` / `Michael Rodriguez` /
`Priya Patel` is its own monoculture — the diversity is real but the *rhythm* is uniform, three
tokens of equal length, every name plausible-American-corporate. Mix name lengths, include
mononyms and hyphenates, let some rows be a company rather than a person, and let one or two be
slightly awkward the way real directories are. Extends `builtin-lint.md` rule 12.

**Internal consistency is non-negotiable.** This is the failure reviewers catch and never
mention — they just stop believing the screen:
- Totals sum. If the table lists five line items, the footer equals their sum.
- Badge counts match list lengths. A `3` on the notifications bell means three items in the tray.
- Avatar initials match the name beside them.
- Statuses agree with dates — nothing is `Delivered` with a future ship date.
- Cross-screen: a customer on the dashboard exists on the customers screen, spelled the same.

**Invent a coherent ecosystem, not scattered nouns.** The vendors, integrations, and customers
across a prototype should feel like they come from one world. Invent them — do not borrow real
trademarks for anything that implies a relationship (a logo wall of real companies is a legal
problem and a credibility one; real *integration* names like "Slack" or "Stripe" are fine when
the product plausibly integrates with them). Give invented companies the texture real ones have:
`Northwind Freight`, `Bellhaus Interiors`, `K2 Analytics` — not `Company A` or `TechCorp`.

**Dates cluster near now.** Recent activity within days, history trailing off over months. See
`builtin-lint.md` rule 13.

---

## §2 Never lorem ipsum — and never lorem's better-dressed cousin

Actual `lorem ipsum` is an obvious fail. The subtler version is **domain-shaped filler**: text
that matches the domain's vocabulary while saying nothing.

> *"Streamline your workflow with powerful tools designed for modern teams."*

That sentence fits any product ever built. If the headline still makes sense after swapping the
product for a different one, it is filler. Three tests, distilled from Harry Dry
(marketingexamples.com/landing-page/guide):

- **Visualizable** — can the reader picture it? *"Cut invoice approval from 3 days to 20 minutes"*
  beats *"accelerate your finance workflows"*.
- **Falsifiable** — could it be untrue? If not, it is decoration.
- **Unique** — could a competitor put it on their page unchanged? Then it is not yours.

---

## §3 Voice by register

The register is already recorded in `PRODUCT.md`. It decides the voice completely.

### `product` — in-app surfaces (dashboards, tools, consoles)

Terse, verb-first, sentence case. The interface is a tool, not a host.

- **Buttons say what happens**: `Approve invoice`, not `Submit` or `Click here`. Verb + object.
- **Sentence case everywhere.** Title Case On Buttons reads like a 2014 template.
- **No exclamation points.** None. `Saved` — not `Saved!`
- **Labels stay visible.** Placeholder-only labels vanish on focus and fail a11y; never use a
  placeholder as the only label.
- **Errors say what to do**, scoped to what failed: *"Card ending 4471 was declined — try another
  card"*, not *"An error occurred"*.
- **Empty states differ by cause** — first-run, no-results, and cleared are three different
  messages. `build.md` → "The state matrix" owns this; don't restate it, satisfy it.

### `brand` — landing, pitch, marketing pages

Here headline craft applies. Formulas distilled from `marketing-skills/copywriting`
(coreyhaines31/marketingskills, MIT) — **rotate them; a menu of one produces a monoculture**,
the same rule `type-pairings.md` applies to fonts:

| Shape | Pattern |
|---|---|
| Outcome | *{desirable outcome} without {pain point}* |
| Problem | *Never {unpleasant event} again* |
| Audience | *{Product type} for {specific audience}* |
| Differentiation | *The {opposite of the usual process} way to {outcome}* |
| Proof | *{Number} {people} use {product} to {outcome}* |
| Plain | *The simple way to {outcome}* |

Subhead does the work the headline skipped: how it works, in one sentence. CTA is
verb + what they get — `Start free trial` beats `Sign up`, `Get the report` beats `Submit`.

---

## §4 Banned vocabulary — the copy-side gradient

`SKILL.md` bans generic gradients as the #1 visual AI tell. This is the verbal equivalent, and
it is just as recognizable. Merged from `marketing-skills` `offers` and `copy-editing` (MIT).

**Never ship these:**

`game-changing` · `revolutionary` · `disruptive` · `next-level` · `10x` · `supercharge` ·
`seamless` / `seamlessly` · `leverage` (as a verb) · `utilize` · `unlock the power of` ·
`take it to the next level` · `robust` · `cutting-edge` · `best-in-class` · `elevate your` ·
`empower your team` · `in today's fast-paced world` · `we're on a mission to`

**Swap in:** `utilize → use` · `leverage → use` · `seamless → smooth` (or delete it) ·
`robust → reliable` · `empower → let`.

**And the structural tells**, which survive any word swap:
- Sentence fragments for drama. Like this. Every third line.
- `It's not just X — it's Y.` and `X isn't about Y. It's about Z.`
- Rule-of-three lists where the third item is a vibe: *"faster, cheaper, and more human."*
- Opening a section with a rhetorical question the copy then answers.

---

## §5 Microcopy inventory — the surfaces that get forgotten

A prototype is judged on its edges. Write these deliberately rather than defaulting:

| Surface | Rule |
|---|---|
| Toasts | State the outcome, not the action: `Invoice sent to Northwind Freight` |
| Table empty cells | `—`, never blank, never `N/A` scattered inconsistently |
| Notification items | Who did what to which object, plus relative time: *"Dana approved INV-2214 · 2h ago"* |
| Tooltips | Explain the non-obvious; never restate a visible label |
| Form help text | Say the constraint before the error fires |
| Confirm dialogs | Name the object and the consequence: `Delete 3 invoices? This can't be undone.` |
| Loading / skeletons | No text. A skeleton that says "Loading…" is two loading indicators |
| Page titles | `<Screen> · <Product>` — reviewers see them in the tab strip and in screenshots |

---

## Attribution

Headline formulas, banned vocabulary, and specificity upgrades distilled from
[marketing-skills](https://github.com/coreyhaines31/marketingskills) (MIT). Copy tests distilled
from Harry Dry's [landing page guide](https://marketingexamples.com/landing-page/guide). The
framing quote is from Anthropic's `frontend-design` skill
([anthropics/skills](https://github.com/anthropics/skills)). Vendored and adapted rather than
depended on — those skills target persuasion for real products, which is the opposite of the job
here.
