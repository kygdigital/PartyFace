# Story 6.4: Preview and Export Real Motion Output

Status: done

## Story

As a PartyFace creator,
I want completed Comfy motion output to play in the browser and export cleanly,
So that I can decide whether to share it.

## Acceptance Criteria

- Given a real motion Comfy job completes
- When PartyFace receives output metadata
- Then the output is mapped into a `MotionOutputVariant`
- And the preview is browser-playable and does not autoplay with sound
- And favorite, regenerate, export, and comparison behavior works with real motion outputs
- And failed or missing outputs show recoverable UI copy without clearing prior favorites.

## Tasks

- [x] Parse MP4 output metadata from Comfy Cloud job results.
- [x] Map real motion outputs into `MotionOutputVariant` records.
- [x] Render real motion outputs as muted browser video previews.
- [x] Export real motion outputs through the existing download action.

## Debug Log

- Comfy `SaveVideo` returned the MP4 under the output node's `images` array with an `.mp4` filename instead of a separate `videos` array.
- The Comfy output parser now treats `.mp4`, `.webm`, `.mov`, and `.gif` files in either output bucket as motion outputs.

## Completion Notes

- Real motion output now appears as an HTML video when the job completes.
- Mock CSS motion cards still render in mock mode.
- Export uses the real MP4 URL when available.

## File List

- `src/features/studio/components/MotionPreview.tsx`
- `src/features/studio/CreationStudio.tsx`
- `src/features/studio/exportOutputs.ts`
- `src/lib/comfy/comfyCloudClient.ts`
- `src/lib/comfy/jobs.ts`
- `src/lib/domain/generation.ts`
