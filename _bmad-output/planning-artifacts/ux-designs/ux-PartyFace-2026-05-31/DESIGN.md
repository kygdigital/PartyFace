---
name: "PartyFace"
description: "A playful disco-glam creative studio for personalized birthday images and videos."
status: "draft"
created: "2026-05-31"
updated: "2026-05-31"
sources:
  - "../../prds/prd-PartyFace-2026-05-31/prd.md"
  - "../../prds/prd-PartyFace-2026-05-31/competitive-teardown-jibjab.md"
  - "../../../epics.md"
colors:
  ink: "#211820"
  surface: "#FFF7FB"
  surface-raised: "#FFFFFF"
  surface-night: "#1A1028"
  line: "#E9D7E6"
  muted: "#766879"
  neon-pink: "#FF3DA7"
  disco-gold: "#FFC857"
  violet: "#7C3AED"
  electric-blue: "#2DD4FF"
  success: "#16A34A"
  warning: "#F59E0B"
  danger: "#E11D48"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "44px"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "0"
  heading:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "0"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "0"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  full: "9999px"
  DEFAULT: "8px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  gutter: "24px"
components:
  button-primary:
    background: "{colors.neon-pink}"
    color: "#FFFFFF"
    radius: "{rounded.md}"
  button-secondary:
    background: "{colors.surface-raised}"
    color: "{colors.ink}"
    radius: "{rounded.md}"
  starter-template-card:
    background: "{colors.surface-raised}"
    border: "{colors.line}"
    radius: "{rounded.md}"
  output-card:
    background: "{colors.surface-raised}"
    border: "{colors.line}"
    radius: "{rounded.md}"
---

# PartyFace Design

## Brand & Style

PartyFace should feel like a playful party tool that has enough polish to be trusted as a creative studio. The visual center is disco/glam: bright light, sparkle, neon, shine, and celebration. It should not feel like a corporate SaaS dashboard, a generic AI prompt box, or a childish craft site.

The product should communicate: "start with a fun scene, personalize it, generate something impressive." Starter Templates create discovery and confidence; editable prompts preserve creative control.

## Colors

- `{colors.neon-pink}` is the primary action and birthday-energy color. Use it for main calls to action, selected templates, and favorite states.
- `{colors.disco-gold}` is the celebratory accent. Use it for highlights, badges, and premium moments.
- `{colors.violet}` and `{colors.electric-blue}` support the disco/nightlife palette without making the app one-note.
- `{colors.surface}` and `{colors.surface-raised}` keep the workspace readable and light enough for repeated editing.
- `{colors.surface-night}` can be used in previews, headers, or template artwork where a nightlife mood is useful.

Avoid beige craft-paper dominance, corporate blue dashboards, and all-purple gradients that make the app feel generic.

## Typography

Use `{typography.display}` sparingly for the PartyFace brand and special birthday moments. Use `{typography.heading}` for panels, sections, and template names. Use `{typography.body}` for controls and helper text. Labels may use `{typography.label}` for compact, scannable section labels.

Do not use viewport-scaled type. Text inside panels and buttons must remain stable and readable across desktop sizes.

## Layout & Spacing

The first screen is a hybrid guided studio:

- Left or top setup rail for Starter Templates, People, Birthday Details, and Prompt.
- Main workspace for previewing the selected template, generated outputs, and favorites.
- Still and Motion tracks are visible as sibling destinations rather than hidden later steps.

Use `{spacing.gutter}` as the default desktop gutter. Keep cards compact and scan-friendly. Avoid nested cards; panels may contain repeated template/output cards, but page sections should not become decorative floating card stacks.

## Elevation & Depth

Use shadows lightly. Generated outputs and selected templates may lift above the workspace, but controls should stay quiet. Shine should come from color, generated imagery, and template previews rather than heavy UI effects.

## Shapes

Default controls and cards use `{rounded.md}`. Use `{rounded.full}` for face thumbnails, status pills, and small badges. Avoid exaggerated pill-heavy UI; PartyFace should feel playful through content and color, not through oversized rounded rectangles.

## Components

- **Starter Template Card:** Shows a preview/thumbnail, template name, short vibe line, and output support indicators for Still and Motion.
- **Person Slot:** Circular face thumbnail area, upload/replace/remove actions, and face usability status.
- **Prompt Editor:** Editable text area with visible generated prompt and reset-to-template affordance.
- **Output Card:** Preview media, status, favorite action, regenerate affordance where relevant, and export action when ready.
- **Generation Status:** Clear status for queued, generating, complete, failed, and retry.

## Do's and Don'ts

- Do make templates feel like launch pads, not locked tracks.
- Do make generated media the visual star.
- Do keep the creation flow on one primary workspace for MVP.
- Do clearly separate Still and Motion outputs.
- Don't hide prompt customization behind advanced settings.
- Don't ask users to manually pick skin color in the happy path.
- Don't build a huge template-catalog visual language for v1.
