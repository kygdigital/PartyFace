# Story 6.3: Submit Real Motion Workflow Job

Status: done

## Story

As a PartyFace creator,
I want Generate motion to submit the selected real Comfy workflow,
So that PartyFace creates an actual short birthday motion output.

## Acceptance Criteria

- Given I have a ready PartyFace setup and required motion inputs
- When I click Generate motion
- Then `POST /api/generate/motion` submits the selected Comfy workflow in real mode
- And the route still supports mock mode as a fallback
- And the UI receives a PartyFace job id linked to the Comfy prompt id
- And duplicate motion submissions are prevented while active
- And motion and still job states remain independent.

## Tasks

- [x] Build the real Comfy graph for motion generation.
- [x] Submit the graph through the existing Comfy Cloud client.
- [x] Return a PartyFace motion job id with provider prompt metadata.
- [x] Preserve mock mode as the default fallback when real mode is disabled or unconfigured.

## Completion Notes

- `POST /api/generate/motion` now submits real Comfy motion jobs when `PARTYFACE_MOTION_WORKFLOW_MODE=comfy`.
- Provider prompt ids are stored on the PartyFace job record for polling and debugging.
- Motion jobs remain separate from still jobs in the in-memory job store.

## File List

- `src/app/api/generate/motion/route.ts`
- `src/lib/comfy/jobs.ts`
- `src/lib/comfy/motionWorkflow.ts`
- `src/lib/comfy/motionWorkflowGraph.ts`
- `src/lib/domain/generation.ts`
