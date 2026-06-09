#!/usr/bin/env bash
# check-overflow.sh — objective horizontal-overflow guard at a TRUE phone viewport.
#
# Why this exists: render.sh screenshots are unfaithful below ~500px (Chrome headless
# clamps the window), so you cannot judge 390px overflow from a screenshot. This measures
# it for real: it embeds each screen in a same-origin <iframe> sized to the target width
# (a genuine CSS-px viewport), reads documentElement.scrollWidth vs innerWidth, and writes
# the verdict into the DOM where `--dump-dom` can grep it. No npm, no private tooling.
#
# Usage:
#   benchmark/check-overflow.sh <prototype-dir> [width]      # width default 390
#
# Exit: 0 if every screen fits; 1 if any screen overflows (or is inconclusive).
#
# Env: CHROME (binary path), PORT (default 8985)
set -euo pipefail

DIR="${1:?usage: check-overflow.sh <prototype-dir> [width]}"
[ -d "$DIR" ] || { echo "no such dir: $DIR" >&2; exit 1; }
W="${2:-390}"
PORT="${PORT:-8985}"

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
if [ ! -x "$CHROME" ]; then
  CHROME="$(command -v google-chrome || command -v chromium || command -v chromium-browser || true)"
fi
[ -n "$CHROME" ] && [ -x "$CHROME" ] || { echo "Chrome not found; set \$CHROME" >&2; exit 1; }

( cd "$DIR" && exec python3 -m http.server "$PORT" ) >/dev/null 2>&1 &
SRV=$!
PROBE="$DIR/.ovprobe.html"
cleanup() { kill "$SRV" 2>/dev/null || true; rm -f "$PROBE"; }
trap cleanup EXIT
for _ in $(seq 1 30); do curl -fsS "http://localhost:$PORT/" >/dev/null 2>&1 && break; sleep 0.2; done

fail=0; checked=0
printf '\nHorizontal overflow @ %dpx — %s\n' "$W" "$DIR"
printf '%s\n' "──────────────────────────────────────────────"
for f in "$DIR"/*.html; do
  name="$(basename "$f")"
  case "$name" in 404.html|.ovprobe.html) continue;; esac
  # Probe page: iframe the screen at the true target width, write verdict into #v.
  cat > "$PROBE" <<HTML
<!doctype html><meta charset=utf8><div id=v>PENDING</div>
<iframe id=f style="width:${W}px;height:900px;border:0" src="${name}"></iframe>
<script>document.getElementById('f').onload=function(){
var d=this.contentDocument,w=this.contentWindow,sw=d.documentElement.scrollWidth,iw=w.innerWidth;
document.getElementById('v').textContent=(sw>iw?'OVERFLOW':'OK')+' '+sw+' '+iw;};</script>
HTML
  out="$("$CHROME" --headless=new --disable-gpu --no-sandbox --virtual-time-budget=4000 \
        --dump-dom "http://localhost:$PORT/.ovprobe.html" 2>/dev/null \
        | grep -oE 'id="v">[A-Z]+ [0-9]+ [0-9]+' | head -1 | sed 's/id="v">//')"
  checked=$((checked+1))
  verdict="${out%% *}"; rest="${out#* }"; sw="${rest%% *}"; iw="${rest##* }"
  case "$verdict" in
    OK)       printf '  ✓  %-20s fits  (scrollW %s ≤ innerW %s)\n' "$name" "$sw" "$iw" ;;
    OVERFLOW) printf '  ✗  %-20s OVERFLOWS  (scrollW %s > innerW %s)\n' "$name" "$sw" "$iw"; fail=1 ;;
    *)        printf '  ?  %-20s inconclusive (probe did not report)\n' "$name"; fail=1 ;;
  esac
done

printf '%s\n' "──────────────────────────────────────────────"
if [ "$fail" -eq 0 ]; then
  printf '  PASS — %d screen(s) fit at %dpx\n' "$checked" "$W"
else
  printf '  FAIL — horizontal overflow at %dpx (a clipped primary action reads as broken)\n' "$W"
fi
exit "$fail"
