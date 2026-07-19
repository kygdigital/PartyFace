# PRD v3 / Epic 11 Reconciliation

Date: 2026-07-19

## Summary

Epic 11 is directionally aligned with PRD v3, but it is not the final renderer.
The shipped work gives PartyFace a registered music library, beat-grid previews,
and cutout-head choreography planning. PRD v3 narrows the next milestone to a
concept-validation prototype: one fully rendered Red Carpet Glam card, 3-4
static theme previews, local face processing, and a deterministic ffmpeg export.

## What Epic 11 Already Covers

| PRD v3 area | Current build alignment |
| --- | --- |
| Reusable music library | Implemented in `src/lib/templates/musicLibrary.ts` with two Birthday Royale tracks. |
| Track picker | Implemented in the studio sidebar. |
| Beat-grid computation | Implemented with computed timestamps and preview tiles. |
| Choreography vocabulary | Implemented as cutout-head choreography blocks with prompt/camera/stability guidance. |
| Plan summary | Motion and final-video previews now reference selected track, BPM, beat windows, cast format, and choreography. |
| Comfy as upstream factory | Partially aligned in docs and plan language. Existing generation endpoints can still send face references to Comfy, so the v3 renderer path must be separate. |

## Gaps Against PRD v3

| Gap | Why it matters | Follow-up story |
| --- | --- | --- |
| One renderable template vs. current multi-template generation studio | v3 wants one finished feeling before broad rendering. | Story 12.1 |
| Static theme preview tiles | v3 keeps 3-5 creative directions for comparison, but only Red Carpet renders. | Story 12.1 |
| Local face cutout processing | v3 explicitly says faces never go to Comfy or remote services. | Story 12.2 |
| Fixed anchor + BPM bob | This is the lightweight cutout-on-body mechanism chosen by review. | Story 12.3 |
| 5-second low-res draft preview | The user should not wait for a full render blind. | Story 12.4 |
| `make-card.sh` ffmpeg export path | v3 chooses server-side ffmpeg as the v1 renderer. | Story 12.5 |
| `public/library/` registered song files | Current app has metadata but previews still use the existing stock loop path. | Story 12.6 |
| Local-only data flow and clear copy | The UI needs to make privacy expectations explicit. | Story 12.7 |

## Product Decisions Carried Forward

- Render one template first: Red Carpet Glam / Birthday Royale.
- Show 3-4 additional themes as static previews only.
- Keep one-person and two-person formats.
- Keep registered music and beat-grid planning from Epic 11.
- Use hardcoded ~35 second timing for the first renderable template.
- Treat Happy Birthday outro as an assembly tail.
- Do not send uploaded faces to Comfy Cloud in the v3 renderer path.

## Recommended Next Epic

Create Epic 12: Red Carpet Glam Renderer Prototype.

The demo-able moment should be: upload one or two local face cutouts, choose a
registered Birthday Royale track, generate a 5-second draft preview, then export
a local ~35 second MP4 using `make-card.sh`.
