# Story 8.1: Add 30-Second Story Template Model

Status: done

## Story

As a PartyFace creator,
I want to choose a video story arc before generating,
So that the final motion output feels like a birthday card with a beginning, middle, and finale.

## Acceptance Criteria

- Given I am preparing a birthday video
- When I choose a story template
- Then PartyFace has structured 30-second story data with timed beats
- And each story includes editable captions, visual direction, music mood, and generation guidance
- And the selected story is included in the server-side generation payload
- And the motion prompt receives story context for future longer-video workflows.

## Tasks

- [x] Add structured story template data.
- [x] Include timed beats and default captions for each story.
- [x] Add music mood and generation guidance metadata.
- [x] Extend PartyFace setup types and validation to include the selected story.
- [x] Include story direction in motion prompt construction.

## Completion Notes

- Added four initial story templates: Disco Birthday Entrance, Superhero Birthday Save, Red Carpet Awards, and Birthday Heist.
- Each story is modeled as four timed beats across roughly 30 seconds.
- This establishes the product layer needed before generating longer, music-ready videos.

## File List

- `src/lib/templates/storyTemplates.ts`
- `src/lib/domain/project.ts`
- `src/lib/domain/schemas.ts`
- `src/features/studio/setupPayload.ts`
- `src/lib/comfy/motionWorkflow.ts`
