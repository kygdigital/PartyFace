# BYOLOMAD

Autonomous BMAD v6 runner. Spins one Docker container per story, gates on tests, commits between stories.

## Quick start

```bash
# Full run — all non-done stories
./byolomad.sh --repo <path-to-bmad-repo> --test-cmd true

# Filter to a specific epic or story
./byolomad.sh --repo <path> --epic 4-7 --test-cmd true

# Skip code reviews (review is on by default; opt out for environments without Cursor)
./byolomad.sh --repo <path> --test-cmd true --no-review

# Dry run — preflight + print plan only
./byolomad.sh --repo <path> --test-cmd true --dry-run
```

## Common flags

| Flag | Purpose | Default |
|------|---------|---------|
| `--repo <path>` | Path to BMAD v6-prepped repo (required) | — |
| `--test-cmd <cmd>` | Post-story test command. Use `true` for repos that can't build in Docker (e.g. iOS/Xcode) | auto-detect |
| `--epic <name>` | Filter to stories whose key starts with `<name>-` (prefix match on the epic/story number — `--epic 2` matches `2-*`, `--epic 4-7` matches `4-7-*`; does **not** match a number appearing later in the key) | all non-done stories |
| `--branch <name>` | Working branch name | `autonomous/<epic>-<timestamp>` |
| `--base <branch>` | Branch to fork from | `main` |
| `--module <name>` | BMAD module: `auto`, `bmm` (software), or `gds` (game-dev). `auto` detects `gds` when `gdd.md`/`game-architecture.md` are present, else `bmm` | `auto` |
| `--engine <name>` | AI engine: `claude`, `amp` (out of Claude credits), or `codex` (experimental scaffold — see README) | `claude` |
| `--model <name>` | Baseline model (SM, EXT-REVIEW, FINALIZE) | `claude-sonnet-4-6` |
| `--model-heavy <name>` | Heavy model (DEV, APPLY-FIXES, CODE-REVIEW) | `claude-opus-4-8` |
| `--amp-mode <mode>` | Amp mode for baseline phases: `smart`, `rush`, `deep` (only with `--engine amp`) | `smart` |
| `--amp-mode-heavy <mode>` | Amp mode for heavy phases (only with `--engine amp`) | `deep` |
| `--image <tag>` | Docker image tag to build/use | `byolomad:review` (or `byolomad:latest` with `--no-review`) |
| `--no-review` | Skip /cursor-reviews + apply-fixes. Default is on — requires Cursor agent CLI + `~/.cursor/` auth **and** `~/.claude/scripts/run-external-review.sh` (from the cursor-reviews skill) | review on |
| `--on-dirty <mode>` | Handle uncommitted changes at startup: `abort`, `stash`, `discard` | `abort` |
| `--phase-timeout <s>` | Abort a phase (and the run) if a single agent/test phase exceeds `<s>` seconds (suffix `s/m/h/d` ok; `0` disables) | `3600` |
| `--keep-container` | Don't remove containers after run (debug) | off |
| `--dry-run` | Preflight only, no containers | off |

Environment: set `REBUILD=1` to force a fresh Docker build; otherwise an existing local image (`byolomad:review` / `byolomad:latest`) is reused.

## Repo requirements

The target repo must have `_bmad/` (framework), the implementation artifacts, and the planning artifacts for its module:

Common (both modules):
- `_bmad/` (framework)
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/*.md` (story files)

BMM (software) — planning artifacts:
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/planning-artifacts/epics.md`

GDS (game-dev) — planning artifacts:
- `_bmad-output/gdd.md`
- `_bmad-output/game-architecture.md`
- `_bmad-output/epics.md` (or `planning-artifacts/epics.md`)

The module is auto-detected (override with `--module bmm|gds`). BMM runs the `bmad-create-story`/`bmad-dev-story`/`bmad-code-review` workflows; GDS runs the `gds-*` equivalents.

## Auth

Uses `$CLAUDE_CODE_OAUTH_TOKEN` (long-lived machine token). Do not use rotating macOS keychain tokens — they are device-bound and 401 inside Linux containers. A 401 / "OAuth token has expired" on the very first story almost always means the token is stale or was revoked — regenerate with `claude setup-token`, re-export it, and resume with the printed resume command.

The Amp engine (`--engine amp`) authenticates via `AMP_API_KEY` (format `sgamp_...`, from https://ampcode.com/settings) instead.

Only the config the phases actually use is staged into the container (settings, commands, skills, plugins, scripts); `~/.claude.json` is stripped of its MCP server blocks and identity before mounting, and `~/.cursor/mcp.json` + chat history are stripped on review runs — so no third-party MCP credentials reach the autonomous agent.

## Notes

- For iOS/Xcode repos, always pass `--test-cmd true` since xcodebuild can't run in Docker
- Merge the autonomous branch back to main after reviewing the output
- Stories are processed in sprint-status.yaml order; every non-done story runs (backlog runs SM+DEV, `ready-for-dev`/`in-progress` run DEV, `review` enters at TEST/EXT-REVIEW). Only `done` stories are skipped.
