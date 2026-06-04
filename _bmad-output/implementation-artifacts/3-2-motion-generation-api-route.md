# Story 3.2: Motion Generation API Route

Status: done

## Story

As a PartyFace creator,
I want to start motion generation from the app,
So that uploaded people and prompt details can produce a short video or animation.

## Acceptance Criteria

- Given I have a ready PartyFace setup
- When I click Generate motion
- Then the browser calls `POST /api/generate/motion`
- And the route validates the payload with Zod
- And the route keeps `COMFY_API_KEY` server-side only
- And the route returns the shared API response wrapper
- And the UI receives a PartyFace job id or mock job id.

## Tasks

- [x] Add `POST /api/generate/motion`.
- [x] Return shared API response wrapper success/failure shapes.
- [x] Record motion jobs in the mock job registry.
- [x] Connect Generate motion to the API route.
- [x] Run lint/build and API verification.

## Dev Notes

- Default to mock mode until real Comfy motion submission is completed.
- `COMFY_API_KEY` must remain server-side only.

## Debug Log

- Verified `npm run lint`.
- Verified `npm run build`.
- Verified `POST /api/generate/motion` returns `{ ok: true, data: { jobId, status: "queued", mode: "mock" } }` for a valid payload.

## Completion Notes

- Added `POST /api/generate/motion` route with Zod setup validation and shared API responses.
- Added motion jobs to the mock job registry.
- Connected the Creation Studio Motion generation button to the API route.
- Real Comfy motion submission remains behind server-side adapter mode.

## File List

- `_bmad-output/implementation-artifacts/3-2-motion-generation-api-route.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/app/api/generate/motion/route.ts`
- `src/features/studio/CreationStudio.tsx`
- `src/lib/comfy/jobs.ts`
