#!/usr/bin/env bash
set -euo pipefail

# BYOLOMAD — BMAD with YOLO in it.
#
# Run a BMAD v6 (BMM)-prepped repo autonomously: one Docker container per
# story, gated on tests passing, committing between stories. Auths via
# $CLAUDE_CODE_OAUTH_TOKEN (long-lived machine token — never the rotating
# macOS keychain tokens, which are device-bound and 401 inside Linux).
#
# Usage:
#   ./byolomad.sh --repo <path> [options]
#
# Options:
#   --repo <path>       Path to the BMAD v6-prepped repo (required). Must contain:
#                         _bmad/                                         (framework)
#                         _bmad-output/planning-artifacts/prd.md
#                         _bmad-output/planning-artifacts/architecture.md
#                         _bmad-output/planning-artifacts/epics.md
#                         _bmad-output/implementation-artifacts/sprint-status.yaml
#                         _bmad-output/implementation-artifacts/*.md    (stories)
#   --epic <name>       Only run story files matching *<name>* (filter).
#   --branch <name>     Branch to work on. Default: autonomous/<epic>-<timestamp>.
#   --base <branch>     Branch to fork from. Default: main.
#   --module <name>     BMAD module: auto|bmm|gds. auto detects gds (game-dev,
#                       uses gdd.md + gds-* workflows) vs bmm (software). Default: auto.
#   --test-cmd <cmd>    Command to run after each story. Auto-detected if omitted.
#   --engine <name>     AI engine: "claude" (default), "amp", or "codex".
#                       "amp" when out of Claude credits. "codex" uses
#                       workflow-oriented prompts because Codex does not resolve
#                       Claude Code slash commands.
#   --model <name>      Claude model for SM, EXT-REVIEW, FINALIZE (baseline).
#                       Default: claude-sonnet-4-6.
#   --model-heavy <n>   Claude model for DEV, APPLY-FIXES, CODE-REVIEW
#                       (deeper reasoning; runs with "ultrathink" trigger).
#                       Default: claude-opus-4-8.
#   --amp-mode <mode>   Amp agent mode for baseline phases (SM, EXT-REVIEW,
#                       FINALIZE). One of: smart, rush, deep. Default: smart.
#   --amp-mode-heavy <m> Amp agent mode for heavy phases (DEV, APPLY-FIXES,
#                       CODE-REVIEW). Default: deep.
#   --image <tag>       Docker image tag to build/use.
#                       Default: byolomad:review (review on) / byolomad:latest (--no-review).
#   --no-review         Skip the /cursor-reviews + apply-fixes phases.
#                       Review is on by default; use this to opt out for
#                       environments without Cursor auth at ~/.cursor/.
#                       (--review is still accepted as a no-op for
#                       backwards compatibility.)
#   --on-dirty <mode>   What to do when the repo has uncommitted changes at
#                       startup. One of:
#                         abort    (default) bail with an error
#                         stash    git stash --include-untracked, then proceed
#                         discard  git reset --hard + git clean -fd, then proceed
#                       Useful for resuming after a story aborted mid-DEV and
#                       left partial files behind.
#   --phase-timeout <s> Abort a phase (and the whole run) if a single agent or
#                       test phase exceeds <s> seconds. 0 disables. Default: 3600.
#   --keep-container    Don't --rm containers (for debugging).
#   --dry-run           Run preflight + print plan, don't spin containers.
#   -h, --help          Show this help.

usage() {
  sed -n '3,58p' "$0" | sed 's/^# \{0,1\}//'
  exit "${1:-0}"
}

# Resolve script dir up front — later logic does `cd "$REPO"`, after which a
# lazily-computed $(dirname "$BASH_SOURCE[0]") would resolve to the wrong place.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ---------- defaults ----------
# Captured as constants so the resume-command builder compares against the same
# literals used to initialize these — bump a default in exactly one place.
readonly DEFAULT_BASE_BRANCH="main"
readonly DEFAULT_MODULE="auto"               # auto | bmm (software) | gds (game-dev)
readonly DEFAULT_ENGINE="claude"             # "claude", "amp", or "codex"
# MODEL is the baseline for SM, EXT-REVIEW, and FINALIZE (fast, cheap, fine for
# template/transform work). MODEL_HEAVY is used for DEV, APPLY-FIXES,
# CODE-REVIEW (deeper reasoning). Both can be overridden on the CLI.
readonly DEFAULT_MODEL="claude-sonnet-4-6"
readonly DEFAULT_MODEL_HEAVY="claude-opus-4-8"
readonly DEFAULT_AMP_MODE="smart"            # Amp agent modes (only with --engine amp)
readonly DEFAULT_AMP_MODE_HEAVY="deep"
# Per-phase wall-clock ceiling (seconds; suffix s/m/h/d ok, 0 disables). Catches
# a wedged agent/test that would otherwise hang an unattended run forever.
readonly DEFAULT_PHASE_TIMEOUT="3600"

# ---------- parse args ----------
REPO=""
EPIC=""
BRANCH=""
BASE_BRANCH="$DEFAULT_BASE_BRANCH"
MODULE="$DEFAULT_MODULE"
TEST_CMD=""
ENGINE="$DEFAULT_ENGINE"
MODEL="$DEFAULT_MODEL"
MODEL_HEAVY="$DEFAULT_MODEL_HEAVY"
AMP_MODE="$DEFAULT_AMP_MODE"
AMP_MODE_HEAVY="$DEFAULT_AMP_MODE_HEAVY"
PHASE_TIMEOUT="$DEFAULT_PHASE_TIMEOUT"
IMAGE_TAG=""
RUN_REVIEW=1
KEEP_CONTAINER=0
DRY_RUN=0
ON_DIRTY="abort"   # abort | stash | discard

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo)            REPO="$2"; shift 2 ;;
    --epic)            EPIC="$2"; shift 2 ;;
    --branch)          BRANCH="$2"; shift 2 ;;
    --base)            BASE_BRANCH="$2"; shift 2 ;;
    --module)          MODULE="$2"; shift 2 ;;
    --test-cmd)        TEST_CMD="$2"; shift 2 ;;
    --engine)          ENGINE="$2"; shift 2 ;;
    --model)           MODEL="$2"; shift 2 ;;
    --model-heavy)     MODEL_HEAVY="$2"; shift 2 ;;
    --amp-mode)        AMP_MODE="$2"; shift 2 ;;
    --amp-mode-heavy)  AMP_MODE_HEAVY="$2"; shift 2 ;;
    --phase-timeout)   PHASE_TIMEOUT="$2"; shift 2 ;;
    --image)           IMAGE_TAG="$2"; shift 2 ;;
    --review)          RUN_REVIEW=1; shift ;;
    --no-review)       RUN_REVIEW=0; shift ;;
    --on-dirty)        ON_DIRTY="$2"; shift 2 ;;
    --keep-container)  KEEP_CONTAINER=1; shift ;;
    --dry-run)         DRY_RUN=1; shift ;;
    -h|--help)         usage 0 ;;
    *) echo "Unknown flag: $1" >&2; usage 1 ;;
  esac
