# PartyFace Product Reconciliation

## Purpose

This document reconciles the original PartyFace PRD and implemented prototype
with the newer discovery documents:

- `docs/PartyFace-discovery.md`
- `docs/template.schema.json`
- `docs/theme-pack.json`
- `docs/music-library-index.json`
- `docs/epic-11-music-choreography-plan.md`

The short version: PartyFace is moving from a prompt-first generative studio
toward a fixed-template e-card renderer where Comfy Cloud creates upstream
ingredients and the web app assembles predictable, funny MP4 cards across 3-5
curated template/theme options.

## Current Product Threads

### Original PRD / Prototype Direction

- User chooses from 3-5 Starter Templates.
- User uploads one or two face photos.
- User edits birthday details and prompt text.
- Comfy Cloud generates still and motion outputs.
- User reviews variants, favorites, exports, and iterates.
- Differentiation from JibJab comes from better image/video generation and more flexible prompting.

### New Discovery Direction

- User chooses a fixed card template/theme.
- User uploads required faces for cast slots.
- App references reusable generated songs from a music library.
- Template + theme pack + music library define the render recipe.
- Comfy Cloud is upstream only: songs, figures, cutouts, raw media.
- The web app renderer assembles the final card from registered ingredients.
- Differentiation from JibJab comes from higher-quality face cutouts, modern generated assets, and a curated beat-synced choreography system.

## Recommended Product Resolution

PartyFace should keep the current Creation Studio as a useful prototype surface,
but the next MVP should narrow around fixed, renderer-first cards. The first
reference card is:

**Birthday Royale / Red Carpet Glam**

The MVP flow becomes:

1. Choose one of 3-5 curated template/theme options, starting with Red Carpet Glam.
2. Upload one or two faces.
3. Confirm recipient name and optional age.
4. Choose a registered Birthday Royale song.
5. Preview the fixed beat/choreography plan.
6. Render/download a finished MP4.

Promptable Comfy generation remains valuable, but it moves upstream into asset
production and test tooling rather than being the end-user's primary render path.

## Conflict Review

| Topic | Original Product | New Discovery Docs | Conflict | Recommended Resolution |
| ----- | ---------------- | ------------------ | -------- | ---------------------- |
| Template model | 3-5 Starter Templates, customizable prompt recipes | Fixed templates plus swappable theme packs | Breadth vs curated consistency | Keep 3-5 curated templates for diversity and testing, but make each one fixed and renderer-ready rather than prompt-open. |
| Rendering path | Generate stills/motion directly through Comfy during creation | Render from registered assets with ffmpeg/canvas/WebCodecs; no Comfy at render time | Comfy is runtime backend vs upstream factory | Make Comfy upstream for assets. Runtime renderer should not require Comfy for fixed-template cards. |
| User customization | Prompt editing and birthday details drive output | Faces always vary; choreo presets optional; gag text deferred | Flexible prompting vs locked experience | Lock core experience for MVP. Allow face/name/age/music. Defer prompt editing for renderer cards. |
| Output type | Still output and short motion output are first-class | Finished MP4 e-card assembled from beat template | Image/video generation studio vs e-card renderer | Keep still generation as useful asset/prototype capability, but MVP success should be downloadable MP4. |
| Duration | Current app plans 30-second music-video cards | Template example is 72 seconds | Short shareable test vs full card structure | Use 30-45 seconds for MVP. Treat 72 seconds as a future fuller-card target. |
| Beat count | Story templates use 4 beats | Discovery says fixed 8-beat structure, then lists 9 including outro | 4-beat prototype vs fixed card skeleton; 8 vs 9 ambiguity | Adopt template.schema as source of truth. Treat outro as beat 9 or assembly tail; update wording once chosen. |
| Cast size | Person 2 optional | Theme pack requires lead and sidekick | Optional second person vs required sidekick | Support real uploaded people only. Templates should provide one-person and two-person choreography formats. |
| Music | Song scripts + stock loop preview; possible Suno import | Reusable songs generated externally with ACE-Step and registered in library | Generated lyrics/handoff vs registered final tracks | Song scripts become upstream prompts/creative notes. Runtime uses `music_ref` tracks. |
| Choreography | Story/motion prompts describe movement | Fixed choreography enum per beat | AI-generated movement vs canned dance vocabulary | Use the choreo enum for renderer MVP. Reserve AI video generation for producing/refreshing raw animation assets. |
| Face handling | Uploaded faces sent into image/video generation | Face cutouts composited onto figures | Integrated generation vs explicit cutout compositing | Favor explicit cutout compositing for JibJab-style control. Use Nano Banana Pro/upstream model for alpha/cutout quality. |
| Benchmark | Better than JibJab by flexible, higher-quality generation | Better than JibJab by quality ingredients plus curated renderer | Differentiation story shifted | Update benchmark criteria to: face cutout quality, timing, humor, music sync, MP4 shareability. |

