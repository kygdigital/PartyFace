# Story 1.3: Two Neutral Person Slots

Status: done

## Story

As a PartyFace creator,
I want two neutral person slots,
so that I can add up to two people without forcing a relationship role.

## Acceptance Criteria

1. Given I am in the Creation Studio, when I view the People section, then I see two slots labeled Person 1 and Person 2 or equivalent.
2. Each slot accepts one Face Photo upload.
3. I can replace or remove an uploaded Face Photo.
4. Uploaded Face Photos show thumbnails.
5. The app does not ask me to select skin color in the happy path.
6. Person 2 is optional.

## Tasks / Subtasks

- [x] Add person slot state to `CreationStudio`. (AC: 1-6)
- [x] Add a `PersonSlots` component under `src/features/studio/components`. (AC: 1-4, 6)
- [x] Support upload, replace, remove, and thumbnail preview for each slot. (AC: 2-4)
- [x] Show Person 2 as optional without blocking the rest of the studio shell. (AC: 6)
- [x] Keep skin color/manual demographic selection out of the happy path. (AC: 5)
- [x] Run `npm run lint` and `npm run build`. (AC: 1-6)

## Dev Notes

- Build on Stories 1.1 and 1.2; do not rework the template picker.
- Keep this story local to person slot UI/state. Face usability detection belongs to Story 1.4.
- Avoid sending uploads to ComfyUI or any API in this story. Use browser object URLs for local thumbnail previews.
- Revoke object URLs when replacing/removing photos to avoid browser memory leaks.
- Person 2 must be visibly optional.

## Dev Agent Record

### Agent Model Used

Codex GPT-5.

### Debug Log References

- `npm run lint` passed.
- `npm run build` passed.
- Source sanity check confirmed Person 1, Person 2, Optional, Upload, Replace, and Remove affordances are present.

### Completion Notes List

- Added typed person slot state with `PersonSlotId`, `PersonPhoto`, and `PersonSlot`.
- Added `PersonSlots` component with two neutral slots, one photo per slot, upload/replace/remove, thumbnail preview, and Person 2 optional badge.
- Wired local object URL previews into the setup rail and hero preview; replaced/removed photos revoke object URLs.
- No skin color or demographic selection was added.

### File List

- `_bmad-output/implementation-artifacts/1-3-two-neutral-person-slots.md`
- `src/features/studio/CreationStudio.tsx`
- `src/features/studio/components/PersonSlots.tsx`
- `src/features/studio/studioTypes.ts`
