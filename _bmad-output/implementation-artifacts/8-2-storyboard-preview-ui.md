# Story 8.2: Storyboard Preview UI

Status: done

## Story

As a PartyFace creator,
I want to preview and edit the beats of my birthday video story,
So that I can shape the personality of the final video before generating.

## Acceptance Criteria

- Given I am in the Creation Studio
- When I reach the setup controls
- Then I can select a video story template
- And I can see the selected story's description, music mood, and four timed beats
- And I can edit beat captions before generating
- And the selected story arc appears in setup readiness feedback
- And the UI remains readable at desktop sizes.

## Tasks

- [x] Add a compact story planner component to the setup panel.
- [x] Support switching between story templates.
- [x] Support editing captions for each timed beat.
- [x] Reset custom beat captions when the selected story changes.
- [x] Verify the story UI loads without browser console errors.

## Completion Notes

- The storyboard UI is intentionally compact and sits between face style and birthday prompt editing.
- Beat caption edits are included in the generated setup payload.
- This story is front-end/product control only; actual 30-second multi-clip generation remains a future story.

## Verification

- `npm run lint`
- `npm run build`
- Browser smoke test at `http://localhost:3001/` confirmed Video Story UI, default arc, editable beat text, and no console errors.

## File List

- `src/features/studio/components/StoryTemplatePlanner.tsx`
- `src/features/studio/CreationStudio.tsx`
- `src/lib/templates/storyTemplates.ts`
