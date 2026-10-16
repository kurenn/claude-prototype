#!/usr/bin/env python3
"""Derive the site's design-file pages from reference/designs/ (run after design-index.py).

GitHub Pages only serves docs/, so this writes docs/designs/<slug>.md (a copy, for view and
download), docs/designs/<slug>.json (parsed tokens for the preview) and docs/designs/index.json
(the library). The only network use is checking which fonts Google Fonts serves. Re-run whenever reference/designs/ changes:

    python3 reference/design-pages.py
"""
import json, pathlib, re, shutil, urllib.error, urllib.parse, urllib.request

HERE = pathlib.Path(__file__).parent
SRC = HERE / "designs"
OUT = HERE.parent / "docs" / "designs"
HEX = re.compile(r"#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b")
GENERIC = {"serif", "sans-serif", "monospace", "system-ui", "cursive", "ui-monospace", "ui-sans-serif"}


def frontmatter(text):
    """The YAML subset these files use: nested maps by indentation, scalar values."""
    if not text.startswith("---\n"):
        return {}
    body = text[4:text.find("\n---", 4)]
    root, stack = {}, [(-1, {})]
    stack[0] = (-1, root)
    for line in body.splitlines():
        if not line.strip() or line.lstrip().startswith("#") or ":" not in line:
            continue
        indent = len(line) - len(line.lstrip())
        key, _, val = line.strip().partition(":")
        while stack[-1][0] >= indent:
            stack.pop()
        parent = stack[-1][1]
        val = val.strip()
        if val == "":
            parent[key] = {}
            stack.append((indent, parent[key]))
        else:
            parent[key] = val.strip('"').strip("'")
    return root


def section(text, title_re, level=2):
    """Body of the first heading at `level` whose title matches, up to the next heading at that level."""
    hashes = "#" * level
    m = re.search(rf"^{hashes} (?:\d+\.\s*)?{title_re}[^\n]*\n", text, re.M | re.I)
    if not m:
        return ""
    end = re.search(rf"^#{{1,{level}}} ", text[m.end():], re.M)
    return text[m.end(): m.end() + end.start()] if end else text[m.end():]


def prose_colors(text):
    """`- **Name** (… #hex …): role` bullets under the Colors section, grouped by ### heading."""
    out, group = [], "Colors"
    for line in section(text, r"Colou?r").splitlines():
        if line.startswith("### "):
            group = line[4:].strip()
        elif m := re.match(r"- \*\*(.+?)\*\*\s*(\(.*?\))?\s*[:—–-]\s*(.*)", line):
            hx = HEX.search(m.group(2) or "") or HEX.search(line)
            tok = re.search(r"\{colors\.([\w-]+)\}", line)
            if hx:
                out.append({"name": m.group(1), "hex": hx.group(0).lower(), "group": group,
                            "token": tok.group(1) if tok else None, "role": m.group(3).strip()})
    return out


_free = {}
def is_free(fam):
    """Is `fam` served by Google Fonts? One request per family, at generation time only."""
    if fam not in _free:
        url = "https://fonts.googleapis.com/css2?family=" + urllib.parse.quote_plus(fam)
        try:
            urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=15)
            _free[fam] = True
        except urllib.error.HTTPError:
            _free[fam] = False  # 400 = no such family
    return _free[fam]


def preview_font(stack, note):
    """The face to preview a role in: the stack's lead family if free, else the first free bold
    name the substitutes note gives after mentioning it, else the next free family in the stack."""
    fams = [f.strip().strip('"\'') for f in stack.split(",") if f.strip() and f.strip().lower() not in GENERIC]
    if not fams:
        return None
    if is_free(fams[0]):
        return fams[0]
    base = re.sub(r"[-\s]?(var|variable|vf)$", "", fams[0], flags=re.I)  # "sohne-var" → "sohne"
    i = note.lower().find(base.lower())
    if i >= 0:
        rest = note[i + len(base):]
        rest = rest[2:] if rest.startswith("**") else rest  # the family itself was bold
        for cand in re.findall(r"\*\*([^*]+?)\*\*", rest):
            if is_free(cand.strip()):
                return cand.strip()
    return next((f for f in fams[1:] if is_free(f)), None)