done

[[ -n "$REPO" ]] || { echo "ERROR: --repo is required" >&2; usage 1; }
[[ -d "$REPO" ]] || { echo "ERROR: --repo path does not exist: $REPO" >&2; exit 1; }
[[ "$ENGINE" == "claude" || "$ENGINE" == "amp" || "$ENGINE" == "codex" ]] || { echo "ERROR: --engine must be 'claude', 'amp', or 'codex'" >&2; exit 1; }
[[ "$MODULE" == "auto" || "$MODULE" == "bmm" || "$MODULE" == "gds" ]] || { echo "ERROR: --module must be 'auto', 'bmm', or 'gds'" >&2; exit 1; }
[[ "$ON_DIRTY" == "abort" || "$ON_DIRTY" == "stash" || "$ON_DIRTY" == "discard" ]] \
  || { echo "ERROR: --on-dirty must be 'abort', 'stash', or 'discard'" >&2; exit 1; }
[[ "$PHASE_TIMEOUT" =~ ^[0-9]+[smhd]?$ ]] \
  || { echo "ERROR: --phase-timeout must be a non-negative number, optionally suffixed s/m/h/d (e.g. 3600, 45m, or 0 to disable)." >&2; exit 1; }

# Claude model names mean nothing to the codex engine. If the user did not
# explicitly override --model/--model-heavy (i.e. they are still the Claude
# defaults), blank them so codex falls back to its own configured model.
if [[ "$ENGINE" == "codex" ]]; then
  [[ "$MODEL" == "$DEFAULT_MODEL" ]] && MODEL=""
  [[ "$MODEL_HEAVY" == "$DEFAULT_MODEL_HEAVY" ]] && MODEL_HEAVY=""
fi

