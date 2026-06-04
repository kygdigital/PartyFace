# Story 2.4: Still Variant Gallery and Favorites

Status: done

## Story

As a PartyFace creator,
I want to review and favorite still variants,
So that I can compare options and keep the best card/poster.

## Acceptance Criteria

- Given still generation completes
- When the app receives Still Output Variant metadata
- Then variants appear in a comparison-friendly gallery
- And each variant has a stable `variantId`
- And I can favorite at least one Still Output
- And favorites reference `variantId`, not array position
- And variants do not replace prior favorites unless I explicitly clear them.

## Tasks

- [x] Add still variant metadata type and mock variant factory.
- [x] Add comparison-friendly still variant gallery UI.
- [x] Add favorite toggling by stable `variantId`.
- [x] Append completed job variants without replacing prior favorites.
- [x] Run lint/build verification.

## Dev Notes

- Mock variants stand in for real Comfy image result metadata until the workflow returns URLs.

## Debug Log

- Verified `npm run lint`.
- Verified `npm run build`.
- Verified gallery surface renders in browser at `http://localhost:3001/` with no console errors.

## Completion Notes

- Added stable `StillOutputVariant` metadata.
- Added mock still variant creation when a mock still job completes.
- Added comparison-friendly still variant gallery.
- Added favorite toggling by `variantId` and a favorites summary.
- Completed job variants append to existing variants; favorite ids are not replaced.

## File List

- `_bmad-output/implementation-artifacts/2-4-still-variant-gallery-and-favorites.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/features/studio/CreationStudio.tsx`
- `src/features/studio/components/StillVariantGallery.tsx`
- `src/features/studio/mockStillVariants.ts`
- `src/lib/domain/generation.ts`
