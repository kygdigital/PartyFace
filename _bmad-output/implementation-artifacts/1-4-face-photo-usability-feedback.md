# Story 1.4: Face Photo Usability Feedback

Status: done

## Story

As a PartyFace creator,
I want feedback when a Face Photo may not work,
So that I can retry before generating bad outputs.

## Acceptance Criteria

- Given I upload a Face Photo
- When the app cannot confidently treat it as usable
- Then I see a clear message asking for a clearer face photo
- And the message appears near the affected Person slot
- And I can replace the Face Photo without losing selected template, birthday details, or prompt text
- And the initial implementation may use a simple local placeholder validation as long as the UX contract is present.

## Tasks

- [x] Add lightweight local photo usability assessment.
- [x] Store usability status/message with each uploaded Person photo.
- [x] Show inline feedback near the affected Person slot.
- [x] Preserve selected template and other setup state when replacing a photo.
- [x] Run lint/build verification.

## Dev Notes

- This story intentionally uses placeholder validation. True face detection can be added later without changing the slot-level UX contract.
- Avoid manual skin color selection in the happy path.

## Debug Log

- Added deterministic local placeholder validation using file type, image decode, dimensions, and file size.
- Verified `npm run lint`.
- Verified `npm run build`.
- Verified app render in browser at `http://localhost:3001/` with no console errors.

## Completion Notes

- Uploaded face photos now carry a slot-level usability status and message.
- The People section shows an inline retry message near the affected Person slot when the placeholder validator cannot treat the photo as usable.
- Replacing or removing a photo only changes the affected Person slot, preserving selected template and setup state.

## File List

- `_bmad-output/implementation-artifacts/1-4-face-photo-usability-feedback.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/features/studio/CreationStudio.tsx`
- `src/features/studio/components/PersonSlots.tsx`
- `src/features/studio/facePhotoValidation.ts`
- `src/features/studio/studioTypes.ts`
