#!/usr/bin/env bash
set -euo pipefail

# BYOLOMAD-AUTO — the autonomous "judge" layer on top of byolomad.sh.
#
# byolomad.sh runs a BMAD repo story-by-story and STOPS at the first story that
# fails a phase (test failure, agent timeout, no commit, etc.), printing a
# resume command and handing back to a human. This wrapper IS that human: it
# runs byolomad, and whenever it stops, an LLM "judge" reads the run log,
# diagnoses why, and decides one of three things —
#
#   resume    transient failure (timeout/network/rate-limit) — just retry.
#   hint      the story was ambiguous / under-specified / a phase asked a
#             question it could not answer headlessly. The judge writes a
#             best-judgment "decisions & assumptions" note INTO the story file,
#             this wrapper commits it, and byolomad re-runs the story with the
#             answer baked in.
#   escalate  not auto-resolvable (auth/token, bad flags, missing artifacts, or
#             a story that keeps failing despite hints) — stop and tell a human.
#
# The judge NEVER edits product code and NEVER runs git itself: it only emits a
# JSON verdict. This wrapper performs every side effect (append the note, commit
# it, resume) in fixed bash, so the model proposes and the shell disposes.
#
# Usage:
#   ./byolomad-auto.sh --repo <path> [any byolomad.sh flag]
#
# Every flag is passed straight through to byolomad.sh. The two it cares about:
#   --repo <path>   required (same as byolomad).
#   --branch <name> optional. If omitted, the wrapper pins one itself so resumes
#                   land on the same branch deterministically.
#
# Knobs (environment):
#   BYOLOMAD_JUDGE_ENGINE  host judge engine: claude | codex. Default: claude.
#                          (Independent of byolomad's in-container --engine.)
#   BYOLOMAD_JUDGE_MODEL   judge model. Default: claude-opus-4-8 (claude engine)
#                          / codex's own default (codex engine).
#   BYOLOMAD_MAX_ITERS     global backstop on byolomad invocations. Default: 40.
#   BYOLOMAD_MAX_SAME_STORY  give up after a single story fails this many times
#                          in a row despite hints. Default: 3.
#   BYOLOMAD_WATCH_MODEL   model for the cheap stall stuck/working call. Default:
#                          claude-sonnet-4-6.
#   BYOLOMAD_STALL_SOFT    seconds of log silence before the watchdog asks the
#                          judge whether a phase is wedged. Default: 600 (10m).
#   BYOLOMAD_STALL_HARD    silence (s) before killing regardless of the judge.
#                          Default: byolomad's --phase-timeout + 5m.
#   BYOLOMAD_WATCH_INTERVAL  watchdog poll cadence, seconds. Default: 60.
#   BYOLOMAD_NO_WATCHDOG=1  disable the stall watchdog entirely.
#
#   -h, --help      Show this help.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BYOLOMAD="$SCRIPT_DIR/byolomad.sh"
STORIES_DIR_REL="_bmad-output/implementation-artifacts"

# Host judge engine. The wrapper's only AI calls (failure diagnosis + stall
# confirm) go through this; it is INDEPENDENT of byolomad's in-container
# --engine. Claude model names are meaningless to codex, so when the judge runs
# on codex the model defaults to empty (codex uses its own configured default)
# unless you set BYOLOMAD_JUDGE_MODEL / BYOLOMAD_WATCH_MODEL to a codex model.
JUDGE_ENGINE="${BYOLOMAD_JUDGE_ENGINE:-claude}"   # claude | codex
if [[ "$JUDGE_ENGINE" == "codex" ]]; then
  JUDGE_MODEL="${BYOLOMAD_JUDGE_MODEL:-}"
  WATCH_MODEL="${BYOLOMAD_WATCH_MODEL:-}"
else
  JUDGE_MODEL="${BYOLOMAD_JUDGE_MODEL:-claude-opus-4-8}"
  WATCH_MODEL="${BYOLOMAD_WATCH_MODEL:-claude-sonnet-4-6}"
