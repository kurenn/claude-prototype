#!/usr/bin/env bash
# test-ensure-deps.sh — sandbox test for companion-skill detection.
#
# The bug this pins: `npx skills add --global` installs into ~/.agents/skills, which
# Claude Code does not load. A skill installed there is present but never invocable, so
# /prototype silently falls back to builtin-lint while preflight reports success.
#
# Runs against a throwaway HOME — never touches the real one. Read-only wrt the repo.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

REPO="$PWD"
SANDBOX="$(mktemp -d)"
trap 'rm -rf "$SANDBOX"' EXIT
fail=0
note() { printf '  ✗ %s\n' "$1"; fail=1; }

# A skill installed ONLY in the root Claude Code does not read.
mkdir -p "$SANDBOX/.agents/skills/impeccable"
printf -- '---\nname: impeccable\ndescription: x\n---\n' > "$SANDBOX/.agents/skills/impeccable/SKILL.md"

out="$(HOME="$SANDBOX" bash "$REPO/ensure-deps.sh" --check 2>&1)"

echo "$out" | grep -q 'impeccable — installed' \
  && printf '  ✓ detects a skill installed in the non-loadable root\n' \
  || note "did not detect impeccable: $out"

link="$SANDBOX/.claude/skills/impeccable"
if [ -L "$link" ] && [ -e "$link/SKILL.md" ]; then
  printf '  ✓ links it into ~/.claude/skills so the Skill tool can load it\n'
else
  note "no usable symlink at ~/.claude/skills/impeccable — the skill would stay uninvocable"
fi

# Idempotent: a second run must not fail or stack symlinks.
HOME="$SANDBOX" bash "$REPO/ensure-deps.sh" --check >/dev/null 2>&1
[ -e "$link/SKILL.md" ] \
  && printf '  ✓ re-runnable without breaking the link\n' \
  || note "second --check run broke the link"

# A genuinely absent companion must still report missing. Capture first, then grep:
# --check exits 1 by design when something is missing, and under `pipefail` that exit
# would propagate through a successful grep (the check-overflow.sh bug, again).
EMPTY="$(mktemp -d)"
out2="$(HOME="$EMPTY" bash "$REPO/ensure-deps.sh" --check 2>&1 || true)"
rm -rf "$EMPTY"
if printf '%s' "$out2" | grep -q 'impeccable — MISSING'; then
  printf '  ✓ still reports a genuinely absent companion\n'
else
  note "absent companion not reported missing: $out2"
fi

echo "──────────────────────────────────────────────"
[ "$fail" -eq 0 ] && echo "  PASS — companion detection works across both roots" || echo "  FAIL"
exit "$fail"
