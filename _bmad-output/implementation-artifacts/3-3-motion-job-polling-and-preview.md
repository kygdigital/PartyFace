# Story 3.3: Motion Job Polling and Preview

Status: done

## Story

As a PartyFace creator,
I want to see motion generation progress and preview the result,
So that I can decide whether the motion output is share-worthy.

## Acceptance Criteria

- Given a motion generation job has started
- When the UI polls `GET /api/jobs/[jobId]`
- Then the UI renders statuses using the shared `GenerationJobStatus` names
- And Still and Motion statuses are independent
- And duplicate motion generation is prevented while a motion job is active
- When the job completes
- Then a browser-playable preview appears in the Motion Output track
- And motion previews do not autoplay with sound.

## Tasks

- [x] Poll motion job status independently from still jobs.
- [x] Prevent duplicate motion generation while active.
- [x] Add browser-playable muted motion preview on completion.
- [x] Run lint/build/browser verification.

## Dev Notes

- Mock preview can use a CSS animated preview surface until real video URLs exist.

## Debug Log

- Verified `npm run lint`.
- Verified `npm run build`.
- Verified the app renders at `http://localhost:3001/` with Motion Output visible and no console errors.

## Completion Notes

- Added independent motion job polling through `GET /api/jobs/[jobId]`.
- Disabled duplicate motion generation while motion jobs are active.
- Added a browser-rendered muted mock motion preview surface after completion.
- Still and Motion job states are tracked separately.

## File List

- `_bmad-output/implementation-artifacts/3-3-motion-job-polling-and-preview.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/features/studio/CreationStudio.tsx`
- `src/features/studio/components/MotionPreview.tsx`
- `src/features/studio/mockMotionVariants.ts`
- `src/lib/domain/generation.ts`
