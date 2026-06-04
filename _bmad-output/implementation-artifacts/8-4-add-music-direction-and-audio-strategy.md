# Story 8.4: Add Music Direction and Audio Strategy

Status: done

## Story

As a PartyFace creator,
I want the birthday video to have music direction,
So that the final result feels like a shareable musical birthday card.

## Acceptance Criteria

- Given a selected story template
- When PartyFace prepares motion generation
- Then music mood metadata is available to the generation pipeline
- And the implementation documents whether v1 uses selected stock loops, generated audio, or provider-native audio
- And the app can later combine the visual output with the selected music direction.

## Tasks

- [x] Define the MVP audio strategy decision.
- [x] Add structured audio strategy metadata to the motion plan.
- [x] Show audio strategy details in the studio motion plan.
- [x] Include audio strategy in motion prompt summarization.
- [x] Document future audio implementation options.

## Completion Notes

- MVP audio should start with curated stock loops, not provider-native audio.
- Generated music and provider-native audio remain future options after quality, rights, and synchronization are validated.
- The studio now shows loop direction, BPM range, and structure notes for the selected story.

## Verification

- `npm run lint`
- `npm run build`
- Browser smoke test at `http://localhost:3001/` confirmed Audio Strategy UI, Stock Loop strategy, BPM detail, and no console errors.

## File List

- `src/lib/templates/audioStrategy.ts`
- `src/lib/templates/motionPlan.ts`
- `src/features/studio/components/MotionPlanPreview.tsx`
- `_bmad-output/planning-artifacts/audio-strategy.md`
- `_bmad-output/implementation-artifacts/8-4-add-music-direction-and-audio-strategy.md`
