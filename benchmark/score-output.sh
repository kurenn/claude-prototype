#!/usr/bin/env bash
# Score a generated prototype against the skill's own promises.
#
# Two tiers:
#   TIER 1 — regression floor. "Did we break the basics?" Present/absent checks
#            derived from SKILL.md constraints + checks/builtin-lint.md. A competent
#            run saturates this near 100%; its job is to catch a missing layout.js,
#            a wrapped control bar, lorem ipsum — the things a refactor breaks quietly.
#   TIER 2 — depth/integrity. "Is the build actually wired correctly?" Cross-file
#            consistency checks (theme/layout/persona names matched across JS + CSS +
#            buttons, script load order, modal a11y, focus styles). These do NOT
#            saturate — subtle mismatches are easy to ship — so this tier is what
#            discriminates a thorough build from a quick one and ranks skill versions.
#
# Usage:
#   benchmark/score-output.sh <prototype-dir> [--json]
#
# Exit code: 0 if TOTAL pct >= PASS_THRESHOLD (default 80), else 1.

set -u

DIR="${1:-}"
JSON=false
[ "${2:-}" = "--json" ] && JSON=true
PASS_THRESHOLD="${PASS_THRESHOLD:-80}"

if [ -z "$DIR" ] || [ ! -d "$DIR" ]; then
  echo "usage: $0 <prototype-dir> [--json]" >&2
  exit 2
fi

score=0; max=0
t1s=0; t1m=0; t2s=0; t2m=0
TIER=1
declare -a RESULTS=()

# check <points> <name> <pass:0|1> <detail>
check() {
  local pts="$1" name="$2" ok="$3" detail="${4:-}"
  max=$((max + pts))
  local got=0 mark="✗"
  if [ "$ok" -eq 1 ]; then got=$pts; mark="✓"; fi
  score=$((score + got))
  if [ "$TIER" -eq 1 ]; then t1m=$((t1m+pts)); t1s=$((t1s+got)); else t2m=$((t2m+pts)); t2s=$((t2s+got)); fi
  RESULTS+=("$TIER|$mark|$pts|$got|$name|$detail")
}

exists()      { [ -e "$DIR/$1" ] && echo 1 || echo 0; }
grep_absent() { if grep -rqiE "$1" "$DIR" --include='*.html' --include='*.css' 2>/dev/null; then echo 0; else echo 1; fi; }
grep_present(){ if grep -rqE "$1" "$DIR" 2>/dev/null; then echo 1; else echo 0; fi; }
html_pages()  { find "$DIR" -maxdepth 1 -name '*.html' 2>/dev/null; }
# extract_arr <jsfile> <VARNAME> -> one value per line.
# Anchored at line start so commented-out example declarations (" *   const X = [...]")
# are skipped and we read the real, active declaration.
extract_arr() {
  [ -f "$DIR/$1" ] || return 0
  grep -E "^[[:space:]]*const ${2} = \[" "$DIR/$1" 2>/dev/null | head -1 \
    | sed -E "s/.*\[//; s/\].*//" | tr -d "'\" " | tr ',' '\n' | grep -v '^$'
}

# ════════════════════════ TIER 1 — regression floor ════════════════════════
TIER=1

for j in state theme layout data persona ui app feedback; do
  check 2 "js/$j.js present" "$(exists js/$j.js)" ""
done
check 3 "serve.py present"         "$(exists serve.py)"          "no-cache dev server"
check 2 "404.html present"         "$(exists 404.html)"         ""
check 2 "css/styles.css present"   "$(exists css/styles.css)"   ""
check 2 "css/feedback.css present" "$(exists css/feedback.css)" ""
check 3 "DESIGN.md present"        "$(exists DESIGN.md)"        ""
check 3 "DEMO.md present"          "$(exists DEMO.md)"          "presenter handoff"
check 3 "README.md present"        "$(exists README.md)"        ""

# control bar present on every page (404 exempt)
pages_total=0; pages_with_bar=0
while IFS= read -r p; do
  [ -z "$p" ] && continue
  [ "$(basename "$p")" = "404.html" ] && continue
  pages_total=$((pages_total + 1))
  grep -q 'id="proto-controls"' "$p" && pages_with_bar=$((pages_with_bar + 1))
