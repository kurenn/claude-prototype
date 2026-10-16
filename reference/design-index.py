#!/usr/bin/env python3
"""Vendor VoltAgent/awesome-design-md (MIT) into reference/designs/ and regenerate
reference/design-index.md from it.

Pinned to one upstream commit so the files only change when we choose to re-vendor.
The build itself never touches the network: discovery reads reference/designs/<slug>.md.
Afterwards it runs design-pages.py, which refreshes the site copy in docs/designs/.

    python3 reference/design-index.py            # re-vendor the pinned commit
    python3 reference/design-index.py <sha>      # move the pin to another commit
"""
import collections, io, pathlib, re, runpy, sys, tarfile, urllib.request

REPO = "VoltAgent/awesome-design-md"
SHA = sys.argv[1] if len(sys.argv) > 1 else "3b605329240ce735b510037cca322f1831fdd7f8"
HERE = pathlib.Path(__file__).parent
DEST = HERE / "designs"
SLUG = re.compile(r"^[a-z0-9][a-z0-9.\-]*$")  # folder names become file names: no paths

blob = urllib.request.urlopen(f"https://codeload.github.com/{REPO}/tar.gz/{SHA}", timeout=60).read()
files, readme, license_ = {}, "", ""
with tarfile.open(fileobj=io.BytesIO(blob)) as tar:  # read members by name; never extractall
    for m in tar.getmembers():
        parts = m.name.split("/")[1:]
        if not m.isfile():
            continue
        if parts == ["README.md"]:
            readme = tar.extractfile(m).read().decode()
        elif parts == ["LICENSE"]:
            license_ = tar.extractfile(m).read().decode()
        elif len(parts) == 3 and parts[0] == "design-md" and parts[2] == "DESIGN.md" and SLUG.match(parts[1]):
            files[parts[1]] = tar.extractfile(m).read().decode()
if len(files) < 50 or "MIT License" not in license_:
    raise SystemExit(f"{len(files)} files, license ok={'MIT License' in license_}: upstream layout changed")

# Category, name and one-line description come from the upstream README's collection list.
meta, cat = {}, "Uncategorized"
for line in readme.splitlines():
    if line.startswith("### "):
        cat = line[4:].strip()
    elif m := re.match(r"- \[\*\*(.+?)\*\*\]\(https://getdesign\.md/([^/]+)/design-md\) - (.+)", line):
        meta[m.group(2)] = (m.group(1), cat, m.group(3).strip())

DEST.mkdir(exist_ok=True)
for old in DEST.glob("*.md"):
    old.unlink()
for slug, text in files.items():
    (DEST / f"{slug}.md").write_text(text, encoding="utf-8")
(DEST / "LICENSE").write_text(license_, encoding="utf-8")

rows = {s: meta.get(s, (s, "Uncategorized", "")) for s in files}
cats = collections.Counter(c for _, c, _ in rows.values())
lines = [
    "# Design-file index — grep here, read locally",
    "",
    f"{len(files)} real-brand DESIGN.md files, vendored from [{REPO}](https://github.com/{REPO})",
    f"at `{SHA[:7]}` (MIT, © VoltAgent — see `reference/designs/LICENSE`). Each one lives at",
    "`reference/designs/<slug>.md`; nothing is fetched at build time. Format: `slug · name · category · summary`.",
    "How and when to use this: `reference/discovery.md` → \"The design-file index\".",
    "Re-vendor with `python3 reference/design-index.py [<sha>]`. Grep this file; don't read it whole.",
    "",
    "## Categories",
    "",
    *(f"- {c} ({n})" for c, n in cats.most_common()),
    "",
    "## Entries",
    "",
    *(f"{s} · {n} · {c} · {d}" for s, (n, c, d) in sorted(rows.items())),
    "",
]
(HERE / "design-index.md").write_text("\n".join(lines), encoding="utf-8")
print(f"vendored {len(files)} files at {SHA[:7]}; {len(cats)} categories")

# The site serves its own copy of the files (GitHub Pages only serves docs/).
runpy.run_path(str(HERE / "design-pages.py"), run_name="__main__")
