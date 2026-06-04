# byolomad — Operating Notes

Field notes for anyone (human or agent) babysitting a run. These cover behavior
that is **not obvious from the script** and that has caused false alarms in
practice. Read #1 before you reach for `docker kill`.

## The 7-phase per-story pipeline

Each story runs these phases in one long-lived container (`byolomad-<story>--<pid>`):

| # | Phase | Model | Notes |
|---|-------|-------|-------|
| 1 | SM (create-story)   | baseline (`--model`, default sonnet-4-6) | reads the whole planning corpus; input-heavy |
| 2 | DEV (dev-story)     | **heavy** (`--model-heavy`, default opus-4-8) **+ `ultrathink`** | writes the implementation |
| 3 | EXT-REVIEW          | (cursor-reviews, separate process) | main jsonl goes quiet here |
| 4 | APPLY-FIXES         | **heavy + `ultrathink`** | applies review findings |
| 5 | TEST (`--test-cmd`) | (separate process) | the build/test gate; failure → STOP |
| 6 | CODE-REVIEW         | **heavy + `ultrathink`** | adversarial review |
| 7 | FINALIZE            | baseline | verify done + commit, flip sprint-status |

The commit lands only after phase 7. A story is committed on the branch and its
sprint-status flips to `done`, then byolomad moves to the next story.

## 1. Idle CPU + a frozen jsonl is NORMAL — do not kill on it

This is the big one. When an agent is mid-model-turn, the work happens
**server-side**. The container sits at ~1% CPU and **nothing streams to the
per-story jsonl until the turn completes**. On the heavy phases (DEV,
APPLY-FIXES, CODE-REVIEW) the model is Opus running `ultrathink` — the largest
extended-thinking budget — so a *single turn* can legitimately think for
**several minutes** before emitting a byte. SM is baseline but reads the entire
PRD + architecture + UX corpus, so its first turn is also slow.

**A frozen log + idle CPU is indistinguishable from a healthy wait by those
signals alone.** Killing on that signature just throws away work and restarts
the same slow turn — pure churn. (Verified: logs showed `rate_limit_event`
status `allowed` across the board — these stalls are *not* throttling, and they
are *not* caused by other concurrent Claude sessions sharing the token.)

**The real backstop for a genuine hang is `--phase-timeout` (default 60 min).**
Let it do its job. Only escalate before that on the one distinguishable failure
mode below.

> The `byolomad-auto.sh` wrapper adds a stall watchdog, but it respects this rule:
> its unconditional-kill ceiling (`BYOLOMAD_STALL_HARD`) defaults to
> `--phase-timeout + 5m`, so it never beats the timeout above. In practice it
> only kills via a judge that confirms wedged-vs-busy first. See the README.

## 2. The one real failure mode: the post-completion wait-loop

Occasionally an agent finishes the actual work (story implemented, gates green,
story file at `Status: review`) and then **spams no-op shell commands** —
`echo "wait ..."`, `echo "awaiting ..."`, `echo "probe ..."` — misreading
output-batching latency as a stall. It will busy-loop like this until the phase
timeout false-fails it, even though the work is done.

This one *is* distinguishable. Detect it by scanning the story's jsonl: if a
large fraction (say >40%) of Bash tool calls are those no-op echoes **and** the
story is already at `Status: review` with passing gates, harvest it manually:

```sh
# verify the work, then commit it yourself and mark the story done
(cd <repo> && npm run build)        # or whatever --test-cmd is
# git add -A && git commit ... ; set the story line to `done` in sprint-status.yaml
docker kill byolomad-<story>--<pid>
# then resume on the same branch for the next story:
./byolomad.sh --repo <repo> --branch <branch> --test-cmd "<cmd>"
```

Worth fixing at the source too (a guard, or a note in the dev-story prompt
telling the agent not to poll-by-echo).

## 3. Resuming is safe and idempotent

If the target `--branch` already exists, byolomad checks it out and **resumes**
(it does not re-fork from `--base`). It enumerates pending stories from
`sprint-status.yaml`, skipping any marked `done`. So after a manual harvest or a
kill, just re-run with the same `--branch` and it continues from the next
not-done story. Commit completed work and mark it `done` first so it isn't redone.

## 4. Setup gotchas seen in the wild

- **`create-next-app <name>` nests the app.** A story whose acceptance criteria
  quote `npx create-next-app@latest <name> ...` will scaffold into a `<name>/`
  subdirectory, not the repo root. If the architecture expects app-at-root
  (`src/` beside `_bmad/`), the root-level `--test-cmd` (`npm run build`) won't
  find `package.json`. Relocate the scaffold to the root, or run the scaffold
  command with `.`.
- **PRD path for BMM preflight.** byolomad's module auto-detect requires
  `_bmad-output/planning-artifacts/prd.md`. If the PRD lives in a nested
  `prds/<slug>/prd.md`, symlink it: `ln -s prds/<slug>/prd.md prd.md`.
- **Non-interactive token.** `CLAUDE_CODE_OAUTH_TOKEN` must be in the
  environment. When launched from a non-interactive shell (cron, IDE task, an
  agent's shell tool) `~/.zshrc` never runs, so secrets sourced there are
  absent. byolomad now falls back to sourcing `$BYOLOMAD_ENV_FILE`
  (default `~/.cache/op-secrets.env`) when the token is missing.

## 5. Watching a run without over-reacting

- Per-story stream: `logs/<story>.jsonl` (tee'd live).
- Top-level phase banners: the run log (`> run.log 2>&1`); grep `^=== \[`.
- Progress: `sprint-status.yaml` (`done`/`review`/`in-progress`) and
  `git log --oneline <branch>` (one commit per finished story).
- Don't pipe the launch through `tee` if you care about the exit code — the
  pipeline's exit reflects `tee`, not byolomad. Redirect with `>` instead.