done < <(html_pages)
bar_ok=0; [ "$pages_total" -gt 0 ] && [ "$pages_with_bar" -eq "$pages_total" ] && bar_ok=1
check 8 "control bar on every page" "$bar_ok" "$pages_with_bar/$pages_total pages"
check 6 "control bar is segmented"  "$(grep_present 'data-(theme|layout|persona)-option')" "all options shown, not a pill"
check 6 "control bar never wraps (flex-wrap:nowrap)" "$(grep_present 'flex-wrap:[[:space:]]*nowrap')" "load-bearing"
check 4 "feedback toggle present"   "$(grep_present 'data-feedback-toggle')" "always-on feedback"
check 3 "share button present"      "$(grep_present 'data-share')" "URL share"

check 3 "theme switching wired"   "$(grep_present 'data-theme=')"   ""
check 3 "layout switching wired"  "$(grep_present 'data-layout=')"  ""
check 3 "persona switching wired" "$(grep_present 'data-persona=')" ""

check 4 "loading states (data-loading)"     "$(grep_present 'data-loading')" ""
check 4 "toasts (data-toast or UI.toast)"   "$(grep_present 'data-toast|UI\.toast')" ""
check 4 "empty state present"               "$(grep_present 'empty-state')" ""
check 3 "skeleton loaders present"          "$(grep_present 'skeleton|fakeLoad')" ""

check 6 "no lorem ipsum"       "$(grep_absent 'lorem ipsum|dolor sit amet')" ""
check 4 "no placeholder names" "$(grep_absent 'John Doe|Jane Doe|User [0-9]+|Example Corp')" ""
check 6 "no purple gradients"  "$(grep_absent 'from-(purple|violet|fuchsia|pink)|linear-gradient[^;]*(purple|violet)')" "#1 AI tell"

nobuild=1
{ [ -e "$DIR/package.json" ] || [ -d "$DIR/node_modules" ] || ls "$DIR"/vite.config.* >/dev/null 2>&1; } && nobuild=0
check 5 "no build tooling" "$nobuild" "Tailwind CDN only"

imgnoalt=$(grep -rEho '<img[^>]*>' "$DIR" --include='*.html' 2>/dev/null | grep -vcE 'alt=')
imgalt_ok=1; [ "${imgnoalt:-0}" -gt 0 ] && imgalt_ok=0
check 3 "all <img> have alt" "$imgalt_ok" "${imgnoalt:-0} missing"

# Dead ends = href="#" with NO click handler. A href="#" that carries a
# data-toast / data-confirm / data-modal / onclick is a wired demo stub, not a dead end.
bare=$(grep -rhoE '<a [^>]*href="#"[^>]*>' "$DIR" --include='*.html' 2>/dev/null \
  | grep -vE 'data-(toast|confirm|modal|persona|layout|theme)|onclick|data-action' \
  | wc -l | tr -d ' ')
dead_ok=1; [ "${bare:-0}" -gt 5 ] && dead_ok=0
check 3 "few unwired href=\"#\" dead links" "$dead_ok" "${bare:-0} found (>5 = likely dead ends)"

# ════════════════════════ TIER 2 — depth / integrity ════════════════════════
TIER=2

# Theme integrity: each THEMES name has a CSS block AND a control-bar button
themes="$(extract_arr js/theme.js THEMES)"
tcount=$(printf '%s\n' "$themes" | grep -vc '^$')
tc_css=1; tc_btn=1
if [ "${tcount:-0}" -ge 1 ]; then
  while IFS= read -r t; do [ -z "$t" ] && continue
    grep -rq "data-theme=\"$t\"\|data-theme='$t'" "$DIR/css" 2>/dev/null || tc_css=0
    grep -rq "data-theme-option=\"$t\"" "$DIR" --include='*.html' 2>/dev/null || tc_btn=0
  done <<< "$themes"