## Decisions To Make

### D1: MVP Runtime

**Recommendation:** Server-side ffmpeg first.

Reasoning: MP4 download is central, audio muxing matters, and browser APIs add
complexity. Canvas/WebCodecs can come later for richer client previews.

### D2: MVP Duration

**Decision:** 30-45 seconds first.

Reasoning: Faster rendering and easier review. The current `template.schema.json`
example uses 72 seconds; that may be a fuller template target, but the prototype
has already validated shorter clips.

### D3: Cast Requirement

**Decision:** Support one uploaded real person or two uploaded real people.
Do not use stock sidekick people for the core MVP.

Reasoning: The product promise is personalization with real friends. Template
choreography should adapt to one-person and two-person formats rather than
filling missing cast slots with stock people.

### D4: Number Of Templates

**Decision:** 3-5 curated production-test templates.

Reasoning: Diversity is important for testing taste, quality, and next-step
decisions. Each template should still be fixed enough to produce reliable
renderer output.

### D5: Comfy Cloud Role

**Decision:** Upstream asset factory for the fixed-template MVP.

Reasoning: This clarifies architecture. Comfy creates songs, figures, cutouts,
and maybe animation assets. The web app composes registered assets into MP4.

### D6: Song Scripts

**Decision:** Keep song scripts as creative prompts and admin/reference
copy, not as runtime user-facing final lyrics for fixed renderer cards.

Reasoning: A registered music library makes the runtime deterministic. Scripts
are still useful for generating new ACE-Step tracks and documenting the tone.

## Updated MVP Definition

PartyFace MVP should be:

- Birthday-only.
- 3-5 fixed, curated template/theme options for testing.
- Red Carpet Glam / Birthday Royale as the first reference template.
- One or two uploaded real faces.
- One-person and two-person choreography formats.
- A reusable music library with at least two Birthday Royale tracks.
- Beat-grid-based choreography timing.
- Fixed choreography enum with curated per-beat defaults.
- Renderer-produced downloadable 30-45 second MP4.

## Updated Non-Goals

- In-app song generation.
- Large template catalog beyond the first 3-5 test templates.
- Custom gag text.
- AI-generated dance at runtime.
- Arbitrary prompt-to-video as the main creation path.
- More than two face cutouts.

## Implementation Implications

### Keep From Current App

- Face upload slots and preview.
- Birthday details form.
- Cutout Heads concept.
- Music preview UI.
- Final-video progress/checkpoint area.
- Comfy Cloud server boundary for upstream generation/testing.

### Rework Or De-emphasize

- Starter Template picker becomes a theme/template picker.
- Story Template planner becomes a fixed template/beat preview.
- Prompt composer becomes secondary/admin-facing for asset generation.
- Song Script panel becomes track generation notes or hidden advanced tooling.
- Motion generation via Comfy becomes upstream ingredient creation, not final render.

### Add

- Template registry from `docs/template.schema.json` shape.
- Theme pack registry from `docs/theme-pack.json`.
- Music library registry from `docs/music-library-index.json`.
- Beat grid computation helper.
- Choreography plan builder.
- Renderer contract for ffmpeg/canvas/WebCodecs.
- MP4 assembly path with selected music track.

## Proposed Next Epic 11 Shape

1. Load registered template/theme/music data in the app.
2. Show 3-5 fixed template/theme options, starting with Red Carpet Glam.
3. Compute beat timestamps for the selected music track.
4. Map template beats to choreography presets and overlays.
5. Show a renderer preview plan.
6. Build or stub the first MP4 renderer path.

## Open Questions

1. Should `outro` be beat 9, or an assembly tail outside the "8-beat" skeleton?
2. Should the first renderer be server-side ffmpeg only?
3. Should track files live in `public/library/`, object storage, or remain external until ingest?
4. Should template/theme/music JSON live in `docs/` temporarily or move into `src/lib/partyface-registry/` when implemented?
