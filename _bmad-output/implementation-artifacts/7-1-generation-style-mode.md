# Story 7.1: Generation Style Mode

Status: done

## Story

As a PartyFace creator,
I want to choose between Cutout Heads and Cinematic Blend,
So that I can make either a playful JibJab-style collage or a polished AI poster.

## Acceptance Criteria

- Given I open the creation studio
- When the setup form loads
- Then Cutout Heads is selected by default
- And I can switch between Cutout Heads and Cinematic Blend
- And the selected style is included in the setup payload
- And still generation receives style-specific prompt instructions
- And the ready summary shows which style is selected.

## Tasks

- [x] Add generation style domain/template definitions.
- [x] Add a studio style selector with Cutout Heads as default.
- [x] Include selected style in validated API setup payloads.
- [x] Add style-specific instructions to still generation prompts.
- [x] Update demo still generation script to use Cutout Heads by default.
- [x] Run lint/build verification.

## Debug Log

- The side test showed prompt-only cutout language can shift the output closer to a playful pasted-head look.
- This story adds the product-level option first; a future two-stage Comfy compositing workflow can specialize the Cutout Heads path further.

## Completion Notes

- Cutout Heads is now the default PartyFace style.
- Cinematic Blend remains available for polished poster outputs.

## File List

- `_bmad-output/implementation-artifacts/7-1-generation-style-mode.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `scripts/check-real-still-demo.mjs`
- `src/features/studio/CreationStudio.tsx`
- `src/features/studio/components/GenerationStyleSelector.tsx`
- `src/features/studio/mockStillVariants.ts`
- `src/features/studio/setupPayload.ts`
- `src/lib/comfy/stillWorkflow.ts`
- `src/lib/domain/project.ts`
- `src/lib/domain/schemas.ts`
- `src/lib/templates/generationStyles.ts`
