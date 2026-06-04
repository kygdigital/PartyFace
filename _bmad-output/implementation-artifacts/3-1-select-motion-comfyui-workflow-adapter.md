# Story 3.1: Select Motion ComfyUI Workflow Adapter

Status: done

## Story

As a PartyFace creator,
I want the motion generation workflow to be selected and wrapped in an adapter,
So that the app can generate short birthday motion outputs without coupling UI code to ComfyUI details.

## Acceptance Criteria

- Given the Creation Studio produces a complete setup payload
- When the motion workflow is selected
- Then the decision is documented in `src/lib/comfy/motionWorkflow.ts`
- And the adapter accepts the typed PartyFace setup payload
- And the adapter defines output type, preview expectations, and duration assumptions
- And the adapter hides ComfyUI-specific request details from React components
- And the implementation can run in mock mode if the real workflow is unavailable.

## Tasks

- [x] Add motion workflow adapter types.
- [x] Select and document the motion workflow in `src/lib/comfy/motionWorkflow.ts`.
- [x] Define output type, preview, and duration assumptions.
- [x] Add a mock-capable motion workflow adapter entry point.
- [x] Run lint/build verification.

## Dev Notes

- This story should not call ComfyUI from React components.
- Real route submission starts in Story 3.2.

## Debug Log

- Verified `npm run lint`.
- Verified `npm run build`.

## Completion Notes

- Added `src/lib/comfy/motionWorkflow.ts` with selected motion workflow assumptions.
- Added motion workflow request/result types in `src/lib/comfy/workflowTypes.ts`.
- Defined MP4 output, browser-playable muted preview expectations, and 3-8 second duration bounds.
- Added mock mode as the default until real Comfy motion submission is wired.

## File List

- `_bmad-output/implementation-artifacts/3-1-select-motion-comfyui-workflow-adapter.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `.env.example`
- `src/lib/comfy/motionWorkflow.ts`
- `src/lib/comfy/workflowTypes.ts`
