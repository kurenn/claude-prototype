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
#   --path=<skill>: print where <skill> is installed and exit (1 if not found), so
#     callers resolve a companion's location instead of hardcoding a root.

set -eu

# Skill roots, searched in order. Claude Code loads from both, and the two installers
# disagree: `npx skills add --global` puts impeccable in ~/.agents/skills, while the git
# clone below goes to ~/.claude/skills. Checking a single root reports an already-installed
# companion as MISSING and silently reinstalls it on every preflight.
SKILL_ROOTS=("${HOME}/.claude/skills" "${HOME}/.agents/skills")
INSTALL_DIR="${HOME}/.claude/skills"   # where *this* script clones to
AUTO_YES=false
CHECK_ONLY=false
PATH_QUERY=""

for arg in "$@"; do
  case "${arg}" in
    --yes|-y) AUTO_YES=true ;;
    --check)  CHECK_ONLY=true ;;
    --path=*) PATH_QUERY="${arg#--path=}" ;;
    *) echo "Usage: $0 [--yes|-y] [--check] [--path=<skill>]" >&2; exit 2 ;;
  esac
done

# Prints where a skill is installed, or returns 1. Counts as installed when
# <root>/<name>/SKILL.md resolves — directly or through a symlink (install.sh --link).
skill_path() {
  local name="$1" root target real
  for root in "${SKILL_ROOTS[@]}"; do
    target="${root}/${name}"
    real="$(readlink -f "${target}" 2>/dev/null || printf '%s' "${target}")"
    if [ -e "${target}/SKILL.md" ] || [ -e "${real}/SKILL.md" ]; then
      printf '%s\n' "${target}"
      return 0
    fi
  done
  return 1
}

have_skill() { skill_path "$1" >/dev/null 2>&1; }

status() {
  local name="$1" path
  if path="$(skill_path "${name}")"; then
    echo "  ✓ ${name} — installed (${path})"
    return 0
  fi
  echo "  ✗ ${name} — MISSING"
  return 1
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
  # --global installs to ~/.agents/skills (not ~/.claude/skills — see SKILL_ROOTS);
  # --yes skips all prompts
  npx -y skills add pbakaus/impeccable --global --yes
}

install_prompt_refiner() {
  if ! command -v git >/dev/null 2>&1; then
    echo "  ✗ git not found. Install git first."
    return 1
  fi
  local repo="https://github.com/kurenn/prompt-refiner-skill.git"
  local target="${INSTALL_DIR}/prompt-refiner"
  if ! confirm "Install prompt-refiner via 'git clone ${repo} → ${target}'?"; then
    echo "  skipped prompt-refiner — /prototype will synthesize the spec inline"
    return 0
  fi
  mkdir -p "${INSTALL_DIR}"
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

if [ -n "${PATH_QUERY}" ]; then
  skill_path "${PATH_QUERY}" || { echo "not installed: ${PATH_QUERY}" >&2; exit 1; }
  exit 0
fi

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
  install_prompt_refiner || echo "  prompt-refiner install did not complete"
fi

echo ""
echo "Done. Re-run with --check anytime to verify status."