else tc_css=0; tc_btn=0; fi
check 6 "every theme has a CSS block"      "$tc_css" "${tcount:-0} themes in theme.js"
check 5 "every theme has a control button" "$tc_btn" ""
multi_theme=0; [ "${tcount:-0}" -ge 2 ] && multi_theme=1
check 3 "≥2 themes defined" "$multi_theme" "${tcount:-0} found"

# Layout integrity: each LAYOUTS name has a CSS rule AND a button; not the placeholder
layouts="$(extract_arr js/layout.js LAYOUTS)"
lcount=$(printf '%s\n' "$layouts" | grep -vc '^$')
lc_css=1; lc_btn=1
if [ "${lcount:-0}" -ge 1 ]; then
  while IFS= read -r l; do [ -z "$l" ] && continue
    grep -rq "data-layout=\"$l\"\|data-layout='$l'" "$DIR/css" 2>/dev/null || lc_css=0
    grep -rq "data-layout-option=\"$l\"" "$DIR" --include='*.html' 2>/dev/null || lc_btn=0
  done <<< "$layouts"
else lc_css=0; lc_btn=0; fi
not_placeholder=1; printf '%s\n' "$layouts" | grep -qE '^(layout-a|layout-b)$' && not_placeholder=0
check 6 "every layout has a CSS rule"        "$lc_css" "${lcount:-0} layouts in layout.js"
check 5 "every layout has a control button"  "$lc_btn" ""
check 4 "layouts customized (not placeholder)" "$not_placeholder" "layout-a/layout-b = untouched template"

# Persona integrity: each PERSONAS name is a key in data.js AND has a button
personas="$(extract_arr js/persona.js PERSONAS)"
pcount=$(printf '%s\n' "$personas" | grep -vc '^$')
pc_data=1; pc_btn=1
if [ "${pcount:-0}" -ge 1 ] && [ -f "$DIR/js/data.js" ]; then
  while IFS= read -r pn; do [ -z "$pn" ] && continue
    grep -q "$pn" "$DIR/js/data.js" 2>/dev/null || pc_data=0
    grep -rq "data-persona-option=\"$pn\"" "$DIR" --include='*.html' 2>/dev/null || pc_btn=0
  done <<< "$personas"
else pc_data=0; pc_btn=0; fi
check 5 "every persona keyed in data.js"      "$pc_data" "${pcount:-0} personas"
check 4 "every persona has a control button"  "$pc_btn" ""

# Script load order: every screen includes all 8 scripts in the required order
order='state theme layout data persona ui app feedback'
order_ok=1; checked=0
while IFS= read -r p; do
  [ -z "$p" ] && continue; [ "$(basename "$p")" = "404.html" ] && continue
  checked=$((checked+1))
  # Only real <script src="js/X.js"> tags — not incidental js/x.js mentions in
  # inline-script bodies or comments (those would inflate the sequence).
  seq=$(grep -oE 'src="js/(state|theme|layout|data|persona|ui|app|feedback)\.js"' "$p" | sed -E 's#src="js/##; s#\.js"##' | tr '\n' ' ' | sed 's/ $//')
  [ "$seq" = "$order" ] || order_ok=0
done < <(html_pages)
[ "$checked" -eq 0 ] && order_ok=0
check 6 "script load order correct on every screen" "$order_ok" "state→…→feedback, $checked screens"

# Modal accessibility: if a modal exists, it carries role=dialog + aria-modal
has_modal=$(grep_present 'data-modal|class="[^"]*modal|openModal')
if [ "$has_modal" -eq 1 ]; then
  modal_a11y=0
  { [ "$(grep_present 'role="dialog"')" -eq 1 ] && [ "$(grep_present 'aria-modal')" -eq 1 ]; } && modal_a11y=1
  check 5 "modals have role=dialog + aria-modal" "$modal_a11y" "a11y"
else
  check 5 "modals have role=dialog + aria-modal" 1 "no modals — n/a"
fi

check 4 "focus-visible styles defined" "$(grep_present ':focus-visible')" "keyboard a11y"