# Token bootstrap: when launched from a non-interactive shell (cron, an IDE
# task, an agent's Bash tool, `sh -c`), ~/.zshrc never runs, so secrets sourced
# there are absent and the engine token check below would fail spuriously. If
# the token isn't already in the environment, source a secrets env-file as a
# fallback. Defaults to the 1Password-backed cache that ~/.zshrc itself sources;
# override with BYOLOMAD_ENV_FILE. Only sourced when the token is missing, so an
# inherited environment always wins.
BYOLOMAD_ENV_FILE="${BYOLOMAD_ENV_FILE:-$HOME/.cache/op-secrets.env}"
if [[ -z "${CLAUDE_CODE_OAUTH_TOKEN:-}" && -f "$BYOLOMAD_ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$BYOLOMAD_ENV_FILE"
fi

REPO="$(cd "$REPO" && pwd)"
PLANNING_DIR="$REPO/_bmad-output/planning-artifacts"
STORIES_DIR="$REPO/_bmad-output/implementation-artifacts"
SPRINT_STATUS="$STORIES_DIR/sprint-status.yaml"

# Relative paths used inside container prompts (container sees $REPO as /workspace).
STORIES_DIR_REL="_bmad-output/implementation-artifacts"

# ---------- preflight: BMAD v6 artifacts ----------
echo "=== Preflight ==="
echo "Repo:  $REPO"

# Resolve the BMAD module. GDS (game-dev) projects use gdd.md + game-architecture.md
# at the _bmad-output root and the gds-* workflows; BMM (software) projects use
# planning-artifacts/{prd,architecture}.md and the bmad-* workflows. The
# implementation artifacts (sprint-status.yaml, story files) live in the same
# place for both. Auto-detect from the artifacts present unless --module forced it.
OUTPUT_DIR="$REPO/_bmad-output"
MODULE_REQUESTED="$MODULE"   # remember whether the user forced it (for resume)
if [[ "$MODULE" == "auto" ]]; then
  if [[ -d "$REPO/_bmad/gds" && -f "$OUTPUT_DIR/gdd.md" && -f "$OUTPUT_DIR/game-architecture.md" ]]; then
    MODULE="gds"
  elif [[ -f "$PLANNING_DIR/prd.md" && -f "$PLANNING_DIR/architecture.md" ]]; then
    MODULE="bmm"
  else
    echo ""
    echo "ERROR: could not auto-detect the BMAD module for this repo." >&2
    echo "  BMM (software) expects _bmad-output/planning-artifacts/{prd,architecture}.md" >&2
    echo "  GDS (game-dev) expects _bmad-output/{gdd,game-architecture}.md and _bmad/gds/" >&2
    echo "Run the BMAD planning workflow first, or force the module with --module bmm|gds." >&2
    exit 1
  fi
  echo "Module: $MODULE (auto-detected)"
else
  echo "Module: $MODULE (forced)"
fi

# Per-module slash-command prefix and the planning artifacts the preflight requires.
if [[ "$MODULE" == "gds" ]]; then
  CMD_PREFIX="gds"
  PLANNING_DESC="gdd.md game-architecture.md epics.md sprint-status.yaml"
  PLANNING_REQUIRED=("$OUTPUT_DIR/gdd.md" "$OUTPUT_DIR/game-architecture.md")
  EPICS_CANDIDATES=("$OUTPUT_DIR/epics.md" "$PLANNING_DIR/epics.md")
else
  CMD_PREFIX="bmad"
  PLANNING_DESC="prd.md architecture.md epics.md sprint-status.yaml"
  PLANNING_REQUIRED=("$PLANNING_DIR/prd.md" "$PLANNING_DIR/architecture.md")
  EPICS_CANDIDATES=("$PLANNING_DIR/epics.md")
fi

missing=()
[[ -d "$REPO/_bmad" ]] || missing+=("_bmad/ (BMAD framework not installed — run 'bmad init' interactively)")
for _f in "${PLANNING_REQUIRED[@]}"; do
  [[ -f "$_f" ]] || missing+=("${_f#"$REPO"/}")
done
_epics_ok=0
for _f in "${EPICS_CANDIDATES[@]}"; do [[ -f "$_f" ]] && { _epics_ok=1; break; }; done
(( _epics_ok )) || missing+=("epics.md (looked in: ${EPICS_CANDIDATES[*]#"$REPO"/})")
[[ -f "$SPRINT_STATUS" ]] || missing+=("_bmad-output/implementation-artifacts/sprint-status.yaml")

if (( ${#missing[@]} > 0 )); then
  echo ""
  echo "ERROR: Repo is not BMAD v6-prepped. Missing artifacts:"
  printf "  - %s\n" "${missing[@]}"
  echo ""
  echo "Run the BMAD v6 planning workflow interactively first, then re-run."
  exit 1
fi

# Enumerate stories directly from sprint-status.yaml (in document order)
# rather than globbing *.md files. This way `backlog` stories — which have
# no file yet — are included and processed in epic/story order alongside
# stories that already have files. Output: "<key>\t<status>" per line.
# Filters out epic-* entries, *-retrospective entries, and done stories.
enumerate_pending_from_sprint_status() {
  awk '
    /^development_status:/ { in_ds=1; next }
    in_ds && /^[^[:space:]]/ { in_ds=0 }
    in_ds && /^[[:space:]]+[0-9]+-[0-9]+-[^:[:space:]]+:/ {
      line = $0
      sub(/^[[:space:]]+/, "", line)
      n = index(line, ":")
      key = substr(line, 1, n-1)
      status = substr(line, n+1)
      sub(/^[[:space:]]+/, "", status)
      sub(/[[:space:]]*#.*$/, "", status)
      sub(/[[:space:]]+$/, "", status)
      gsub(/["'"'"']/, "", status)
      if (tolower(status) != "done") print key "\t" status
    }
  ' "$SPRINT_STATUS"
}

all_pending_lines=()
while IFS= read -r line; do
  [[ -n "$line" ]] && all_pending_lines+=("$line")
done < <(enumerate_pending_from_sprint_status)

(( ${#all_pending_lines[@]} > 0 )) || {
  # Not a preflight failure per se — sprint-status exists but every story
  # is done, or it has no story-shaped keys. Treat as "nothing to do".
  echo "Planning: $PLANNING_DESC ✓"
  echo "Stories: 0 pending (all done, or sprint-status.yaml has no story entries)"
  echo ""
  echo "Nothing to do."
  exit 0
}

# Apply epic filter: prefix match on the epic number segment so `--epic 2`
# matches `2-*` without catching `3-2`, `4-12`, etc. Also supports fuller
# prefixes like `--epic 2-9`.
filtered_lines=()
for l in "${all_pending_lines[@]}"; do
  key="${l%%$'\t'*}"
  if [[ -z "$EPIC" || "$key" == "$EPIC-"* ]]; then
    filtered_lines+=("$l")
  fi
done
(( ${#filtered_lines[@]} > 0 )) || { echo "ERROR: No pending stories matched filter '$EPIC'" >&2; exit 1; }

echo "Planning: $PLANNING_DESC ✓"
echo "Stories: ${#filtered_lines[@]} pending (of ${#all_pending_lines[@]} non-done total)"

# ---------- preflight: repo state ----------
cd "$REPO"
git rev-parse --is-inside-work-tree >/dev/null 2>&1 \
  || { echo "ERROR: $REPO is not a git repo" >&2; exit 1; }

DIRTY_TRACKED=0; DIRTY_UNTRACKED=0
git diff-index --quiet HEAD -- || DIRTY_TRACKED=1
[[ -n "$(git ls-files --others --exclude-standard)" ]] && DIRTY_UNTRACKED=1

# `abort` mode preserves the historical behavior: only tracked-file
# modifications block the run. Untracked files (e.g. logs/) are tolerated
# silently. `stash` and `discard` clean up both.
if (( DIRTY_TRACKED )) && [[ "$ON_DIRTY" == "abort" ]]; then
  echo "ERROR: Repo has uncommitted changes. Commit/stash, or pass --on-dirty stash|discard." >&2
  git status --short
  exit 1
fi

if (( DIRTY_TRACKED || DIRTY_UNTRACKED )) && [[ "$ON_DIRTY" != "abort" ]]; then
  case "$ON_DIRTY" in
    stash)
      stash_msg="byolomad pre-run $(date +%Y%m%d-%H%M%S)"
      git stash push --include-untracked --message "$stash_msg" >/dev/null
      echo "Stashed pre-run state: $stash_msg  (recover with: git stash pop)"
      ;;
    discard)
      echo "Discarding uncommitted changes (--on-dirty discard):"
      git status --short
      git reset --hard HEAD >/dev/null
      git clean -fd >/dev/null
      ;;
  esac
fi

# Make sure the base branch exists locally or on origin
if ! git rev-parse --verify --quiet "$BASE_BRANCH" >/dev/null \
   && ! git rev-parse --verify --quiet "origin/$BASE_BRANCH" >/dev/null; then
  echo "ERROR: Base branch '$BASE_BRANCH' not found locally or on origin." >&2
  exit 1
fi

git fetch --quiet origin || echo "Warning: could not fetch origin (offline?)"

# Default branch name if not given
if [[ -z "$BRANCH" ]]; then
  BRANCH="autonomous/${EPIC:-run}-$(date +%Y%m%d-%H%M%S)"
fi

# ---------- preflight: test command ----------
if [[ -z "$TEST_CMD" ]]; then
  if   [[ -f package.json ]];   then TEST_CMD="npm test"
  elif [[ -f pyproject.toml ]] || [[ -f pytest.ini ]] || [[ -f setup.py ]]; then TEST_CMD="pytest"
  elif [[ -f go.mod ]];         then TEST_CMD="go test ./..."
  elif [[ -f Cargo.toml ]];     then TEST_CMD="cargo test"
  else
    echo "ERROR: could not auto-detect test command. Pass --test-cmd." >&2
    exit 1
  fi
fi

# ---------- preflight: host auth ----------
[[ -f "$HOME/.gitconfig"    ]] || { echo "ERROR: $HOME/.gitconfig missing. Set git user.name/user.email first." >&2; exit 1; }
if [[ "$ENGINE" == "claude" ]]; then
  [[ -d "$HOME/.claude"       ]] || { echo "ERROR: $HOME/.claude missing. Log in to Claude Code first." >&2; exit 1; }
  [[ -f "$HOME/.claude.json"  ]] || { echo "ERROR: $HOME/.claude.json missing. Log in to Claude Code first." >&2; exit 1; }
fi

# Default image tag picks up the pre-built review image when --review is on,
# so we can reuse existing local images without rebuilding. --image overrides.
if [[ -z "$IMAGE_TAG" ]]; then
  if [[ "$RUN_REVIEW" == "1" ]]; then IMAGE_TAG="byolomad:review"
  else                                IMAGE_TAG="byolomad:latest"
  fi
fi

# ---------- preflight: Cursor auth (review is on by default) ----------
# Claude/Amp use the cursor-reviews skill for the external-review phase. Codex
# uses a native review prompt instead, so it does not require Cursor auth.
if [[ "$RUN_REVIEW" == "1" && "$ENGINE" != "codex" ]]; then
  [[ -d "$HOME/.cursor" ]] || { echo "ERROR: review phase requires $HOME/.cursor. Enable Cursor CLI first (Cursor app > Settings > Enable CLI, then 'cursor --install-agent' or 'agent login'), or pass --no-review to skip." >&2; exit 1; }
  [[ -f "$HOME/.claude/scripts/run-external-review.sh" ]] || { echo "ERROR: review phase requires ~/.claude/scripts/run-external-review.sh (installed by the cursor-reviews skill), or pass --no-review to skip." >&2; exit 1; }
fi

echo "Branch: $BRANCH (base: $BASE_BRANCH)"
echo "Test:   $TEST_CMD"
echo "Timeout: $([[ "$PHASE_TIMEOUT" == "0" ]] && echo "disabled" || echo "$PHASE_TIMEOUT per phase")"
echo "Engine: $ENGINE"
if [[ "$ENGINE" == "claude" ]]; then
  if [[ "$MODEL" == "$MODEL_HEAVY" ]]; then
    echo "Model:  $MODEL"
  else
    echo "Model:  $MODEL (baseline) / $MODEL_HEAVY (DEV, APPLY-FIXES, CODE-REVIEW)"
  fi
elif [[ "$ENGINE" == "amp" ]]; then
  if [[ "$AMP_MODE" == "$AMP_MODE_HEAVY" ]]; then
    echo "Mode:   $AMP_MODE"
  else
    echo "Mode:   $AMP_MODE (baseline) / $AMP_MODE_HEAVY (DEV, APPLY-FIXES, CODE-REVIEW)"
  fi
else
  if [[ -n "$MODEL" || -n "$MODEL_HEAVY" ]]; then
    echo "Model:  ${MODEL:-codex default} (baseline) / ${MODEL_HEAVY:-codex default} (DEV, APPLY-FIXES, CODE-REVIEW)"
  else
    echo "Model:  codex default"
  fi
fi
echo ""

# ---------- plan: skip already-done stories ----------
# A story is considered "done" if EITHER:
#   1. sprint-status.yaml has `<story-name>: done` in the development_status
#      block. This is BMAD v6's authoritative source of truth — the
#      bmad-dev-story and bmad-code-review skills update it directly.
#   2. A commit on the working branch references the story name in its
#      subject line (how this script marks its own completions).
sprint_status_for() {
  # Return the status value (lowercased) for a story key from sprint-status.yaml,
  # or empty if not found. Keys look like "2-6-saved-workflow-...: done".
  local name="$1"
  awk -v key="$name" '
    $0 ~ "^[[:space:]]+" key "[[:space:]]*:" {
      sub(/^[[:space:]]+[^:]+:[[:space:]]*/, "")
      sub(/[[:space:]]+#.*$/, "")
      gsub(/["'"'"']/, "")
      print tolower($0); exit
    }
  ' "$SPRINT_STATUS"
}

# Commit-log fallback: if the working branch already has a commit whose
# subject starts with "<name>:" we treat it as done (how the runner marks
# its own completions) even if sprint-status.yaml still says otherwise.
story_already_committed() {
  # Anchor on the exact subject prefix FINALIZE writes ("<name>: ", see the
  # finalize prompt) so a key is not matched as a loose substring of a longer
  # committed key — e.g. "2-1-auth" must not match "2-1-auth-v2: ...". Mirrors
  # the in-container verification at the end of the run loop.
  git log --pretty=%s "$BRANCH" 2>/dev/null | grep -qF "$1: "
}

pending=()           # parallel arrays: story key and its sprint-status
pending_statuses=()
skipped=()
for l in "${filtered_lines[@]}"; do
  name="${l%%$'\t'*}"
  status="${l#*$'\t'}"
  if story_already_committed "$name"; then
    skipped+=("$name (committed)")
  else
    pending+=("$name")
    pending_statuses+=("$status")
  fi
done

echo "=== Plan ==="
if (( ${#skipped[@]} > 0 )); then
  echo "Skipping ${#skipped[@]} already-done:"
  printf "  - %s\n" "${skipped[@]}"
fi
echo "Pending ${#pending[@]}:"
for i in "${!pending[@]}"; do
  printf "  - %s  [status: %s]\n" "${pending[$i]}" "${pending_statuses[$i]}"
done
echo ""

if [[ "$DRY_RUN" == "1" ]]; then
  echo "(dry-run — exiting before Docker)"
  exit 0
fi

if (( ${#pending[@]} == 0 )); then
  echo "Nothing to do."
  exit 0
fi

# ---------- build image ----------
# Reuse existing local image if present (build step needs network access to
# docker.io for the base layer, which may not always be available). Set
# REBUILD=1 to force a fresh build.
if [[ "${REBUILD:-0}" != "1" ]] && docker image inspect "$IMAGE_TAG" >/dev/null 2>&1; then
  echo "=== Reusing existing $IMAGE_TAG image (set REBUILD=1 to force) ==="
else
  echo "=== Building $IMAGE_TAG image ==="
  docker build -q \
    --build-arg HOST_UID="$(id -u)" \
    --build-arg WITH_CURSOR_AGENT="$RUN_REVIEW" \
    -t "$IMAGE_TAG" \
    "$SCRIPT_DIR" > /dev/null
fi
echo "Image ready."
echo ""

# ---------- stage host config ----------
CLAUDE_STAGING=""
CODEX_STAGING=""
if [[ "$ENGINE" == "claude" ]]; then
  # Stage ONLY what the BMAD phases need into a throwaway dir, then mount that
  # (never the live ~/.claude). An allowlist, not `cp -R ~/.claude/.`: a full
  # copy would drag in history.jsonl, projects/, sessions/, paste-cache/, and
  # any .credentials.json* backups — none used by the phases, all readable by
  # an agent running --dangerously-skip-permissions on attacker-influenceable
  # story content. Auth is via CLAUDE_CODE_OAUTH_TOKEN (a long-lived machine
  # token), never the device-bound macOS keychain token (which 401s in Linux).
  CLAUDE_STAGING="$(mktemp -d)"
  mkdir -p "$CLAUDE_STAGING/.claude"
  for _item in settings.json CLAUDE.md commands skills plugins scripts; do
    [[ -e "$HOME/.claude/$_item" ]] && cp -R "$HOME/.claude/$_item" "$CLAUDE_STAGING/.claude/"
  done
  # ~/.claude.json holds MCP server definitions whose env blocks carry
  # third-party credentials (at the top level AND per-project), an oauthAccount
  # identity block, and a projects block with per-project prompt/session
  # telemetry. The container disables MCP (--strict-mcp-config below) and runs
  # --dangerously-skip-permissions, so it needs none of that — strip all three
  # at every depth before staging. Fall back to an empty config if jq is
  # unavailable (rather than leak an unfiltered file).
  if command -v jq >/dev/null 2>&1; then
    jq 'walk(if type == "object" then del(.mcpServers, .oauthAccount, .projects) else . end)' \
       "$HOME/.claude.json" > "$CLAUDE_STAGING/.claude.json" 2>/dev/null \
      || echo '{}' > "$CLAUDE_STAGING/.claude.json"
  else
    echo '{}' > "$CLAUDE_STAGING/.claude.json"
  fi

  if [[ -z "${CLAUDE_CODE_OAUTH_TOKEN:-}" ]]; then
    echo "ERROR: CLAUDE_CODE_OAUTH_TOKEN is not set, and no fallback env-file supplied it." >&2
    echo "Containers need a long-lived OAuth token to auth against Anthropic." >&2
    echo "Looked for a fallback at: $BYOLOMAD_ENV_FILE (override with BYOLOMAD_ENV_FILE)." >&2
    echo "Generate a token with: claude setup-token  (then export it, or add it to that env-file)." >&2
    exit 1
  fi
elif [[ "$ENGINE" == "amp" ]]; then
  # Amp engine — auth via AMP_API_KEY. No host config staging needed;
  # Amp reads AGENTS.md / .amp/ from the workspace directly.
  CLAUDE_STAGING="$(mktemp -d)"  # still needed for cleanup trap
  if [[ -z "${AMP_API_KEY:-}" ]]; then
    echo "ERROR: AMP_API_KEY is not set in your environment." >&2
    echo "Get your access token from https://ampcode.com/settings" >&2
    echo "then:  export AMP_API_KEY=sgamp_..." >&2
    exit 1
  fi
else
  # Codex engine — auth via CODEX_HOME (~/.codex/auth.json from `codex login`) or
  # OPENAI_API_KEY. Stage a minimal CODEX_HOME (auth only, no config.toml/MCP) the
  # way the claude branch stages ~/.claude. The in-container phase prompts below
  # avoid Claude slash commands and instead tell Codex to execute the BMAD
  # workflow from the repository artifacts.
  CLAUDE_STAGING="$(mktemp -d)"   # kept for the cleanup trap
  CODEX_STAGING="$(mktemp -d)"
  if [[ -d "$HOME/.codex" ]]; then
    mkdir -p "$CODEX_STAGING/.codex"
    [[ -f "$HOME/.codex/auth.json" ]] && cp "$HOME/.codex/auth.json" "$CODEX_STAGING/.codex/"
  fi
  if [[ ! -f "$CODEX_STAGING/.codex/auth.json" && -z "${OPENAI_API_KEY:-}" ]]; then
    echo "ERROR: codex engine needs ~/.codex/auth.json (run 'codex login') or OPENAI_API_KEY in the environment." >&2
    exit 1
  fi
fi

# ---------- stage host Cursor config (if --review) ----------
CURSOR_STAGING=""
if [[ "$RUN_REVIEW" == "1" && "$ENGINE" != "codex" ]]; then
  CURSOR_STAGING="$(mktemp -d)"
  cp -R "$HOME/.cursor/." "$CURSOR_STAGING/.cursor"
  # Strip what the review agent does not need and must not see inside a
  # container processing untrusted diffs: mcp.json can hold plaintext API
  # keys, and chats/projects/prompt_history/statsig are large local history
  # irrelevant to a diff review. The agent's own auth (cli-config.json) stays.
  rm -rf "$CURSOR_STAGING/.cursor/mcp.json" \
         "$CURSOR_STAGING/.cursor/chats" \
         "$CURSOR_STAGING/.cursor/projects" \
         "$CURSOR_STAGING/.cursor/prompt_history.json" \
         "$CURSOR_STAGING/.cursor/statsig-cache.json"
fi

cleanup() { rm -rf "$CLAUDE_STAGING" "$CURSOR_STAGING" "$CODEX_STAGING"; }
trap cleanup EXIT

# ---------- switch to working branch ----------
# Create or reuse the branch. If it exists already (resume case), check it out;
# otherwise fork from base.
if git rev-parse --verify --quiet "$BRANCH" >/dev/null; then
  echo "Resuming existing branch: $BRANCH"
  git checkout "$BRANCH"
else
  echo "Creating branch: $BRANCH from ${BASE_BRANCH}"
  # Prefer origin/<base> if it's ahead
  if git rev-parse --verify --quiet "origin/$BASE_BRANCH" >/dev/null; then
    git checkout -b "$BRANCH" "origin/$BASE_BRANCH"
  else
    git checkout -b "$BRANCH" "$BASE_BRANCH"
  fi
fi
echo ""

mkdir -p "$REPO/logs"

# Keep byolomad run logs out of the story commits. FINALIZE does a broad
# "git add all changed files", and logs live under the repo tree (mounted at
# /workspace), so without this they would be swept into history and shipped on
# merge. .git/info/exclude is a local-only ignore: it does not modify the
# tracked .gitignore, and it is honored by git inside the container (same .git
# via the bind mount). Covers the .jsonl, -review.md, and -review-invoke.log.
git_exclude="$(git rev-parse --git-path info/exclude 2>/dev/null)"
if [[ -n "$git_exclude" ]] && ! grep -qxF 'logs/' "$git_exclude" 2>/dev/null; then
  mkdir -p "$(dirname "$git_exclude")"
  printf 'logs/\n' >> "$git_exclude"
fi

# ---------- run loop ----------
REMOVE_FLAG="--rm"
[[ "$KEEP_CONTAINER" == "1" ]] && REMOVE_FLAG=""

SPRINT_STATUS_REL="$STORIES_DIR_REL/sprint-status.yaml"

FAILED_STORY=""
for i in "${!pending[@]}"; do
  name="${pending[$i]}"
  status="${pending_statuses[$i]}"
  relpath="$STORIES_DIR_REL/${name}.md"
  container_name="byolomad-$(echo "$name" | tr -c 'A-Za-z0-9' '-')-$$"
  log_file="logs/${name}.jsonl"

  echo "=== $name ==="

  # Finalization prompt — kept as a small env var to avoid the complexity
  # of shipping a multi-line heredoc through docker -e. In v6, the
  # code-review workflow is responsible for marking sprint-status.yaml
  # done; this phase just verifies that and commits.
  FINALIZE_PROMPT="The story ${relpath} has been implemented, tests pass, and ${CMD_PREFIX}-code-review has run. Do only these final steps:
1. Open ${SPRINT_STATUS_REL}. Find the line for '${name}:'. If it reads 'done' already, leave it. Otherwise (e.g. 'review', 'in-progress', 'ready-for-dev'), update ONLY that single line so it reads '${name}: done'. Do not touch other stories, comments, or unrelated lines.
2. git add all changed files.
3. git commit with the subject line starting EXACTLY with '${name}: '.
Do not run tests. Do not modify implementation code. Exit cleanly."

  # Conditional review mounts
  REVIEW_MOUNTS=()
  if [[ "$RUN_REVIEW" == "1" && "$ENGINE" != "codex" ]]; then
    REVIEW_MOUNTS+=(-v "$CURSOR_STAGING/.cursor":/home/runner/.cursor)
  fi

  # Run the AI engine inside the container as a sequence of phases, each
  # its own invocation (== a fresh context). The container stays up for
  # the duration; /workspace state accumulates across phases.
  #
  # Engine-specific notes:
  #   claude: auth via CLAUDE_CODE_OAUTH_TOKEN; ~/.claude mounted RW.
  #   amp:    auth via AMP_API_KEY; no host config needed.
  #   codex:  auth via CODEX_HOME or OPENAI_API_KEY; no slash-command support, so
  #           phases use explicit BMAD workflow prompts.

  # Build engine-specific docker args
  ENGINE_MOUNTS=()
  ENGINE_ENVS=()
  if [[ "$ENGINE" == "claude" ]]; then
    ENGINE_MOUNTS+=(-v "$CLAUDE_STAGING/.claude":/home/runner/.claude)
    ENGINE_MOUNTS+=(-v "$CLAUDE_STAGING/.claude.json":/home/runner/.claude.json)
    ENGINE_ENVS+=(-e CLAUDE_CODE_OAUTH_TOKEN="$CLAUDE_CODE_OAUTH_TOKEN")
    ENGINE_ENVS+=(-e BMAD_MODEL="$MODEL")
    ENGINE_ENVS+=(-e BMAD_MODEL_HEAVY="$MODEL_HEAVY")
  elif [[ "$ENGINE" == "amp" ]]; then
    ENGINE_ENVS+=(-e AMP_API_KEY="$AMP_API_KEY")
    ENGINE_ENVS+=(-e BMAD_AMP_MODE="$AMP_MODE")
    ENGINE_ENVS+=(-e BMAD_AMP_MODE_HEAVY="$AMP_MODE_HEAVY")
  else
    # Codex: mount the staged CODEX_HOME and point codex at it; pass
    # OPENAI_API_KEY if present. BMAD_MODEL(_HEAVY) may be empty (codex default).
    [[ -d "$CODEX_STAGING/.codex" ]] && ENGINE_MOUNTS+=(-v "$CODEX_STAGING/.codex":/home/runner/.codex)
    ENGINE_ENVS+=(-e CODEX_HOME=/home/runner/.codex)
    [[ -n "${OPENAI_API_KEY:-}" ]] && ENGINE_ENVS+=(-e OPENAI_API_KEY="$OPENAI_API_KEY")
    ENGINE_ENVS+=(-e BMAD_MODEL="$MODEL")
    ENGINE_ENVS+=(-e BMAD_MODEL_HEAVY="$MODEL_HEAVY")
  fi

  # Isolate the container's node_modules from the host repo (prevents the container's
  # Linux install from clobbering the host's native bindings via the bind mount). Use a
  # writable host dir rather than a bare anonymous volume, which Docker creates root-owned
  # and the non-root container user cannot write to.
  NM_ISOLATE="${TMPDIR:-/tmp}/byolomad-nm/$(basename "$REPO")"
  mkdir -p "$NM_ISOLATE" && chmod 777 "$NM_ISOLATE"
  set +e
  docker run $REMOVE_FLAG \
    --name "$container_name" \
    -v "$REPO":/workspace \
    -v "$NM_ISOLATE":/workspace/node_modules \
    "${ENGINE_MOUNTS[@]}" \
    -v "$HOME/.gitconfig":/home/runner/.gitconfig:ro \
    "${REVIEW_MOUNTS[@]}" \
    -w /workspace \
    "${ENGINE_ENVS[@]}" \
    -e BMAD_ENGINE="$ENGINE" \
    -e BMAD_TEST_CMD="$TEST_CMD" \
    -e BMAD_STORY_NAME="$name" \
    -e BMAD_STORY_RELPATH="$relpath" \
    -e BMAD_BASE_BRANCH="$BASE_BRANCH" \
    -e BMAD_RUN_REVIEW="$RUN_REVIEW" \
    -e BMAD_STORY_STATUS="$status" \
    -e BMAD_SPRINT_STATUS_REL="$SPRINT_STATUS_REL" \
    -e BMAD_CMD_PREFIX="$CMD_PREFIX" \
    -e BMAD_PHASE_TIMEOUT="$PHASE_TIMEOUT" \
    -e BMAD_FINALIZE_PROMPT="$FINALIZE_PROMPT" \
    "$IMAGE_TAG" \
    bash -c '
      set -e

      # Dispatch function: calls claude or amp based on BMAD_ENGINE.
      # Args: $1 = prompt, $2 = optional model/mode override.
      # (Any apostrophe in comments inside this bash -c body would close
      # the outer single-quote and break parsing. Keep them out.)
      agent_run() {
        case "$BMAD_ENGINE" in
          amp)   amp_run "$1" "$2" ;;
          codex) codex_run "$1" "$2" ;;
          *)     claude_run "$1" "$2" ;;
        esac
      }

      # Each phase is wrapped in `timeout` so a wedged agent (network stall,
      # tool loop, prompt that never returns) cannot hang an unattended run
      # forever. coreutils is in the image; -k 30 follows SIGTERM with SIGKILL
      # 30s later for a process that ignores the term. A value of 0 disables.
      # On expiry timeout exits 124 (137 if SIGKILLed), which under set -e
      # aborts the body and routes into the host rc!=0 / resume path.
      claude_run() {
        local _model="${2:-$BMAD_MODEL}"
        timeout -k 30 "${BMAD_PHASE_TIMEOUT:-3600}" claude -p "$1" \
          --model "$_model" \
          --dangerously-skip-permissions \
          --strict-mcp-config --mcp-config '"'"'{"mcpServers":{}}'"'"' \
          --output-format stream-json \
          --verbose
      }

      amp_run() {
        local _mode="${2:-$BMAD_AMP_MODE}"
        timeout -k 30 "${BMAD_PHASE_TIMEOUT:-3600}" amp --execute "$1" \
          --mode "$_mode" \
          --dangerously-allow-all \
          --mcp-config '"'"'{}'"'"' \
          --stream-json
      }

      # codex exec == headless run. The bypass flag is codex equivalent of
      # --dangerously-skip-permissions (safe here: the container IS the sandbox).
      # --json streams events for liveness logging. Model is optional: when empty
      # codex uses its own configured default.
      codex_run() {
        local _model="${2:-$BMAD_MODEL}"
        if [ -n "$_model" ]; then
          timeout -k 30 "${BMAD_PHASE_TIMEOUT:-3600}" codex exec "$1" \
            -m "$_model" \
            --dangerously-bypass-approvals-and-sandbox \
            --skip-git-repo-check \
            --json
        else
          timeout -k 30 "${BMAD_PHASE_TIMEOUT:-3600}" codex exec "$1" \
            --dangerously-bypass-approvals-and-sandbox \
            --skip-git-repo-check \
            --json
        fi
      }

      codex_phase_prompt() {
        local phase="$1"
        case "$phase" in
          create-story)
            cat <<EOF
You are running inside a BMAD v6-prepped repository as the Scrum Master phase for story "$BMAD_STORY_NAME".

Codex does not have Claude slash commands, so execute the BMAD create-story workflow directly:
1. Inspect the repository BMAD assets under _bmad/ and _bmad-output/.
2. Read the relevant planning artifacts:
   - BMM/software projects: _bmad-output/planning-artifacts/prd.md, architecture.md, epics.md.
   - GDS/game projects: _bmad-output/gdd.md, game-architecture.md, and epics.md wherever present.
3. Create or update exactly this story file: $BMAD_STORY_RELPATH.
4. Follow the local BMAD story format, task structure, acceptance criteria, dev notes, and testing guidance from the repo artifacts. Preserve existing human content if the file already exists.
5. Update only the matching "$BMAD_STORY_NAME:" line in $BMAD_SPRINT_STATUS_REL to ready-for-dev when the story is prepared.

Do not implement product code. Do not commit. If something required is missing, explain the missing artifact and exit non-zero.
EOF
            ;;
          dev-story)
            cat <<EOF
You are running inside a BMAD v6-prepped repository as the Developer phase for story "$BMAD_STORY_NAME".

Codex does not have Claude slash commands, so execute the BMAD dev-story workflow directly:
1. Read $BMAD_STORY_RELPATH, $BMAD_SPRINT_STATUS_REL, and the relevant BMAD guidance under _bmad/.
2. Implement only the story scope, satisfying its acceptance criteria and tasks.
3. Add or update focused tests where the story calls for them or where the change needs regression coverage.
4. Keep unrelated files and unrelated stories untouched.
5. Update the story file task checklist/dev-agent sections in the local BMAD style, and set only the matching "$BMAD_STORY_NAME:" line in $BMAD_SPRINT_STATUS_REL to review when implementation is ready for validation.

Do not commit. Do not mark the story done.$_ultrathink
EOF
            ;;
          ext-review)
            cat <<EOF
Review the current uncommitted changes for story "$BMAD_STORY_NAME" ($BMAD_STORY_RELPATH).

Write a concise consolidated review report to logs/${BMAD_STORY_NAME}-review.md. Focus on correctness, regressions, security, missing tests, and story-scope mismatches. If there are no actionable findings, write that clearly. Do not modify code in this phase.
EOF
            ;;
          code-review)
            cat <<EOF
You are running inside a BMAD v6-prepped repository as the Code Review phase for story "$BMAD_STORY_NAME".

Codex does not have Claude slash commands, so execute the BMAD code-review workflow directly:
1. Read $BMAD_STORY_RELPATH and inspect the story changes with git diff HEAD.
2. Review for correctness, acceptance-criteria coverage, regressions, security issues, and missing tests.
3. Apply only fixes that are necessary for this story. Keep unrelated code untouched.
4. Update the story file review/dev-agent notes in the local BMAD style.
5. Leave final sprint-status completion to the FINALIZE phase.

Do not commit.$_ultrathink
EOF
            ;;
          *)
            return 1
            ;;
        esac
      }

      bmad_phase_prompt() {
        local phase="$1"
        if [ "$BMAD_ENGINE" = "codex" ]; then
          codex_phase_prompt "$phase"
          return
        fi

        case "$phase" in
          create-story) printf "/%s-create-story %s\n" "$BMAD_CMD_PREFIX" "$BMAD_STORY_NAME" ;;
          dev-story)    printf "/%s-dev-story %s%s\n" "$BMAD_CMD_PREFIX" "$BMAD_STORY_RELPATH" "$_ultrathink" ;;
          ext-review)   printf "Run /cursor-reviews on the current uncommitted changes (git diff HEAD). Scope: only the changes made for story %s (%s). After the reviews finish, write a consolidated summary of all findings to logs/%s-review.md (not to stdout only -- write the file).\n" "$BMAD_STORY_NAME" "$BMAD_STORY_RELPATH" "$BMAD_STORY_NAME" ;;
          code-review)  printf "/%s-code-review %s%s\n" "$BMAD_CMD_PREFIX" "$BMAD_STORY_RELPATH" "$_ultrathink" ;;
          *)            return 1 ;;
        esac
      }

      # Baseline phases:    SM -> DEV -> TEST -> CODE-REVIEW -> FINALIZE = 5
      # With --review add:   EXT-REVIEW + APPLY-FIXES before TEST         = 7
      total_phases=5
      [ "$BMAD_RUN_REVIEW" = "1" ] && total_phases=7

      # Gate SM and DEV on BMAD v6 sprint-status. Prevents re-running
      # create-story against a finalized story file (risk: regenerates
      # content) or dev-story against already-reviewed code.
      #   backlog / "":   run SM + DEV
      #   ready-for-dev:  skip SM, run DEV
      #   in-progress:    skip SM, run DEV (dev-story handles resume)
      #   review:         skip SM + DEV, start from TEST / EXT-REVIEW
      case "$BMAD_STORY_STATUS" in
        review)              do_sm=0; do_dev=0 ;;
        ready-for-dev|in-progress) do_sm=0; do_dev=1 ;;
        *)                   do_sm=1; do_dev=1 ;;
      esac

      echo "=== [$BMAD_STORY_NAME] sprint-status=${BMAD_STORY_STATUS:-<none>}; sm=$do_sm dev=$do_dev ==="

      # Resolve the "heavy" parameter for agent_run. For Claude this is
      # a model name; for Amp it is an agent mode. agent_run dispatches.
      if [ "$BMAD_ENGINE" = "amp" ]; then
        _heavy="$BMAD_AMP_MODE_HEAVY"
      else
        _heavy="$BMAD_MODEL_HEAVY"
      fi

      # "ultrathink" is a Claude Code prompt trigger that allocates the
      # largest extended-thinking budget. For Amp, deep mode handles this
      # automatically, so we strip it from the prompt.
      _ultrathink=""
      [ "$BMAD_ENGINE" = "claude" ] && _ultrathink="

