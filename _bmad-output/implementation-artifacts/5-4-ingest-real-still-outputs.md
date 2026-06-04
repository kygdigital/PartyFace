# Story 5.4: Ingest Real Still Outputs

Status: done

## Story

As a PartyFace creator,
I want completed Comfy still outputs to appear in the gallery,
So that I can review and favorite actual generated images.

## Acceptance Criteria

- Given a real still Comfy job completes
- When PartyFace receives output metadata
- Then real image preview/download URLs are mapped into `StillOutputVariant` records
- And each variant has a stable `variantId`
- And existing mock gallery, favorite, regenerate, and export behavior works with real outputs
- And failed or missing outputs show recoverable UI copy without clearing prior favorites.

## Tasks

- [x] Fetch Comfy job details after provider jobs complete.
- [x] Extract `SaveImage` image file metadata and resolve signed view URLs.
- [x] Map real output URLs into `StillOutputVariant` records.
- [x] Render real image previews in the still gallery while preserving mock card previews.
- [x] Export/download real still outputs with the existing export action.
- [x] Keep mock gallery/favorite/regenerate behavior unchanged.
- [x] Run lint/build verification.

## Debug Log

- Official Comfy Cloud docs show generated file download via `/api/view?filename=...&subfolder=...&type=output`.
- The app now polls provider statuses, then reads output metadata once the real Comfy job completes.
- Real outputs are added to the same gallery state as mock outputs, so favorites and regenerate remain shared.

## Completion Notes

- Story 5.4 completes the real still output ingestion path through preview and download URLs.
- Story 5.5 should run a demo checkpoint with Comfy mode enabled and judge whether the generated outputs meet the image-quality benchmark.

## File List

- `_bmad-output/implementation-artifacts/5-4-ingest-real-still-outputs.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/features/studio/CreationStudio.tsx`
- `src/features/studio/components/StillVariantGallery.tsx`
- `src/features/studio/exportOutputs.ts`
- `src/lib/comfy/comfyCloudClient.ts`
- `src/lib/comfy/jobs.ts`
- `src/lib/comfy/stillWorkflow.ts`
- `src/lib/comfy/workflowTypes.ts`
- `src/lib/domain/generation.ts`
