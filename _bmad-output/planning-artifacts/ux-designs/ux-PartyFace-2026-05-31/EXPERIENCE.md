---
title: "PartyFace Experience"
status: "draft"
created: "2026-05-31"
updated: "2026-05-31"
sources:
  - "../../prds/prd-PartyFace-2026-05-31/prd.md"
  - "../../prds/prd-PartyFace-2026-05-31/competitive-teardown-jibjab.md"
  - "../../../epics.md"
design: "./DESIGN.md"
---

# PartyFace Experience

## Foundation

PartyFace v1 is a desktop-web small-group validation app. The UX should be a hybrid guided studio: enough ordering to help first-time users, but not a multi-page wizard that slows iteration. DESIGN.md is the visual identity reference; this document owns the behavior, IA, states, flows, and accessibility floor.

Primary UX principles:

- Start from templates for discovery.
- Keep Person 1 and Person 2 neutral.
- Make prompt customization visible.
- Treat Still and Motion as sibling outputs.
- Make generation states explicit.
- Keep favorites and exports easy to compare.

## Information Architecture

### Primary Surface: Creation Studio

The Creation Studio is the first screen and main workspace.

Sections:

1. **Starter Templates**
   - 3-5 supported templates.
   - Template selection happens before photo upload in the default flow.
   - Each template shows name, short description, and Still/Motion support.

2. **People**
   - Two slots: Person 1 and Person 2.
   - Each slot supports upload, replace, remove, thumbnail preview, and usability status.

3. **Birthday Details**
   - Fields for name, age, message, and tone/relationship context.
   - Fields should be optional where possible; defaults fill blank areas.

4. **Prompt**
   - Shows the composed prompt from template + details.
   - User can edit directly.
   - User can reset to template default.

5. **Outputs**
   - Still Output track.
   - Motion Output track.
   - Each track has generate, status, variants/results, favorite, and export states.

6. **Favorites / Compare**
   - Selected still and motion favorites remain visible.
   - The view supports small-group comparison against benchmark output later.

## Voice And Tone

Microcopy should feel energetic but useful. Avoid heavy AI jargon unless needed.

Use:
- "Pick a party starter"
- "Add Person 1"
- "Add Person 2"
- "Make it more glam"
- "Generate stills"
- "Generate motion"
- "Try another version"

Avoid:
- "Configure model parameters"
- "Select demographic attributes"
- "Template locked"
- "Unsupported identity input"

Error copy should be direct and recoverable: "This photo may be hard to use. Try a clearer face photo with good lighting."

## Component Patterns

### Starter Template Cards

Behavior:
- Selecting a card updates Birthday Vibe and prompt defaults.
- Selected card is visually distinct using `{colors.neon-pink}`.
- Template selection does not clear uploaded people or birthday details.
- Template changes should warn only if they would overwrite a manually edited prompt.

### Person Slots

Behavior:
- Slots are neutral: Person 1 and Person 2.
- Person 2 is optional.
- Replacing a photo keeps template, details, prompt, and generated history unless regeneration requires clearing stale outputs.
- Usability feedback appears inline per slot.

### Prompt Editor

Behavior:
- Prompt is editable at all times before generation.
- Template and birthday details compose an initial prompt.
- Manual edits should be preserved unless the user explicitly resets.
- Show a lightweight indication when the prompt has been customized.

### Output Tracks

Behavior:
- Still and Motion tracks are visible together.
- Each track can be empty, ready, generating, complete, failed, or favorited.
- Generation controls use current template, people, details, and prompt.
- Still generation should allow multiple variants.
- Motion generation may start with one variant.

### Favorites

Behavior:
- A user can favorite at least one Still Output and one Motion Output.
- Favorites are visually distinct.
- Export actions prioritize favorites when available.

## State Patterns

- **Empty:** Template-first empty state invites picking a Starter Template.
- **Partial setup:** Missing People or prompt requirements are called out near the relevant section.
- **Ready:** Still and Motion generation controls are enabled when at least one usable person and a template or prompt exist.
- **Generating:** Show visible progress/pending state; do not allow duplicate accidental generation without feedback.
- **Complete:** Show media preview, favorite action, regenerate action, and export action.
- **Failed:** Explain failure in plain language and preserve setup inputs for retry.
- **Customized prompt:** Show that current prompt differs from template default and allow reset.

## Interaction Primitives

- Template click selects and applies defaults.
- Upload click opens file picker.
- Replace removes previous photo only after new photo is selected or user confirms.
- Favorite toggles a result's selected status.
- Generate actions are explicit per output track: "Generate stills" and "Generate motion."
- Regenerate uses current prompt/details and appends new variants rather than silently replacing favorites.
- Export downloads the selected/favorited media.

## Accessibility Floor

- All core controls must be keyboard reachable.
- Template cards and output cards must expose selected/favorite state textually, not only by color.
- Inputs must have visible labels.
- Error/status messages must be placed near the affected control.
- Text must remain readable on desktop; avoid text over busy generated previews unless backed by a readable overlay.
- Motion previews should not autoplay with sound [ASSUMPTION: if audio is added later, user controls are required].

## Responsive & Platform

V1 targets desktop web. The layout should degrade gracefully on narrower screens but does not need a fully optimized mobile creation experience yet.

Recommended desktop layout:
- Left setup rail or setup column.
- Main output/preview workspace.
- Sticky or persistent generate/export actions where useful.

## Key Flows

### UX-1: Karen starts from a template and creates a birthday surprise

1. Karen opens PartyFace and sees Starter Templates first.
2. She chooses "Disco Glam Birthday."
3. The app pre-fills a Birthday Vibe and prompt.
4. She uploads Person 1 and Person 2 photos.
5. She enters age/name/message details.
6. She edits the prompt to make it more personal.
7. She generates stills and motion.
8. She favorites the strongest outputs and exports them.
9. Climax: the output feels personalized, polished, and more fun than the benchmark.

### UX-2: Karen iterates after the first result is almost right

1. Karen sees a generated Still Output she likes but wants more sparkle.
2. She edits the prompt from "disco birthday" to "more glitter, brighter neon, red carpet energy."
3. She regenerates stills without re-uploading photos.
4. The new variants appear next to or after prior variants.
5. She favorites the better version.
6. Climax: iteration feels easy and creatively useful.

## Open UX Questions

1. Should generated text be rendered by the model, by front-end overlay, or both?
2. Which 3-5 Starter Templates should ship first?
3. Should outputs appear in a single combined gallery or separate Still/Motion sections?
4. Should prompt editing be always visible or collapsed after first successful generation?
5. How much generation cost/time should be shown in v1?
