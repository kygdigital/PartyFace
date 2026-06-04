---
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
  - 5
  - 6
  - 7
  - 8
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-PartyFace-2026-05-31/prd.md
  - _bmad-output/planning-artifacts/ux-designs/ux-PartyFace-2026-05-31/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-PartyFace-2026-05-31/EXPERIENCE.md
workflowType: 'architecture'
project_name: 'PartyFace'
user_name: 'Karengtrz'
date: '2026-05-31'
lastStep: 8
status: 'complete'
completedAt: '2026-05-31'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Step 1: Initialization

Architecture workspace initialized for PartyFace.

### Input Documents Loaded

- PRD: `_bmad-output/planning-artifacts/prds/prd-PartyFace-2026-05-31/prd.md`
- UX Design: `_bmad-output/planning-artifacts/ux-designs/ux-PartyFace-2026-05-31/DESIGN.md`
- UX Experience: `_bmad-output/planning-artifacts/ux-designs/ux-PartyFace-2026-05-31/EXPERIENCE.md`

### Input Documents Not Found

- Product brief: none
- Research documents: none
- Project context: none

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
PartyFace requires a desktop-web creation studio that supports two neutral Subject slots, Face Photo upload, basic usability feedback, birthday detail capture, Starter Template selection, editable prompt composition, still generation, motion generation, favorites, iteration, and export. The requirements cluster around one main user workflow rather than many independent modules.

**Non-Functional Requirements:**
The architecture must make generation state visible, avoid unrelated third-party storage, keep face handling deliberate, prevent accidental runaway generation, and remain accessible/readable on desktop. Since this is a small-group validation MVP, production-scale auth, billing, moderation, and multi-tenant storage are not required.

**Scale & Complexity:**

- Primary domain: desktop web app with backend generation orchestration.
- Complexity level: medium prototype.
- Estimated architectural components: web UI, local/project state model, upload/media handling, ComfyUI integration layer, job status/result model, export/download layer.

### Technical Constraints & Dependencies

- ComfyUI/Comfy Cloud is the core generation backend for Still Outputs and Motion Outputs.
- Existing repo has a static HTML/CSS/JS prototype; architecture must decide whether to preserve or migrate it.
- `COMFY_API_KEY` exists locally and was previously fixed for upload workflows, but client-side exposure must be avoided if the app calls Comfy APIs directly.
- Still and Motion workflows should share setup state but may use separate ComfyUI workflows/models.
- V1 should support local/small-group use before public infrastructure.
- Each epic should end with a demo-able moment that the user can open, click through, and review before proceeding.

### Cross-Cutting Concerns Identified

- Face photo privacy and upload boundaries.
- Async job progress and failure handling.
- Prompt/template composition consistency.
- Variant/favorite state management.
- Export/download for image and motion media.
- Cost/runaway generation guardrails.
- Accessibility and desktop usability.

## Starter Template Evaluation

### Primary Technology Domain

PartyFace is a desktop-web application with backend generation orchestration. The frontend needs a rich guided studio UI, while the backend boundary must protect ComfyUI credentials and manage upload/job/result flows.

### Starter Options Considered

**Static HTML/CSS/JS**

- Pros: current prototype already exists; fastest for local UI sketching.
- Cons: weak fit for ComfyUI integration because browser code must not expose `COMFY_API_KEY`; async job orchestration becomes awkward without a backend.

**Vite React TypeScript**

- Pros: lightweight, fast, excellent for client-heavy apps.
- Cons: still requires a separate backend/serverless layer for ComfyUI key protection, uploads, job polling, and output proxying.

**Next.js App Router**

- Pros: combines frontend and backend route handlers in one project; protects server-side environment variables; supports TypeScript, Tailwind, and a single local dev server for UI plus API routes.
- Cons: more framework surface than a static prototype, but justified by the ComfyUI integration boundary.

### Selected Starter: Next.js App Router + TypeScript + Tailwind

**Rationale for Selection:**
Next.js App Router best fits the PartyFace MVP because the product is a web creative studio with server-side generation orchestration. API route handlers can own ComfyUI uploads, job submission, polling, and output download/proxy behavior without exposing secrets in the browser. TypeScript helps model project setup, people, templates, variants, jobs, favorites, and exports. Tailwind maps cleanly to the PartyFace `DESIGN.md` token direction.

