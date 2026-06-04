# Story 9.2: Submit Per-Beat Clip Generation Jobs

Status: done

## Story

As a PartyFace creator,
I want PartyFace to generate one short clip for each story beat,
So that the final birthday video can have a real beginning, middle, and finale.

## Acceptance Criteria

- Given a ready setup with a motion plan
- When final video generation starts
- Then PartyFace submits one provider job per planned clip
- And each provider job receives the beat-specific prompt, duration, and face references
- And the job record tracks per-clip provider ids and statuses.

## Tasks

- [x] Add a dedicated final-video generation API route.
- [x] Add a final-video workflow adapter with mock and Comfy modes.
- [x] Build one Seedance workflow per motion-plan clip in Comfy mode.
- [x] Reuse uploaded face references across the beat clip submissions.
- [x] Track final-video jobs as a separate output type with provider job ids and motion plan snapshot.
- [x] Keep real per-beat generation behind `PARTYFACE_FINAL_VIDEO_WORKFLOW_MODE=comfy`.

## Completion Notes

- `POST /api/generate/final-video` now returns a final-video job contract.
- Mock mode returns a safe 4-clip, 30-second job without spending Comfy credits.
- Comfy mode submits one Seedance image-to-video workflow per planned story beat.
- Final stitching and per-clip progress UI remain future stories.

## Verification

- `npm run lint`
- `npm run build`
- Mock endpoint contract returned HTTP 202 with `clipCount: 4`, `durationSeconds: 30`, `mode: mock`, and a motion plan snapshot.
- Browser smoke test at `http://localhost:3001/` confirmed PartyFace and Final Video Assembly still load with no console errors.

## File List

- `src/app/api/generate/final-video/route.ts`
- `src/lib/comfy/finalVideoWorkflow.ts`
- `src/lib/comfy/jobs.ts`
- `src/lib/comfy/workflowTypes.ts`
- `src/lib/domain/generation.ts`
- `src/lib/comfy/motionWorkflow.ts`
- `.env.example`
