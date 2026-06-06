#!/usr/bin/env bash
# Score a generated prototype against the skill's own promises.
#
# Objective, automatable checks derived from SKILL.md's non-negotiable constraints
# and checks/builtin-lint.md. This does NOT replace impeccable / human review — it's
# the regression floor: a number you can track across skill changes to prove that a
# refactor didn't quietly make the OUTPUT worse while making the skill leaner.
#
# Usage:
#   benchmark/score-output.sh <prototype-dir> [--json]
#
# Exit code: 0 if score >= PASS_THRESHOLD (default 80), else 1.

set -u

DIR="${1:-}"
JSON=false
[ "${2:-}" = "--json" ] && JSON=true
PASS_THRESHOLD="${PASS_THRESHOLD:-80}"

if [ -z "$DIR" ] || [ ! -d "$DIR" ]; then
  echo "usage: $0 <prototype-dir> [--json]" >&2
  exit 2
fi

score=0
max=0
declare -a RESULTS=()

# check <points> <name> <pass:0|1> <detail>
check() {
  local pts="$1" name="$2" ok="$3" detail="${4:-}"
  max=$((max + pts))
  local got=0 mark="✗"
  if [ "$ok" -eq 1 ]; then got=$pts; mark="✓"; fi
  score=$((score + got))
  RESULTS+=("$mark|$pts|$got|$name|$detail")
}

# helpers
exists()      { [ -e "$DIR/$1" ] && echo 1 || echo 0; }
# grep_absent: 1 (pass) when pattern is NOT found
grep_absent() { if grep -rqiE "$1" "$DIR" --include='*.html' --include='*.css' 2>/dev/null; then echo 0; else echo 1; fi; }
# grep_present: 1 (pass) when pattern IS found
grep_present(){ if grep -rqE "$1" "$DIR" 2>/dev/null; then echo 1; else echo 0; fi; }

html_pages() { find "$DIR" -maxdepth 1 -name '*.html' 2>/dev/null; }

# --- Structure: the eight JS files + platform files (the stale-tree bug class) ---
for j in state theme layout data persona ui app feedback; do
  check 2 "js/$j.js present" "$(exists js/$j.js)" ""
done
check 3 "serve.py present"        "$(exists serve.py)"        "no-cache dev server"
check 2 "404.html present"        "$(exists 404.html)"        ""
check 2 "css/styles.css present"  "$(exists css/styles.css)"  ""
check 2 "css/feedback.css present" "$(exists css/feedback.css)" ""
check 3 "DESIGN.md present"       "$(exists DESIGN.md)"       ""
check 3 "DEMO.md present"         "$(exists DEMO.md)"         "presenter handoff"
check 3 "README.md present"       "$(exists README.md)"      ""

# --- Control bar: visible, segmented, never-wraps ---
pages_total=0; pages_with_bar=0
while IFS= read -r p; do
  [ -z "$p" ] && continue
  [ "$(basename "$p")" = "404.html" ] && continue   # error page is exempt
  pages_total=$((pages_total + 1))
  grep -q 'id="proto-controls"' "$p" && pages_with_bar=$((pages_with_bar + 1))
done < <(html_pages)
bar_ok=0; [ "$pages_total" -gt 0 ] && [ "$pages_with_bar" -eq "$pages_total" ] && bar_ok=1
check 8 "control bar on every page" "$bar_ok" "$pages_with_bar/$pages_total pages"
check 6 "control bar is segmented (all options shown)" "$(grep_present 'data-(theme|layout|persona)-option')" "not a cycling pill"
check 6 "control bar never wraps (flex-wrap:nowrap)" "$(grep_present 'flex-wrap:[[:space:]]*nowrap')" "load-bearing"
check 4 "feedback toggle present"   "$(grep_present 'data-feedback-toggle')" "always-on feedback"
check 3 "share button present"      "$(grep_present 'data-share')" "URL share"