**Initialization Command:**

```bash
npx create-next-app@latest partyface-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Because this repo is not empty, implementation should either scaffold in a temporary directory and merge into the repo, or manually add the equivalent Next.js structure in place.

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
TypeScript, React, and Node.js-compatible route handlers.

**Styling Solution:**
Tailwind CSS, with PartyFace design tokens mapped into Tailwind theme variables or CSS custom properties.

**Build Tooling:**
Next.js dev/build tooling with App Router.

**Testing Framework:**
Not included by default; add Playwright and/or Vitest when implementation stories require test coverage.

**Code Organization:**
`src/app` for pages and route handlers, `src/components` for UI, `src/lib` for project state and generation logic, and `src/app/api` for ComfyUI backend endpoints.

**Development Experience:**
Single dev server for frontend and backend route handlers, hot reload, TypeScript checks, and ESLint.

**Note:** Project initialization/migration to Next.js should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Use Next.js App Router + TypeScript + Tailwind as the app foundation.
- Keep ComfyUI credentials and generation calls server-side only.
- Model PartyFace as a local prototype project/session, not a multi-user SaaS.
- Represent generation as asynchronous jobs with explicit states.
- Keep Still and Motion generation as separate workflows sharing one setup state.

**Important Decisions (Shape Architecture):**
- Use Zod for request/body/env validation.
- Use local in-memory/session state first; defer database persistence.
- Use a typed domain model for Project, Subject, StarterTemplate, GenerationJob, Variant, and Favorite.
- Keep exports as downloadable files/URLs produced by generation route handlers.
- Use Tailwind tokens/CSS variables based on DESIGN.md.

**Deferred Decisions (Post-MVP):**
- Authentication and user accounts.
- Database-backed media library/history.
- Billing/subscription system.
- Public deployment and abuse prevention.
- Social publishing integrations.

### Data Architecture

**Decision:** No database for v1. Use client-side project state plus server-side ephemeral job handling.

**Rationale:** PartyFace is a small-group validation prototype. The core question is whether the creation workflow and ComfyUI outputs feel compelling, not whether users can return to old projects.

**Domain Types:**
- `PartyFaceProject`
- `Subject`
- `FacePhoto`
- `StarterTemplate`
- `BirthdayDetails`
- `PromptState`
- `GenerationJob`
- `Variant`
- `Favorite`

**Validation:** Use Zod 4 schemas for API requests, env validation, and generation job payloads.

### Authentication & Security

**Decision:** No auth for local/small-group MVP. Protect ComfyUI credentials by keeping them server-side in Next.js route handlers.

**Rationale:** Public user accounts are out of scope. The real security boundary is preventing `COMFY_API_KEY` from being exposed in browser code.

**API Security Strategy:**
- Read `COMFY_API_KEY` only from server environment.
- Browser calls PartyFace API routes, not Comfy Cloud directly.
- Do not store uploaded Face Photos with unrelated third-party services.
- Add basic request-size/type checks for uploads.
- Add generation guardrails to prevent accidental repeated job submission.

### API & Communication Patterns

**Decision:** Use internal REST-style Next.js route handlers for the app backend.

**Initial Routes:**
- `POST /api/uploads/face` - validate and prepare/upload a Face Photo.
- `POST /api/generate/still` - start still generation.
- `POST /api/generate/motion` - start motion generation.
- `GET /api/jobs/:id` - poll generation status.
- `GET /api/results/:id` - retrieve/download result metadata or proxied output.

**Generation Model:**
- Route handlers submit work to ComfyUI/Comfy Cloud.
- Browser receives a PartyFace job id and polls for status.
- Job states: `idle`, `uploading`, `ready`, `queued`, `generating`, `complete`, `failed`.
- Still and Motion jobs share project setup payloads but use separate workflow adapters.

**Error Handling:**
- API errors return structured JSON: `{ error: { code, message, recoverable } }`.
- UI maps errors to plain-language recovery messages.

### Frontend Architecture

**Decision:** Build a single Creation Studio page using React components and local state.

**Component Structure:**
- `CreationStudio`
- `StarterTemplatePicker`
- `PersonSlots`
- `BirthdayDetailsForm`
- `PromptEditor`
- `OutputTrack`
- `VariantCard`
- `FavoriteBar`
- `GenerationStatus`

**State Management:**
- Use React local state/reducer first.
- Avoid global state libraries for MVP unless state becomes painful.
- Keep setup state shared by Still and Motion tracks.
- Keep generated variants/favorites in page state for v1.

**Styling:**
- Tailwind CSS with PartyFace design tokens mapped from `DESIGN.md`.
- Generated media should be visually dominant; UI chrome should support the creative workflow.

### Infrastructure & Deployment

**Decision:** Local development and demo-first. Use `npm run dev` for prototype review.

**Rationale:** The MVP is for builder/friends validation. Public deployment can wait until the output/workflow is proven.

**Environment Configuration:**
- `.env.local` stores `COMFY_API_KEY`.
- Server validates required env before generation routes run.
- Example env file should document required variables without secrets.

**Monitoring/Logging:**
- Console/server logs are acceptable for local MVP.
- Log job lifecycle events enough to debug upload/generation failures.
- Do not log raw secrets.

### Decision Impact Analysis

**Implementation Sequence:**
1. Scaffold/migrate to Next.js + TypeScript + Tailwind.
2. Implement typed project/session state and Starter Templates.
3. Implement two-person setup and prompt composition.
4. Add server route layer with env validation.
5. Add still generation route and job polling.
6. Add motion generation route and preview handling.
7. Add favorites/export and demo checkpoints.

**Cross-Component Dependencies:**
- Starter Templates feed prompt composition and generation payloads.
- Person Slots feed upload/media handling and generation payloads.
- Still and Motion tracks share setup state but call different workflow adapters.
- Export depends on completed Variant records.
- Favorites depend on Variant identity and output type.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
The main conflict risks are API response shapes, job state names, domain type names, component placement, upload handling, error handling, and whether generation state lives in UI-only state or server job records.

### Naming Patterns

**Database Naming Conventions:**
No database in v1. If persistence is later added, use lowercase plural table names and camelCase TypeScript fields mapped deliberately at the boundary.

**API Naming Conventions:**
- Use REST-style route handlers under `src/app/api`.
- Use plural resource names where applicable.
- Use kebab-case only for static URL segments if needed; prefer simple nouns.
- Use camelCase JSON fields.

Examples:
- `POST /api/uploads/face`
- `POST /api/generate/still`
- `POST /api/generate/motion`
- `GET /api/jobs/[jobId]`
- `GET /api/results/[resultId]`

**Code Naming Conventions:**
- React components: `PascalCase`, e.g. `StarterTemplatePicker.tsx`.
- Hooks: `useCamelCase`, e.g. `usePartyFaceProject.ts`.
- Domain types: `PascalCase`, e.g. `GenerationJob`.
- Functions/variables: `camelCase`, e.g. `composePrompt`.
- Constants: `SCREAMING_SNAKE_CASE` only for true constants; otherwise named exports.

### Structure Patterns

**Project Organization:**
- `src/app` for Next.js pages/layout/API routes.
- `src/components` for reusable UI components.
- `src/features/studio` for Creation Studio feature components and state.
- `src/lib/domain` for shared types and schemas.
- `src/lib/templates` for Starter Template definitions.
- `src/lib/comfy` for ComfyUI adapters and workflow builders.
- `src/lib/api` for API response helpers.
- `src/styles` only if global style helpers outgrow `globals.css`.

**Test Placement:**
- Co-locate component/unit tests next to source files when added.
- E2E tests live under `tests/e2e`.

### Format Patterns

**API Response Formats:**
All API routes return one of:

```ts
type ApiSuccess<T> = { ok: true; data: T };
type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
    recoverable: boolean;
  };
};
```

**Data Exchange Formats:**
- JSON fields use camelCase.
- Dates use ISO 8601 strings.
- Job/output ids are opaque strings.
- Missing optional values use `null` only when meaningful; otherwise omit.

### Communication Patterns

**Generation Job State:**
Use exactly these job states:

```ts
type GenerationJobStatus =
  | "idle"
  | "uploading"
  | "ready"
  | "queued"
  | "generating"
  | "complete"
  | "failed";
