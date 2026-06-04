---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-PartyFace-2026-05-31/prd.md
  - _bmad-output/planning-artifacts/prds/prd-PartyFace-2026-05-31/competitive-teardown-jibjab.md
  - _bmad-output/planning-artifacts/ux-designs/ux-PartyFace-2026-05-31/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-PartyFace-2026-05-31/EXPERIENCE.md
  - _bmad-output/planning-artifacts/architecture.md
---

# PartyFace - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for PartyFace, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR-1: The user can upload Face Photos for one or two Subjects from their device; the app accepts common browser-supported image formats, presents two neutral Subject slots, shows uploads in workflow, and supports remove/replace before generation.

FR-2: The system can identify whether an uploaded Face Photo is likely usable for generation; if not usable, it shows a clear retry message, avoids manual skin color selection in the happy path, and preserves a way to retry.

FR-3: The user can enter birthday-specific details including recipient name, age, message, and relationship/tone; the app can generate defaults, include details in prompts, and allow edits before regeneration.

FR-4: The user can choose a guided Birthday Vibe or write a custom prompt; the app offers at least three guided vibes, accepts freeform prompt text, and makes the final generation prompt inspectable enough for iteration.

FR-5: The user can choose from 3-5 supported Starter Templates before generation; each template has a name, visual preview or description, default Birthday Vibe, and compatible Still Output and Motion Output guidance; choosing a template pre-fills defaults without preventing customization.

FR-6: The user can generate multiple Still Output Variants from selected Face Photos for one or two Subjects and a Birthday Vibe; the app requests at least two still variants per generation run, displays completed variants, and supports selecting a favorite Still Output.

FR-7: The user can download a selected Still Output as a shareable image file with a readable default name.

FR-8: The user can generate at least one Motion Output from selected Face Photos for one or two Subjects and a Birthday Vibe; the app requests a short Motion Output through a ComfyUI Workflow, previews it in the browser, and shows progress while generation runs.

FR-9: The user can download a selected Motion Output as a shareable video or animated file and can distinguish still export from motion export.

FR-10: The user can adjust Birthday Vibe or prompt text and request new Variants without starting over; existing Face Photos and birthday details persist, and new Variants do not delete favorites unless explicitly cleared.

FR-11: The user can mark favorite Still Outputs and Motion Outputs for comparison; the app visually distinguishes favorites and supports keeping at least one Still Output and one Motion Output as favorites.

### NonFunctional Requirements

NFR-1: Face Photos should remain local or within the configured ComfyUI/Comfy Cloud workflow used by the builder; v1 must not introduce unrelated third-party storage.

NFR-2: Generation states must be visible so users understand whether the app is uploading, queued, generating, complete, or failed.

NFR-3: The app should bias toward fewer, better outputs over a large number of mediocre Variants.

NFR-4: ComfyUI generation should expose enough progress/cost friction to avoid accidental runaway generation.

NFR-5: Core creation controls should be keyboard reachable and readable at desktop sizes.

NFR-6: The MVP is a small-group trusted prototype, not public launch infrastructure.

### Additional Requirements

- Architecture document is complete: `_bmad-output/planning-artifacts/architecture.md`.
- Current repo contains a static prototype (`index.html`, `styles.css`, `app.js`) with local canvas editing; implementation must migrate/scaffold to Next.js App Router + TypeScript + Tailwind.
- ComfyUI MCP has been validated in this environment for image generation and local upload auth after setting `COMFY_API_KEY`; app implementation must route ComfyUI calls through server-side Next.js route handlers.
- `COMFY_API_KEY` must remain server-side only and must not be exposed in browser code.
- Use the architecture's shared API response wrapper, `GenerationJobStatus` union, and project structure.
- Starter Templates should be treated as customizable creative recipes rather than a large fixed template catalog.
- JibJab benchmark implies table stakes around easy personalization, occasion clarity, preview, and share/export.
- Competitive differentiation depends on promptable iteration, higher generation quality, and less manual face setup than JibJab-style flows.
- Each epic should end with a demo-able moment that the user can open, click through, and review for progress before proceeding.

