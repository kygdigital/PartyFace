# PartyFace

PartyFace is a disco-glam birthday creation studio for personalized still images and short motion cards. The MVP is a small-group prototype inspired by JibJab-style personalized birthday videos, with ComfyUI planned as the generation backend.

## Run

Install dependencies:

```bash
npm install
```

Start the local Next.js app:

```bash
npm run dev
```

Then visit `http://localhost:3000`.

## Verify

```bash
npm run lint
npm run build
```

## Environment

Copy `.env.example` to `.env.local` and add local secrets there:

```bash
COMFY_API_KEY=
COMFY_CLOUD_BASE_URL=https://cloud.comfy.org
PARTYFACE_STILL_WORKFLOW_MODE=mock
PARTYFACE_MOTION_WORKFLOW_MODE=mock
```

`COMFY_API_KEY` is server-only. Do not create a `NEXT_PUBLIC_COMFY_API_KEY`.

To run the real still generation demo checkpoint, set `PARTYFACE_STILL_WORKFLOW_MODE=comfy`
and `COMFY_API_KEY` in `.env.local`, restart the dev server, then run:

```bash
npm run demo:real-still -- /absolute/path/person-1.jpg /absolute/path/person-2.jpg
```

If your shell already exports an empty `COMFY_API_KEY`, unset it before starting
the dev server so Next.js can read the value from `.env.local`.

## Project Shape

- `src/app` - Next.js App Router pages, layout, globals, and future API routes.
- `src/features/studio` - PartyFace Creation Studio feature UI.
- `src/components/ui` - reusable visual primitives.
- `src/lib/domain` - shared domain types and schemas.
- `src/lib/templates` - starter templates and prompt composition.
- `src/lib/api` - shared API response helpers.
- `src/lib/comfy` - server-side ComfyUI integration boundary.
- `src/styles` - design tokens.

The original dependency-free canvas prototype is preserved in `legacy-static/` for reference.

## BMAD

BMAD Method is installed for Codex in this repo.

- Skills live in `.agents/skills`.
- BMAD config lives in `_bmad`.
- Planning output goes to `_bmad-output/planning-artifacts`.
- Implementation output goes to `_bmad-output/implementation-artifacts`.

## BYOLOMAD

BYOLOMAD is installed project-locally under `tools/byolomad`. It can run the BMAD story backlog autonomously through Claude Code containers once the repo is clean and `CLAUDE_CODE_OAUTH_TOKEN` is available.

This install is updated to the upstream version that includes experimental Codex plumbing. Current upstream status:

- `BYOLOMAD_JUDGE_ENGINE=codex` can use Codex as the host-side judge.
- `--engine codex` is present but marked experimental/not functional for full story execution because BYOLOMAD still invokes BMAD phases as Claude Code slash commands.

Claude Code skill symlink:

```text
~/.claude/skills/byolomad -> tools/byolomad/skills/byolomad
```

PartyFace also includes the top-level planning PRD symlink expected by BYOLOMAD:

```text
_bmad-output/planning-artifacts/prd.md
```

Before running:

```bash
claude setup-token
export CLAUDE_CODE_OAUTH_TOKEN=...
```

Dry-run from the repo root:

```bash
tools/byolomad/byolomad-auto.sh --repo . --test-cmd "npm run build" --no-review --dry-run
```

Codex judge experiment:

```bash
BYOLOMAD_JUDGE_ENGINE=codex tools/byolomad/byolomad-auto.sh --repo . --test-cmd "npm run build" --no-review --dry-run
```