fi
MAX_ITERS="${BYOLOMAD_MAX_ITERS:-40}"
MAX_SAME_STORY="${BYOLOMAD_MAX_SAME_STORY:-3}"

# Stall watchdog: a background sentry polls the live run log for liveness and
# pages a (cheap) judge to confirm wedged-vs-busy before killing a hung phase.
# WATCH_MODEL is set above with JUDGE_MODEL (engine-aware default).
WATCH_INTERVAL="${BYOLOMAD_WATCH_INTERVAL:-60}"            # poll cadence, seconds
STALL_SOFT="${BYOLOMAD_STALL_SOFT:-600}"                   # silence before asking the judge (10m)
# STALL_HARD (unconditional-kill ceiling) defaults to byolomad's own
# --phase-timeout + a margin, computed after the arg scan below — so the
# watchdog's blind kill never fires BEFORE byolomad's phase-timeout (which emits
# a clean STOPPED). In practice that leaves the judge-confirmed soft path as the
# only way the watchdog acts; the hard ceiling is a true last resort for runs
# with --phase-timeout disabled. Override verbatim with BYOLOMAD_STALL_HARD.
WATCHDOG="${BYOLOMAD_NO_WATCHDOG:+0}"; WATCHDOG="${WATCHDOG:-1}"  # set BYOLOMAD_NO_WATCHDOG=1 to disable

usage() { sed -n '4,50p' "$0" | sed 's/^# \{0,1\}//'; exit "${1:-0}"; }

# ---------- preflight ----------
for arg in "$@"; do [[ "$arg" == "-h" || "$arg" == "--help" ]] && usage 0; done

[[ -x "$BYOLOMAD" ]] || { echo "ERROR: $BYOLOMAD not found or not executable." >&2; exit 1; }
command -v jq >/dev/null || { echo "ERROR: jq is required (parses the judge verdict)." >&2; exit 1; }
[[ "$JUDGE_ENGINE" == "claude" || "$JUDGE_ENGINE" == "codex" ]] \
  || { echo "ERROR: BYOLOMAD_JUDGE_ENGINE must be 'claude' or 'codex'." >&2; exit 1; }
command -v "$JUDGE_ENGINE" >/dev/null \
  || { echo "ERROR: the '$JUDGE_ENGINE' CLI is required to run the judge (BYOLOMAD_JUDGE_ENGINE=$JUDGE_ENGINE)." >&2; exit 1; }

# ---------- light arg scan ----------
# Pass everything through verbatim, but peek at --repo (needed to locate logs /
# story files / commit hints), --branch (pin one if absent), and --on-dirty
# (decide whether to inject 'discard' on resume).
ARGS=("$@")
REPO=""; EPIC=""; HAS_BRANCH=0; HAS_ON_DIRTY=0
PHASE_TIMEOUT_RAW="3600"   # byolomad's DEFAULT_PHASE_TIMEOUT; overridden if --phase-timeout is passed
i=0
while [[ $i -lt ${#ARGS[@]} ]]; do
  case "${ARGS[$i]}" in
    --repo)          REPO="${ARGS[$((i+1))]:-}";  i=$((i+2)) ;;
    --epic)          EPIC="${ARGS[$((i+1))]:-}";  i=$((i+2)) ;;
    --branch)        HAS_BRANCH=1;                i=$((i+2)) ;;
    --on-dirty)      HAS_ON_DIRTY=1;              i=$((i+2)) ;;
    --phase-timeout) PHASE_TIMEOUT_RAW="${ARGS[$((i+1))]:-3600}"; i=$((i+2)) ;;
    *)               i=$((i+1)) ;;
  esac
done

# Resolve STALL_HARD now that the phase-timeout is known. byolomad accepts a
# bare-number or s/m/h/d-suffixed value (0 disables); convert to seconds and sit
# the watchdog's hard ceiling 5 minutes above it. If the phase-timeout is
# disabled (0), fall back to a generous standalone backstop. An explicit
# BYOLOMAD_STALL_HARD always wins.
to_seconds() {
  local v="$1" n unit; n="${v%[smhd]}"; unit="${v#"$n"}"
  case "$unit" in
    m) echo $((n*60)) ;; h) echo $((n*3600)) ;; d) echo $((n*86400)) ;; *) echo "$n" ;;
  esac
}
_pt="$(to_seconds "$PHASE_TIMEOUT_RAW")"
if [[ "$_pt" -eq 0 ]]; then _stall_hard_default=7200; else _stall_hard_default=$((_pt + 300)); fi
STALL_HARD="${BYOLOMAD_STALL_HARD:-$_stall_hard_default}"

