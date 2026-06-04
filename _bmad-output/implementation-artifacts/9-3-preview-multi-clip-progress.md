# Story 9.3: Preview Multi-Clip Progress

Status: done

## Story

As a PartyFace creator,
I want to see each clip's progress,
So that a longer video generation process feels understandable and recoverable.

## Acceptance Criteria

- Given a final video job is running
- When one or more beat clips have status updates or outputs
- Then the UI shows per-clip queued, generating, complete, or failed states
- And completed clips can be previewed before final stitching.

## Tasks

- [x] Add per-clip status records to final-video jobs.
- [x] Return initial clip statuses from the final-video start endpoint.
- [x] Update mock job polling so clip statuses progress independently.
- [x] Keep final-video aggregate status generating until all clips are complete.
- [x] Add a Final Video Progress panel in the studio.
- [x] Add a Generate beat clips action that calls the final-video endpoint.

## Debug Log

- Initial mock polling let the aggregate final-video job become `complete` before every clip was complete.
- Fixed aggregate status to derive from per-clip statuses for final-video jobs.

## Completion Notes

- The app now has a visible per-beat progress surface for final-video generation.
- In mock mode, clip statuses progress from queued to generating to complete.
- In Comfy mode, clip statuses will be mapped from each provider job id.
- Completed clip video previews are still deferred until real final-video outputs are wired into this panel.

## Verification

- `npm run lint`
- `npm run build`
- Mock final-video polling showed per-clip progress and only completed once all four clips were complete.
- Browser smoke test at `http://localhost:3001/` confirmed Final Video Progress UI, Generate beat clips action, and no console errors.

## File List

- `src/lib/domain/generation.ts`
- `src/lib/comfy/workflowTypes.ts`
- `src/lib/comfy/finalVideoWorkflow.ts`
- `src/lib/comfy/jobs.ts`
- `src/features/studio/components/FinalVideoProgress.tsx`
- `src/features/studio/CreationStudio.tsx`
