# Story 9.1: Final Video Assembly Contract

Status: done

## Story

As a PartyFace builder,
I want a clear final video assembly contract,
So that multi-clip generation, stitching, music, and export can be implemented without guessing how the pieces should fit together.

## Acceptance Criteria

- Given a motion generation plan exists
- When PartyFace prepares the final video path
- Then it derives a final assembly plan with clip count, output format, aspect ratio, duration, audio mode, and export target
- And the plan lists the expected generation, normalization, stitching, audio, and export steps
- And the studio shows the assembly plan before real multi-clip execution is wired.

## Tasks

- [x] Add a video assembly plan model.
- [x] Derive assembly steps from the current motion plan.
- [x] Add studio UI for final assembly steps.
- [x] Keep real stitching/audio muxing marked as future work.
- [x] Verify the browser loads the assembly plan without console errors.

## Completion Notes

- Epic 9 now has a visible product/engineering contract for the final 30-second MP4.
- The plan currently marks generation/normalization as planned and stitching/audio/export as future, so it is honest about what is wired today.
- This sets up the next stories for per-beat Comfy job submission and final media assembly.

## Verification

- `npm run lint`
- `npm run build`
- Browser smoke test at `http://localhost:3001/` confirmed Final Video Assembly UI, Generate/stitch/mux contract, MP4 target, Stock Loop audio mode, and no console errors.

## File List

- `src/lib/templates/videoAssemblyPlan.ts`
- `src/features/studio/components/VideoAssemblyPlanPreview.tsx`
- `src/features/studio/CreationStudio.tsx`
- `src/lib/templates/motionPlan.ts`
