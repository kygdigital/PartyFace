# PartyFace Audio Strategy

## MVP Decision

PartyFace should start with curated stock music loops for 30-second video cards.

This is the best first path because it gives us predictable timing, licensing can be handled deliberately, and generated video can be stitched or exported without depending on a video provider's audio support. Generated music and provider-native audio are still useful later, but they add consistency, rights, and synchronization questions before the core product loop is proven.

## Product Contract

- Every story template carries a music mood.
- The motion plan derives an audio strategy from that mood.
- The default audio strategy is `stock-loop`.
- Each audio strategy includes loop direction, rough BPM range, and structure notes.
- The studio includes a local stock-loop preview so music is no longer only theoretical.
- The final beat should align with the music drop or chorus.
- Browser previews remain muted by default until the user explicitly plays sound.

## Future Options

### Stock Loop Library

Use a small curated library of licensed 30-second loops. This should be the first production-quality implementation.

### Generated Music

Generate short instrumental beds from the story mood. This may be useful for customization, but it needs quality and rights review before becoming the default.

### Provider-Native Audio

Use provider audio only when the video model can produce reliable, controllable, rights-safe music. Until then, treat it as experimental.

## Implementation Note

The current app stores audio strategy metadata in the motion generation plan. Actual audio rendering, clip stitching, and final muxing are intentionally deferred to a later Epic 8 story.