# Wide tables must scroll inside a wrapper, not push the page wider than a phone.
# Proxy: every page with a <table> carries ≥ as many overflow-x wrappers as tables.
tbl_ok=1; tbl_total=0
while IFS= read -r p; do
  [ -z "$p" ] && continue
  t=$(grep -ocE '<table' "$p" 2>/dev/null); t=${t:-0}
  [ "$t" -eq 0 ] && continue
  tbl_total=$((tbl_total+t))
  w=$(grep -oE 'proto-table-wrap|overflow-x-auto|overflow-auto' "$p" 2>/dev/null | wc -l | tr -d ' ')
  [ "${w:-0}" -ge "$t" ] || tbl_ok=0
done < <(html_pages)
if [ "$tbl_total" -eq 0 ]; then
  check 3 "tables wrapped for mobile scroll" 1 "no tables — n/a"
else
  check 3 "tables wrapped for mobile scroll" "$tbl_ok" "$tbl_total table(s), each in an overflow-x wrapper"
fi

# Distinct personas with content (≥2 → at least one non-default state exists)
multi_persona=0; [ "${pcount:-0}" -ge 2 ] && multi_persona=1
check 3 "≥2 personas (incl. a non-default state)" "$multi_persona" "${pcount:-0} found"

# ════════════════════════ report ════════════════════════
pct=0;   [ "$max" -gt 0 ]  && pct=$((  score * 100 / max ))
t1pct=0; [ "$t1m" -gt 0 ]  && t1pct=$(( t1s * 100 / t1m ))
t2pct=0; [ "$t2m" -gt 0 ]  && t2pct=$(( t2s * 100 / t2m ))
passbool=$([ "$pct" -ge "$PASS_THRESHOLD" ] && echo true || echo false)

if $JSON; then
  printf '{\n  "prototype": "%s",\n  "total": {"score": %d, "max": %d, "pct": %d},\n' "$DIR" "$score" "$max" "$pct"
  printf '  "tier1_floor": {"score": %d, "max": %d, "pct": %d},\n'  "$t1s" "$t1m" "$t1pct"
  printf '  "tier2_depth": {"score": %d, "max": %d, "pct": %d},\n'  "$t2s" "$t2m" "$t2pct"
  printf '  "threshold": %d,\n  "pass": %s,\n  "checks": [\n' "$PASS_THRESHOLD" "$passbool"
  n=${#RESULTS[@]}; i=0
  for r in "${RESULTS[@]}"; do
    IFS='|' read -r tier mark pts got name detail <<< "$r"; i=$((i+1)); comma=,; [ "$i" -eq "$n" ] && comma=
    printf '    {"tier": %s, "name": "%s", "points": %s, "earned": %s, "detail": "%s"}%s\n' "$tier" "$name" "$pts" "$got" "$detail" "$comma"
  done
  printf '  ]\n}\n'
else
  echo "Prototype: $DIR"
  echo "═══ TIER 1 · regression floor ════════════════════════════"
  for r in "${RESULTS[@]}"; do IFS='|' read -r tier mark pts got name detail <<< "$r"
    [ "$tier" -eq 1 ] && printf "  %s  %-42s %2s/%-2s  %s\n" "$mark" "$name" "$got" "$pts" "$detail"; done
  printf "  ── Tier 1: %d/%d (%d%%)\n" "$t1s" "$t1m" "$t1pct"
  echo "═══ TIER 2 · depth / integrity ═══════════════════════════"
  for r in "${RESULTS[@]}"; do IFS='|' read -r tier mark pts got name detail <<< "$r"
    [ "$tier" -eq 2 ] && printf "  %s  %-42s %2s/%-2s  %s\n" "$mark" "$name" "$got" "$pts" "$detail"; done
  printf "  ── Tier 2: %d/%d (%d%%)\n" "$t2s" "$t2m" "$t2pct"
  echo "──────────────────────────────────────────────────────────"
  printf "  TOTAL: %d / %d  (%d%%)   threshold %d%% → %s\n" "$score" "$max" "$pct" "$PASS_THRESHOLD" \
    "$([ "$pct" -ge "$PASS_THRESHOLD" ] && echo PASS || echo FAIL)"
  echo "  (Tier 1 should sit near 100%; Tier 2 is the discriminating signal.)"
fi

[ "$pct" -ge "$PASS_THRESHOLD" ]