ultrathink"

      if [ "$do_sm" = "1" ]; then
        echo "=== [$BMAD_STORY_NAME] Phase 1/$total_phases: SM (${BMAD_CMD_PREFIX}-create-story) ==="
        # For backlog stories the file does not exist yet; pass the story
        # key (not a path) so create-story parses the epic/story number
        # and resolves content from epics.md. SM writes the file to the
        # default location which matches $BMAD_STORY_RELPATH.
        agent_run "$(bmad_phase_prompt create-story)"
      else
        echo "=== [$BMAD_STORY_NAME] Phase 1/$total_phases: SM -- SKIPPED (status=$BMAD_STORY_STATUS, story already created) ==="
      fi

      if [ "$do_dev" = "1" ]; then
        echo "=== [$BMAD_STORY_NAME] Phase 2/$total_phases: DEV (${BMAD_CMD_PREFIX}-dev-story) [$_heavy] ==="
        agent_run "$(bmad_phase_prompt dev-story)" "$_heavy"
      else
        echo "=== [$BMAD_STORY_NAME] Phase 2/$total_phases: DEV -- SKIPPED (status=$BMAD_STORY_STATUS, dev already complete) ==="
      fi

      if [ "$BMAD_RUN_REVIEW" = "1" ]; then
        echo "=== [$BMAD_STORY_NAME] Phase 3/$total_phases: EXT-REVIEW (cursor-reviews on diff) ==="
        mkdir -p logs
        REVIEW_FILE="logs/${BMAD_STORY_NAME}-review.md"
        # Feed cursor-reviews ONLY this story'\''s uncommitted changes.
        # The skill runs the diff through parallel external reviews.
        # Best-effort: a non-zero exit or a timeout here must NOT abort the
        # story — it degrades to the empty-REVIEW_FILE path below (warn + skip
        # APPLY-FIXES), so a flaky/wedged external review never blocks the run.
        agent_run "$(bmad_phase_prompt ext-review)" > "logs/${BMAD_STORY_NAME}-review-invoke.log" 2>&1 || true

        if [ ! -s "$REVIEW_FILE" ]; then
          echo "WARNING: ext-review phase produced no $REVIEW_FILE — skipping APPLY-FIXES"
        else
          echo "=== [$BMAD_STORY_NAME] Phase 4/$total_phases: APPLY-FIXES (from external review) [$_heavy] ==="
          agent_run "Read the review findings in $REVIEW_FILE. Apply ONLY the fixes that are in scope for story $BMAD_STORY_NAME ($BMAD_STORY_RELPATH). Ignore findings about unrelated code. Do not modify the story file, tests only when directly relevant. After applying, re-run the test command to confirm nothing regressed: $BMAD_TEST_CMD${_ultrathink}" "$_heavy"
        fi
      fi

      TEST_PHASE=$([ "$BMAD_RUN_REVIEW" = "1" ] && echo "5/7" || echo "3/5")
      CR_PHASE=$(  [ "$BMAD_RUN_REVIEW" = "1" ] && echo "6/7" || echo "4/5")
      FIN_PHASE=$( [ "$BMAD_RUN_REVIEW" = "1" ] && echo "7/7" || echo "5/5")

      echo "=== [$BMAD_STORY_NAME] Phase $TEST_PHASE: TEST ($BMAD_TEST_CMD) ==="
      timeout -k 30 "${BMAD_PHASE_TIMEOUT:-3600}" bash -c "$BMAD_TEST_CMD"

      echo "=== [$BMAD_STORY_NAME] Phase $CR_PHASE: CODE-REVIEW (${BMAD_CMD_PREFIX}-code-review) [$_heavy] ==="
      agent_run "$(bmad_phase_prompt code-review)" "$_heavy"

      echo "=== [$BMAD_STORY_NAME] Phase $FIN_PHASE: FINALIZE (verify done + commit) ==="
      agent_run "$BMAD_FINALIZE_PROMPT"

      # Verify the finalize phase actually committed with the expected subject.
      git log -1 --pretty=%s | grep -qF "$BMAD_STORY_NAME:" \
        || { echo "ERROR: no commit for $BMAD_STORY_NAME"; exit 2; }
    ' 2>&1 | tee "$log_file"
  rc=${PIPESTATUS[0]}
  set -e

  if [[ "$rc" -ne 0 ]]; then
    FAILED_STORY="$name"
    echo ""
    if [[ "$rc" -eq 124 || "$rc" -eq 137 ]]; then
      echo "  ✗ $name failed (exit $rc — a phase exceeded --phase-timeout=$PHASE_TIMEOUT). See $log_file."
    else
      echo "  ✗ $name failed (exit $rc). See $log_file."
    fi
    break
  fi

  echo "  ✓ $name done: $(git -C "$REPO" log -1 --oneline)"
  echo ""
