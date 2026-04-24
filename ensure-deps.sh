#!/usr/bin/env bash
# Ensure companion skills are installed before /prototype runs.
#
# Essential companions:
#   impeccable     — deep design assessment (https://impeccable.style/)
#   prompt-refiner — Q&A → spec refinement
#
# Behavior:
#   Default: prompt before installing (safe for interactive use).
#   --yes / -y: auto-confirm (useful from Claude Code when the LLM decides to install).
#   --check: report status without installing (exit 0 if all present, 1 if missing).

set -eu

SKILLS_DIR="${HOME}/.claude/skills"
AUTO_YES=false
CHECK_ONLY=false

for arg in "$@"; do
  case "${arg}" in
    --yes|-y) AUTO_YES=true ;;
    --check)  CHECK_ONLY=true ;;
    *) echo "Usage: $0 [--yes|-y] [--check]" >&2; exit 2 ;;
  esac
done

have_skill() {
  local name="$1"
  # Accept regular dir, symlink, or any readable path
  [ -e "${SKILLS_DIR}/${name}/SKILL.md" ] || \
  [ -e "${SKILLS_DIR}/${name}" ] && [ -e "$(readlink -f "${SKILLS_DIR}/${name}" 2>/dev/null || echo "${SKILLS_DIR}/${name}")/SKILL.md" ]
}

status() {
  local name="$1"
  if have_skill "${name}"; then
    echo "  ✓ ${name} — installed"
    return 0
  else
    echo "  ✗ ${name} — MISSING"
    return 1
  fi
}

confirm() {
  local prompt="$1"
  if [ "${AUTO_YES}" = true ]; then return 0; fi
  printf "%s [y/N] " "${prompt}"
  read -r answer
  case "${answer}" in [yY]*) return 0 ;; *) return 1 ;; esac
}

install_impeccable() {
  if ! command -v npx >/dev/null 2>&1; then
    echo "  ✗ npx not found. Install Node.js first: https://nodejs.org/"
    return 1
  fi
  if ! confirm "Install impeccable via 'npx -y skills add pbakaus/impeccable --global --yes'?"; then
    echo "  skipped impeccable — /prototype will use built-in lint fallback"
    return 0
  fi
  # --global installs to ~/.claude/skills; --yes skips all prompts
  npx -y skills add pbakaus/impeccable --global --yes
}

install_prompt_refiner() {
  if ! command -v git >/dev/null 2>&1; then
    echo "  ✗ git not found. Install git first."
    return 1
  fi
  local repo="https://github.com/kurenn/prompt-refiner-skill.git"
  local target="${SKILLS_DIR}/prompt-refiner"
  if ! confirm "Install prompt-refiner via 'git clone ${repo} → ${target}'?"; then
    echo "  skipped prompt-refiner — /prototype will synthesize the spec inline"
    return 0
  fi
  mkdir -p "${SKILLS_DIR}"
  git clone --depth 1 "${repo}" "${target}"
  # Verify SKILL.md landed at the expected path
  if [ -f "${target}/SKILL.md" ]; then
    echo "  ✓ prompt-refiner installed at ${target}"
  else
    echo "  ✗ clone succeeded but SKILL.md not found at ${target}/SKILL.md"
    echo "    check repo layout: ${repo}"
    return 1
  fi
}

echo "Checking /prototype companion skills..."
missing=0
status impeccable     || missing=$((missing + 1))
status prompt-refiner || missing=$((missing + 1))

if [ "${missing}" -eq 0 ]; then
  echo ""
  echo "All companion skills installed. /prototype will use them automatically."
  exit 0
fi

if [ "${CHECK_ONLY}" = true ]; then
  echo ""
  echo "${missing} companion(s) missing. Run without --check to install."
  exit 1
fi

echo ""
if ! have_skill impeccable; then
  echo "--- impeccable ---"
  install_impeccable || echo "  impeccable install did not complete"
fi

if ! have_skill prompt-refiner; then
  echo ""
  echo "--- prompt-refiner ---"
  install_prompt_refiner
fi

echo ""
echo "Done. Re-run with --check anytime to verify status."
