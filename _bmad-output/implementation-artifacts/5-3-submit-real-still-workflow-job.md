# Story 5.3: Submit Real Still Workflow Job

Status: done

## Story

As a PartyFace creator,
I want Generate stills to submit the selected real Comfy workflow,
So that PartyFace creates actual birthday image variants.

## Acceptance Criteria

- Given I have a ready PartyFace setup and uploaded face references
- When I click Generate stills
- Then `POST /api/generate/still` submits the selected Comfy workflow in real mode
- And prompt, birthday details, template choice, and face inputs are injected into the workflow
- And the route still supports mock mode as a fallback
- And the UI receives a PartyFace job id linked to the Comfy prompt id
- And accidental duplicate still submissions are prevented while active.

## Tasks

- [x] Add a server-only Comfy Cloud client for image upload, workflow submission, and job status polling.
- [x] Build a Nano Banana/Gemini still workflow graph with LoadImage, optional ImageBatch, GeminiImage2Node, and SaveImage.
- [x] Upload browser image references into Comfy Cloud input storage before workflow submission.
- [x] Submit one Comfy prompt per still variant and store the returned prompt ids on the PartyFace job.
- [x] Keep mock mode unchanged when Comfy mode is not enabled.
- [x] Poll real Comfy job status without ingesting outputs yet.
- [x] Run lint/build verification.

## Debug Log

- Official Comfy Cloud docs confirm `POST /api/prompt` with `X-API-Key` and partner-node `extra_data.api_key_comfy_org`.
- Official Comfy Cloud docs confirm direct image upload via `POST /api/upload/image`.
- Comfy MCP discovery confirmed `GeminiImage2Node`, `LoadImage`, `ImageBatch`, and `SaveImage` are available for the selected workflow shape.
- Real mode is gated by `PARTYFACE_STILL_WORKFLOW_MODE=comfy` plus `COMFY_API_KEY`, so local/demo use remains mock by default.

## Completion Notes

- Real still generation now submits Nano Banana/Gemini workflows through Comfy Cloud when Comfy mode is enabled.
- Story 5.4 should use stored Comfy prompt ids to fetch completed output metadata and map real image URLs into `StillOutputVariant`.

## File List

- `_bmad-output/implementation-artifacts/5-3-submit-real-still-workflow-job.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `.env.example`
- `src/app/api/jobs/[jobId]/route.ts`
- `src/lib/comfy/comfyCloudClient.ts`
- `src/lib/comfy/jobs.ts`
- `src/lib/comfy/stillWorkflow.ts`
- `src/lib/comfy/stillWorkflowGraph.ts`
- `src/lib/comfy/workflowTypes.ts`
- `src/lib/domain/generation.ts`