```

**State Management Patterns:**
- Use a reducer for Creation Studio state once it spans templates, people, prompt, outputs, and favorites.
- State updates must be immutable.
- Still and Motion outputs share setup state but maintain separate output tracks.
- Favorites reference `variantId`, not array index.

### Process Patterns

**Error Handling Patterns:**
- Server logs technical details.
- API returns structured recoverable errors.
- UI renders plain-language recovery copy near the affected control.
- Do not expose raw ComfyUI error dumps directly to users.

**Loading State Patterns:**
- Generation buttons become disabled while the matching track is active.
- Still and Motion loading states are independent.
- Failed jobs preserve setup inputs and existing favorites.
- Regeneration appends new variants unless the user explicitly clears results.

### Enforcement Guidelines

**All AI Agents MUST:**

- Keep `COMFY_API_KEY` server-side only.
- Use the shared API response wrapper.
- Use the shared `GenerationJobStatus` union exactly.
- Add new generation integrations under `src/lib/comfy`.
- Add new UI for the studio under `src/features/studio`.
- Preserve demo-able moments at the end of each epic.
- Prefer small typed modules over one large app file.

**Pattern Enforcement:**

- TypeScript types and Zod schemas are the first enforcement layer.
- Build/lint checks must pass before considering an implementation story complete.
- Story acceptance criteria must include the demo-able moment for that epic.

### Pattern Examples

**Good Examples:**
- `src/features/studio/components/PersonSlots.tsx`
- `src/lib/domain/generation.ts`
- `src/lib/comfy/stillWorkflow.ts`
- `{ ok: false, error: { code: "FACE_UNUSABLE", message: "Try a clearer face photo.", recoverable: true } }`

**Anti-Patterns:**
- Calling Comfy Cloud directly from React components.
- Storing secrets in client-side environment variables.
- Using `status: "done"` in one route and `status: "complete"` in another.
- Index-based favorites like `favoriteStillIndex = 0`.
- Replacing all old variants every time the user regenerates.

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
PartyFace/
├── README.md
├── package.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── tsconfig.json
├── .env.example
├── .env.local
├── public/
│   ├── templates/
│   │   ├── disco-glam.png
│   │   ├── luxury-cover.png
│   │   ├── music-video.png
│   │   ├── superhero-duo.png
│   │   └── red-carpet.png
│   └── samples/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── api/
│   │       ├── uploads/
│   │       │   └── face/
│   │       │       └── route.ts
│   │       ├── generate/
│   │       │   ├── still/
│   │       │   │   └── route.ts
│   │       │   └── motion/
│   │       │       └── route.ts
│   │       ├── jobs/
│   │       │   └── [jobId]/
│   │       │       └── route.ts
│   │       └── results/
│   │           └── [resultId]/
│   │               └── route.ts
│   ├── components/
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Field.tsx
│   │       ├── StatusBadge.tsx
│   │       └── MediaCard.tsx
│   ├── features/
│   │   └── studio/
│   │       ├── CreationStudio.tsx
│   │       ├── studioReducer.ts
│   │       ├── studioTypes.ts
│   │       ├── components/
│   │       │   ├── StarterTemplatePicker.tsx
│   │       │   ├── PersonSlots.tsx
│   │       │   ├── BirthdayDetailsForm.tsx
│   │       │   ├── PromptEditor.tsx
│   │       │   ├── OutputTrack.tsx
│   │       │   ├── VariantCard.tsx
│   │       │   ├── FavoriteBar.tsx
│   │       │   └── GenerationStatus.tsx
│   │       └── hooks/
│   │           └── usePartyFaceProject.ts
│   ├── lib/
│   │   ├── api/
│   │   │   ├── responses.ts
│   │   │   └── errors.ts
│   │   ├── comfy/
│   │   │   ├── client.ts
│   │   │   ├── uploads.ts
│   │   │   ├── jobs.ts
│   │   │   ├── stillWorkflow.ts
│   │   │   ├── motionWorkflow.ts
│   │   │   └── workflowTypes.ts
│   │   ├── domain/
│   │   │   ├── project.ts
│   │   │   ├── subjects.ts
│   │   │   ├── generation.ts
│   │   │   └── schemas.ts
│   │   ├── templates/
│   │   │   ├── starterTemplates.ts
│   │   │   └── promptComposer.ts
│   │   └── env.ts
│   └── styles/
│       └── tokens.css
├── tests/
│   └── e2e/
│       └── studio.spec.ts
└── _bmad-output/
```