def resolve(val, fm):
    """Swap token references for their values: a whole `{typography.button}` becomes that dict;
    references inside a longer value (`1px solid {colors.hairline}`) are substituted in place."""
    if not isinstance(val, str):
        return val
    if m := re.fullmatch(r"\{(\w+)\.([\w-]+)\}", val.strip()):
        return fm.get(m.group(1), {}).get(m.group(2), val)
    return re.sub(r"\{(\w+)\.([\w-]+)\}",
                  lambda m: str(fm.get(m.group(1), {}).get(m.group(2), m.group(0))), val)


def page(slug, text, meta, sha):
    fm = frontmatter(text)
    typo = {role: props for role, props in fm.get("typography", {}).items() if isinstance(props, dict)}
    note = section(text, r"Note on Font Substitutes", 3).strip()
    hints = note or section(text, r"Typography")  # many files name substitutes in the type prose
    subs = {}
    for props in typo.values():
        stack = props.get("fontFamily", "")
        props["preview"] = preview_font(stack, hints)
        lead = stack.split(",")[0].strip().strip('"\'')
        if lead and props["preview"] and props["preview"] != lead:
            subs[lead] = props["preview"]
    components = {name: {k: resolve(v, fm) for k, v in spec.items()}
                  for name, spec in fm.get("components", {}).items() if isinstance(spec, dict)}
    name, category, summary = meta
    if name == slug:  # not in upstream's list (e.g. slack): derive what we can from the file
        name = slug.replace("-", " ").title()
    summary = summary or re.split(r"(?<=\.)\s", str(fm.get("description", "")).strip())[0]
    return {
        "slug": slug, "name": name, "category": category, "summary": summary,
        "description": fm.get("description", ""),
        "colors": prose_colors(text) or [{"name": k, "hex": v.lower(), "group": "Colors", "token": k, "role": ""}
                                         for k, v in fm.get("colors", {}).items() if isinstance(v, str) and HEX.fullmatch(v)],
        "tokens": {k: fm.get(k, {}) for k in ("colors", "rounded", "spacing")},
        "typography": typo, "substitutes": subs, "substitutesNote": note,
        "components": components, "structured": bool(fm),
        "source": f"https://github.com/VoltAgent/awesome-design-md/blob/{sha}/design-md/{slug}/DESIGN.md",
    }


def main():
    index, idx_text = {}, (HERE / "design-index.md").read_text(encoding="utf-8")
    sha = re.search(r"at `([0-9a-f]{7,40})`", idx_text).group(1)  # the pinned upstream commit
    for line in idx_text.splitlines():
        parts = line.split(" · ")
        if len(parts) >= 4 and not line.startswith(("-", "#")):  # a category may itself contain " · "
            index[parts[0]] = (parts[1], " · ".join(parts[2:-1]), parts[-1])
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    library = []
    for md in sorted(SRC.glob("*.md")):
        slug = md.stem
        data = page(slug, md.read_text(encoding="utf-8"), index.get(slug, (slug, "Uncategorized", "")), sha)
        shutil.copyfile(md, OUT / md.name)
        (OUT / f"{slug}.json").write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
        library.append({k: data[k] for k in ("slug", "name", "category", "summary")} |
                       {"swatches": [c["hex"] for c in data["colors"]][:6]})
    shutil.copyfile(SRC / "LICENSE", OUT / "LICENSE")
    (OUT / "index.json").write_text(json.dumps(library, ensure_ascii=False), encoding="utf-8")
    print(f"wrote {len(library)} pages to {OUT}")


if __name__ == "__main__":
    main()
