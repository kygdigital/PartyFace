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
ingredients and the web app assembles a predictable, funny MP4.

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
but the next MVP should narrow around one fixed, renderer-first card:

**Birthday Royale / Red Carpet Glam**

The MVP flow becomes:

1. Choose Red Carpet Glam.
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
| Template model | 3-5 Starter Templates, customizable prompt recipes | One fixed template plus swappable theme packs | Breadth vs curated consistency | For MVP, ship one fixed template/theme. Keep Starter Templates as exploration/prototype UI until renderer path replaces them. |
| Rendering path | Generate stills/motion directly through Comfy during creation | Render from registered assets with ffmpeg/canvas/WebCodecs; no Comfy at render time | Comfy is runtime backend vs upstream factory | Make Comfy upstream for assets. Runtime renderer should not require Comfy for fixed-template cards. |
| User customization | Prompt editing and birthday details drive output | Faces always vary; choreo presets optional; gag text deferred | Flexible prompting vs locked experience | Lock core experience for MVP. Allow face/name/age/music. Defer prompt editing for renderer cards. |
| Output type | Still output and short motion output are first-class | Finished MP4 e-card assembled from beat template | Image/video generation studio vs e-card renderer | Keep still generation as useful asset/prototype capability, but MVP success should be downloadable MP4. |
| Duration | Current app plans 30-second music-video cards | Template example is 72 seconds | Short shareable test vs full card structure | Decide intentionally. Recommend 30-45s for MVP unless the Birthday Royale song/beat skeleton truly needs 72s. |
| Beat count | Story templates use 4 beats | Discovery says fixed 8-beat structure, then lists 9 including outro | 4-beat prototype vs fixed card skeleton; 8 vs 9 ambiguity | Adopt template.schema as source of truth. Treat outro as beat 9 or assembly tail; update wording once chosen. |
| Cast size | Person 2 optional | Theme pack requires lead and sidekick | Optional second person vs required sidekick | For Red Carpet Glam, require two faces or provide a stock sidekick fallback. Recommend stock sidekick fallback for easier MVP testing. |
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

**Recommendation:** 30-45 seconds first.

Reasoning: Faster rendering and easier review. The current `template.schema.json`
example uses 72 seconds; that may be a fuller template target, but the prototype
has already validated shorter clips.

### D3: Cast Requirement

**Recommendation:** Support one required face plus optional second face with a
stock sidekick fallback.

Reasoning: The old PRD's second slot was optional. Requiring two faces increases
friction. The Red Carpet Glam theme can still prefer two faces.

### D4: Number Of Templates

**Recommendation:** One production template, multiple prototype prompts.

Reasoning: The current 3-5 Starter Templates helped discovery, but renderer work
needs depth. One excellent card is more valuable than five shallow renderers.

### D5: Comfy Cloud Role

**Recommendation:** Upstream asset factory for the fixed-template MVP.

Reasoning: This clarifies architecture. Comfy creates songs, figures, cutouts,
and maybe animation assets. The web app composes registered assets into MP4.

### D6: Song Scripts

**Recommendation:** Keep song scripts as creative prompts and admin/reference
copy, not as runtime user-facing final lyrics for fixed renderer cards.

Reasoning: A registered music library makes the runtime deterministic. Scripts
are still useful for generating new ACE-Step tracks and documenting the tone.

## Updated MVP Definition

PartyFace MVP should be:

- Birthday-only.
- One production theme pack: Red Carpet Glam.
- One fixed Birthday Royale template.
- One or two uploaded faces.
- A reusable music library with at least two Birthday Royale tracks.
- Beat-grid-based choreography timing.
- Fixed choreography enum with curated per-beat defaults.
- Renderer-produced downloadable MP4.

## Updated Non-Goals

- In-app song generation.
- Large template catalog.
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
2. Show Red Carpet Glam as the first production card.
3. Compute beat timestamps for the selected music track.
4. Map template beats to choreography presets and overlays.
5. Show a renderer preview plan.
6. Build or stub the first MP4 renderer path.

## Open Questions

1. Should `outro` be beat 9, or an assembly tail outside the "8-beat" skeleton?
2. Should Red Carpet Glam require two uploaded faces, or allow one face plus stock sidekick?
3. Should the first renderer be server-side ffmpeg only?
4. Is 72 seconds intentional for Birthday Royale, or should the MVP version be 30-45 seconds?
5. Should track files live in `public/library/`, object storage, or remain external until ingest?
6. Should template/theme/music JSON live in `docs/` temporarily or move into `src/lib/partyface-registry/` when implemented?
