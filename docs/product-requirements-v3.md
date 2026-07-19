# PartyFace Product Requirements v3

Draft created: 2026-07-19
Supersedes: v2 (2026-07-19). Revised against `review-and-mitigations-v2.md`; applies the **lightweight** fix for each finding (tradeoffs accepted 2026-07-19).

## Vision

PartyFace helps someone create a personalized, face-cutout dancing birthday card
that feels like a modern, higher-quality JibJab: real friend faces, funny
choreography, punchy music, and a finished MP4 that is easy to share.

The product should feel curated and playful, not like a blank prompt box. Comfy
Cloud remains important, but its role is upstream asset generation. The web app
assembles the final card from registered templates, faces, music, and
choreography timing.

**v3 framing:** this milestone is a **concept-validation prototype**, not a
production renderer. The goal is to prove the *feeling* ("a face-cutout dancing
card is fun and shareable") on **one** fully finished template before investing
in a general animation/render system.

## Product Direction

PartyFace is a fixed-template renderer product.

- Comfy Cloud creates upstream ingredients: songs, figure art, backdrops, and
  visual tests.
- PartyFace stores or references those ingredients in registries.
- The app renderer combines template structure, theme assets, face cutouts,
  music timing, and overlays into a 30-45 second MP4.
- Comfy is **not** required at card render time for a registered template.
- **Faces are processed locally, never sent to Comfy Cloud** (see Privacy).

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
- **One fully rendered template (Red Carpet Glam / Birthday Royale).**
- **3-4 additional themes shown as static preview images only** (no render).
- One or two uploaded real face photos, **cut out locally**.
- One-person and two-person choreography formats for the rendered template.
- Recipient name and optional recipient age.
- Reusable music library with registered tracks.
- Track picker; the app references songs, it does not generate audio inline.
- Beat grid computed from known BPM at ingest.
- Fixed choreography vocabulary mapped to beat moments.
- **Face composited over a pre-made dance clip via a fixed head anchor with a
  BPM-synced "bob"** (no per-frame rig — see Core Concepts / FR-6).
- **A 5-second low-res draft preview** before full render.
- Renderer plan summary before export.
- Downloadable **~35 second** MP4 (within the 30-45s window).

### Out Of Scope

- Account system, payments, or marketplace.
- More than two real face cutouts.
- Stock sidekick people as a substitute for missing real faces.
- Custom gag text in the first renderer MVP.
- In-app song generation.
- AI-generated dance at runtime.
- Arbitrary prompt-to-video as the main user flow.
- Public launch infrastructure.
- **General animation/rig system** (per-frame head-anchor tracks, skeletal rigs).
- **Multi-template rendering** (only Red Carpet Glam renders in v1).
- **Proportional/auto-scaled beat timing** (v1 timings are hardcoded).
- **Browser canvas / WebCodecs rendering** (server-side ffmpeg only for v1).
- **Any cloud processing of user faces.**

## Core Concepts

### Fixed Template

A template defines the card's structure: beats, timing windows, choreo slots,
text slots, cast slots, and render requirements. It is an app composition
contract, not a ComfyUI workflow. **For v1 the rendered template's beat timings
are hardcoded to fit ~35 seconds**; proportional timing is deferred.

### Theme Pack

A theme pack fills a template with a specific vibe: backdrop, figures, palette,
copy, music reference, overlays, and asset paths. **For v1, only Red Carpet Glam
has a complete, renderable theme pack; other themes exist as static preview
images.**

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

Each preset maps to a **pre-made dance clip**; in v1 there is no per-frame rig.
The uploaded face is overlaid at a fixed anchor point per cast slot, with a
small vertical "bob" oscillation derived from the track BPM to sell the motion.

### Render Path (v1)

A single server-side **ffmpeg script (`make-card.sh`)** takes a template, theme,
track, and one or two local face cutouts and produces the MP4:
backdrop → pre-made dance clip → face overlay (fixed anchor + BPM bob) → text
overlays (title, outro) → audio mux. The path is deterministic. The Happy
Birthday outro is an **assembly tail** appended after the beat sequence, not a
numbered beat.

## MVP User Flow

1. User opens PartyFace and sees the rendered template plus static theme previews.
2. User chooses the rendered template (Red Carpet Glam).
3. User uploads one or two real face photos; **faces are cut out locally**, with
   on-screen guidance for a good photo (single front-facing face, clear lighting).
4. User enters recipient name and optional age.
5. User chooses a registered music track.
6. App computes beat timing from the selected track.
7. App shows the planned choreography, card moments, and a **5-second low-res
   draft preview**.
8. User renders the card.
9. App produces a ~35 second MP4 (30-45s window) for download and sharing.

## Functional Requirements

### FR-1 Template And Theme Selection

The app must show the rendered template plus **3-4 static theme preview images**
(mock + one-line vibe). Only Red Carpet Glam is fully renderable in v1; previews
exist so users can compare creative directions without a full render.

### FR-2 Real Face Uploads

The app must support one or two uploaded real face photos. **Cutout/background
removal runs locally** (e.g., macOS Vision person segmentation or `rembg`); face
images are never uploaded to Comfy Cloud or any remote service. Templates must
define whether they support one-person, two-person, or both choreography formats.

### FR-3 Recipient Details

The app must collect recipient name and optional age. The renderer may use these
values for title, outro, and number gag slots.

### FR-4 Music Library Track Picker

The app must list registered tracks from the music library. Tracks include id,
title, source, theme, tags, BPM, key, duration, file reference, and beat-grid
metadata. **Track files live in `public/library/` for the prototype.**

### FR-5 Beat Grid Computation

The app must compute beat timestamps from the selected track's BPM, downbeat
offset, and beats-per-bar metadata. Explicit beat maps may be added later for
tracks with tempo drift.

### FR-6 Choreography Plan And Face Motion

The app must map the rendered template's beats to choreography presets, where
each preset is a **pre-made dance clip**. The uploaded face cutout is composited
at a **fixed head anchor per cast slot with a BPM-synced vertical bob**; there is
no per-frame rig in v1. One-person and two-person formats may use different
choreo plans and anchors.

### FR-7 Draft Preview And Plan Summary

Before full render, the app must show (a) a summary of the selected template,
cast count, music track, duration target, and major card moments, and (b) a
**5-second low-res draft clip** so the user is not rendering blind.

### FR-8 MP4 Render And Export

The app must produce a downloadable ~35 second MP4 (within 30-45s) via the
`make-card.sh` ffmpeg path, with the selected song, local face cutouts, themed
assets, text overlays, and the pre-made dance clip with face bob.

## Non-Functional Requirements

- The renderer path must be deterministic for a given template, theme, track,
  and face inputs.
- Registered card render must not require Comfy Cloud at runtime.
- **Uploaded faces and rendered cards remain local to the prototype; faces are
  never sent to a remote service.** No retention beyond the local working
  session unless the user explicitly saves output.
- The app must make failures understandable, especially missing assets, missing
  song files, invalid or unusable face inputs, and render errors.
- The prototype should prioritize clear review loops over production polish.

## Success Metrics

Measured by hand across ~5 tester sessions during the prototype window; no
telemetry required.

**Primary**
- **Time-to-card < 5 minutes** (upload → downloadable MP4).
- **≥ 4 of 5 testers complete a card** end-to-end without help.

**Quality**
- **≥ 4 of 5 friends** shown the result agree it "reads as a face-cutout dancing
  greeting, not a generic AI poster."
- The final MP4 is 30-45 seconds and includes music.

**Guardrail (must not fail)**
- **Render success rate ≥ 95%** — no black frames, missing audio, or broken MP4s
  across test renders.

**Comparison**
- Users can **compare 3-5 creative template directions** (previews) and **render 1**.

## Open Questions (Resolved in v3)

1. **Renderer engine** → **Server-side ffmpeg only** (`make-card.sh`) for v1;
   browser canvas/WebCodecs deferred.
2. **Music file location** → **`public/library/`** for the prototype; object
   storage considered post-prototype.
3. **Registry JSON location** → **stays in `docs/` for now**; move to
   `src/lib/partyface-registry/` when implementation begins (single source of
   truth).
4. **Happy Birthday outro** → **assembly tail**, appended after the beat
   sequence, not a numbered beat.

## Remaining Open Questions (owners TBD)

- **[later]** Right-of-publicity / likeness and biometric-law review before any
  public launch or if faces ever reach a third-party cloud. (Owner: Regulatory/
  Privacy, revisit before launch.)
- **[later]** Ownership/licensing of ACE-Step-generated music for shareable
  cards. (Owner: TBD, before distribution.)
- **[prototype exit]** Go/no-go criteria to proceed past the prototype (proposed:
  hit the primary + quality metrics above with ≥ 4/5 testers).
