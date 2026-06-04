---
title: "PartyFace PRD"
status: "draft"
created: "2026-05-31"
updated: "2026-05-31"
---

# PRD: PartyFace

## 0. Document Purpose

This PRD defines the first small-group validation version of PartyFace for the builder and close friends. It captures the product vision, target user, core journeys, MVP scope, requirements, success metrics, and open questions needed to guide front-end and ComfyUI workflow development. The PRD uses `[ASSUMPTION]` tags where the product direction has been inferred and should be confirmed before implementation planning.

Inputs:
- Inspiration video: `/Users/karengtrz/Downloads/BD47B50E-2BA4-4C28-9F3B-80B743F3C8B4.MOV`
- Inspiration image: `/Users/karengtrz/Downloads/FEA3C6D2-8911-4EE1-9F68-E8CE30F5DD77.png`
- Competitive benchmark: `https://www.jibjab.com`
- Competitive teardown: `competitive-teardown-jibjab.md`

## 1. Vision

PartyFace helps someone create a personalized birthday image and short birthday video starring real friends, using ComfyUI-backed generation to produce results that feel more premium, flexible, and delightful than rigid face-in-template products.

The product is inspired by receiving a fun birthday video that personalized specific people into a lively scene with music, but where the output quality and setup friction felt limited. PartyFace should preserve the fun of seeing familiar faces in an over-the-top birthday world while improving the quality bar with modern image and video generation.

For the first validation version, PartyFace is not trying to compete with JibJab's full template library. It is a focused creation workflow: upload face photos, choose or describe a birthday vibe, generate still and motion variants through ComfyUI, pick favorites, and export/share with friends.

## 2. Target User

### 2.1 Jobs To Be Done

- Create a personalized birthday surprise for a girlfriend, close friend, or family member.
- Turn a few face photos into a funny, high-quality party image or short video without learning ComfyUI.
- Generate multiple creative options instead of being stuck with one fixed template.
- Share an output that feels custom enough to be worth texting, posting, or showing at a party.
- Compare whether modern generative output feels more delightful than JibJab-style template output.

### 2.2 Non-Users (v1)

- Users who need a large catalog of polished templates for every holiday and occasion.
- Users who need professional commercial licensing, brand approvals, or production-grade campaign tooling.
- Users who want fully manual video editing controls.
- Users who are uncomfortable uploading face photos to a local/prototype AI workflow.

### 2.3 Key User Journeys

- **UJ-1. Karen makes a birthday surprise for her girlfriend.**
  - **Persona + context:** Karen has a few good photos and wants something more personal and polished than a generic birthday card.
  - **Entry state:** She opens the PartyFace web app on desktop [ASSUMPTION: desktop web is the first surface].
  - **Path:** She uploads Face Photos for up to two Subjects, enters recipient details such as name/age/tone, chooses a "disco glam birthday" vibe or writes a prompt, and requests both still and motion outputs.
  - **Climax:** PartyFace returns several still-card variants and a short video/animation option that visibly star the uploaded faces in a fun birthday scene.
  - **Resolution:** Karen picks the best output, downloads it, and sends it to the recipient.
  - **Edge case:** If a face upload is poor quality or no face is detected, PartyFace explains the issue and asks for a better photo instead of silently generating a bad result.

- **UJ-2. A small friend group tests whether PartyFace beats the benchmark.**
  - **Persona + context:** A friend group is comparing PartyFace outputs against the JibJab-style birthday video/image that inspired the product.
  - **Entry state:** The builder has a working prototype and a few photos from friends who consented to test.
  - **Path:** The builder creates a few prompt variations, generates still and motion options, and shows the outputs side-by-side with the benchmark.
  - **Climax:** Friends can clearly say which output feels more fun, higher quality, and more share-worthy.
  - **Resolution:** Feedback informs the next product cut: better face handling, better prompt controls, better video workflow, or better share/export.

## 3. Glossary

- **PartyFace** — The product and web app for creating personalized birthday stills and videos.
- **Face Photo** — A user-uploaded image containing a person whose face may be used in generated outputs.
- **Subject** — A person represented by a Face Photo in a PartyFace output.
- **Birthday Vibe** — A guided creative direction or user prompt, such as disco glam, luxury magazine cover, 90s music video, or superhero birthday.
- **Starter Template** — A supported birthday scene recipe that combines visual style, output type guidance, prompt defaults, and optional text framing. A Starter Template is customizable, not a fixed template rail.
- **Still Output** — A generated birthday image, card, or poster.
- **Motion Output** — A generated short animated card, video loop, or birthday video.
- **Variant** — One generated option for a Still Output or Motion Output.
- **ComfyUI Workflow** — The backend generation pipeline used to produce Still Outputs and Motion Outputs.
- **Benchmark Output** — A JibJab-style birthday video/image used to compare perceived quality and delight.

