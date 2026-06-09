#!/usr/bin/env bash
# render.sh — turn a generated prototype dir into screenshots for design judging.
#
# Serves the prototype on a local port and screenshots every screen at a desktop
# and a mobile width using headless Chrome. Output PNGs feed Tier 3 (design-judge.md).
#
# Usage:
#   benchmark/render.sh <prototype-dir> [out-dir]
#
# Env overrides:
#   CHROME   path to a Chrome/Chromium binary (auto-detected on macOS by default)
#   PORT     local server port (default 8973)
#   WIDTHS   space-separated viewport widths (default "1440 390")
#
# Notes:
#   - Captures the above-the-fold viewport (window-size), which is what a viewer
#     sees first — deliberately not full-page, since first impression is the signal.
#   - 404.html is skipped (not a design surface).
#   - No npm deps. Chrome must be installed.
set -euo pipefail

DIR="${1:?usage: render.sh <prototype-dir> [out-dir]}"
[ -d "$DIR" ] || { echo "no such dir: $DIR" >&2; exit 1; }
OUT="${2:-$DIR/.shots}"
PORT="${PORT:-8973}"
WIDTHS="${WIDTHS:-1440 390}"

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
if [ ! -x "$CHROME" ]; then
  CHROME="$(command -v google-chrome || command -v chromium || command -v chromium-browser || true)"
fi
[ -n "$CHROME" ] && [ -x "$CHROME" ] || { echo "Chrome not found; set \$CHROME" >&2; exit 1; }

mkdir -p "$OUT"

# Serve the prototype (plain http.server is fine for one-shot captures).
( cd "$DIR" && exec python3 -m http.server "$PORT" ) >/dev/null 2>&1 &
SRV=$!
cleanup() { kill "$SRV" 2>/dev/null || true; }
trap cleanup EXIT

# Wait for the server to answer.
for _ in $(seq 1 30); do
  if curl -fsS "http://localhost:$PORT/" >/dev/null 2>&1; then break; fi
  sleep 0.2
done

shot_count=0
for f in "$DIR"/*.html; do
  name="$(basename "$f" .html)"
  [ "$name" = "404" ] && continue
  for w in $WIDTHS; do
    "$CHROME" --headless=new --hide-scrollbars --disable-gpu --no-sandbox \
      --force-device-scale-factor=1 --window-size="${w},900" \
      --virtual-time-budget=3000 \
      --screenshot="$OUT/${name}-w${w}.png" \
      "http://localhost:$PORT/${name}.html" >/dev/null 2>&1 || true
    [ -f "$OUT/${name}-w${w}.png" ] && shot_count=$((shot_count + 1))
  done
done

echo "rendered $shot_count screenshot(s) → $OUT"