### UX Design Requirements

UX-DR1: Present exactly two neutral Subject slots in v1, labeled Person 1 and Person 2 or equivalent.

UX-DR2: Provide 3-5 Starter Templates with names and visual previews or descriptions so users can start quickly.

UX-DR3: After selecting a Starter Template, expose editable creative prompt/details so customization is obvious.

UX-DR4: Show separate still and motion generation tracks so users understand both outputs are supported.

UX-DR5: Display generation status and failure states clearly for upload, still generation, and motion generation.

UX-DR6: Display generated Variants in a comparison-friendly layout with favorite selection.

UX-DR7: Provide distinct export/download actions for Still Outputs and Motion Outputs.

UX-DR8: Keep the first surface desktop-web friendly and readable.

### FR Coverage Map

FR-1: Epic 1 - Guided Birthday Project setup with two neutral Subject slots and Face Photo upload.

FR-2: Epic 1 - Face Photo usability feedback during guided setup.

FR-3: Epic 1 - Birthday details capture during guided setup.

FR-4: Epic 1 - Birthday Vibe and editable prompt setup.

FR-5: Epic 1 - Starter Template selection and customization.

FR-6: Epic 2 - Still Output generation and review.

FR-7: Epic 4 - Still Output export.

FR-8: Epic 3 - Motion Output generation and preview.

FR-9: Epic 4 - Motion Output export.

FR-10: Epic 2 and Epic 3 - Prompt/detail iteration for still and motion generation.

FR-11: Epic 2, Epic 3, and Epic 4 - Favorite selection and comparison for generated outputs.

## Epic List

### Epic 1: Create a Guided Birthday Project

A user can start a PartyFace project, add up to two people, choose a Starter Template, enter birthday details, and see an editable generation prompt before spending generation effort.

**FRs covered:** FR-1, FR-2, FR-3, FR-4, FR-5

### Epic 2: Generate and Review Still Birthday Outputs

A user can generate multiple still birthday image/card Variants through ComfyUI, view results, adjust the prompt/details, regenerate, and favorite the best Still Output.

**FRs covered:** FR-6, FR-10, FR-11

### Epic 3: Generate and Review Motion Birthday Outputs

A user can generate a short birthday video/animation Variant through ComfyUI, preview it, adjust the prompt/details, regenerate, and favorite a Motion Output.

**FRs covered:** FR-8, FR-10, FR-11

### Epic 4: Export and Compare Shareable Results

A user can download selected Still Outputs and Motion Outputs, then use them for small-group comparison against the JibJab-style Benchmark Output.

**FRs covered:** FR-7, FR-9, FR-11

## Epic 1: Create a Guided Birthday Project

A user can start a PartyFace project, add up to two people, choose a Starter Template, enter birthday details, and see an editable generation prompt before spending generation effort.

### Story 1.1: Set Up Initial Project from Next.js Starter

As a PartyFace creator,
I want the app to run as a Next.js guided studio,
So that the product has a secure backend boundary and a demo-able web foundation.

**FRs implemented:** FR-1, FR-3, FR-4, FR-5

**Acceptance Criteria:**

**Given** the current static prototype exists
**When** the project is migrated or scaffolded to Next.js App Router + TypeScript + Tailwind
**Then** `npm run dev` serves the PartyFace app locally
**And** the first screen renders a disco-glam Creation Studio shell
**And** the project includes the architecture-defined folders for `src/app`, `src/features/studio`, `src/lib/domain`, `src/lib/templates`, `src/lib/api`, and `src/lib/comfy`
**And** `COMFY_API_KEY` is documented in `.env.example` but not exposed to browser code
**And** the setup follows the architecture's selected starter approach for a non-empty repo
**And** the existing static prototype intent is preserved or intentionally superseded.

### Story 1.2: Starter Template Picker

As a PartyFace creator,
I want to choose a Starter Template first,
So that I can begin from a fun birthday scene instead of a blank prompt.

**FRs implemented:** FR-4, FR-5

