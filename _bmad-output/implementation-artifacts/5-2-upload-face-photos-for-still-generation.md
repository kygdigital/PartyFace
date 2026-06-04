# Story 5.2: Upload Face Photos for Still Generation

Status: done

## Story

As a PartyFace creator,
I want uploaded face photos to be sent to the server-side Comfy workflow,
So that real still generation can use my selected people.

## Acceptance Criteria

- Given I have at least one usable Person photo
- When I start still generation
- Then the server receives the photo payload or upload reference without exposing `COMFY_API_KEY`
- And the Comfy upload result is mapped to the selected still workflow's expected image input
- And Nano Banana and Krea 2 are compared against the same 1-2 face references before the final still provider path is locked
- And upload failures return the shared recoverable API error format
- And existing setup state is preserved after upload failure.

## Tasks

- [x] Include a browser-safe image reference with each usable face photo in the setup payload.
- [x] Validate supported image reference formats in the shared setup schema.
- [x] Map face references to the selected Nano Banana workflow input contract server-side.
- [x] Keep Krea 2 available as the comparison/fallback provider candidate.
- [x] Return a recoverable API error when a still reference is missing or unsupported.
- [x] Run lint/build verification.

## Debug Log

- Browser uploads now retain a preview URL for UI display and a data URL reference for server submission.
- `buildStillImageReferences` maps HTTPS references to `partner_generate.medias[].value`.
- Data URL references are accepted as the current app-local transport and marked for partner media/upload resolution in Story 5.3.
- The server returns `still_reference_unavailable` without clearing client setup state if reference preparation fails.

## Completion Notes

- Story 5.2 prepares real face references for the selected Nano Banana still flow but does not submit the real Comfy job yet.
- Story 5.3 should convert the mapped references into the actual `partner_generate` media/input shape and persist the Comfy prompt id.

## File List

- `_bmad-output/implementation-artifacts/5-2-upload-face-photos-for-still-generation.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/app/api/generate/still/route.ts`
- `src/features/studio/CreationStudio.tsx`
- `src/features/studio/setupPayload.ts`
- `src/features/studio/studioTypes.ts`
- `src/lib/comfy/stillImageReferences.ts`
- `src/lib/comfy/stillWorkflow.ts`
- `src/lib/comfy/workflowTypes.ts`
- `src/lib/domain/project.ts`
- `src/lib/domain/schemas.ts`