[[ -n "$REPO" ]] || { echo "ERROR: --repo is required." >&2; usage 1; }
[[ -d "$REPO" ]] || { echo "ERROR: --repo path does not exist: $REPO" >&2; exit 1; }
REPO="$(cd "$REPO" && pwd)"

# Pin a branch so the first run and every resume target the same one. byolomad
# defaults to autonomous/<epic>-<timestamp> when --branch is absent, which would
# differ between our invocations — pin it here instead.
if [[ $HAS_BRANCH -eq 0 ]]; then
  BRANCH="autonomous/${EPIC:-run}-$(date +%Y%m%d-%H%M%S)"
  ARGS+=(--branch "$BRANCH")
  echo "[auto] No --branch given; pinning: $BRANCH"
fi

mkdir -p "$REPO/logs"
JUDGE_LOG="$REPO/logs/auto-judge.log"
WD_MARKER="$REPO/logs/.watchdog-killed"

# ---------- helpers ----------
escalate() {
  echo ""
  echo "=== byolomad-auto: STOPPING — human needed ==="
  echo "$1"
  exit 1
}

# Append the judge's best-judgment note to the story file and commit it. The
# commit subject deliberately avoids the "<name>: " prefix that byolomad's
# story_already_committed() greps for — otherwise our note commit would make
# byolomad skip the story as "done".
apply_hint() {
  local file="$1" name="$2" hint="$3" iter="$4"
  {
    printf '\n\n## Autonomous judge decisions (byolomad-auto)\n'
    printf '<!-- Added %s after attempt %s failed. Best-judgment answers to unblock the autonomous run. -->\n\n' \
      "$(date '+%Y-%m-%d %H:%M:%S')" "$iter"
    printf '%s\n' "$hint"
  } >> "$file"
  ( cd "$REPO" \
      && git add -- "$file" \
      && git commit -q -m "judge(auto): unblock story $name with best-judgment assumptions" )
  echo "[auto] Appended judge decision to ${file#"$REPO"/} and committed it."
}

# Build a focused diagnosis digest from the (noisy, stream-json-laden) run log:
# the phase/status skeleton plus the tail where the actual error lives.
build_digest() {
  local runlog="$1"
  {
    echo "--- PHASE / STATUS TIMELINE ---"
    grep -aE '^(=== |  ✗|  ✓|ERROR|WARNING|Status:)' "$runlog" | tail -100
    echo
    echo "--- RUN LOG TAIL ---"
    tail -c 12000 "$runlog"
  }
}

# Run a judge prompt through the configured engine and echo the model's final
# text (a JSON object), code-fences stripped. Engine-agnostic so the judge logic
# is written once. $1 = prompt, $2 = model (empty -> the engine's own default).
judge_invoke() {
  local prompt="$1" model="$2" raw text
  if [[ "$JUDGE_ENGINE" == "codex" ]]; then
    # `-o` writes ONLY the agent's final message to a file — no event envelope to
    # unwrap. `--ignore-user-config` skips the user's config/MCP (auth still uses
    # CODEX_HOME); the bypass flag is codex's `--dangerously-skip-permissions`.
    local margs=() last; [[ -n "$model" ]] && margs=(-m "$model"); last="$(mktemp)"
    codex exec "$prompt" "${margs[@]}" \
      --dangerously-bypass-approvals-and-sandbox \
      --skip-git-repo-check --ignore-user-config \
      -o "$last" --json >>"$JUDGE_LOG" 2>&1 || true
    text="$(cat "$last" 2>/dev/null || true)"; rm -f "$last"
  else
    local margs=(); [[ -n "$model" ]] && margs=(--model "$model")
    raw="$(claude -p "$prompt" "${margs[@]}" \
            --strict-mcp-config --mcp-config '{"mcpServers":{}}' \
            --output-format json 2>>"$JUDGE_LOG")" || true
    # --output-format json wraps the reply in an envelope; text is in .result.
    text="$(printf '%s' "$raw" | jq -r '.result // empty' 2>/dev/null || true)"
    [[ -z "$text" ]] && text="$raw"
  fi
  printf '%s\n' "$text" | sed '/^```/d'   # strip stray fences if the model added them
}