**Acceptance Criteria:**

**Given** I open the Creation Studio
**When** I view the Starter Templates section
**Then** I see 3-5 templates with names, descriptions, and Still/Motion support indicators
**And** at least one template is Disco Glam Birthday
**And** selecting a template visually marks it as selected
**And** selecting a template pre-fills Birthday Vibe and prompt defaults
**And** templates are defined in `src/lib/templates/starterTemplates.ts`.

### Story 1.3: Two Neutral Person Slots

As a PartyFace creator,
I want two neutral person slots,
So that I can add up to two people without forcing a relationship role.

**FRs implemented:** FR-1

**Acceptance Criteria:**

**Given** I am in the Creation Studio
**When** I view the People section
**Then** I see two slots labeled Person 1 and Person 2 or equivalent
**And** each slot accepts one Face Photo upload
**And** I can replace or remove an uploaded Face Photo
**And** uploaded Face Photos show thumbnails
**And** the app does not ask me to select skin color in the happy path
**And** Person 2 is optional.

### Story 1.4: Face Photo Usability Feedback

As a PartyFace creator,
I want feedback when a Face Photo may not work,
So that I can retry before generating bad outputs.

**FRs implemented:** FR-2

**Acceptance Criteria:**

**Given** I upload a Face Photo
**When** the app cannot confidently treat it as usable
**Then** I see a clear message asking for a clearer face photo
**And** the message appears near the affected Person slot
**And** I can replace the Face Photo without losing selected template, birthday details, or prompt text
**And** the initial implementation may use a simple local placeholder validation as long as the UX contract is present.

### Story 1.5: Birthday Details and Prompt Composer

As a PartyFace creator,
I want to enter birthday details and inspect the composed prompt,
So that I can personalize the result before generation.

**FRs implemented:** FR-3, FR-4

**Acceptance Criteria:**

**Given** I selected a Starter Template
**When** I enter birthday details such as name, age, message, and tone
**Then** those details influence the prompt preview
**And** I can edit the prompt directly
**And** the app shows when the prompt has been customized from the template default
**And** I can reset the prompt to the selected template default
**And** prompt composition logic lives in `src/lib/templates/promptComposer.ts`.

### Story 1.6: Ready-to-Generate Demo Checkpoint

As a PartyFace creator,
I want the setup screen to tell me when I am ready to generate,
So that I can review progress before real generation work begins.

**FRs implemented:** FR-1, FR-2, FR-3, FR-4, FR-5

**Acceptance Criteria:**

**Given** I am setting up a PartyFace project
**When** no template/prompt or usable Person slot is present
**Then** Still and Motion generation actions are unavailable or clearly marked incomplete
**And** the app explains what is missing
**When** at least one usable Person slot and a template or prompt are present
**Then** Still and Motion generation actions become available
**And** clicking them can show a non-destructive placeholder state until Epic 2/3 implement real generation
**And** the demo-able moment for Epic 1 is: open the app, pick a template, add Person 1/2, edit details/prompt, and see the project become ready to generate.

## Epic 2: Generate and Review Still Birthday Outputs

A user can generate multiple still birthday image/card Variants through ComfyUI, view results, adjust the prompt/details, regenerate, and favorite the best Still Output.

### Story 2.1: Select Still ComfyUI Workflow Adapter

As a PartyFace creator,
I want the still generation workflow to be selected and wrapped in an adapter,
So that the app can generate premium still outputs without coupling UI code to ComfyUI details.

**FRs implemented:** FR-6, FR-10

**Acceptance Criteria:**

**Given** the Creation Studio produces a complete setup payload
**When** the still workflow is selected
**Then** the decision is documented in `src/lib/comfy/stillWorkflow.ts`
**And** the adapter accepts the typed PartyFace setup payload
**And** the adapter hides ComfyUI-specific request details from React components
**And** the implementation can run in mock mode if the real workflow is unavailable
**And** open workflow assumptions are documented near the adapter.

### Story 2.2: Still Generation API Route