## 4. Features

### 4.1 Face Intake And Subject Setup

**Description:** The user uploads Face Photos for up to two Subjects. PartyFace should make this feel lightweight and intelligent: detect usable faces where possible, avoid asking for manual attributes unless necessary, and prepare the photos for generation. Realizes UJ-1 and UJ-2.

**Functional Requirements:**

#### FR-1: Upload Face Photos

The user can upload Face Photos for one or two Subjects from their device.

**Consequences (testable):**
- The app accepts common image formats supported by the browser.
- The app clearly presents two neutral Subject slots in v1, labeled Person 1 and Person 2 or equivalent.
- Uploaded Face Photos appear in the creation workflow before generation.
- The user can remove or replace a Face Photo before generating.

#### FR-2: Detect Face Usability

The system can identify whether an uploaded Face Photo is likely usable for generation [ASSUMPTION: v1 may use a simple local/browser-side check or ComfyUI workflow result rather than robust face detection].

**Consequences (testable):**
- If no face is likely usable, the user sees a clear message asking for another image.
- The user is not asked to manually select skin color in the happy path.
- The system preserves a way to retry with a better Face Photo.

### 4.2 Birthday Creative Setup

**Description:** The user provides enough occasion context and creative direction for PartyFace to generate personalized outputs. The workflow should support quick guided choices through Starter Templates, plus customization through prompt editing. Realizes UJ-1.

**Functional Requirements:**

#### FR-3: Capture Birthday Details

The user can enter birthday-specific details, including recipient name, age, message, and relationship/tone [ASSUMPTION: all fields are optional except enough text to produce a useful output].

**Consequences (testable):**
- The app can generate default text when fields are blank.
- Entered details can be included in prompts for Still Outputs and Motion Outputs.
- The user can edit details before regenerating.

#### FR-4: Select Or Write Birthday Vibe

The user can choose a guided Birthday Vibe or write a custom prompt.

**Consequences (testable):**
- The app offers at least three guided vibes for v1.
- The user can add freeform prompt text.
- The final generation prompt is visible or inspectable enough for iteration.

#### FR-5: Start From A Starter Template

The user can choose from 3-5 supported Starter Templates before generation.

**Consequences (testable):**
- Each Starter Template has a name, visual preview or description, default Birthday Vibe, and compatible Still Output and Motion Output guidance.
- Choosing a Starter Template pre-fills prompt/defaults without preventing further customization.
- The user can modify the prompt after choosing a Starter Template.

### 4.3 Still Output Generation

**Description:** PartyFace generates premium Still Outputs using ComfyUI. This is one of the two first-class MVP outputs, not merely a fallback for video. Realizes UJ-1 and UJ-2.

**Functional Requirements:**

#### FR-6: Generate Still Variants

The user can generate multiple Still Output Variants from selected Face Photos for one or two Subjects and a Birthday Vibe.

**Consequences (testable):**
- The app can request at least two Still Output Variants per generation run [ASSUMPTION: variant count may be limited by ComfyUI cost/time].
- Each Variant is visible in the app after generation completes.
- The user can select a favorite Still Output.

#### FR-7: Export Still Output

The user can download a selected Still Output.

**Consequences (testable):**
- Export produces an image file suitable for texting or posting.
- The file uses a readable default name.

### 4.4 Motion Output Generation

**Description:** PartyFace generates a short animated or video birthday greeting using ComfyUI. The first version should prioritize short, shareable motion over full video-editor flexibility. Realizes UJ-1 and UJ-2.

**Functional Requirements:**

#### FR-8: Generate Motion Variants

The user can generate at least one Motion Output from selected Face Photos for one or two Subjects and a Birthday Vibe.

**Consequences (testable):**
- The app can request a short Motion Output through a ComfyUI Workflow.
- The user can preview the Motion Output in the browser [ASSUMPTION: v1 output format is browser-playable MP4, GIF, or similar].
- The user sees progress or pending state while generation runs.

#### FR-9: Export Motion Output

The user can download a selected Motion Output.

**Consequences (testable):**
- Export produces a shareable video or animated file.
- The user can distinguish Still Output export from Motion Output export.

### 4.5 Iteration And Selection

**Description:** PartyFace differentiates from rigid template products by making iteration central. The user can adjust creative direction, regenerate, compare outputs, and pick winners. Realizes UJ-1 and UJ-2.

**Functional Requirements:**

#### FR-10: Regenerate With Prompt Changes

