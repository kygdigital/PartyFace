# Story 4.1: Still Output Export

Status: done

## Story

As a PartyFace creator,
I want to download my selected Still Output,
So that I can text, post, or compare it outside the app.

## Acceptance Criteria

- Given I have a completed or favorited Still Output
- When I click the still export action
- Then the app downloads or opens a shareable image file
- And the file has a readable default name
- And the export action prioritizes the favorited Still Output when available
- And export errors use the shared recoverable error format.

## Tasks

- [x] Add still export helper.
- [x] Add export action that prioritizes favorited stills.
- [x] Use readable default filenames.
- [x] Return shared recoverable errors from export failures.
- [x] Run lint/build verification.

## Dev Notes

- Mock still outputs export as SVG image files until real generated image URLs exist.

## Debug Log

- Verified `npm run lint`.
- Verified `npm run build`.
- Verified `Export still` renders in browser at `http://localhost:3001/`.

## Completion Notes

- Added SVG still export helper with readable filenames.
- Still export prioritizes the favorited still output when present, otherwise the first generated still.
- Export failures use the shared recoverable API error shape.

## File List

- `_bmad-output/implementation-artifacts/4-1-still-output-export.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/features/studio/CreationStudio.tsx`
- `src/features/studio/components/StillVariantGallery.tsx`
- `src/features/studio/exportOutputs.ts`
