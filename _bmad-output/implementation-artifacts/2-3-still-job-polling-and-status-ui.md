# Story 2.3: Still Job Polling and Status UI

Status: done

## Story

As a PartyFace creator,
I want to see still generation progress,
So that I know whether the app is working, complete, or failed.

## Acceptance Criteria

- Given a still generation job has started
- When the UI polls `GET /api/jobs/[jobId]`
- Then the UI renders statuses using the shared `GenerationJobStatus` names
- And Still and Motion statuses are independent
- And duplicate still generation is prevented while a still job is active
- And failed jobs preserve setup inputs and existing favorites.

## Tasks

- [x] Add a server-side mock job registry.
- [x] Add `GET /api/jobs/[jobId]`.
- [x] Poll still job status from the Creation Studio.
- [x] Prevent duplicate still generation while a still job is active.
- [x] Run lint/build and API verification.

## Dev Notes

- Mock jobs may advance deterministically by elapsed time.
- Motion remains independent and placeholder-only until Epic 3.

## Debug Log

- Verified `npm run lint`.
- Verified `npm run build`.
- Verified a mock still job can be fetched from `GET /api/jobs/[jobId]` and advances to `complete`.

## Completion Notes

- Added in-memory mock job registry with deterministic status progression.
- Added `GET /api/jobs/[jobId]` using the shared API response wrapper.
- Creation Studio now polls active still jobs and renders shared `GenerationJobStatus` values.
- Still generation is disabled while a still job is active; motion remains independent.
- Failed job checks preserve setup inputs and show recovery text.

## File List

- `_bmad-output/implementation-artifacts/2-3-still-job-polling-and-status-ui.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/app/api/generate/still/route.ts`
- `src/app/api/jobs/[jobId]/route.ts`
- `src/features/studio/CreationStudio.tsx`
- `src/lib/comfy/jobs.ts`
- `src/lib/domain/generation.ts`
