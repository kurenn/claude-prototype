#!/usr/bin/env bash
# consistency.sh — cheap guards against the three drifts this repo actually accumulates.
# No browser, no Claude run, no network: safe to run on every push.
#
#   1. Markdown citing a repo path that no longer exists.
#   2. benchmark/score-output.sh scoring an older scaffold than templates/ ships.
#   3. docs/ (a hand-maintained prototype) forking the files it must share with templates/.
#
# Read-only. Exit 1 if any check fails.
#
# Deliberately NOT `set -e`: every check should report before the script exits, which is
# the same failure mode check-overflow.sh had (a bare `set -e` swallowing the diagnosis).
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

fail=0
note() { printf '  ✗ %s\n' "$1"; fail=1; }

# ── 1. Every repo path cited in the living docs exists ─────────────────────
# CHANGELOG.md and benchmark/results/ are excluded on purpose: they are historical
# records and are expected to name files that have since moved or been deleted.
# Candidates ending in `-` are dropped: they are truncated placeholder paths such as
# `benchmark/results/design-ab-<date>.md`, where the regex stops at the `<`.
echo "1. Cited paths exist"
cited=$(grep -rhoE '(reference|templates|checks|benchmark|design-lab)/[A-Za-z0-9._/-]+' \
          SKILL.md README.md CONTRIBUTING.md reference/*.md checks/*.md \
          benchmark/README.md benchmark/rebench.md benchmark/design-judge.md \
        | sed 's/[.,:;)]*$//' | grep -v -- '-$' | sort -u)
missing=0
while IFS= read -r ref; do
  [ -z "$ref" ] && continue
  [ -e "$ref" ] || { note "$ref — cited in markdown, does not exist"; missing=$((missing + 1)); }
done <<< "$cited"
[ "$missing" -eq 0 ] && printf '  ✓ %s cited paths all resolve\n' "$(printf '%s\n' "$cited" | wc -l | tr -d ' ')"

# ── 2. score-output.sh scores the scaffold that templates/ actually ships ──
# The benchmark silently stops covering a feature when a new js/ file is added and this
# list is not: a prototype missing the whole motion tier once scored 100% on Tier 1.
echo "2. Benchmark covers every scaffold script"
want_present=$( { for f in templates/scaffold-base/js/*.js; do basename "$f" .js; done; echo feedback; } | sort | tr '\n' ' ')
got_present=$(sed -n "s/^for j in \(.*\); do$/\1/p" benchmark/score-output.sh | tr ' ' '\n' | sort | tr '\n' ' ')
if [ "$want_present" = "$got_present" ]; then
  printf '  ✓ presence list matches templates/scaffold-base/js/\n'
else
  note "score-output.sh presence list is stale: has [$got_present] want [$want_present]"
fi

# Body scripts only — js/vt.js loads in <head>, before Tailwind, and is excluded by design.
want_order=$(sed -n '/<body/,$p' templates/scaffold-base/index.html \
             | grep -oE 'src="js/[a-z]+\.js"' | sed -E 's#src="js/##; s#\.js"##' | tr '\n' ' ' | sed 's/ $//')
got_order=$(sed -n "s/^order='\(.*\)'$/\1/p" benchmark/score-output.sh)
if [ "$want_order" = "$got_order" ]; then
  printf '  ✓ load order matches templates/scaffold-base/index.html\n'
else
  note "score-output.sh order is stale: has [$got_order] want [$want_order]"
fi

got_alt=$(grep -oE "src=\"js/\(([a-z|]+)\)" benchmark/score-output.sh | sed -E 's#.*\(##; s#\)$##' | tr '|' '\n' | sort | tr '\n' ' ')
want_alt=$(printf '%s\n' "$want_order" | tr ' ' '\n' | sort | tr '\n' ' ')
if [ "$got_alt" = "$want_alt" ]; then
  printf '  ✓ load-order regex covers the same scripts\n'
else
  note "score-output.sh order regex is stale: has [$got_alt] want [$want_alt]"
fi

# ── 3. docs/ has not forked the files it shares with templates/ ────────────
# docs/ is a real generated prototype (the GitHub Pages front page), so most of it is
# expected to differ. These files carry no per-prototype customization — when they drift,
# a scaffold fix has landed in only one of the two copies.
echo "3. docs/ shares unmodified scaffold files"
shared_ok=1
for f in js/state.js js/vt.js serve.py; do
  cmp -s "docs/$f" "templates/scaffold-base/$f" \
    || { note "docs/$f has diverged from templates/scaffold-base/$f"; shared_ok=0; }
done
cmp -s docs/js/feedback.js templates/feedback-overlay/feedback.js \
  || { note "docs/js/feedback.js has diverged from templates/feedback-overlay/feedback.js"; shared_ok=0; }
[ "$shared_ok" -eq 1 ] && printf '  ✓ 4 shared files identical\n'

# ── 4. Nothing hardcodes a companion skill's install root ─────────────────
# The roots live once, in ensure-deps.sh (SKILL_ROOTS); everything else resolves a
# companion with `ensure-deps.sh --path=<skill>`. A hardcoded root silently breaks
# under the other installer — reference/assess.md pointed at ~/.agents/skills while
# preflight only searched ~/.claude/skills, so impeccable reinstalled every run.
# CHANGELOG.md and benchmark/results/ are excluded as historical records.
echo "4. No hardcoded companion skill roots"
stray=$(grep -rln '\.agents/skills' --include='*.md' --include='*.sh' --include='*.yml' . 2>/dev/null \
        | grep -vE '^\./(ensure-deps\.sh|checks/consistency\.sh|CHANGELOG\.md|benchmark/results/)' || true)
if [ -z "$stray" ]; then
  printf '  ✓ resolved via ensure-deps.sh --path, not hardcoded\n'
else
  while IFS= read -r f; do
    note "$f hardcodes a skills root — resolve it with ensure-deps.sh --path=<skill>"
  done <<< "$stray"
fi

echo "──────────────────────────────────────────────"
if [ "$fail" -eq 0 ]; then echo "  PASS — repo is internally consistent"; else echo "  FAIL — see above"; fi
exit "$fail"