### Architectural Boundaries

**API Boundaries:**
- Browser code never calls Comfy Cloud directly.
- Browser calls `src/app/api/**` route handlers.
- API route handlers validate inputs with Zod and return the shared `{ ok, data/error }` response shape.
- `src/lib/comfy/**` is the only layer allowed to know Comfy Cloud request details.

**Component Boundaries:**
- `src/features/studio` owns the PartyFace creation workflow.
- `src/components/ui` contains reusable visual primitives only.
- Studio components receive typed props and dispatch reducer actions; they do not call Comfy APIs directly.

**Service Boundaries:**
- `src/lib/templates` owns Starter Template definitions and prompt composition.
- `src/lib/domain` owns shared TypeScript types and Zod schemas.
- `src/lib/comfy` owns upload, job, still workflow, and motion workflow adapters.

**Data Boundaries:**
- V1 state lives in React state/reducer and server ephemeral job handling.
- No database layer in MVP.
- Completed outputs are represented as `Variant` records with `variantId`, `outputType`, status, preview/download URLs, and favorite state.

### Requirements to Structure Mapping

**Epic 1: Create a Guided Birthday Project**
- `src/features/studio/CreationStudio.tsx`
- `src/features/studio/components/StarterTemplatePicker.tsx`
- `src/features/studio/components/PersonSlots.tsx`
- `src/features/studio/components/BirthdayDetailsForm.tsx`
- `src/features/studio/components/PromptEditor.tsx`
- `src/lib/templates/starterTemplates.ts`
- `src/lib/templates/promptComposer.ts`
- `src/lib/domain/project.ts`
- `src/lib/domain/subjects.ts`

