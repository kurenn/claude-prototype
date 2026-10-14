#!/usr/bin/env python3
"""Regenerate reference/design-index.md from the shadcn.io DESIGN.md directory.

Stores only slug, name and category tags. The files themselves are fetched live,
one at a time, during discovery (reference/discovery.md -> "The design-file index").
shadcn.io's terms forbid bulk scraping and redistribution, so never extend this to
download file contents.

    python3 reference/design-index.py
"""
import collections, json, pathlib, re, urllib.request

SRC = "https://www.shadcn.io/design"
OUT = pathlib.Path(__file__).with_name("design-index.md")

req = urllib.request.Request(SRC, headers={"User-Agent": "Mozilla/5.0"})
html = urllib.request.urlopen(req, timeout=30).read().decode()
# The directory ships as Next.js flight data: JS string literals pushed into __next_f.
payload = "".join(json.loads(f'"{c}"') for c in re.findall(r'self\.__next_f\.push\(\[1,"(.*?)"\]\)', html, re.S))

entries = {}
for m in re.finditer(r'\{"slug":"([^"]+)","name":"([^"]+)"(?:(?!\{"slug").)*?"tags":(\[[^\]]*\])', payload, re.S):
    entries[m.group(1)] = (m.group(2), json.loads(m.group(3)))
if len(entries) < 100:
    raise SystemExit(f"only {len(entries)} entries parsed; the page format probably changed")

tags = collections.Counter(t for _, ts in entries.values() for t in ts)
lines = [
    "# Design-file index — match here, fetch live",
    "",
    f"{len(entries)} DESIGN.md files from {SRC} (slug · name · tags). Contents are **not** stored",
    "here: fetch a matched file from `https://www.shadcn.io/design/<slug>/raw` at build time.",
    "How and when to use this: `reference/discovery.md` → \"The design-file index\".",
    "Regenerate with `python3 reference/design-index.py`. Don't read this whole file — grep it.",
    "",
    "## Tags",
    "",
    *(f"- {t} ({n})" for t, n in tags.most_common()),
    "",
    "## Entries",
    "",
    *(f"{s} · {name} · {'; '.join(ts)}" for s, (name, ts) in sorted(entries.items())),
    "",
]
OUT.write_text("\n".join(lines), encoding="utf-8")
print(f"wrote {OUT} ({len(entries)} entries, {len(tags)} tags)")
