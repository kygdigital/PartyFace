# Story 1.6: Ready-to-Generate Demo Checkpoint

Status: done

## Story

As a PartyFace creator,
I want the setup screen to tell me when I am ready to generate,
So that I can review progress before real generation work begins.

## Acceptance Criteria

- Given I am setting up a PartyFace project
- When no template/prompt or usable Person slot is present
- Then Still and Motion generation actions are unavailable or clearly marked incomplete
- And the app explains what is missing
- When at least one usable Person slot and a template or prompt are present
- Then Still and Motion generation actions become available
- And clicking them can show a non-destructive placeholder state until Epic 2/3 implement real generation
- And the demo-able moment for Epic 1 is: open the app, pick a template, add Person 1/2, edit details/prompt, and see the project become ready to generate.

## Tasks

- [x] Add setup readiness calculation.
- [x] Disable or clearly mark generation actions when setup is incomplete.
- [x] Show missing setup requirements.
- [x] Add non-destructive still/motion placeholder click states.
- [x] Run lint/build/browser verification.

## Dev Notes

- This checkpoint does not call ComfyUI yet.
- Use the existing placeholder validation from Story 1.4 to decide whether a Person slot is usable.

## Debug Log

- Verified `npm run lint`.
- Verified `npm run build`.
- Verified initial browser checkpoint on `http://localhost:3001/`: generation buttons disabled, missing usable-face-photo guidance visible, output tracks marked setup incomplete, and no console errors.

## Completion Notes

- Added setup readiness derived from a usable Person photo and non-empty prompt.
- Disabled Still and Motion actions until setup is ready.
- Added missing setup guidance in the hero preview.
- Added non-destructive placeholder generation state for Still and Motion clicks once setup becomes ready.

## File List

- `_bmad-output/implementation-artifacts/1-6-ready-to-generate-demo-checkpoint.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/features/studio/CreationStudio.tsx`