done

# ---------- summary ----------
echo "=== Summary ==="
echo "Branch: $BRANCH"
if [[ -n "$FAILED_STORY" ]]; then
  echo "Status: STOPPED at $FAILED_STORY"
  echo ""
  echo "To resume after fixing the story or code:"
  # Rebuild the full invocation — every non-default flag the run used, plus
  # a `| tee` suggestion so the retry actually captures output (easy to
  # forget and then there's no log to diagnose a repeat failure from).
  # Values are %q-quoted so paths/commands with spaces or shell metacharacters
  # round-trip safely when pasted back. Defaults come from the DEFAULT_*
  # constants so a model/branch bump never desyncs this from the parser.
  resume_cmd="$(printf '%q' "$0") --repo $(printf '%q' "$REPO") --branch $(printf '%q' "$BRANCH")"
  [[ -n "$EPIC"                            ]] && resume_cmd+=" --epic $(printf '%q' "$EPIC")"
  [[ -n "$TEST_CMD"                        ]] && resume_cmd+=" --test-cmd $(printf '%q' "$TEST_CMD")"
  [[ "$MODULE_REQUESTED" != "$DEFAULT_MODULE" ]] && resume_cmd+=" --module $(printf '%q' "$MODULE_REQUESTED")"
  [[ "$ENGINE" != "$DEFAULT_ENGINE"        ]] && resume_cmd+=" --engine $(printf '%q' "$ENGINE")"
  [[ "$RUN_REVIEW" == "0"                  ]] && resume_cmd+=" --no-review"
  [[ "$ON_DIRTY" != "abort"                ]] && resume_cmd+=" --on-dirty $(printf '%q' "$ON_DIRTY")"
  [[ "$KEEP_CONTAINER" == "1"              ]] && resume_cmd+=" --keep-container"
  [[ "$MODEL"       != "$DEFAULT_MODEL"       ]] && resume_cmd+=" --model $(printf '%q' "$MODEL")"
  [[ "$MODEL_HEAVY" != "$DEFAULT_MODEL_HEAVY" ]] && resume_cmd+=" --model-heavy $(printf '%q' "$MODEL_HEAVY")"
  [[ "$AMP_MODE"       != "$DEFAULT_AMP_MODE"       ]] && resume_cmd+=" --amp-mode $(printf '%q' "$AMP_MODE")"
  [[ "$AMP_MODE_HEAVY" != "$DEFAULT_AMP_MODE_HEAVY" ]] && resume_cmd+=" --amp-mode-heavy $(printf '%q' "$AMP_MODE_HEAVY")"
  [[ "$PHASE_TIMEOUT" != "$DEFAULT_PHASE_TIMEOUT"   ]] && resume_cmd+=" --phase-timeout $(printf '%q' "$PHASE_TIMEOUT")"
  [[ "$BASE_BRANCH" != "$DEFAULT_BASE_BRANCH"       ]] && resume_cmd+=" --base $(printf '%q' "$BASE_BRANCH")"
  echo "  $resume_cmd 2>&1 \\"
  echo "    | tee run-$(basename "$REPO")-\$(date +%Y%m%d-%H%M).log"
  exit 1
fi

echo "Status: all stories complete"
echo ""
echo "Next steps:"
echo "  cd $REPO"
echo "  git log --oneline ${BASE_BRANCH}..HEAD"
echo "  git push -u origin $BRANCH"