# Ask the judge for a verdict. Echoes a JSON object on stdout. The judge gets
# NO tools — everything it needs is in the prompt — so it cannot touch anything;
# it can only reason and answer.
run_judge() {
  local name="$1" runlog="$2"
  local story_file="$REPO/$STORIES_DIR_REL/$name.md"
  local story_content="(No story file exists yet — the SM phase had not created it.)"
  [[ -f "$story_file" ]] && story_content="$(head -c 8000 "$story_file")"
  local digest; digest="$(build_digest "$runlog")"

  local prompt
  prompt="You are the autonomous JUDGE supervising 'byolomad', a runner that builds a
software repo one story at a time inside Docker, gating each story on tests and
committing between stories. It just STOPPED at story '$name' because a phase
returned non-zero. Your job: decide how to unblock it, with best judgment, so
the run can continue unattended.

You have a SHORT LEASH. You may choose exactly one action:
  - \"resume\": the failure looks transient (a phase timeout with no clear root
    cause, a network/rate-limit/Docker hiccup, a flaky test). Just retry.
  - \"hint\": the story was ambiguous, under-specified, or a phase effectively
    needed clarification it could not get while running headless (e.g. an
    elicitation step, an unclear requirement, a test failing because intended
    behavior is undefined). Provide a concise best-judgment note that ANSWERS
    the open question(s). It will be appended verbatim to the story's markdown
    file and the story will be re-run, so the DEV phase sees your decision.
    Write it AS decisions/assumptions for the implementer — NOT as code. You do
    NOT write or patch code; the DEV/APPLY-FIXES phases do that on retry.
  - \"escalate\": not safely auto-resolvable — auth/token errors (expired or
    invalid OAuth), missing BMAD artifacts, bad flags, environment/setup
    problems, or anything where guessing risks corrupting later stories. A human
    should look.

Respond with ONLY a single JSON object, no prose, no code fences:
{\"category\":\"transient|ambiguity|test_failure|auth|setup|unknown\",\"action\":\"resume|hint|escalate\",\"reason\":\"one sentence\",\"hint\":\"markdown note for the story file; empty string unless action is hint\"}

=== STORY FILE ($name) ===
$story_content

=== RUN DIAGNOSIS DIGEST ===
$digest"

  judge_invoke "$prompt" "$JUDGE_MODEL"
}