As a PartyFace creator,
I want to start still generation from the app,
So that uploaded people and prompt details can produce Still Output Variants.

**FRs implemented:** FR-6

**Acceptance Criteria:**

**Given** I have a ready PartyFace setup
**When** I click Generate stills
**Then** the browser calls `POST /api/generate/still`
**And** the route validates the payload with Zod
**And** the route keeps `COMFY_API_KEY` server-side only
**And** the route returns the shared API response wrapper
**And** the UI receives a PartyFace job id or mock job id.

### Story 2.3: Still Job Polling and Status UI

As a PartyFace creator,
I want to see still generation progress,
So that I know whether the app is working, complete, or failed.

**FRs implemented:** FR-6

**Acceptance Criteria:**

**Given** a still generation job has started
**When** the UI polls `GET /api/jobs/[jobId]`
**Then** the UI renders statuses using the shared `GenerationJobStatus` names
**And** Still and Motion statuses are independent
**And** duplicate still generation is prevented while a still job is active
**And** failed jobs preserve setup inputs and existing favorites.

### Story 2.4: Still Variant Gallery and Favorites

As a PartyFace creator,
I want to review and favorite still variants,
So that I can compare options and keep the best card/poster.

**FRs implemented:** FR-6, FR-11

**Acceptance Criteria:**

**Given** still generation completes
**When** the app receives Still Output Variant metadata
**Then** variants appear in a comparison-friendly gallery
**And** each variant has a stable `variantId`
**And** I can favorite at least one Still Output
**And** favorites reference `variantId`, not array position
**And** variants do not replace prior favorites unless I explicitly clear them.

### Story 2.5: Still Prompt Iteration Demo Checkpoint

As a PartyFace creator,
I want to regenerate stills after changing the prompt,
So that I can make a better version without restarting setup.

**FRs implemented:** FR-10, FR-11

**Acceptance Criteria:**

**Given** I have generated at least one Still Output
**When** I edit the prompt and regenerate stills
**Then** the app keeps Person slots, birthday details, and prior favorites
**And** new Still Output Variants are appended or clearly separated from previous results
**And** the demo-able moment for Epic 2 is: start from Epic 1 setup, generate/mock still variants, favorite one, edit prompt, regenerate, and compare results.

## Epic 3: Generate and Review Motion Birthday Outputs

A user can generate a short birthday video/animation Variant through ComfyUI, preview it, adjust the prompt/details, regenerate, and favorite a Motion Output.

### Story 3.1: Select Motion ComfyUI Workflow Adapter

As a PartyFace creator,
I want the motion generation workflow to be selected and wrapped in an adapter,
So that the app can generate short birthday motion outputs without coupling UI code to ComfyUI details.

**FRs implemented:** FR-8, FR-10

**Acceptance Criteria:**

**Given** the Creation Studio produces a complete setup payload
**When** the motion workflow is selected
**Then** the decision is documented in `src/lib/comfy/motionWorkflow.ts`
**And** the adapter accepts the typed PartyFace setup payload
**And** the adapter defines output type, preview expectations, and duration assumptions
**And** the adapter hides ComfyUI-specific request details from React components
**And** the implementation can run in mock mode if the real workflow is unavailable.

### Story 3.2: Motion Generation API Route

As a PartyFace creator,
I want to start motion generation from the app,
So that uploaded people and prompt details can produce a short video or animation.

**FRs implemented:** FR-8

**Acceptance Criteria:**

**Given** I have a ready PartyFace setup
**When** I click Generate motion
**Then** the browser calls `POST /api/generate/motion`
**And** the route validates the payload with Zod
**And** the route keeps `COMFY_API_KEY` server-side only
**And** the route returns the shared API response wrapper
**And** the UI receives a PartyFace job id or mock job id.

### Story 3.3: Motion Job Polling and Preview

As a PartyFace creator,
I want to see motion generation progress and preview the result,
So that I can decide whether the motion output is share-worthy.

**FRs implemented:** FR-8

**Acceptance Criteria:**

