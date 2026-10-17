# claude-prototype — project site

register: brand   # a landing page plus a reference library, for people deciding whether to install

## Product purpose
The public site for /prototype, a Claude Code skill that builds clickable, zero-dependency HTML
prototypes. The landing page is one screen, after opensop.ai's simplicity: what the skill is, how to
install it, five points and three links; the design-file library shows the 84 real-brand DESIGN.md files the skill
reads, one page per file with its palette, type and components drawn live.

## Users
Developers and designers who use Claude Code, landing from GitHub or a shared link, deciding in
under a minute whether the skill is worth installing. Some come back to the library to pick a
brand's design file for a brief, copy it, or check its free fonts.

## Brand & tone
Clean, minimal, exact, calm. Quiet like a well-set technical paper rather than a product launch:
white space, hairlines, one family in weights only, monospace for anything technical. Confident
without hype; every claim is a checked number or a working demo.

## Anti-references
- Not generic AI-made dev landing: no purple/blue gradients, no glassmorphism, no centered Inter
  hero, no "Modern solutions for modern teams" copy.
- Not a brand knockoff: the library describes other companies' design files, so it must never
  look like it is one of those brands, use their logos, or imply affiliation.
- Not loud: one accent, spent as a fill, a couple of times per page.

## Strategic principles
- Show, don't claim: the page is itself a prototype built by the skill, and its margin notes
  explain its own design decisions.
- Credit sources visibly: VoltAgent/awesome-design-md on every library page, not only in a footer.
- Nothing depends on another site at runtime except fonts and Tailwind's CDN.
