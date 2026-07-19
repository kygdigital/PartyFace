# PartyFace Discovery

PartyFace creates personalized face-cutout dancing e-cards in the spirit of
JibJab: real faces composited onto themed cartoon dancing figures, set to a song
from a reusable music library, and assembled from a fixed beat/choreography
template.

## Core Idea

The experience is consistent for everyone because each card is built from a
fixed template. Personalization comes from:

- Faces, always.
- Choreography presets, optionally.
- Theme packs, music selection, and later gag copy.

The MVP should feel curated rather than generative-chaotic. A user picks a
theme, adds faces, chooses a library track, and PartyFace renders a predictable,
funny, shareable card.

## Discovery Files

| File | What it is | Layer |
| ---- | ---------- | ----- |
| `PartyFace-one-pager-v1.md` | Project brief / the ask | Product |
| `docs/template.schema.json` | Fixed beat structure plus choreography preset enum. App composition contract, not a ComfyUI workflow. | Compose/render |
| `theme-pack.json` | Swappable skin: backdrop, figures, gag copy, music ref. Example: Red Carpet Glam. | Compose/render |
| `music-library.json` | Index of reusable songs. Tracks are referenced, never generated inline. `beat_grid` is computed on ingest from known BPM. | Assets -> compose |
| `docs/music-library-index.json` | Current PartyFace seed index for reusable generated songs. | Assets -> compose |
| `docs/epic-11-music-choreography-plan.md` | Epic 11 implementation plan for track selection, beat grids, and cutout-head choreography. | Product/engineering |

## Two Schemas, Two Layers

Do not conflate ComfyUI workflow JSON with the PartyFace composition files.

```text
ComfyUI workflows  ->  media files
                       songs via ACE-Step
                       figures + face cutouts via image models
                              |
docs/template.schema.json + theme-pack.json + music-library.json
                              |
                    Web app renderer
                    ffmpeg / canvas / WebCodecs
                              |
                    finished card .mp4
```

ComfyUI workflow JSON is the upstream factory for raw ingredients.

PartyFace composition files are the recipe and assembly line the web app runs.
No Comfy execution should be required at render time for a card assembled from
registered assets.

## Fixed Beat Skeleton

The first PartyFace template should use a fixed beat skeleton:

1. Hero reveal.
2. Logo splash.
3. Live-event framing.
4. Dance-loop verse.
5. Gag interstitials.
6. Number gag.
7. Escalation / hero moment.
8. Group climax.
9. Happy Birthday outro.

The file name `docs/template.schema.json` may still describe this as an "8-beat"
structure if intro/outro framing is modeled separately. The implementation
should be explicit about whether the outro is a beat or an assembly tail.

## Choreography Vocabulary

Start with a locked preset enum:

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

The curated path locks choreography to the template. A later customization path
can expose per-beat overrides with:

```json
{
  "customization": {
    "allow_choreo_override": true
  }
}
```

## Open Build Questions

- Render path: client-side WebCodecs/canvas vs. server-side ffmpeg.
- Face cutout quality bar: likely `nano-banana-pro` for alpha/cutout work.
- Whether computed `beat_grid` is accurate enough for all generated songs, or
  whether more songs need explicit per-song `beat_map` timing.

## MVP Scope

- One theme pack.
- One or two face uploads.
- Library track picker.
- Fixed template renderer.
- Downloadable MP4.

Deferred:

- Custom gag text.
- More than two characters.
- In-app song generation.
- AI-generated dance, such as Wan Dancer.
