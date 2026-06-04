# Story 1.5: Birthday Details and Prompt Composer

Status: done

## Story

As a PartyFace creator,
I want to enter birthday details and inspect the composed prompt,
So that I can personalize the result before generation.

## Acceptance Criteria

- Given I selected a Starter Template
- When I enter birthday details such as name, age, message, and tone
- Then those details influence the prompt preview
- And I can edit the prompt directly
- And the app shows when the prompt has been customized from the template default
- And I can reset the prompt to the selected template default
- And prompt composition logic lives in `src/lib/templates/promptComposer.ts`.

## Tasks

- [x] Add birthday details state and fields.
- [x] Add prompt composition helper under `src/lib/templates`.
- [x] Add editable prompt preview with customized/default state.
- [x] Add reset behavior for selected template and entered details.
- [x] Run lint/build verification.

## Dev Notes

- Details should personalize the prompt without requiring generation yet.
- Direct prompt edits should not wipe uploaded people or selected template.

## Debug Log

- Verified `npm run lint`.
- Verified `npm run build`.
- Verified browser interaction on `http://localhost:3001/`: details influence the prompt, direct prompt editing shows Customized, and Reset returns to the composed template prompt while preserving details.

## Completion Notes

- Added birthday name, age, tone, and message controls to the Creation Studio.
- Added an editable prompt textarea backed by `src/lib/templates/promptComposer.ts`.
- Prompt remains template-driven until manually edited, then shows a Customized state and can be reset.
- The hero prompt preview now reflects the current composed or customized prompt.

## File List

- `_bmad-output/implementation-artifacts/1-5-birthday-details-and-prompt-composer.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/features/studio/CreationStudio.tsx`
- `src/features/studio/components/BirthdayPromptComposer.tsx`
- `src/lib/templates/promptComposer.ts`