**Epic 2: Generate and Review Still Birthday Outputs**
- `src/app/api/generate/still/route.ts`
- `src/app/api/jobs/[jobId]/route.ts`
- `src/lib/comfy/stillWorkflow.ts`
- `src/lib/comfy/jobs.ts`
- `src/features/studio/components/OutputTrack.tsx`
- `src/features/studio/components/VariantCard.tsx`
- `src/features/studio/components/GenerationStatus.tsx`

**Epic 3: Generate and Review Motion Birthday Outputs**
- `src/app/api/generate/motion/route.ts`
- `src/app/api/jobs/[jobId]/route.ts`
- `src/lib/comfy/motionWorkflow.ts`
- `src/lib/comfy/jobs.ts`
- `src/features/studio/components/OutputTrack.tsx`
- `src/features/studio/components/VariantCard.tsx`
- `src/features/studio/components/GenerationStatus.tsx`

**Epic 4: Export and Compare Shareable Results**
- `src/app/api/results/[resultId]/route.ts`
- `src/features/studio/components/FavoriteBar.tsx`
- `src/features/studio/components/VariantCard.tsx`
- `src/lib/domain/generation.ts`

### Integration Points

**Internal Communication:**
- UI dispatches reducer actions for setup, prompt, output, and favorite changes.
- UI starts generation by calling API routes.
- API routes call `src/lib/comfy` adapters.
- UI polls `GET /api/jobs/[jobId]` until complete or failed.

**External Integrations:**
- ComfyUI/Comfy Cloud via server-side adapter layer.
- Local filesystem/download behavior through browser downloads and proxied result URLs.

**Data Flow:**
1. User picks Starter Template.
2. User adds Person 1/Person 2 Face Photos.
3. User enters birthday details and edits prompt.
4. UI submits setup payload to still or motion API.
5. API validates payload and starts ComfyUI job.
6. UI polls job status.
7. Complete job returns Variant metadata.
8. User favorites and exports selected Variant.

### File Organization Patterns

**Configuration Files:**
- Root-level Next.js, TypeScript, ESLint, PostCSS, env example.
- Secrets live only in `.env.local`; `.env.example` documents names without values.

