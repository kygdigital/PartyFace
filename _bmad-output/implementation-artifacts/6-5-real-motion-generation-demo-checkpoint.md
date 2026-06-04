# Story 6.5: Real Motion Generation Demo Checkpoint

Status: done

## Story

As a PartyFace builder,
I want to run the full motion generation path with real Comfy output,
So that I can judge whether PartyFace beats the benchmark on fun and shareability.

## Acceptance Criteria

- Given the selected motion workflow is configured
- When I complete setup and generate motion
- Then a real browser-playable motion output appears
- And I can favorite, regenerate, export, and compare it
- And the demo-able moment for Epic 6 is: generate a real motion birthday card, preview it muted in browser, favorite it, export it, and compare it against the benchmark placeholder.

## Tasks

- [x] Enable real motion mode locally with `.env.local`.
- [x] Submit a real motion job through the PartyFace API.
- [x] Poll the PartyFace job API until completion.
- [x] Download the generated MP4 to the shared outputs folder for review.
- [x] Verify lint, production build, and browser load.

## Debug Log

- Failed job: `comfy-motion-1780263271030` failed on provider seed validation before seed normalization.
- Successful job: `comfy-motion-1780263349690` completed with provider prompt id `fba45adf-7137-4ead-83f7-2b36b5775cb4`.
- Downloaded demo output: `/Users/karengtrz/Documents/Codex/2026-05-30/files-mentioned-by-the-user-img/outputs/partyface-motion-seedance-1.mp4`.

## Completion Notes

- The Epic 6 demo produced a real MP4 through the PartyFace API and Comfy Cloud.
- The current first motion workflow prioritizes a working end-to-end pipeline over final prompt/model tuning.
- Next quality iteration should compare Seedance motion against alternate providers and tune prompts for more obvious cutout-head movement.

## Verification

- `npm run lint`
- `npm run build`
- Browser smoke test at `http://localhost:3001/` with no console errors.

## File List

- `_bmad-output/implementation-artifacts/6-5-real-motion-generation-demo-checkpoint.md`
- `src/lib/comfy/comfyCloudClient.ts`
- `src/lib/comfy/jobs.ts`
- `src/lib/comfy/motionWorkflow.ts`
- `src/lib/comfy/motionWorkflowGraph.ts`
- `src/features/studio/CreationStudio.tsx`
- `src/features/studio/components/MotionPreview.tsx`
- `src/features/studio/exportOutputs.ts`
