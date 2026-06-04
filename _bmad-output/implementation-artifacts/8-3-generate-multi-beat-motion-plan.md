# Story 8.3: Generate Multi-Beat Motion Plan

Status: done

## Story

As a PartyFace creator,
I want the selected story beats transformed into a generation plan,
So that future video generation can produce coherent 30-second outputs instead of a single motion prompt.

## Acceptance Criteria

- Given a story template with edited beats
- When motion generation starts
- Then PartyFace can derive a structured multi-beat generation plan
- And the plan can target either a single long-video workflow or multiple stitched clips
- And the plan is inspectable for tuning.

## Tasks

- [x] Add a motion plan builder that converts story beats into clip plans.
- [x] Include target duration, strategy, music mood, transitions, camera direction, and audio cues.
- [x] Add a studio preview for the derived motion plan.
- [x] Include the plan summary in motion prompt construction.
- [x] Store a motion plan snapshot with motion job records.
- [x] Keep hand-built demo payloads compatible with the expanded setup schema.

## Completion Notes

- The current strategy is `multi-clip-stitch`, which keeps the door open for multiple short generated clips plus later stitching/audio.
- The UI now shows a 30-second storyboard plan below the generation tracks.
- The real Seedance workflow still generates the first short motion proof; longer multi-clip execution remains a future integration story.

## Verification

- `npm run lint`
- `npm run build`
- Browser smoke test at `http://localhost:3001/` confirmed Motion Plan UI, 30s storyboard plan, multi-clip strategy, music mood, and no console errors.

## File List

- `src/lib/templates/motionPlan.ts`
- `src/features/studio/components/MotionPlanPreview.tsx`
- `src/features/studio/CreationStudio.tsx`
- `src/lib/comfy/motionWorkflow.ts`
- `src/lib/comfy/workflowTypes.ts`
- `src/lib/comfy/jobs.ts`
- `src/lib/domain/generation.ts`
- `scripts/check-real-still-demo.mjs`
