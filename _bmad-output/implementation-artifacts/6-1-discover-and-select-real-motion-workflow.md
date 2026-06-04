# Story 6.1: Discover and Select Real Motion Workflow

Status: done

## Story

As a PartyFace builder,
I want to inspect available Comfy motion workflows and select the first real motion workflow,
So that PartyFace can move from mock motion previews to generated video or animation.

## Acceptance Criteria

- Given Comfy MCP/API access is available
- When I inspect saved workflows, templates, and relevant video/image-to-video nodes
- Then the selected motion workflow decision is documented in `src/lib/comfy/motionWorkflow.ts`
- And required node ids, prompt inputs, image inputs, duration controls, model/provider choices, and output expectations are captured near the adapter
- And preview requirements remain browser-playable and muted by default
- And unresolved workflow assumptions are explicitly documented before implementation continues.

## Tasks

- [x] Compare available video generation options for PartyFace motion.
- [x] Select an image-to-video workflow that can use generated first-frame imagery.
- [x] Document the selected adapter, provider, duration bounds, and output contract.
- [x] Keep mock mode available as a local fallback.

## Completion Notes

- Selected a Comfy Cloud workflow that chains a Nano Banana/Gemini first frame into ByteDance Seedance image-to-video.
- The selected workflow is `partyface-seedance-motion-v1` and uses browser-playable MP4 output.
- This keeps the visual quality and face-reference behavior from the still workflow while adding motion as a second stage.

## File List

- `src/lib/comfy/motionWorkflow.ts`
- `src/lib/comfy/motionWorkflowGraph.ts`
- `src/lib/comfy/workflowTypes.ts`
