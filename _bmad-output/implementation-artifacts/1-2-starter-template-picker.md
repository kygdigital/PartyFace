# Story 1.2: Starter Template Picker

Status: done

## Story

As a PartyFace creator,
I want to choose a Starter Template first,
so that I can begin from a fun birthday scene instead of a blank prompt.

## Acceptance Criteria

1. Given I open the Creation Studio, when I view the Starter Templates section, then I see 3-5 templates with names, descriptions, and Still/Motion support indicators.
2. At least one template is Disco Glam Birthday.
3. Selecting a template visually marks it as selected.
4. Selecting a template pre-fills Birthday Vibe and prompt defaults.
5. Templates are defined in `src/lib/templates/starterTemplates.ts`.

## Tasks / Subtasks

- [x] Define typed Starter Templates in `src/lib/templates/starterTemplates.ts`. (AC: 1, 2, 4, 5)
- [x] Add a `StarterTemplatePicker` component under `src/features/studio/components`. (AC: 1, 3)
- [x] Wire selected template state into `CreationStudio`. (AC: 3, 4)
- [x] Show selected Birthday Vibe and prompt preview in the studio shell. (AC: 4)
- [x] Run `npm run lint` and `npm run build`. (AC: 1-5)

## Dev Notes

- Build on Story 1.1's Next.js shell; do not re-scaffold.
- Keep the first surface template-first.
- Use 3-5 templates. The planned set is Disco Glam Birthday, Luxury Magazine Cover, 90s Music Video, Superhero Birthday Duo, and Red Carpet Paparazzi.
- Template selection must not imply final generation is ready; People, Details, Prompt, and output behavior come in later stories.
- Keep implementation local to `src/lib/templates/starterTemplates.ts`, `src/features/studio/components/StarterTemplatePicker.tsx`, and `src/features/studio/CreationStudio.tsx`.

## Dev Agent Record

### Agent Model Used

Codex GPT-5.

### Debug Log References

- `npm run lint` passed.
- `npm run build` passed.
- Existing dev server hot-reloaded after a transient module-missing state while `CreationStudio.tsx` was being replaced.

### Completion Notes List

- Added five typed Starter Templates with descriptions, Birthday Vibe defaults, prompt defaults, accent colors, and Still/Motion support flags.
- Added `StarterTemplatePicker` with listbox semantics, selected visual state, and Still/Motion support badges.
- Wired selected template state into the Creation Studio hero and prompt default preview.
- Code review found no blocking issues.

### File List

- `_bmad-output/implementation-artifacts/1-2-starter-template-picker.md`
- `src/features/studio/CreationStudio.tsx`
- `src/features/studio/components/StarterTemplatePicker.tsx`
- `src/lib/templates/starterTemplates.ts`
