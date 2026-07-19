# PartyFace Product Requirements v2

Draft created: 2026-07-19

## Vision

PartyFace helps someone create a personalized, face-cutout dancing birthday card
that feels like a modern, higher-quality JibJab: real friend faces, funny
choreography, punchy music, and a finished MP4 that is easy to share.

The product should feel curated and playful, not like a blank prompt box. Comfy
Cloud remains important, but its role is upstream asset generation. The web app
should assemble the final card from registered templates, faces, music, and
choreography timing.

## Product Direction

PartyFace is a fixed-template renderer product.

- Comfy Cloud creates upstream ingredients: songs, figure art, face cutouts,
  backdrops, experimental animation assets, and visual tests.
- PartyFace stores or references those ingredients in registries.
- The app renderer combines template structure, theme assets, face cutouts,
  music timing, and overlays into a 30-45 second MP4.
- Comfy should not be required at card render time for a registered template.

## Target User

The first audience is the creator and friends: someone making a funny,
personalized birthday card for a girlfriend, friend, or group chat.

The user wants the result to feel:

- Personal because it uses real faces.
- Fun because the scene, music, and choreography feel specific.
- Better than template-only competitors because the visuals and cutouts are
  higher quality.
- Fast enough to make and review without becoming a production project.

## MVP Scope

### In Scope

- Birthday cards only.
- Desktop web prototype.
- 3-5 fixed, curated template/theme options for testing.
- Red Carpet Glam / Birthday Royale as the first reference template.
- One or two uploaded real face photos.
- One-person and two-person choreography formats per template.
- Recipient name and optional recipient age.
- Reusable music library with registered tracks.
- Track picker; the app references songs, it does not generate audio inline.
- Beat grid computed from known BPM at ingest.
- Fixed choreography vocabulary mapped to beat moments.
- Renderer plan preview before export.
- Downloadable 30-45 second MP4.

### Out Of Scope

- Account system, payments, or marketplace.
- More than two real face cutouts.
- Stock sidekick people as a substitute for missing real faces.
- Custom gag text in the first renderer MVP.
- In-app song generation.
- AI-generated dance at runtime.
- Arbitrary prompt-to-video as the main user flow.
- Public launch infrastructure.

## Core Concepts

### Fixed Template

A template defines the card's structure: beats, timing windows, choreo slots,
text slots, cast slots, and render requirements. It is an app composition
contract, not a ComfyUI workflow.

### Theme Pack

A theme pack fills a template with a specific vibe: backdrop, figures, palette,
copy, music reference, overlays, and asset paths.

### Music Library

The app references reusable songs that were produced separately, such as with
ACE-Step 1.5 in Comfy Cloud. At runtime, the app chooses from registered tracks
and uses known BPM metadata to compute beat timing.

### Choreography Presets

The first choreography vocabulary is:

```text
arms_up
point_at_camera
fist_pump
hip_sway
air_guitar
cape_spin
freeze_pose
group_point
clap
```

## MVP User Flow

1. User opens PartyFace and sees template/theme options.
2. User chooses a template, starting with Red Carpet Glam.
3. User uploads one or two real face photos.
4. User enters recipient name and optional age.
5. User chooses a registered music track.
6. App computes beat timing from the selected track.
7. App shows the planned choreography and card moments.
8. User renders the card.
9. App produces a 30-45 second MP4 for download and sharing.

## Functional Requirements

### FR-1 Template And Theme Selection

The app must show 3-5 curated template/theme options for testing. Each option
must have enough metadata to drive a fixed render path, even if only Red Carpet
Glam is fully implemented first.

### FR-2 Real Face Uploads

The app must support one or two uploaded real face photos. Templates must define
whether they support one-person, two-person, or both choreography formats.

### FR-3 Recipient Details

The app must collect recipient name and optional age. The renderer may use these
values for title, outro, and number gag slots.

### FR-4 Music Library Track Picker

The app must list registered tracks from the music library. Tracks include id,
title, source, theme, tags, BPM, key, duration, file reference, and beat-grid
metadata.

### FR-5 Beat Grid Computation

The app must compute beat timestamps from the selected track's BPM, downbeat
offset, and beats-per-bar metadata. Explicit beat maps may be added later for
tracks with tempo drift.

### FR-6 Choreography Plan

The app must map template beats to choreography presets. One-person and
two-person templates may use different choreo plans.

### FR-7 Renderer Plan Preview

Before rendering, the app must show the user the selected template, cast count,
music track, duration target, and major card moments.

### FR-8 MP4 Render And Export

The app must produce a downloadable 30-45 second MP4 with the selected song,
face cutouts, themed assets, text overlays, and choreographed movement.

## Non-Functional Requirements

- The renderer path should be deterministic for a given template, theme, track,
  and face inputs.
- Registered card render should not require Comfy Cloud at runtime.
- Generated or uploaded personal media should remain local to the prototype
  unless explicitly pushed to a remote service.
- The app should make failures understandable, especially missing assets,
  missing song files, invalid face inputs, and render errors.
- The prototype should prioritize clear review loops over production polish.

## Success Metrics

- A creator can make a complete card with one or two real faces.
- The final MP4 is 30-45 seconds and includes music.
- The card clearly reads as a face-cutout dancing greeting, not a generic AI
  poster.
- The user can compare at least 3-5 creative template directions.
- The card quality is strong enough to share with friends for feedback.

## Open Questions

1. Should the first renderer be server-side ffmpeg only, or should browser
   canvas/WebCodecs preview work be started in parallel?
2. Should registered music files live in `public/library/`, object storage, or
   stay external until ingest is implemented?
3. Should template/theme/music JSON stay in `docs/` for planning, or move into
   `src/lib/partyface-registry/` as implementation data?
4. Is the Happy Birthday outro a numbered beat or an assembly tail outside the
   fixed beat skeleton?
