#!/usr/bin/env bash
# Measure the skill's CONTEXT COST and compare against the pre-refactor baseline.
#
# Two numbers matter:
#   trigger-time cost = SKILL.md alone — loaded every time the skill fires.
#   full cost         = SKILL.md + all reference/*.md — the worst case if every
#                       phase file is read in one run.
#
# Progressive disclosure wins by shrinking trigger-time cost while keeping the
# information available on demand. This script proves the win is real.
#
# Usage: benchmark/context-cost.sh [--json]

set -u
cd "$(dirname "$0")/.." || exit 2
JSON=false; [ "${1:-}" = "--json" ] && JSON=true

toks() { echo $(( $(wc -c < "$1") / 4 )); }   # ~4 chars/token heuristic

skill_tok=$(toks SKILL.md)
ref_tok=0
for f in reference/*.md; do [ -e "$f" ] && ref_tok=$((ref_tok + $(toks "$f"))); done
full_tok=$((skill_tok + ref_tok))

base_tok=$(grep -oE '"trigger_time_tokens_est":[[:space:]]*[0-9]+' benchmark/baseline.json | grep -oE '[0-9]+')
base_tok=${base_tok:-0}

reduction=0
[ "$base_tok" -gt 0 ] && reduction=$(( (base_tok - skill_tok) * 100 / base_tok ))

if $JSON; then
  printf '{"trigger_time_tokens": %d, "full_tokens": %d, "baseline_trigger_tokens": %d, "trigger_reduction_pct": %d}\n' \
    "$skill_tok" "$full_tok" "$base_tok" "$reduction"
else
  echo "Context cost (≈ tokens, chars/4)"
  echo "────────────────────────────────────────────────"
  printf "  baseline trigger-time (pre-split):  ~%5d\n" "$base_tok"
  printf "  current  trigger-time (SKILL.md):   ~%5d   (%d%% lighter)\n" "$skill_tok" "$reduction"
  printf "  full cost  (SKILL.md + reference):  ~%5d   (loaded only if every phase is read)\n" "$full_tok"
  echo "────────────────────────────────────────────────"
  for f in SKILL.md reference/*.md; do
    [ -e "$f" ] && printf "    %-28s ~%5d tok  (%s lines)\n" "$f" "$(toks "$f")" "$(wc -l < "$f" | tr -d ' ')"
  done
fi