**Source Organization:**
- Route handlers under `src/app/api`.
- Studio feature code under `src/features/studio`.
- Comfy integration under `src/lib/comfy`.
- Domain schemas/types under `src/lib/domain`.

**Test Organization:**
- E2E tests under `tests/e2e`.
- Component/unit tests may be co-located when added.

**Asset Organization:**
- Template previews live under `public/templates`.
- Sample media for demos lives under `public/samples`.

### Development Workflow Integration

**Development Server Structure:**
- Use `npm run dev`.
- App runs as one Next.js server with UI and API route handlers.

**Build Process Structure:**
- `npm run build` validates Next.js production build.
- TypeScript and lint checks should pass before completing implementation stories.

**Deployment Structure:**
- Local-first MVP.
- Public deployment deferred until generation workflow and quality are validated.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
The selected stack and patterns are compatible. Next.js App Router provides the server boundary needed for ComfyUI credentials, while React/Tailwind supports the hybrid guided studio UX. Zod validation complements TypeScript and route handlers.

**Pattern Consistency:**
The implementation patterns support the architectural decisions. API response wrappers, job status names, domain model names, and route boundaries are defined consistently.

**Structure Alignment:**
The project structure maps cleanly to the architecture. UI code lives under `src/features/studio`, shared UI under `src/components/ui`, Comfy integrations under `src/lib/comfy`, domain schemas under `src/lib/domain`, and API boundaries under `src/app/api`.

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**
All four epics are architecturally supported:
- Epic 1 maps to studio setup, templates, prompt composition, and subject components.
- Epic 2 maps to still generation route, Comfy still adapter, job polling, and output components.
- Epic 3 maps to motion generation route, Comfy motion adapter, job polling, and preview components.
- Epic 4 maps to results route, favorites, exports, and comparison-ready output components.

**Functional Requirements Coverage:**
All FRs have architectural support through the defined frontend components, domain types, API routes, and Comfy integration layer.

**Non-Functional Requirements Coverage:**
Privacy, clarity, quality, cost awareness, accessibility, and prototype scope are addressed through server-side credential handling, explicit job states, generation guardrails, UI state patterns, and deferred production infrastructure.

### Implementation Readiness Validation ✅

**Decision Completeness:**
Critical decisions are documented: framework, server boundary, data persistence, ComfyUI integration shape, async job model, validation, styling, and deployment posture.

**Structure Completeness:**
The project tree is complete enough for implementation. It specifies root config, app routes, API handlers, studio components, domain types, Comfy adapters, templates, styles, assets, and tests.

**Pattern Completeness:**
Naming, API response format, job status format, state management, error handling, loading states, and enforcement guidelines are defined.

### Gap Analysis Results

**Critical Gaps:**
None for Epic 1 implementation.

**Important Gaps:**
- Exact ComfyUI still workflow is not finalized.
- Exact ComfyUI motion workflow is not finalized.
- Result persistence strategy is intentionally ephemeral for MVP; this may need revision if testing spans multiple sessions.

**Nice-to-Have Gaps:**
- Add Playwright once the Next.js app exists.
- Add mock Comfy mode for demo-able UI progress before real generation is stable.
- Add sample template preview assets.

### Validation Issues Addressed

No contradictions found. The open ComfyUI workflow details are acknowledged as later implementation decisions for Epic 2 and Epic 3, not blockers for Epic 1.

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High for Epic 1, medium for Epic 2/3 until exact ComfyUI workflows are selected.

**Key Strengths:**
- Clear server-side generation boundary.
- Explicit state/job model.
- Demo-able epic constraint captured.
- Project structure maps directly to PRD, UX, and epics.

**Areas for Future Enhancement:**
- Persistent history/media library.
- Auth and deployment.
- Public-use privacy/abuse controls.
- Formal workflow registry for multiple ComfyUI pipelines.

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented.
- Use implementation patterns consistently across all components.
- Respect project structure and boundaries.
- Refer to this document for architectural questions.

**First Implementation Priority:**
Scaffold/migrate the repo to Next.js App Router + TypeScript + Tailwind, then implement Epic 1's demo-able guided Creation Studio.