**Given** a motion generation job has started
**When** the UI polls `GET /api/jobs/[jobId]`
**Then** the UI renders statuses using the shared `GenerationJobStatus` names
**And** Still and Motion statuses are independent
**And** duplicate motion generation is prevented while a motion job is active
**When** the job completes
**Then** a browser-playable preview appears in the Motion Output track
**And** motion previews do not autoplay with sound.

### Story 3.4: Motion Favorites and Iteration Demo Checkpoint

As a PartyFace creator,
I want to favorite and regenerate motion outputs,
So that I can keep the strongest short birthday video.

**FRs implemented:** FR-10, FR-11

**Acceptance Criteria:**

**Given** motion generation completes
**When** the app receives Motion Output Variant metadata
**Then** I can favorite at least one Motion Output
**And** favorites reference `variantId`, not array position
**When** I edit the prompt and regenerate motion
**Then** setup inputs and prior favorites remain available
**And** the demo-able moment for Epic 3 is: start from setup, generate/mock a motion output, preview it, favorite it, change prompt, and regenerate.

## Epic 4: Export and Compare Shareable Results

A user can download selected Still Outputs and Motion Outputs, then use them for small-group comparison against the JibJab-style Benchmark Output.

### Story 4.1: Still Output Export

As a PartyFace creator,
I want to download my selected Still Output,
So that I can text, post, or compare it outside the app.

**FRs implemented:** FR-7

**Acceptance Criteria:**

**Given** I have a completed or favorited Still Output
**When** I click the still export action
**Then** the app downloads or opens a shareable image file
**And** the file has a readable default name
**And** the export action prioritizes the favorited Still Output when available
**And** export errors use the shared recoverable error format.

### Story 4.2: Motion Output Export

As a PartyFace creator,
I want to download my selected Motion Output,
So that I can text, post, or compare it outside the app.

**FRs implemented:** FR-9

**Acceptance Criteria:**

**Given** I have a completed or favorited Motion Output
**When** I click the motion export action
**Then** the app downloads or opens a shareable video or animated file
**And** the file has a readable default name
**And** the export action prioritizes the favorited Motion Output when available
**And** still and motion export actions are visually distinct.

### Story 4.3: Favorites Summary

As a PartyFace creator,
I want a clear summary of my selected outputs,
So that I can review the best still and motion options together.

**FRs implemented:** FR-11

**Acceptance Criteria:**

**Given** I have favorited outputs
**When** I view the Favorites or Compare area
**Then** I see my favorited Still Output and Motion Output
**And** each favorite shows output type, preview, and export action
**And** missing favorites show a clear empty state
**And** the summary is suitable for small-group review.

### Story 4.4: Benchmark Comparison Demo Checkpoint

As a PartyFace creator,
I want to compare PartyFace outputs against the benchmark,
So that I can validate whether PartyFace feels better than the JibJab-style inspiration.

**FRs implemented:** FR-7, FR-9, FR-11

**Acceptance Criteria:**

**Given** I have a selected Still Output and/or Motion Output
**When** I open the comparison area
**Then** I can view PartyFace favorites alongside a benchmark reference placeholder or imported benchmark media
**And** the UI supports the small-group review goal from the PRD
**And** the demo-able moment for Epic 4 is: export a still, export a motion output, and show a comparison-ready favorites summary.

## Epic 5: Integrate Real Comfy Still Generation

A user can generate real still birthday image/card outputs through a selected ComfyUI/Comfy Cloud workflow, replacing mock still variants with generated media returned from the backend.

**FRs covered:** FR-1, FR-2, FR-6, FR-7, FR-10, FR-11

### Story 5.1: Discover and Select Real Still Workflow

As a PartyFace builder,
I want to inspect available Comfy workflows and select the first real still workflow,
So that PartyFace can move from mock still variants to generated images.

**FRs implemented:** FR-6

**Acceptance Criteria:**

