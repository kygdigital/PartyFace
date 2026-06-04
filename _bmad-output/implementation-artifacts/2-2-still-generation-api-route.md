# Story 2.2: Still Generation API Route

Status: done

## Story

As a PartyFace creator,
I want to start still generation from the app,
So that uploaded people and prompt details can produce Still Output Variants.

## Acceptance Criteria

- Given I have a ready PartyFace setup
- When I click Generate stills
- Then the browser calls `POST /api/generate/still`
- And the route validates the payload with Zod
- And the route keeps `COMFY_API_KEY` server-side only
- And the route returns the shared API response wrapper
- And the UI receives a PartyFace job id or mock job id.

## Tasks

- [x] Add Zod schema for the PartyFace setup payload.
- [x] Add `POST /api/generate/still`.
- [x] Return shared API response wrapper success/failure shapes.
- [x] Connect Generate stills to the API route.
- [x] Run lint/build and API verification.

## Dev Notes

- Default to mock mode until real Comfy still submission is completed.
- `COMFY_API_KEY` must remain server-side only.

## Debug Log

- Installed `zod`.
- Verified `npm run lint`.
- Verified `npm run build`.
- Verified `POST /api/generate/still` on `http://localhost:3001` returns `{ ok: true, data: { jobId, status: "queued", mode: "mock" } }` for a valid payload.

## Completion Notes

- Added Zod validation for the PartyFace setup payload.
- Added `POST /api/generate/still` route with shared API success/failure responses.
- Kept real Comfy submission behind server-side adapter mode; mock mode remains the default.
- Connected the Creation Studio Still generation button to the API route and displays the returned mock job id.

## File List

- `_bmad-output/implementation-artifacts/2-2-still-generation-api-route.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `.env.example`
- `package-lock.json`
- `package.json`
- `src/app/api/generate/still/route.ts`
- `src/features/studio/CreationStudio.tsx`
- `src/lib/api/responses.ts`
- `src/lib/comfy/stillWorkflow.ts`
- `src/lib/domain/schemas.ts`
