# Epic 12: Red Carpet Glam Renderer Prototype

## Goal

Build the PRD v3 concept-validation prototype: one deterministic Red Carpet Glam
Birthday Royale card that uses local face cutouts, a registered music track, a
pre-made dance clip, fixed face anchors with BPM bob, and server-side ffmpeg to
produce a downloadable ~35 second MP4.

This epic intentionally does not build a general animation system. The purpose
is to prove that the result feels like a fun, personalized face-cutout dancing
card before investing in broader renderer infrastructure.

## Scope

In scope:

- One fully renderable template: Red Carpet Glam / Birthday Royale.
- 3-4 static theme preview tiles for creative comparison.
- One-person and two-person render formats.
- Local face cutout/background-removal path.
- Fixed head anchors per cast slot.
- BPM-synced vertical bob.
- 5-second low-res draft preview.
- `make-card.sh` ffmpeg render/export path.
- Registered music track files under `public/library/`.
- Clear local-only privacy copy for face handling.

Out of scope:

- Multi-template rendering.
- Per-frame anchor tracks or skeletal rigs.
- Browser canvas/WebCodecs rendering.
- Cloud face processing.
- In-app song generation.
- Runtime AI dance generation.

## Stories

### Implementation Status

Committed implementation target:

- Story 12.1: Red Carpet Paparazzi is marked as local-renderable; other starter templates are preview-only for the v3 renderer.
- Story 12.2: Uploads show local circular cutout previews and the local renderer decodes face files into `.partyface-renders/`.
- Story 12.3: The local renderer uses fixed solo/duo anchors and BPM-synced vertical bob.
- Story 12.4: The local renderer can produce a 5-second low-res draft preview.
- Story 12.5: `scripts/make-card.sh` creates a deterministic ffmpeg MP4.
- Story 12.6: Registered tracks resolve under `public/library/`.
- Story 12.7: Upload and renderer panels state that faces remain local for the prototype.

Known prototype limitation: the v1 cutout is a circular sticker mask, not full
semantic background removal. This is enough to validate the JibJab-style
cutout-head feeling before investing in segmentation.

### Story 12.1: Red Carpet Renderable Template Plus Static Previews

As a PartyFace creator,
I want to see one renderable Red Carpet Glam card plus other static theme ideas,
So that I can compare creative directions without expecting every theme to render.

Acceptance criteria:

- Given the studio loads
- When template/theme options are shown
- Then Red Carpet Glam is marked as renderable
- And 3-4 additional theme previews are marked as preview-only
- And non-renderable previews cannot start the v3 ffmpeg export.

Demo moment:

Choose Red Carpet Glam and see the render controls enabled; choose another
theme preview and see comparison details without render controls.

### Story 12.2: Local Face Cutout Intake

As a PartyFace creator,
I want uploaded faces processed locally,
So that real people are not sent to Comfy Cloud or another remote service.

Acceptance criteria:

- Given a user uploads one or two face photos
- When the v3 renderer prepares inputs
- Then it creates local cutout assets for the render path
- And the UI states that faces stay local for the prototype
- And the Comfy still/motion generation path is visually separate from the local renderer path.

Demo moment:

Upload a face and see a local cutout preview plus a local-only data-flow note.

### Story 12.3: Fixed Anchor And BPM Bob Composer

As a PartyFace builder,
I want a lightweight cutout-head motion mechanism,
So that the card reads as dancing without a full rigging system.

Acceptance criteria:

- Given one or two local face cutouts and a registered track
- When the renderer plan is built
- Then it assigns fixed head anchors for each cast slot
- And it computes a BPM-synced vertical bob expression
- And one-person and two-person formats use different anchor presets.

Demo moment:

Inspect the renderer plan and see anchor coordinates, scale, and bob timing for
each uploaded face.

### Story 12.4: Five-Second Draft Preview

As a PartyFace creator,
I want a quick draft clip before the full render,
So that I can catch obvious face placement or timing problems.

Acceptance criteria:

- Given a renderable template, face cutout, and track are selected
- When the user requests a draft
- Then the app creates a 5-second low-res preview
- And the preview uses the same fixed anchor and BPM bob settings as the final render
- And draft failures explain missing face, track, or asset inputs.

Demo moment:

Generate a short draft preview and play it in the studio.

### Story 12.5: `make-card.sh` FFmpeg Export

As a PartyFace creator,
I want the app to produce a downloadable MP4,
So that I can share the finished Birthday Royale card.

Acceptance criteria:

- Given valid Red Carpet Glam inputs
- When the full render starts
- Then the server runs a deterministic ffmpeg path
- And the output is a ~35 second MP4 with audio
- And the MP4 includes backdrop, pre-made dance clip, face overlay bob, title/outro text, and selected registered track
- And black-frame, missing-audio, and missing-asset failures are surfaced clearly.

Demo moment:

Render and download a local Birthday Royale MP4.

### Story 12.6: Registered Track Files In `public/library/`

As a PartyFace builder,
I want registered tracks to resolve to local prototype files,
So that preview and render use the same audio source.

Acceptance criteria:

- Given a track in the music library
- When the app previews or renders it
- Then its file resolves under `public/library/`
- And missing files are reported before render starts
- And the existing stock loop is no longer mislabeled as the registered generated song.

Demo moment:

Choose Birthday Royale (Glam Disco), preview the exact file, and see the same
file referenced in the render plan.

### Story 12.7: Prototype Privacy And Consent Copy

As a PartyFace creator,
I want clear expectations about face use,
So that I understand this prototype keeps personal media local.

Acceptance criteria:

- Given the upload and render areas are visible
- When a user reviews the flow
- Then the UI says faces are processed locally for the v3 renderer
- And it notes that generated cards remain local unless the user saves/shares them
- And any Comfy-powered experimental path is labeled separately from the local renderer.

Demo moment:

Read the upload/render panels and confirm the data-flow promise is obvious.

## Epic Demo

The Epic 12 demo is complete when a user can choose Red Carpet Glam, upload one
or two real faces, choose a registered Birthday Royale track, generate a
5-second low-res draft, and export a local ~35 second MP4.
