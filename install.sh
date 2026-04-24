#!/usr/bin/env bash
# Install the /prototype skill into Claude Code's skills directory.
# Safe to re-run; detects existing installs and asks before replacing.

set -eu

SKILL_NAME="prototype"
SKILLS_DIR="${HOME}/.claude/skills"
TARGET="${SKILLS_DIR}/${SKILL_NAME}"
# Absolute path to this script's parent directory (the repo root)
SOURCE="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"

if [ ! -f "${SOURCE}/SKILL.md" ]; then
  echo "✗ SKILL.md not found at ${SOURCE}/SKILL.md" >&2
  echo "  Run this script from the claude-prototype repo root." >&2
  exit 1
fi

mkdir -p "${SKILLS_DIR}"

if [ -e "${TARGET}" ] || [ -L "${TARGET}" ]; then
  echo "A skill already exists at ${TARGET}:"
  ls -la "${TARGET}" | sed 's/^/  /'
  printf "Replace it? [y/N] "
  read -r answer
  case "${answer}" in
    [yY]*) rm -rf "${TARGET}" ;;
    *)     echo "Aborted."; exit 1 ;;
  esac
fi

MODE="${1:-link}"
case "${MODE}" in
  link|--link|-l)
    ln -s "${SOURCE}" "${TARGET}"
    echo "✓ Symlinked ${TARGET} → ${SOURCE}"
    echo "  Edits to this repo flow through immediately."
    ;;
  copy|--copy|-c)
    cp -R "${SOURCE}" "${TARGET}"
    echo "✓ Copied ${SOURCE} → ${TARGET}"
    echo "  Re-run ./install.sh to sync after edits."
    ;;
  *)
    echo "Usage: ./install.sh [link|copy]" >&2
    echo "  link (default) — symlink, edits flow through" >&2
    echo "  copy           — independent copy, must re-run to sync" >&2
    exit 1
    ;;
esac

echo ""
echo "Running preflight — installing essential companion skills..."
bash "${SOURCE}/ensure-deps.sh" --yes || true

echo ""
echo "Next steps:"
echo "  1. Restart your Claude Code session (or run /help)"
echo "  2. Type /prototype to start a prototype flow"
echo ""
echo "Companion skills /prototype uses automatically:"
echo "  • impeccable     — deep design assessment (https://impeccable.style/)"
echo "  • prompt-refiner — Q&A spec refinement"
echo "  • claude-in-chrome (MCP) — browser QA + screenshots (optional)"
