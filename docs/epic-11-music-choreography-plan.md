# Epic 11: Music Library and Beat-Synced Choreography

## Goal

PartyFace should treat songs as reusable assets that are generated outside the
core app, registered in a music library, and referenced by video generation.
This lets us pair cutout-head dancing with predictable beat timing instead of
trying to generate audio inline during every card creation flow.

This plan builds on `docs/PartyFace-discovery.md`, which defines the split
between upstream ComfyUI asset factories and the web app composition/rendering
contract.

## Product Direction

The creator chooses a birthday template, song script, and music track. PartyFace
uses the selected track metadata to create beat-synced choreography prompts for
cutout-head characters, then carries that timing into final-video assembly.

The MVP should start with a small curated library of generated songs. Tracks are
created separately with ACE-Step 1.5 in Comfy Cloud, then registered in
`docs/music-library-index.json` or a future app-level music registry.

## Core Principles

- The app references registered songs; it does not generate audio inline.
- Songs are reusable across many birthday cards.
- ComfyUI workflows create raw ingredients; PartyFace template/theme/music files
  define the assembly recipe.
- Rendering a card from registered assets should not require Comfy execution.
- BPM, downbeat offset, and bar structure are known at ingest.
- Beat timing is computed from `beat_grid` unless a track has tempo drift.
- Explicit `beat_map` arrays are reserved for drift, tempo changes, or hand-edited timing.
- Choreography should match PartyFace's cutout-head visual language: head bobs, shoulder shimmies, hand waves, freeze frames, pose hits, cake points, and crowd chants.

## Music Library Model

Each track should include:

- `id`: stable app-facing track id.
- `title`: human-readable title.
- `file`: library-relative audio path.
- `source`: generation source, such as `ace-step-1.5-xl-turbo`.
- `theme`: broad template family, such as `red_carpet_glam`.
- `vibe_tags`: searchable mood tags.
- `bpm`: generation-time tempo.
- `key`: musical key if known.
- `duration_s`: total duration.
- `vocal`: vocal style label.
- `beat_grid`: computed timing seed.
- `beat_map`: explicit timing only when needed.
- `beat_map_source`: `computed_on_ingest`, `manual`, or provider/analyzer name.

Beat timestamp formula:

```text
timestamp(bar, beat) = downbeat_offset_s + ((bar - 1) * beats_per_bar + beat) * (60 / bpm)
```

## Choreography Model

PartyFace should define reusable choreography blocks that can be selected by
template, track vibe, and story beat.

Example choreography blocks:

- `head-bob`: simple beat-matched head bounce for cutout faces.
- `side-step`: two-beat step-touch motion for dance-pop scenes.
- `hero-pose-hit`: comic pose on a downbeat.
- `camera-flash-freeze`: red-carpet freeze frame on beat one.
- `cake-point`: point toward cake or caption on phrase ending.
- `confetti-drop`: final beat hit for chorus/drop.
- `group-wave`: background dancers wave in alternating bars.

Each block should include:

- `id`
- `name`
- `beats`
- `best_for_templates`
- `prompt_instruction`
- `camera_instruction`
- `face_stability_note`

## Epic 11 Stories

### Story 11.1: Register Generated Song Library

As a PartyFace creator,
I want the app to reference a small library of generated birthday songs,
So that I can choose music without generating a new track every time.

Acceptance criteria:

- Given the project has generated music assets
- When the app loads music metadata
- Then it can list at least two registered tracks with title, source, theme, tags, BPM, key, duration, vocal, and beat grid
- And track metadata is stored separately from generated audio files
- And the app does not require audio generation during the card creation flow.

Demo moment:

Select a registered track and see it appear in the video/audio plan.

### Story 11.2: Compute Beat Grid on Ingest

As a PartyFace builder,
I want track timing computed from BPM and downbeat metadata,
So that choreography can land on musical beats.

Acceptance criteria:

- Given a registered track with `beat_grid`
- When PartyFace prepares the choreography plan
- Then it computes timestamps using the beat-grid formula
- And it supports `beat_map` overrides for tracks with drift
- And the computed beat data can be inspected for a selected track.

Demo moment:

Open a track and see beat timestamps for the first several bars.

### Story 11.3: Add Cutout-Head Choreography Blocks

As a PartyFace creator,
I want PartyFace to choose simple dance moves for cutout-head characters,
So that the generated video feels intentionally choreographed.

Acceptance criteria:

- Given a template and music track are selected
- When PartyFace builds the motion plan
- Then it attaches choreography blocks to each story beat
- And each block includes prompt instructions, camera guidance, and face stability notes
- And choreography emphasizes cutout-head movement rather than realistic full-body dance.

Demo moment:

Choose Red Carpet Glam and see camera-flash freeze, walk hook, head sway, and final pose choreography in the plan.

### Story 11.4: Generate Beat-Synced Video Prompts

As a PartyFace creator,
I want each clip prompt to include music and choreography timing,
So that generated clips match the chosen track.

Acceptance criteria:

- Given a storyboard, selected track, and choreography blocks
- When PartyFace prepares per-beat video prompts
- Then each clip prompt includes track id, BPM, beat timing, choreography instructions, and visual direction
- And the prompt preserves face stability guidance
- And the final beat receives a stronger pose/drop instruction.

Demo moment:

Inspect the generated prompt for a beat and confirm it names the choreography and timing cues.

### Story 11.5: Music Library Demo Checkpoint

As a PartyFace builder,
I want to review the full music-library-to-choreography flow,
So that we can validate whether the videos feel more intentional before building deeper rendering infrastructure.

Acceptance criteria:

- Given the music library, beat grid, and choreography blocks exist
- When I select a template and track
- Then PartyFace shows the selected song, beat timing, choreography plan, and final-video audio plan
- And the demo-able moment for Epic 11 is: choose a registered Birthday Royale track, preview the audio, inspect beat-synced cutout-head choreography, and confirm the final-video plan references the selected track.

## Future Work

- Add an ACE-Step generation workflow document for producing new library tracks.
- Add an audio ingest tool that validates metadata and computes beat grids.
- Add a mux/stitch service that combines generated video clips with selected registered tracks.
- Add track licensing/source metadata before public sharing.
