# Story 2.5: Still Prompt Iteration Demo Checkpoint

Status: done

## Story

As a PartyFace creator,
I want to regenerate stills after changing the prompt,
So that I can make a better version without restarting setup.

## Acceptance Criteria

- Given I have generated at least one Still Output
- When I edit the prompt and regenerate stills
- Then the app keeps Person slots, birthday details, and prior favorites
- And new Still Output Variants are appended or clearly separated from previous results
- And the demo-able moment for Epic 2 is: start from Epic 1 setup, generate/mock still variants, favorite one, edit prompt, regenerate, and compare results.

## Tasks

- [x] Make regeneration distinct after a completed still run.
- [x] Keep setup state and favorite ids across subsequent still runs.
- [x] Clearly separate variants by generation job.
- [x] Run lint/build/browser verification.

## Dev Notes

- Real image regeneration remains mock-backed until Comfy result URLs are wired.

## Debug Log

- Verified `npm run lint`.
- Verified `npm run build`.
- Verified the Epic 2 checkpoint surface renders at `http://localhost:3001/` with no console errors.

## Completion Notes

- The Still generation action changes to Regenerate once variants exist.
- Completed mock still variants remain appended and grouped by generation job.
- Existing favorites remain referenced by stable `variantId` and are not cleared by subsequent runs.
- The Epic 2 demo checkpoint is ready for review with mock still outputs.

## File List

- `_bmad-output/implementation-artifacts/2-5-still-prompt-iteration-demo-checkpoint.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/features/studio/CreationStudio.tsx`
- `src/features/studio/components/StillVariantGallery.tsx`
