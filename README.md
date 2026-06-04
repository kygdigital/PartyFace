# PartyFace

PartyFace is a playful birthday-card and short-video creation studio inspired by
JibJab, but designed around modern AI image and video generation. The first
prototype helps someone pick a visual template, add two real face photos,
customize birthday copy, generate stills, turn a favorite still into motion, and
plan a 30-second music-video style card.

The product direction is disco-glam, celebratory, and personal: less rigid
template filling, more "make this look amazing for my friend" iteration.

## Current Status

PartyFace is an active MVP prototype.

- Next.js Creation Studio UI is implemented.
- Starter templates, two person slots, birthday details, and prompt composition are implemented.
- Still generation supports mock mode and Comfy Cloud mode.
- Motion generation supports mock mode and Comfy Cloud mode.
- Generation styles include `Cinematic Blend` and `Cutout Heads`.
- Story templates, beat-by-beat motion planning, music direction, and final-video progress UI are implemented.
- A local 90s stock-loop MP3 preview asset is included.
- BMAD planning and story artifacts are local workflow files and are ignored by git.
- Epic 9 final-video assembly is in progress; story 9.5 remains the next demo checkpoint.

## Quick Start

Install dependencies:

```bash
npm install
```

Start the local Next.js app:

```bash
npm run dev
```

Then visit:

```text
http://localhost:3000
```

If port 3000 is busy, Next.js may start on another port, such as
`http://localhost:3001`.

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
PARTYFACE_FINAL_VIDEO_WORKFLOW_MODE=mock
```

`COMFY_API_KEY` is server-only. Do not create a `NEXT_PUBLIC_COMFY_API_KEY`.
Keep real keys in `.env.local`; that file is ignored by git.

To use real Comfy Cloud generation, set the relevant workflow mode to `comfy`,
restart the dev server, and make sure `COMFY_API_KEY` is present:

```bash
PARTYFACE_STILL_WORKFLOW_MODE=comfy
PARTYFACE_MOTION_WORKFLOW_MODE=comfy
PARTYFACE_FINAL_VIDEO_WORKFLOW_MODE=comfy
```

If your shell already exports an empty `COMFY_API_KEY`, unset it before starting
the dev server so Next.js can read the value from `.env.local`.

## Real Still Demo

Run a real still-generation checkpoint with two local face images:

```bash
npm run demo:real-still -- /absolute/path/person-1.jpg /absolute/path/person-2.jpg
```

The browser UI also routes generation through local API routes so the client
never talks to Comfy Cloud directly.

## Product Workflow

The current first-use flow is:

1. Choose a starter template.
2. Add two face photos.
3. Pick a generation style.
4. Customize birthday details and prompt direction.
5. Generate still variants.
6. Favorite/export still outputs.
7. Generate motion from a favorite still.
8. Choose a story template for a longer music-video style card.
9. Preview beat progress and final-video assembly status.

## Generation Styles

`Cinematic Blend` aims for polished AI poster/video output where the faces feel
naturally integrated into the scene.

`Cutout Heads` aims for a more JibJab-like collage effect with oversized,
sticker-like face cutouts attached to generated bodies. This is currently a
prompt/workflow style option, with a stronger future path being two-stage
generation: create the scene and bodies, segment uploaded faces, then composite
face cutouts with direct layout control.

## Music

The MVP includes a local stock-loop MP3 for previewing the final-video
experience. Future music import can support user-provided tracks, including
audio generated in tools like Suno, as long as the user has rights to use and
share the track.

## Project Shape

- `src/app` - Next.js App Router pages, layout, globals, and API routes.
- `src/features/studio` - PartyFace Creation Studio feature UI.
- `src/features/studio/components` - studio-specific UI components.
- `src/components/ui` - reusable visual primitives.
- `src/lib/domain` - shared domain types and schemas.
- `src/lib/templates` - starter templates, story templates, prompt composition, motion plans, and audio strategy.
- `src/lib/api` - shared API response helpers.
- `src/lib/comfy` - server-side Comfy Cloud integration boundary.
- `src/styles` - design tokens.
- `public/audio` - local audio preview assets.
- `tools/byolomad` - project-local BYOLOMAD runner.

The original dependency-free canvas prototype is preserved in `legacy-static/`
for reference.

## Comfy Cloud Boundary

Browser components call PartyFace API route handlers. The API routes call the
server-side Comfy integration in `src/lib/comfy`.

This keeps credentials private and lets the app swap workflows, providers, and
mock/real modes without changing the client UI.

## BMAD

BMAD Method can be installed locally for Codex in this repo. BMAD-generated
files are intentionally ignored so local agent configuration, planning drafts,
and story artifacts do not clutter the shared repository.

- Local skills live in `.agents/skills`.
- Local BMAD config lives in `_bmad`.
- Local planning output goes to `_bmad-output/planning-artifacts`.
- Local implementation output goes to `_bmad-output/implementation-artifacts`.

These paths are available in a local BMAD-prepped workspace, but they are not
expected to exist after a fresh clone until BMAD is installed or restored.

## BYOLOMAD

BYOLOMAD is installed project-locally under `tools/byolomad`. It can run the
BMAD story backlog autonomously through Claude Code containers once the repo is
clean and `CLAUDE_CODE_OAUTH_TOKEN` is available.

This install is updated to the upstream version that includes experimental
Codex plumbing. Current upstream status:

- `BYOLOMAD_JUDGE_ENGINE=codex` can use Codex as the host-side judge.
- `--engine codex` is present but marked experimental for full story execution
  because BYOLOMAD still invokes BMAD phases as Claude Code slash commands.

Claude Code skill symlink:

```text
~/.claude/skills/byolomad -> tools/byolomad/skills/byolomad
```

In a local BMAD-prepped workspace, PartyFace may include the top-level planning
PRD symlink expected by BYOLOMAD:

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
