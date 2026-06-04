# Story 6.2: Prepare Motion Inputs from PartyFace Setup

Status: done

## Story

As a PartyFace creator,
I want my PartyFace setup to be transformed into the selected motion workflow inputs,
So that the motion output reflects my faces, template, and prompt.

## Acceptance Criteria

- Given I have a ready PartyFace setup
- When motion generation starts
- Then face references, prompt, birthday details, and template direction are mapped to the selected motion workflow
- And any still-image seed/frame dependency is handled server-side
- And validation errors return the shared recoverable API error format
- And setup state and existing favorites are preserved.

## Tasks

- [x] Reuse PartyFace setup payload and validation for motion generation.
- [x] Upload face references server-side for the selected Comfy graph.
- [x] Build a motion first-frame prompt that includes template and generation style direction.
- [x] Normalize provider-specific values before submission.

## Debug Log

- The first live Seedance run failed because `Date.now()` created a seed larger than the provider's maximum accepted value.
- Motion seed values are now normalized to fit the provider range before the Comfy graph is submitted.

## Completion Notes

- Motion inputs now use the same face-reference upload path as still generation.
- The selected generation style, including cutout-heads mode, is included in the first-frame prompt.
- Existing setup state and favorites remain client-side concerns; motion submission is isolated from still submission.

## File List

- `src/lib/comfy/motionWorkflow.ts`
- `src/lib/comfy/motionWorkflowGraph.ts`
- `src/lib/comfy/stillImageReferences.ts`
- `src/lib/comfy/workflowTypes.ts`