**Given** Comfy MCP/API access is available
**When** I inspect saved workflows, templates, and relevant API/provider nodes
**Then** the selected still workflow decision is documented in `src/lib/comfy/stillWorkflow.ts`
**And** any required node ids, prompt inputs, image inputs, model/provider choices, and output expectations are captured near the adapter
**And** Nano Banana is preferred for the first identity-aware still workflow when available through the configured Comfy environment
**And** Krea 2 is documented as a fallback or alternate style-led poster workflow
**And** unresolved workflow assumptions are explicitly documented before implementation continues.

### Story 5.2: Upload Face Photos for Still Generation

As a PartyFace creator,
I want uploaded face photos to be sent to the server-side Comfy workflow,
So that real still generation can use my selected people.

**FRs implemented:** FR-1, FR-2, FR-6

**Acceptance Criteria:**

**Given** I have at least one usable Person photo
**When** I start still generation
**Then** the server receives the photo payload or upload reference without exposing `COMFY_API_KEY`
**And** the Comfy upload result is mapped to the selected still workflow's expected image input
**And** Nano Banana and Krea 2 are compared against the same 1-2 face references before the final still provider path is locked
**And** upload failures return the shared recoverable API error format
**And** existing setup state is preserved after upload failure.

### Story 5.3: Submit Real Still Workflow Job

As a PartyFace creator,
I want Generate stills to submit the selected real Comfy workflow,
So that PartyFace creates actual birthday image variants.

**FRs implemented:** FR-6, FR-10

**Acceptance Criteria:**

**Given** I have a ready PartyFace setup and uploaded face references
**When** I click Generate stills
**Then** `POST /api/generate/still` submits the selected Comfy workflow in real mode
**And** prompt, birthday details, template choice, and face inputs are injected into the workflow
**And** the route still supports mock mode as a fallback
**And** the UI receives a PartyFace job id linked to the Comfy prompt id
**And** accidental duplicate still submissions are prevented while active.

### Story 5.4: Ingest Real Still Outputs

As a PartyFace creator,
I want completed Comfy still outputs to appear in the gallery,
So that I can review and favorite actual generated images.

**FRs implemented:** FR-6, FR-7, FR-11

**Acceptance Criteria:**

**Given** a real still Comfy job completes
**When** PartyFace receives output metadata
**Then** real image preview/download URLs are mapped into `StillOutputVariant` records
**And** each variant has a stable `variantId`
**And** existing mock gallery, favorite, regenerate, and export behavior works with real outputs
**And** failed or missing outputs show recoverable UI copy without clearing prior favorites.

### Story 5.5: Real Still Generation Demo Checkpoint

As a PartyFace builder,
I want to run the full still generation path with real Comfy output,
So that I can judge whether PartyFace beats the benchmark on image quality.

**FRs implemented:** FR-6, FR-7, FR-10, FR-11

**Acceptance Criteria:**

**Given** the selected still workflow is configured
**When** I complete setup and generate stills
**Then** real still variants appear in the gallery
**And** I can favorite, regenerate, export, and compare them
**And** the demo-able moment for Epic 5 is: upload one or two faces, generate real stills, favorite the best image, export it, and compare it against the benchmark placeholder.

## Epic 6: Integrate Real Comfy Motion Generation

A user can generate a real short birthday motion output through a selected ComfyUI/Comfy Cloud workflow, replacing mock motion previews with browser-playable generated media.

**FRs covered:** FR-1, FR-8, FR-9, FR-10, FR-11

### Story 6.1: Discover and Select Real Motion Workflow

As a PartyFace builder,
I want to inspect available Comfy motion workflows and select the first real motion workflow,
So that PartyFace can move from mock motion previews to generated video or animation.

**FRs implemented:** FR-8

**Acceptance Criteria:**

**Given** Comfy MCP/API access is available
**When** I inspect saved workflows, templates, and relevant video/image-to-video nodes
**Then** the selected motion workflow decision is documented in `src/lib/comfy/motionWorkflow.ts`
**And** required node ids, prompt inputs, image inputs, duration controls, model/provider choices, and output expectations are captured near the adapter
**And** preview requirements remain browser-playable and muted by default
**And** unresolved workflow assumptions are explicitly documented before implementation continues.

