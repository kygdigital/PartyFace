---
name: byolomad
description: Kick off byolomad-auto.sh — the autonomous BMAD runner with the self-healing "judge" wrapper — against a repo, figuring out the right CLI invocation and flags so the user doesn't have to. Use when the user says "run byolomad", "/byolomad", "byolomad this repo", "build out the stories", or otherwise wants to autonomously run a BMAD v6-prepped repo story-by-story until it's done.
---

# byolomad

Launches the autonomous BMAD runner so the user doesn't have to remember the script path or reason out the flags. The runner builds a BMAD v6-prepped repo one story at a time in Docker, and the `-auto` wrapper supervises it: when a story fails, an LLM "judge" diagnoses the log and either resumes, writes a best-judgment note into the story file, or escalates to a human. It loops until every story is done.

## The command

"byolomad" means the autonomous runner. **Always invoke `byolomad-auto.sh`** — the
supervised, self-healing wrapper. The bare `byolomad.sh` is an internal building
block the wrapper drives; never call it directly from this skill.

**Resolve the script path at runtime — do NOT hardcode it.** This skill lives in
the byolomad repo at `skills/byolomad/SKILL.md`, and the installed skill is
normally a symlink from `~/.codex/skills/byolomad` or `~/.claude/skills/byolomad`,
so the repo (and the runner at its root) is reachable from that symlink:

```bash
if [ -e "$HOME/.codex/skills/byolomad" ]; then
  SKILL_LINK="$HOME/.codex/skills/byolomad"
else
  SKILL_LINK="$HOME/.claude/skills/byolomad"
fi
BYO_REPO="$(cd "$(dirname "$(readlink "$SKILL_LINK" 2>/dev/null || echo "$SKILL_LINK")")/.." 2>/dev/null && pwd)"
BYO="$BYO_REPO/byolomad-auto.sh"
[[ -x "$BYO" ]] || echo "Could not locate byolomad-auto.sh from the skill symlink — ask the user where the byolomad repo is."
```

Then run `"$BYO" --repo <repo> [flags]`. If `$BYO` isn't found (the skill was
copied rather than symlinked, or the repo moved), ask the user where the byolomad
repo is — or `find` it — rather than guessing a path.

Run it in the **background** (`run_in_background: true`) — a full run takes many minutes to hours. Tell the user it's running and where the logs are (`<repo>/logs/`), then let it work. Don't block the session waiting on it.

## What to do when invoked

1. **Resolve the target repo.**
   - If the user named a path/repo, use it.
   - Otherwise default to the current working directory.
   - The repo is the `--repo` value. byolomad needs an absolute path; resolve it.

2. **Quick preflight (cheap, catches the dumb failures before an hours-long run).** Check the repo looks BMAD v6-prepped:
   - `_bmad/` exists, and `_bmad-output/implementation-artifacts/sprint-status.yaml` exists.
   - Planning artifacts: BMM wants `_bmad-output/planning-artifacts/{prd,architecture,epics}.md`; GDS wants `_bmad-output/{gdd,game-architecture}.md`.
   - If artifacts are missing, **stop and tell the user** — byolomad will just abort at preflight anyway. Don't launch a doomed run.
   - Glance at `sprint-status.yaml`: if every story is already `done`, say so and don't launch.

3. **Pick `--test-cmd` if it's not obvious.** byolomad auto-detects from `package.json` / `pyproject.toml` / `go.mod` / `Cargo.toml`. But:
   - For iOS/Xcode repos (or anything that can't build in Docker), pass `--test-cmd true` — xcodebuild won't run in the container.
   - If unsure whether the project builds in a plain `node:24-slim`-based Linux container, ask the user or default to `--test-cmd true` and say you did.

4. **Confirm the plan, briefly.** State the repo, the branch (the wrapper pins `autonomous/<epic>-<timestamp>` if you don't pass `--branch`), the test command, and whether review is on. Pass `--dry-run` first if the user wants to see the story plan before committing to a real run.

5. **Launch in the background and report.** Give the user the log locations and how to watch:
   - Per-iteration run logs: `<repo>/logs/auto-run-<timestamp>.log`
   - Judge verdict audit trail: `<repo>/logs/auto-judge.log`
   - byolomad's own per-story stream: `<repo>/logs/<story>.jsonl`

## Common flag cheatsheet

| Intent | Flag |
|--------|------|
| Just one epic/story | `--epic 4-7` (prefix match on the story key) |
| Repo can't build in Docker (iOS, etc.) | `--test-cmd true` |
| Skip the Cursor external-review phase | `--no-review` |
| See the plan without running | `--dry-run` |
| Out of Claude credits | `--engine amp` (needs `AMP_API_KEY`) |
| Use Codex for story phases | `--engine codex` (needs `codex login` or `OPENAI_API_KEY`) |

When `--engine codex` is selected, the external-review phase is performed by
Codex itself, so Cursor auth is not required. Claude/Amp still use the
`/cursor-reviews` skill when review is enabled.
| Resume left partial files | the wrapper already injects `--on-dirty discard` on retries |

Wrapper-specific knobs are environment variables, not flags:
- `BYOLOMAD_JUDGE_MODEL` — judge model for failure diagnosis (default `claude-opus-4-8`).
- `BYOLOMAD_MAX_SAME_STORY` — give up after a story fails this many times despite hints (default 3).
- `BYOLOMAD_MAX_ITERS` — global backstop (default 40).
- `BYOLOMAD_STALL_SOFT` / `BYOLOMAD_STALL_HARD` — seconds of log silence before the stall watchdog asks the judge / kills regardless (defaults: 600 / `--phase-timeout` + 5m, so the blind kill never beats byolomad's own phase-timeout).
- `BYOLOMAD_WATCH_MODEL` — cheap model for the stall stuck/working call (default `claude-sonnet-4-6`).
- `BYOLOMAD_NO_WATCHDOG=1` — disable the stall watchdog.

## Stall monitoring (built in)

The wrapper runs a background sentry during every iteration: it polls the live
run log each minute and, if output goes silent past `STALL_SOFT`, wakes a cheap
judge to decide wedged-vs-busy before killing anything (past `STALL_HARD` it
kills regardless, as a backstop). A kill drops the container, which routes into
the normal STOPPED → judge → resume path. So a hung phase is caught in minutes
rather than waiting out byolomad's 1-hour `--phase-timeout`. Nothing to enable —
it's on unless `BYOLOMAD_NO_WATCHDOG=1`.

## When the wrapper escalates

If `byolomad-auto.sh` exits with `=== byolomad-auto: STOPPING — human needed ===`, it hit something the judge's short leash won't touch (auth/token, missing artifacts, a story that kept failing, or a real bug). Read the named run log, summarize the cause for the user, and offer to fix it — this is the one moment a human (or a Claude with a human present) is expected to step in. Don't just relaunch blindly into the same wall.

## Auth note

byolomad's containers need `CLAUDE_CODE_OAUTH_TOKEN` (a long-lived machine token from `claude setup-token`), NOT the rotating macOS keychain token. If a run dies on the first story with a 401 / "OAuth token has expired", the token is stale — regenerate it, re-export it (or refresh `~/.cache/op-secrets.env`), and relaunch.
