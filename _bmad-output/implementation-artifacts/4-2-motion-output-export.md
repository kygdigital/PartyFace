# Story 4.2: Motion Output Export

Status: done

## Story

As a PartyFace creator,
I want to download my selected Motion Output,
So that I can text, post, or compare it outside the app.

## Acceptance Criteria

- Given I have a completed or favorited Motion Output
- When I click the motion export action
- Then the app downloads or opens a shareable video or animated file
- And the file has a readable default name
- And the export action prioritizes the favorited Motion Output when available
- And still and motion export actions are visually distinct.

## Tasks

- [x] Add motion export helper.
- [x] Add export action that prioritizes favorited motion outputs.
- [x] Use readable default filenames.
- [x] Keep still and motion export actions visually distinct.
- [x] Run lint/build verification.

## Dev Notes

- Mock motion outputs export as animated SVG files until real video URLs exist.

## Debug Log

- Verified `npm run lint`.
- Verified `npm run build`.
- Verified `Export motion` renders in browser at `http://localhost:3001/`.

## Completion Notes

- Added animated SVG motion export helper with readable filenames.
- Motion export prioritizes the favorited motion output when present, otherwise the first generated motion output.
- Still and motion export actions use distinct visual styling.

## File List

- `_bmad-output/implementation-artifacts/4-2-motion-output-export.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/features/studio/CreationStudio.tsx`
- `src/features/studio/components/MotionPreview.tsx`
- `src/features/studio/exportOutputs.ts`