# --- Three-dimensional runtime switching ---
check 3 "theme switching wired"   "$(grep_present 'data-theme=')"   ""
check 3 "layout switching wired"  "$(grep_present 'data-layout=')"  ""
check 3 "persona switching wired" "$(grep_present 'data-persona=')" ""

# --- Interaction states ---
check 4 "loading states (data-loading)" "$(grep_present 'data-loading')" ""
check 4 "toasts (data-toast or UI.toast)" "$(grep_present 'data-toast|UI\.toast')" ""
check 4 "empty state present" "$(grep_present 'empty-state')" ""
check 3 "skeleton loaders present" "$(grep_present 'skeleton|fakeLoad')" ""

# --- Anti-slop content rules (from builtin-lint) ---
check 6 "no lorem ipsum"            "$(grep_absent 'lorem ipsum|dolor sit amet')" ""
check 4 "no placeholder names"      "$(grep_absent 'John Doe|Jane Doe|User [0-9]+|Example Corp')" ""
check 6 "no purple gradients"       "$(grep_absent 'from-(purple|violet|fuchsia|pink)|linear-gradient[^;]*(purple|violet)')" "#1 AI tell"

# --- No build tooling (load-bearing for 'anyone can run it') ---
nobuild=1
{ [ -e "$DIR/package.json" ] || [ -d "$DIR/node_modules" ] || ls "$DIR"/vite.config.* >/dev/null 2>&1; } && nobuild=0
check 5 "no build tooling" "$nobuild" "Tailwind CDN only"

# --- Accessibility floor: imgs have alt ---
imgnoalt=$(grep -rEho '<img[^>]*>' "$DIR" --include='*.html' 2>/dev/null | grep -vcE 'alt=' )
imgalt_ok=1; [ "${imgnoalt:-0}" -gt 0 ] && imgalt_ok=0
check 3 "all <img> have alt" "$imgalt_ok" "${imgnoalt:-0} missing"

# --- Dead-end soft signal: bare href="#" count ---
bare=$(grep -rho 'href="#"' "$DIR" --include='*.html' 2>/dev/null | wc -l | tr -d ' ')
dead_ok=1; [ "${bare:-0}" -gt 5 ] && dead_ok=0
check 3 "few bare href=\"#\" dead links" "$dead_ok" "${bare:-0} found (>5 = likely dead ends)"

# --- Report ---
pct=0; [ "$max" -gt 0 ] && pct=$(( score * 100 / max ))

if $JSON; then
  printf '{\n  "prototype": "%s",\n  "score": %d,\n  "max": %d,\n  "pct": %d,\n  "threshold": %d,\n  "pass": %s,\n  "checks": [\n' \
    "$DIR" "$score" "$max" "$pct" "$PASS_THRESHOLD" "$([ "$pct" -ge "$PASS_THRESHOLD" ] && echo true || echo false)"
  n=${#RESULTS[@]}; i=0
  for r in "${RESULTS[@]}"; do
    IFS='|' read -r mark pts got name detail <<< "$r"
    i=$((i + 1)); comma=,; [ "$i" -eq "$n" ] && comma=
    printf '    {"name": "%s", "points": %s, "earned": %s, "detail": "%s"}%s\n' "$name" "$pts" "$got" "$detail" "$comma"
  done
  printf '  ]\n}\n'
else
  echo "Prototype: $DIR"
  echo "────────────────────────────────────────────────────────"
  for r in "${RESULTS[@]}"; do
    IFS='|' read -r mark pts got name detail <<< "$r"
    printf "  %s  %-42s %2s/%-2s  %s\n" "$mark" "$name" "$got" "$pts" "$detail"
  done
  echo "────────────────────────────────────────────────────────"
  printf "  SCORE: %d / %d  (%d%%)   threshold %d%% → %s\n" \
    "$score" "$max" "$pct" "$PASS_THRESHOLD" "$([ "$pct" -ge "$PASS_THRESHOLD" ] && echo PASS || echo FAIL)"
fi

[ "$pct" -ge "$PASS_THRESHOLD" ]
