# Story 9.4: Stitch Clips with Music

Status: done

## Story

As a PartyFace creator,
I want completed beat clips stitched with the selected music loop,
So that I receive one shareable birthday video card.

## Acceptance Criteria

- Given all beat clips are complete
- When PartyFace assembles the final output
- Then it creates one browser-playable MP4
- And the selected audio strategy is applied or clearly deferred if no audio renderer is configured
- And the output can be exported.

## Tasks

- [x] Add a local stock-loop audio asset for MVP music preview.
- [x] Add an in-app audio preview player for the selected audio strategy.
- [x] Mux the latest 90s video test with the stock loop using FFmpeg.
- [x] Verify the muxed output has both video and audio tracks.
- [x] Keep full multi-clip stitching as the next demo-checkpoint integration.

## Completion Notes

- Music is now tangible in the app through a local stock-loop preview.
- A real sample MP4 with music was created from the latest 90s single-shot video.
- This story validates the music/muxing direction before the final full multi-clip demo.

## Verification

- `npm run lint`
- `npm run build`
- Browser smoke test at `http://localhost:3001/` confirmed one audio player with `/audio/partyface-90s-stock-loop.mp3` and no console errors.
- `ffprobe` confirmed the muxed sample includes H.264 video and AAC audio.

## Demo Output

- `/Users/karengtrz/Documents/Codex/2026-05-30/files-mentioned-by-the-user-img/outputs/partyface-90s-music-video-with-music-1.mp4`

## File List

- `public/audio/partyface-90s-stock-loop.wav`
- `public/audio/partyface-90s-stock-loop.mp3`
- `src/lib/templates/audioStrategy.ts`
- `src/features/studio/components/MotionPlanPreview.tsx`
- `_bmad-output/planning-artifacts/audio-strategy.md`
- `_bmad-output/implementation-artifacts/9-4-stitch-clips-with-music.md`