# Stall confirmation: the watchdog calls this when the run log has gone silent.
# Echoes "stuck" or "working". The judge is handed the idle duration (a strong
# signal on its own) plus the recent tail, and is told NOT to cry wolf on a
# legitimately-busy phase — killing one throws away real work.
judge_confirm_stuck() {
  local runlog="$1" idle="$2"
  local digest; digest="$(build_digest "$runlog")"
  local prompt
  prompt="You are the stall-watchdog's judge for 'byolomad'. A phase has produced NO new
log output for ${idle} seconds. Decide whether it is genuinely WEDGED (hung,
deadlocked, waiting on input that will never come, or spinning on the same error
forever) or just LEGITIMATELY BUSY (a long test run, a compile, or the model
'thinking' without emitting tokens). Killing a busy phase wastes real work, so
only say stuck when the silence AND the evidence really point to a hang.

Respond with ONLY a JSON object, no prose, no code fences:
{\"stuck\":true,\"reason\":\"one sentence\"}

=== RUN DIAGNOSIS DIGEST (last activity before the silence) ===
$digest"
  local text; text="$(judge_invoke "$prompt" "$WATCH_MODEL")"
  if [[ "$(printf '%s' "$text" | jq -r '.stuck // false' 2>/dev/null || echo false)" == "true" ]]; then
    echo stuck
  else
    echo working
  fi
}

# Background sentry. Polls the active iteration's run log for liveness. Stays
# DISARMED until the first container phase begins, so it never trips on the
# quiet Docker image build or preflight. Once armed it tracks how long the log
# has been silent: past STALL_SOFT it wakes the judge to confirm wedged-vs-busy
# (re-asking each soft window if the judge says busy), and past STALL_HARD it
# kills regardless — the backstop for a judge that keeps guessing "working" at a
# corpse. A kill drops the container, so byolomad fails the story the normal way
# (-> STOPPED -> the main judge resumes). Leaves a marker so the wrapper can log
# that a stall was caught and handled.
run_watchdog() {
  local runlog="$1"
  local armed=0 last_size=0 last_growth=0 next_confirm=0 now size idle do_kill reason cid
  while :; do
    sleep "$WATCH_INTERVAL"
    [[ -f "$runlog" ]] || continue
    now="$(date +%s)"
    size="$(stat -f %z "$runlog" 2>/dev/null || echo 0)"
    if [[ $armed -eq 0 ]]; then
      if grep -qE '=== \[.*Phase ' "$runlog" 2>/dev/null; then
        armed=1; last_size=$size; last_growth=$now; next_confirm=$((now + STALL_SOFT))
      fi
      continue
    fi
    if [[ "$size" -gt "$last_size" ]]; then
      last_size=$size; last_growth=$now; next_confirm=$((now + STALL_SOFT)); continue
    fi
    idle=$((now - last_growth)); do_kill=""; reason=""
    if [[ $idle -ge $STALL_HARD ]]; then
      do_kill=1; reason="no log output for ${idle}s (hard ceiling ${STALL_HARD}s)"
    elif [[ $idle -ge $STALL_SOFT && $now -ge $next_confirm ]]; then
      if [[ "$(judge_confirm_stuck "$runlog" "$idle")" == "stuck" ]]; then
        do_kill=1; reason="judge confirmed wedged after ${idle}s of silence"
      else
        next_confirm=$((now + STALL_SOFT))   # judge says busy — re-check next window
      fi
    fi
    if [[ -n "$do_kill" ]]; then
      # Newest byolomad container = the active iteration's. (Single-run
      # assumption; concurrent runs against other repos could share the prefix.)
      cid="$(docker ps --filter name=byolomad- -q 2>/dev/null | head -1)"
      printf '\n[watchdog] STALL: %s — killing container %s\n' "$reason" "${cid:-<none>}" >> "$runlog"
      printf '%s\n' "$reason" > "$WD_MARKER"
      [[ -n "$cid" ]] && docker kill "$cid" >/dev/null 2>&1 || true
      return 0
    fi
  done
}

# ---------- supervisor loop ----------
# Reap a lingering sentry if the wrapper is interrupted mid-iteration.
trap '[[ -n "${wd_pid:-}" ]] && kill "$wd_pid" 2>/dev/null; exit 130' INT TERM

last_story=""; same_count=0; iter=0
run_args=("${ARGS[@]}")   # first run: user args (+ pinned branch)

while :; do
  iter=$((iter+1))
  [[ $iter -gt $MAX_ITERS ]] && escalate "Hit BYOLOMAD_MAX_ITERS=$MAX_ITERS without finishing. Something is looping — inspect $REPO/logs/."

  ts="$(date +%Y%m%d-%H%M%S)"
  RUN_LOG="$REPO/logs/auto-run-$ts.log"
  rm -f "$WD_MARKER"
  : > "$RUN_LOG"   # create it now so the watchdog can stat it from the first poll
  echo ""
  echo "=== [auto] iteration $iter — ./byolomad.sh ${run_args[*]} ==="
  set +e
  wd_pid=""
  if [[ "$WATCHDOG" == "1" ]]; then run_watchdog "$RUN_LOG" & wd_pid=$!; fi
  "$BYOLOMAD" "${run_args[@]}" 2>&1 | tee -a "$RUN_LOG"
  rc=${PIPESTATUS[0]}
  if [[ -n "$wd_pid" ]]; then kill "$wd_pid" 2>/dev/null; wait "$wd_pid" 2>/dev/null; fi
  set -e

  if [[ -f "$WD_MARKER" ]]; then
    echo "[auto] watchdog caught a stall: $(cat "$WD_MARKER") — routing through the judge."
    rm -f "$WD_MARKER"
  fi

  if [[ $rc -eq 0 ]]; then
    echo ""
    echo "=== byolomad-auto: DONE — byolomad exited 0 (all stories complete, or nothing to do). ==="
    exit 0
  fi

  # Non-zero. Only a "Status: STOPPED at <name>" line means a story-level
  # failure with a resume path. Anything else (preflight/flag/artifact error)
  # is not something hints can fix — escalate immediately.
  if ! grep -q '^Status: STOPPED at ' "$RUN_LOG"; then
    escalate "byolomad exited $rc with no STOPPED marker — a preflight/setup error, not a story failure. See $RUN_LOG."
  fi
  story="$(grep '^Status: STOPPED at ' "$RUN_LOG" | tail -1 | sed 's/^Status: STOPPED at //')"

  # Cheap pre-check: auth failures can't be fixed headlessly (token regen is
  # interactive). Bail before spending a judge call.
  if grep -qiE 'OAuth token has expired|invalid[_ ]token|authentication_error|401 [Uu]nauthor' "$RUN_LOG"; then
    escalate "Auth failure on story '$story' (expired/invalid OAuth token). Regenerate with 'claude setup-token', re-export CLAUDE_CODE_OAUTH_TOKEN (or refresh $HOME/.cache/op-secrets.env), then re-run. See $RUN_LOG."
  fi

  # Same-story loop guard.
  if [[ "$story" == "$last_story" ]]; then same_count=$((same_count+1)); else same_count=1; last_story="$story"; fi
  if [[ $same_count -gt $MAX_SAME_STORY ]]; then
    escalate "Story '$story' failed $same_count times in a row despite judge intervention. Stopping to avoid burning credits on a wall. See $RUN_LOG."
  fi

  echo "[auto] STOPPED at '$story' (attempt $same_count). Consulting judge ($JUDGE_MODEL)..."
  verdict="$(run_judge "$story" "$RUN_LOG")"
  action="$(printf '%s' "$verdict" | jq -r '.action // "escalate"' 2>/dev/null || echo escalate)"
  reason="$(printf '%s' "$verdict" | jq -r '.reason // ""'        2>/dev/null || echo '')"
  printf '[auto] Judge verdict: action=%s — %s\n' "$action" "$reason"
  printf '%s  story=%s attempt=%s action=%s reason=%s\n' "$(date '+%F %T')" "$story" "$same_count" "$action" "$reason" >> "$JUDGE_LOG"

  case "$action" in
    resume)
      : # retry as-is
      ;;
    hint)
      hint="$(printf '%s' "$verdict" | jq -r '.hint // ""' 2>/dev/null || echo '')"
      story_file="$REPO/$STORIES_DIR_REL/$story.md"
      if [[ -n "$hint" && -f "$story_file" ]]; then
        apply_hint "$story_file" "$story" "$hint" "$iter"
      else
        echo "[auto] Judge asked to hint, but hint text was empty or no story file at ${story_file#"$REPO"/}. Resuming without a note."
      fi
      ;;
    *)
      escalate "Judge could not auto-resolve story '$story' (category-driven escalate): $reason. See $RUN_LOG."
      ;;
  esac

  # Resume runs: re-use the pinned branch, and clear any partial files the
  # failed phase left behind so the story re-runs against a clean, committed
  # tip (which now includes any judge note). Only inject 'discard' if the user
  # didn't already choose an --on-dirty mode.
  run_args=("${ARGS[@]}")
  [[ $HAS_ON_DIRTY -eq 0 ]] && run_args+=(--on-dirty discard)
done
