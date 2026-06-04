# Story 5.1: Discover and Select Real Still Workflow

Status: done

## Story

As a PartyFace builder,
I want to inspect available Comfy workflows and select the first real still workflow,
So that PartyFace can move from mock still variants to generated images.

## Acceptance Criteria

- Given Comfy MCP/API access is available
- When I inspect saved workflows, templates, and relevant API/provider nodes
- Then the selected still workflow decision is documented in `src/lib/comfy/stillWorkflow.ts`
- And any required node ids, prompt inputs, image inputs, model/provider choices, and output expectations are captured near the adapter
- And Nano Banana is preferred for the first identity-aware still workflow when available through the configured Comfy environment
- And Krea 2 is documented as a fallback or alternate style-led poster workflow
- And unresolved workflow assumptions are explicitly documented before implementation continues.

## Tasks

- [x] Inspect saved Comfy workflows.
- [x] Inspect relevant Comfy templates and provider/API nodes.
- [x] Select first real still workflow path.
- [x] Document workflow contract and assumptions in `src/lib/comfy/stillWorkflow.ts`.
- [x] Run lint/build verification.

## Dev Notes

- Prefer Nano Banana for the first identity-aware still workflow if available through the configured Comfy environment.
- Keep Krea 2 as a fallback or alternate style-led poster model.
- This story selects the workflow contract; submission implementation follows in later stories.

## Debug Log

- Comfy MCP `list_saved_workflows` returned 7 saved workflows: `Add Image.json`, `Gallery Watercolor Print.json`, `Illustrated SF Cover.json`, `Room Redesign.json`, `SeedDance 2.0.json`, `Test Arrkvardk.json`, and `Upscale Print.json`.
- Comfy MCP `search_nodes` confirmed `Krea2ImageNode` exists under `api node/image/Krea`.
- `Krea2ImageNode` supports prompt, Krea 2 Medium/Large, seed, aspect ratio, 1K resolution, creativity, optional moodboard, and optional style reference chain.
- `Krea2ImageNode` outputs `IMAGE`; core `SaveImage` can persist the image output.
- Comfy MCP `search_nodes` confirmed `GeminiImageNode`, `GeminiImage2Node`, and `GeminiNanoBanana2` exist under `api node/image/Gemini`.
- Nano Banana supports prompt, model, seed, aspect ratio, resolution, response modality, and optional IMAGE references.
- Comfy MCP `partner_generate` exposes `vertexai/nano-banana-pro` and `vertexai/nano-banana-2`.
- No Krea-specific saved PartyFace workflow was found.
- Verified `npm run lint`.
- Verified `npm run build`.

## Completion Notes

- Selected first real still path: server-side Nano Banana partner/API workflow using `vertexai/nano-banana-pro`, 4:5 aspect ratio, 2K target resolution, and IMAGE references where available.
- Documented the provider contract and unresolved upload/reference transport in `src/lib/comfy/stillWorkflow.ts`.
- Krea 2 remains a strong fallback or alternate style-led poster path; face-photo upload/reference strategy moves to Story 5.2.

## File List

- `_bmad-output/implementation-artifacts/5-1-discover-and-select-real-still-workflow.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/lib/comfy/stillWorkflow.ts`
- `src/lib/comfy/workflowTypes.ts`
