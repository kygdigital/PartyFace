# Story 2.1: Select Still ComfyUI Workflow Adapter

Status: done

## Story

As a PartyFace creator,
I want the still generation workflow to be selected and wrapped in an adapter,
So that the app can generate premium still outputs without coupling UI code to ComfyUI details.

## Acceptance Criteria

- Given the Creation Studio produces a complete setup payload
- When the still workflow is selected
- Then the decision is documented in `src/lib/comfy/stillWorkflow.ts`
- And the adapter accepts the typed PartyFace setup payload
- And the adapter hides ComfyUI-specific request details from React components
- And the implementation can run in mock mode if the real workflow is unavailable
- And open workflow assumptions are documented near the adapter.

## Tasks

- [x] Add shared PartyFace setup payload types.
- [x] Add Comfy workflow adapter types.
- [x] Select and document the still workflow in `src/lib/comfy/stillWorkflow.ts`.
- [x] Add a mock-capable still workflow adapter entry point.
- [x] Run lint/build verification.

## Dev Notes

- This story should not call ComfyUI from React components.
- The real route submission starts in Story 2.2; this story defines the adapter boundary and selected workflow assumptions.

## Debug Log

- Verified `npm run lint`.
- Verified `npm run build`.

## Completion Notes

- Added shared PartyFace setup payload types under `src/lib/domain/project.ts`.
- Added Creation Studio setup payload builder for usable person photos, template, birthday details, and prompt.
- Selected the PartyFace Krea 2 still poster workflow in `src/lib/comfy/stillWorkflow.ts`.
- Added a mock-capable adapter entry point that returns queued mock jobs until real Comfy submission is wired in Story 2.2.
- Documented open workflow assumptions near the adapter.

## File List

- `_bmad-output/implementation-artifacts/2-1-select-still-comfyui-workflow-adapter.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/features/studio/CreationStudio.tsx`
- `src/features/studio/components/BirthdayPromptComposer.tsx`
- `src/features/studio/setupPayload.ts`
- `src/features/studio/studioTypes.ts`
- `src/lib/comfy/stillWorkflow.ts`
- `src/lib/comfy/workflowTypes.ts`
- `src/lib/domain/project.ts`
- `src/lib/templates/promptComposer.ts`
