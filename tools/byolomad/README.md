# byolomad

**BMAD with YOLO in it.** Point it at a [BMAD v6](https://github.com/bmad-code-org/BMAD-METHOD)-prepped
repo and it builds the whole thing autonomously — one story at a time, each in
its own Docker container, gated on tests, committing between stories — and keeps
going until every story is `done` or it hits something only a human should
decide.

```
/byolomad                 # from inside any BMAD repo, or:
./byolomad-auto.sh --repo /path/to/bmad-repo --test-cmd "npm test"
```

---

## What it is (three layers)

byolomad is autonomous by design — "byolomad" means the supervised runner, not
the bare engine. Three layers, each doing only what the one below it can't:

| Layer | File | Role |
|-------|------|------|
| **Skill** | `skills/byolomad/SKILL.md` | The `/byolomad` launch entry point. Resolves the repo, preflights it, picks sensible flags, launches in the background. |
| **Judge wrapper** | `byolomad-auto.sh` | The autonomy. Supervises the runner: diagnoses failures and **resumes / hints / escalates**, and runs a **stall watchdog** that kills wedged phases. Loops until done. |
| **Runner** | `byolomad.sh` | The engine. Runs one story through a 7-phase pipeline (SM → DEV → review → test → code-review → finalize) in a container. An internal building block — you rarely call it directly. |

### How the autonomy works

When the runner **stops** at a failed story, the wrapper consults an LLM **judge**
that picks one of three actions (it never edits code or runs git itself — it only
returns a verdict; the wrapper performs every side effect):

- **resume** — transient failure (timeout, network, rate-limit). Just retry.
- **hint** — the story was ambiguous or a phase needed an answer it couldn't get
  headless. The judge writes a best-judgment "decisions & assumptions" note into
  the story file; the wrapper commits it and re-runs so DEV sees the answer.
- **escalate** — auth/token, missing artifacts, a real bug, or a story that kept
  failing despite hints. Stop and tell a human.

A background **stall watchdog** polls the live run log every minute. If output
goes silent past a threshold it wakes a cheap judge to confirm *wedged vs. just
busy* before killing the container — which routes the kill into the same
resume path. Guardrails keep it from looping forever (`MAX_SAME_STORY`,
`MAX_ITERS`) and auth failures escalate immediately.

> ⚠️ **Read [`OPERATIONS.md`](./OPERATIONS.md) §1 before tuning the watchdog.**
> A frozen log + idle CPU is *normal* during heavy Opus/`ultrathink` turns — they
> can legitimately think for minutes before emitting a byte. By default the
> watchdog's unconditional-kill ceiling sits *above* `--phase-timeout`, so it
> never beats byolomad's own backstop; the judge-confirmed soft path is the only
> way it acts in practice. Lower `STALL_HARD` only if you accept rare false kills
> on long, quiet-but-healthy turns.

---

## Requirements

Run on the **host** (macOS/Linux):

- **Docker** — one container per story.
- **[Claude Code CLI](https://docs.claude.com/en/docs/claude-code)** — logged in (`~/.claude`, `~/.claude.json` present). The host also runs the judge.
- **`jq`** — the wrapper parses the judge's JSON verdict with it.
- **`CLAUDE_CODE_OAUTH_TOKEN`** — a *long-lived machine token* from `claude setup-token`. **Not** the rotating macOS keychain token (it's device-bound and 401s inside Linux containers).
- **`~/.gitconfig`** with `user.name` / `user.email` set.

Optional:

- **[Cursor CLI](https://cursor.com)** + `~/.claude/scripts/run-external-review.sh` (from the `cursor-reviews` skill) — for the external-review phase. Skip with `--no-review`.
- **`amp`** + `AMP_API_KEY` — alternative engine for when you're out of Claude credits (`--engine amp`).
- **Codex CLI** + `codex login` (or `OPENAI_API_KEY`) — alternative host judge or in-container engine (`BYOLOMAD_JUDGE_ENGINE=codex`, `--engine codex`).

### The target repo must be BMAD v6-prepped

byolomad builds; it does not plan. The repo needs:

```
_bmad/                                              # BMAD framework (run `bmad init`)
_bmad-output/
  planning-artifacts/{prd,architecture,epics}.md    # BMM (software) — or:
  {gdd,game-architecture}.md                        # GDS (game-dev)
  implementation-artifacts/sprint-status.yaml       # the story list (source of truth)
```

Run the BMAD v6 planning workflow interactively first. byolomad picks up every
non-`done` story from `sprint-status.yaml` in order.

---

## Install

```sh
git clone <this-repo> byolomad
cd byolomad

# 1. Long-lived token for the containers
claude setup-token
export CLAUDE_CODE_OAUTH_TOKEN=...        # add to your shell profile or ~/.cache/op-secrets.env

# 2. Make /byolomad available from any directory (single source of truth: this repo)
ln -s "$(pwd)/skills/byolomad" ~/.claude/skills/byolomad

# Optional: install the same skill for Codex
mkdir -p ~/.codex/skills
ln -s "$(pwd)/skills/byolomad" ~/.codex/skills/byolomad
```

Then reload skills in Claude Code or Codex. `/byolomad` now works from inside any
BMAD repo. (Cloning to a new machine? Just recreate the symlink for the client
you use.)

---

## Usage

**The easy way** — from inside a BMAD repo:

```
/byolomad
```

The skill resolves the repo (defaults to your current directory), checks it's
BMAD-prepped, picks a `--test-cmd`, and launches in the background.

**The CLI way:**

```sh
./byolomad-auto.sh --repo . --test-cmd "npm test"
./byolomad-auto.sh --repo /path/to/repo --epic 4-7        # one epic/story
./byolomad-auto.sh --repo . --dry-run                     # preflight + plan, no containers
```

Every `byolomad.sh` flag passes straight through. Common ones:

| Flag | Purpose |
|------|---------|
| `--epic 4-7` | Only stories whose key starts with `4-7-` |
| `--test-cmd true` | For repos that can't build in Docker (iOS/Xcode) |
| `--no-review` | Skip the Cursor external-review phase |
| `--dry-run` | Show the plan without running |
| `--engine amp` | Use Amp instead of Claude |
| `--engine codex` | Use OpenAI Codex for the in-container BMAD phases |

Full reference: `./byolomad-auto.sh --help` and `./byolomad.sh --help`.

### Configuration (wrapper env knobs)

| Variable | Default | Purpose |
|----------|---------|---------|
| `BYOLOMAD_JUDGE_ENGINE` | `claude` | Host judge engine: `claude` or `codex`. Independent of the in-container `--engine` |
| `BYOLOMAD_JUDGE_MODEL` | `claude-opus-4-8` | Model for failure diagnosis (codex engine: defaults to codex's own model) |
| `BYOLOMAD_WATCH_MODEL` | `claude-sonnet-4-6` | Cheap model for the stall stuck/working check |
| `BYOLOMAD_STALL_SOFT` / `BYOLOMAD_STALL_HARD` | `600` / *(`--phase-timeout` + 5m)* | Seconds of log silence before the watchdog asks the judge / kills regardless. The hard ceiling defaults above byolomad's phase-timeout, so the blind kill never beats the cleaner `--phase-timeout` STOP — leaving the judge-confirmed soft path as the only way the watchdog acts in practice |
| `BYOLOMAD_MAX_SAME_STORY` | `3` | Give up after a story fails this many times despite hints |
| `BYOLOMAD_MAX_ITERS` | `40` | Global backstop on runner invocations |
| `BYOLOMAD_NO_WATCHDOG` | unset | Set to `1` to disable the stall watchdog |

---

## Watching a run

Logs land in `<repo>/logs/`:

- `auto-run-<timestamp>.log` — each wrapper iteration's full output
- `auto-judge.log` — the judge's verdict audit trail (what it decided and why)
- `<story>.jsonl` — the runner's per-story agent stream

Progress also shows in `sprint-status.yaml` (`done`/`review`/`in-progress`) and
`git log --oneline <branch>` (one commit per finished story).

**For babysitting a run without over-reacting — false-alarm signatures, the one
real hang mode, manual harvest, and setup gotchas seen in the wild — read
[`OPERATIONS.md`](./OPERATIONS.md).**

---

## Engines

byolomad has two independent AI seams:

1. **In-container engine** (`--engine`) — runs the BMAD phases. `claude` (default),
   `amp`, and `codex` are supported.
2. **Host judge engine** (`BYOLOMAD_JUDGE_ENGINE`) — the wrapper's failure
   diagnosis and stall confirmation. `claude` (default) and `codex` are wired.

### Codex

Codex support uses the real `codex-cli` flags (`codex exec`,
`--dangerously-bypass-approvals-and-sandbox`, `--json`, `-o`) and a different
phase strategy from Claude/Amp:

- **As the host judge** (`BYOLOMAD_JUDGE_ENGINE=codex`) — the judge reads a log
  and returns a JSON verdict. The codex path captures the final message via
  `codex exec -o` and parses it. Needs `codex login` or `OPENAI_API_KEY` on the
  host.
- **As the in-container engine** (`--engine codex`) — the runner does not ask
  Codex to execute Claude slash commands. Instead it sends explicit prompts for
  the BMAD create-story, dev-story, external-review, and code-review phases,
  telling Codex to read the repo's `_bmad/` and `_bmad-output/` artifacts and
  update the same story/status files the Claude workflows use.

To use Codex as the judge:

```sh
codex login                                   # or export OPENAI_API_KEY=...
BYOLOMAD_JUDGE_ENGINE=codex ./byolomad-auto.sh --repo . --test-cmd "npm test"
```

To run the story-building phases with Codex:

```sh
codex login                                   # or export OPENAI_API_KEY=...
./byolomad-auto.sh --repo . --engine codex --test-cmd "npm test"
```

When `--engine codex` is used, the external-review phase is performed by Codex
itself and does not require Cursor auth. Claude/Amp still use the
`/cursor-reviews` skill when review is enabled.

---

## When it escalates

If `byolomad-auto.sh` exits with `=== byolomad-auto: STOPPING — human needed ===`,
it hit something the judge's short leash won't touch. The message names the
cause and the run log. Common one: an expired token — regenerate with
`claude setup-token`, re-export it, and relaunch on the same branch (byolomad
resumes from the next not-done story; it never redoes committed work).

---

## Safety

The autonomous agent runs `--dangerously-skip-permissions` inside the container
on potentially attacker-influenceable story content, so the container is
deliberately minimal: only the config the phases need is staged in,
`~/.claude.json` is stripped of MCP/identity/project blocks, MCP is disabled,
Cursor's `mcp.json` and chat history are stripped on review runs, and git hooks
are neutralized. The judge that runs on your host is **read-only** — it diagnoses
and returns JSON; the wrapper performs every file write, commit, and resume.
Branches are isolated (`autonomous/<epic>-<timestamp>`); review and merge before
shipping.