### Story 6.2: Prepare Motion Inputs from PartyFace Setup

As a PartyFace creator,
I want my PartyFace setup to be transformed into the selected motion workflow inputs,
So that the motion output reflects my faces, template, and prompt.

**FRs implemented:** FR-1, FR-8, FR-10

**Acceptance Criteria:**

**Given** I have a ready PartyFace setup
**When** motion generation starts
**Then** face references, prompt, birthday details, and template direction are mapped to the selected motion workflow
**And** any still-image seed/frame dependency is handled server-side
**And** validation errors return the shared recoverable API error format
**And** setup state and existing favorites are preserved.

### Story 6.3: Submit Real Motion Workflow Job

As a PartyFace creator,
I want Generate motion to submit the selected real Comfy workflow,
So that PartyFace creates an actual short birthday motion output.

**FRs implemented:** FR-8, FR-10

**Acceptance Criteria:**

**Given** I have a ready PartyFace setup and required motion inputs
**When** I click Generate motion
**Then** `POST /api/generate/motion` submits the selected Comfy workflow in real mode
**And** the route still supports mock mode as a fallback
**And** the UI receives a PartyFace job id linked to the Comfy prompt id
**And** duplicate motion submissions are prevented while active
**And** motion and still job states remain independent.

### Story 6.4: Preview and Export Real Motion Output

As a PartyFace creator,
I want completed Comfy motion output to play in the browser and export cleanly,
So that I can decide whether to share it.

**FRs implemented:** FR-8, FR-9, FR-11

**Acceptance Criteria:**

**Given** a real motion Comfy job completes
**When** PartyFace receives output metadata
**Then** the output is mapped into a `MotionOutputVariant`
**And** the preview is browser-playable and does not autoplay with sound
**And** favorite, regenerate, export, and comparison behavior works with real motion outputs
**And** failed or missing outputs show recoverable UI copy without clearing prior favorites.

### Story 6.5: Real Motion Generation Demo Checkpoint

As a PartyFace builder,
I want to run the full motion generation path with real Comfy output,
So that I can judge whether PartyFace beats the benchmark on fun and shareability.

**FRs implemented:** FR-8, FR-9, FR-10, FR-11

**Acceptance Criteria:**

**Given** the selected motion workflow is configured
**When** I complete setup and generate motion
**Then** a real browser-playable motion output appears
**And** I can favorite, regenerate, export, and compare it
**And** the demo-able moment for Epic 6 is: generate a real motion birthday card, preview it muted in browser, favorite it, export it, and compare it against the benchmark placeholder.

## Epic 8: Story-Driven Birthday Videos

A user can choose and customize a 30-second birthday story arc before generation, giving PartyFace videos a beginning, middle, finale, and music direction rather than a single animated poster.

**FRs covered:** FR-3, FR-4, FR-8, FR-10

### Story 8.1: Add 30-Second Story Template Model

As a PartyFace creator,
I want to choose a video story arc before generating,
So that the final motion output feels like a birthday card with a beginning, middle, and finale.

**FRs implemented:** FR-3, FR-4, FR-8

**Acceptance Criteria:**

**Given** I am preparing a birthday video
**When** I choose a story template
**Then** PartyFace has structured 30-second story data with timed beats
**And** each story includes editable captions, visual direction, music mood, and generation guidance
**And** the selected story is included in the server-side generation payload
**And** the motion prompt receives story context for future longer-video workflows.

### Story 8.2: Storyboard Preview UI

As a PartyFace creator,
I want to preview and edit the beats of my birthday video story,
So that I can shape the personality of the final video before generating.

**FRs implemented:** FR-3, FR-4, FR-10

**Acceptance Criteria:**

**Given** I am in the Creation Studio
**When** I reach the setup controls
**Then** I can select a video story template
**And** I can see the selected story's description, music mood, and four timed beats
**And** I can edit beat captions before generating
**And** the selected story arc appears in setup readiness feedback
**And** the demo-able moment for Story 8.2 is: choose a video story, edit a beat caption, and see the story arc preserved in the generation setup.