The user can adjust Birthday Vibe or prompt text and request new Variants without starting over.

**Consequences (testable):**
- Existing Face Photos and birthday details persist across regeneration.
- New Variants do not delete prior favorites unless the user chooses to clear them.

#### FR-11: Compare Favorites

The user can mark favorite Still Outputs and Motion Outputs for comparison.

**Consequences (testable):**
- The app visually distinguishes selected favorites.
- The user can keep at least one Still Output and one Motion Output as favorites.

## 5. Cross-Cutting NFRs

- **Privacy:** Face Photos should remain local or within the configured ComfyUI/Comfy Cloud workflow used by the builder; v1 must not introduce unrelated third-party storage [ASSUMPTION: prototype users are friends who consent to testing].
- **Clarity:** Generation states must be visible; users should not wonder whether the app is working.
- **Quality:** The app should bias toward fewer, better outputs over a large number of mediocre Variants.
- **Cost Awareness:** ComfyUI generation should expose enough metadata or UX friction to avoid accidental runaway generation.
- **Accessibility:** Core creation controls should be keyboard reachable and readable at desktop sizes.

## 6. Non-Goals (Explicit)

- Building a full JibJab-style template marketplace in v1.
- Supporting every holiday or occasion in v1.
- Building production-grade accounts, billing, or subscriptions in v1.
- Providing professional video editing controls in v1.
- Guaranteeing perfect face identity preservation for every uploaded photo in v1.
- Public launch readiness in v1.

## 7. MVP Scope

### 7.1 In Scope

- Desktop web prototype.
- Birthday occasion only.
- 3-5 supported Starter Templates, including disco/glam birthday.
- Customization from each Starter Template through prompt/detail editing.
- Upload Face Photos for up to two Subjects.
- Generate Still Outputs through ComfyUI.
- Generate short Motion Outputs through ComfyUI.
- Preview outputs in the app.
- Download selected still and motion outputs.
- Iterate by changing prompts/details and regenerating.
- Small-group comparison against JibJab-style Benchmark Outputs.

### 7.2 Out of Scope for MVP

- Public user accounts and authentication.
- Payments/subscriptions.
- Large template catalog.
- Native mobile app.
- Social publishing integrations.
- Full media library/history.
- Arbitrary multi-person scenes beyond two Subjects.
- Fine-grained timeline/video editing.
- Automated moderation or abuse prevention beyond small-group trusted use [NOTE FOR PM: revisit before public launch].

## 8. Success Metrics

**Primary**

- **SM-1:** Friend preference — at least 3 of 5 small-group testers prefer a PartyFace Still Output or Motion Output over the Benchmark Output for quality and share-worthiness. Validates FR-6, FR-8, FR-10.
- **SM-2:** Creation success — the builder can create one usable Still Output and one usable Motion Output for a real birthday recipient in a single session. Validates FR-1 through FR-9.

**Secondary**

- **SM-3:** Iteration usefulness — at least one regenerated Variant is judged meaningfully better than the first result during a test session. Validates FR-10.
- **SM-4:** Setup friction — tester feedback does not identify manual face setup as the main pain point. Validates FR-1 and FR-2.
- **SM-5:** Template usefulness — at least 3 of 5 testers say Starter Templates made it easier to begin without blocking customization. Validates FR-5.

**Counter-metrics**

- **SM-C1:** Do not optimize for number of templates. A larger catalog is not success if output quality and iteration quality remain weak.
- **SM-C2:** Do not optimize for unlimited generation. More Variants are not success if generation becomes confusing, slow, or expensive.

## 9. Open Questions

1. What exact ComfyUI workflows should produce the first Still Output and Motion Output?
2. What is the best two-Subject setup UX: recipient + friend, birthday person + sender, or generic Subject A/B?
3. What output length is enough for the first Motion Output: 3 seconds, 5 seconds, 10 seconds, or longer?
4. Should text be rendered by the generation model, overlaid by the front end, or both?
5. How much face detection/prep should happen in the browser versus in ComfyUI?
6. Which 3-5 Starter Templates should ship in the first validation build?
7. What does "good enough identity preservation" mean for the small-group test?
8. Should PartyFace save generation history locally for the prototype?

## 10. Assumptions Index

- Desktop web is the first surface.
- V1 supports up to two Subjects.
- Subject slots are neutral rather than relationship-specific.
- Face usability detection may be simple in v1.
- Birthday detail fields are optional except enough input to produce a useful output.
- Still variant count may be limited by ComfyUI cost/time.
- Motion output format is browser-playable MP4, GIF, or similar.
- Prototype users are friends who consent to testing.
