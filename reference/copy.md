# Copy: write like the product, not like a narrator

Read this before writing the first screen (Step 6); run the sweep at the end of Step 7.

The build's words are what the reviewer reads first, so they are the most common way a
prototype gives away that a model made it. Reading eleven builds from the October 2026 A/B
rounds (two briefs) turned up the same tells over and over: sentences that describe the controls ("The price
updates as you go" in four builds), the same reassurance repeated under every heading ("No
guilt trip" in four builds, "Skip, swap or pause any time" several times on one page), paired
rhetorical questions ("Going away? Pause it. Bored of Brazil? Swap it." in six builds), and
copy that talks about the prototype instead of the product. A real product team doesn't write
like that; the user can see the interface, and the brand says a thing once.

## The test

For every sentence that isn't a label, a value or real product content, ask whether the
user could work out what it says from the label, the control or the screen. If they could,
delete it. Explain only what can't be inferred, and say it once.

## Rules

1. **Label, don't narrate.** A button says what it does ("Export CSV"); nothing around it
   describes it. Never "click", "tap", "the button below", "this lets you", "use the filters to".
   GOV.UK: not everyone clicks; Material: don't name the control type.
   ✗ "Tap a coffee to see its tasting notes." ✓ (nothing; the cards are obviously tappable)
2. **Don't describe the interface's behaviour when the user will see it happen.** A live price
   that updates doesn't need "The price updates as you go"; a toggle that unpicks doesn't need
   "Tap again to unpick".
3. **No subtitle that restates its heading.** Microsoft: "don't repeat the main instruction with
   slightly different wording". A heading stands alone unless the line under it adds a fact.
   ✗ "Billing · Manage your billing settings and payment details" ✓ "Billing"
4. **Say a reassurance once, where the worry happens.** "Cancel any time" belongs next to the
   button that commits, not in the hero, the plan cards, the FAQ and the footer.
5. **Put facts in place of adjectives.** "Roasted Tuesday, at your door Thursday" beats "fresh,
   fast and effortless". A date, a number or a name does more than a promise.
6. **Field labels are nouns.** "Email", not "Enter your email address". A hint is one short
   sentence for a format or a constraint ("For example, SW1A 1AA"), never in the placeholder.
7. **Tooltips only for icon-only controls and unfamiliar terms**, never repeating the label.
8. **Buttons name the outcome.** "Pause deliveries" / "Keep my box", not "Submit", "OK",
   "Confirm" or "Let's go!".
9. **Never mention the prototype in product copy.** No "This is a demo, so no card is needed",
   no "The four screens are…". The 404 and the control bar are the only places that may say
   "prototype".
10. **Errors, empty states and irreversible actions are where words earn their place** (below).

## Where explaining is right

- **Errors:** next to the field, what's wrong and how to fix it, without blame. "Use at least 8
  characters", not "Invalid password".
- **Empty states:** one sentence plus the action. "No invoices match *Overdue*." + Clear filter.
- **Irreversible or costly actions:** a confirm that names the object and the consequence, with
  outcome buttons ("Cancel subscription" / "Keep it"). Routine actions get no confirm.
- **Format and constraints** the user must meet (size limits, accepted files, cutoffs, fees).
- **Domain terms** the user may not know, defined once, close to first use.

## Voice tells to cut

Flagged by Wikipedia's "Signs of AI writing" list and the GOV.UK, Microsoft and Mailchimp
style guides, and seen in our own builds:

- **Words:** seamless(ly), effortless(ly), unlock, supercharge, elevate, empower, leverage,
  robust, delve, crucial, pivotal, tailored, curated, vibrant, journey, "with ease", "in just a
  few clicks", "please note", "you can".
- **Shapes:** "Whether you're X or Y", "Not just X, but Y", "No X, no Y, just Z", rhetorical
  question + answer pairs, three short adjectives in a row, sentences ending in ", ensuring…",
  a spaced em dash where a full stop would do.
- **Stock lines:** "No guilt trip", "no 'are you sure?' maze", "We'll wait", "We won't judge",
  "Here's what you need to know", "Oops!".
- **Every-section scaffolding:** an eyebrow over every heading, a subtitle under every heading,
  a "How it works" row of three numbered steps.

One deliberate line of brand voice per screen is fine; it reads as voice because it's alone.

## Sweep (end of Step 7)

Run it whichever assessor ran; neither impeccable nor builtin-lint checks wording.

```
grep -rniE "\b(click|tap) (the|on|here|below|a|an|any|again)\b|\bthis (button|page|screen|section) (lets|will|shows)|updates as you|as you go\b|\byou can (always|easily|also)\b|no guilt|are you sure\?.{0,3} maze|seamless|effortless|whether you'?re|here'?s (what|how)|\bunlock|supercharge|\belevate (your|the|every)|empower|leverag|\brobust|\bdelve|\bcrucial|in just a few|with ease|please note|this is a (demo|prototype)|of this prototype" <prototype>/ --include="*.html"
grep -rc " — " <prototype>/ --include="*.html"
```

Then read every screen's non-label text once, top to bottom, applying the test above. Fix by
deleting first and rewriting second. Record the count of lines cut in `LINT.md`.