### Story 8.3: Generate Multi-Beat Motion Plan

As a PartyFace creator,
I want the selected story beats transformed into a generation plan,
So that future video generation can produce coherent 30-second outputs instead of a single motion prompt.

**FRs implemented:** FR-8, FR-10

**Acceptance Criteria:**

**Given** a story template with edited beats
**When** motion generation starts
**Then** PartyFace can derive a structured multi-beat generation plan
**And** the plan can target either a single long-video workflow or multiple stitched clips
**And** the plan is inspectable for tuning.

### Story 8.4: Add Music Direction and Audio Strategy

As a PartyFace creator,
I want the birthday video to have music direction,
So that the final result feels like a shareable musical birthday card.

**FRs implemented:** FR-8

**Acceptance Criteria:**

**Given** a selected story template
**When** PartyFace prepares motion generation
**Then** music mood metadata is available to the generation pipeline
**And** the implementation documents whether v1 uses selected stock loops, generated audio, or provider-native audio
**And** the app can later combine the visual output with the selected music direction.

## Epic 9: Assemble Final 30-Second Video Cards

A user can move from a story-driven motion plan to a finished 30-second MP4 birthday card with generated clips, simple stitching, and music direction.

**FRs covered:** FR-8, FR-9, FR-10, FR-11

### Story 9.1: Final Video Assembly Contract

As a PartyFace builder,
I want a clear final video assembly contract,
So that multi-clip generation, stitching, music, and export can be implemented without guessing how the pieces should fit together.

**FRs implemented:** FR-8, FR-9

**Acceptance Criteria:**

**Given** a motion generation plan exists
**When** PartyFace prepares the final video path
**Then** it derives a final assembly plan with clip count, output format, aspect ratio, duration, audio mode, and export target
**And** the plan lists the expected generation, normalization, stitching, audio, and export steps
**And** the studio shows the assembly plan before real multi-clip execution is wired.

### Story 9.2: Submit Per-Beat Clip Generation Jobs

As a PartyFace creator,
I want PartyFace to generate one short clip for each story beat,
So that the final birthday video can have a real beginning, middle, and finale.

**FRs implemented:** FR-8, FR-10

**Acceptance Criteria:**

**Given** a ready setup with a motion plan
**When** final video generation starts
**Then** PartyFace submits one provider job per planned clip
**And** each provider job receives the beat-specific prompt, duration, and face references
**And** the job record tracks per-clip provider ids and statuses.

### Story 9.3: Preview Multi-Clip Progress

As a PartyFace creator,
I want to see each clip's progress,
So that a longer video generation process feels understandable and recoverable.

**FRs implemented:** FR-8, FR-11

**Acceptance Criteria:**

**Given** a final video job is running
**When** one or more beat clips have status updates or outputs
**Then** the UI shows per-clip queued, generating, complete, or failed states
**And** completed clips can be previewed before final stitching.

### Story 9.4: Stitch Clips with Music

As a PartyFace creator,
I want completed beat clips stitched with the selected music loop,
So that I receive one shareable birthday video card.

**FRs implemented:** FR-8, FR-9

**Acceptance Criteria:**

**Given** all beat clips are complete
**When** PartyFace assembles the final output
**Then** it creates one browser-playable MP4
**And** the selected audio strategy is applied or clearly deferred if no audio renderer is configured
**And** the output can be exported.

### Story 9.5: Final Video Demo Checkpoint

As a PartyFace builder,
I want to run the full final-video path,
So that I can judge whether PartyFace feels meaningfully better than the benchmark.

**FRs implemented:** FR-8, FR-9, FR-10, FR-11

**Acceptance Criteria:**

**Given** real per-beat generation and assembly are configured
**When** I run the demo checkpoint
**Then** PartyFace produces a 30-second MP4
**And** the demo-able moment for Epic 9 is: choose a story, generate beat clips, preview progress, stitch with music, export the finished birthday video, and compare it against JibJab-style output.
