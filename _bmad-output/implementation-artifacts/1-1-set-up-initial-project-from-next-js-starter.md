# Story 1.1: Set Up Initial Project from Next.js Starter

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a PartyFace creator,
I want the app to run as a Next.js guided studio,
so that the product has a secure backend boundary and a demo-able web foundation.

## Acceptance Criteria

1. Given the current static prototype exists, when the project is migrated or scaffolded to Next.js App Router + TypeScript + Tailwind, then `npm run dev` serves the PartyFace app locally.
2. The first screen renders a disco-glam Creation Studio shell.
3. The project includes the architecture-defined folders for `src/app`, `src/features/studio`, `src/lib/domain`, `src/lib/templates`, `src/lib/api`, and `src/lib/comfy`.
4. `COMFY_API_KEY` is documented in `.env.example` but not exposed to browser code.
5. The setup follows the architecture's selected starter approach for a non-empty repo.
6. The existing static prototype intent is preserved or intentionally superseded.
7. Local verification commands for build and lint/type checks are present and pass, or any unavailable command is documented with a concrete reason.

## Tasks / Subtasks

- [x] Scaffold or migrate the repo to a Next.js App Router project in place. (AC: 1, 5)
  - [x] Use TypeScript, Tailwind CSS, ESLint, App Router, `src/` directory, npm, and `@/*` import alias.
  - [x] Avoid creating a nested app folder as the long-term project root; if a temporary scaffold is used, merge the relevant files into this repo root.
  - [x] Preserve or archive the current static prototype files deliberately; do not silently delete their intent.
- [x] Add the required root configuration and scripts. (AC: 1, 7)
  - [x] Create/update `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, and Next/Tailwind global CSS files as needed.
  - [x] Ensure `npm run dev` starts the app.
  - [x] Ensure `npm run build` and the configured lint/type verification command pass before marking the story complete.
- [x] Create the architecture-defined source folders. (AC: 3)
  - [x] Add `src/app`, `src/features/studio`, `src/lib/domain`, `src/lib/templates`, `src/lib/api`, `src/lib/comfy`, `src/components/ui`, and `src/styles` if not already created by the scaffold.
  - [x] Add minimal placeholder/index files only where useful to keep folders meaningful; avoid large empty abstractions.
- [x] Build the first-screen Creation Studio shell. (AC: 2, 6)
  - [x] Render `src/app/page.tsx` through a `CreationStudio` component in `src/features/studio/CreationStudio.tsx`.
  - [x] Include visible sections for Starter Templates, People, Birthday Details, Prompt, Still Output, Motion Output, and Favorites/Compare, but keep detailed interactions for later stories.
  - [x] Apply the disco-glam design direction using the PartyFace tokens from UX docs.
- [x] Add environment documentation without secrets. (AC: 4)
  - [x] Create `.env.example` with `COMFY_API_KEY=` and any comments needed for local setup.
  - [x] Confirm no `NEXT_PUBLIC_COMFY_API_KEY` or client-side Comfy secret reference is introduced.
  - [x] Add or update `.gitignore` so `.env.local` remains untracked.
- [x] Update project documentation. (AC: 1, 6, 7)
  - [x] Update `README.md` from static-prototype instructions to Next.js local development instructions.
  - [x] Mention the old static prototype only as historical/reference context if it remains in the repo.

## Dev Notes

### Source Story Context

This is the first implementation story for Epic 1, "Create a Guided Birthday Project." It establishes the project foundation required by the remaining Epic 1 stories:

- Story 1.2 will add the Starter Template picker and real template definitions.
- Story 1.3 will add two neutral Person slots and upload handling.
- Story 1.4 will add Face Photo usability feedback.
- Story 1.5 will add birthday details and prompt composition.
- Story 1.6 will wire the ready-to-generate demo checkpoint.

Do not implement the full Epic 1 workflow in this story. Build a credible shell and the correct architecture surface so later stories have stable places to land.

### Existing Prototype State

Current repo files before this story:

- `index.html`, `styles.css`, and `app.js` implement a dependency-free canvas birthday-card studio.
- Current prototype behavior includes card text editing, template swatches, multi-face uploads, circular face cutouts, scale/rotation controls, prompt copy, and PNG download.
- `README.md` currently documents opening `index.html` or serving the folder with `python3 -m http.server 5173`.

Implementation may replace the static first screen with Next.js, but preserve the product intent: a birthday creation studio, not a marketing landing page. If the old static files remain, ensure they do not conflict with Next.js routing/build behavior.

### Architecture Requirements

Follow these architecture decisions:

- Stack: Next.js App Router + TypeScript + Tailwind.
- Backend boundary: browser code must call PartyFace route handlers, not Comfy Cloud directly.
- Secrets: `COMFY_API_KEY` is server-side only and belongs in `.env.local`, with only a blank documented key in `.env.example`.
- V1 persistence: no database; use local/client state and server-side ephemeral job handling in later stories.
- Styling: map PartyFace design tokens into Tailwind/CSS variables.
- Component placement:
  - `src/app` for app routes/pages/layout/global CSS.
  - `src/features/studio` for Creation Studio feature code.
  - `src/components/ui` for reusable UI primitives.
  - `src/lib/domain` for shared types/schemas.
  - `src/lib/templates` for template definitions and prompt composition.
  - `src/lib/api` for response helpers.
  - `src/lib/comfy` for ComfyUI integration.

Use these exact future-facing route and model conventions when creating placeholders or docs:

- API routes will live under `src/app/api`.
- Future routes include `POST /api/uploads/face`, `POST /api/generate/still`, `POST /api/generate/motion`, `GET /api/jobs/[jobId]`, and `GET /api/results/[resultId]`.
- Future API responses use `{ ok: true, data }` or `{ ok: false, error: { code, message, recoverable } }`.
- Future generation statuses are exactly: `idle`, `uploading`, `ready`, `queued`, `generating`, `complete`, `failed`.

### UX Requirements

The first screen must be a usable app surface, not a landing page. Create a hybrid guided studio shell with:

- Starter Templates first for discovery.
- People section with Person 1 and Person 2 language visible.
- Birthday Details section.
- Prompt section with visible editability implied.
- Separate Still Output and Motion Output tracks.
- Favorites/Compare area.

Visual direction:

- Disco/glam, playful, polished creative studio.
- Use the PartyFace palette: ink `#211820`, surface `#FFF7FB`, surface raised `#FFFFFF`, surface night `#1A1028`, line `#E9D7E6`, muted `#766879`, neon pink `#FF3DA7`, disco gold `#FFC857`, violet `#7C3AED`, electric blue `#2DD4FF`.
- Avoid a corporate SaaS dashboard, beige craft-paper dominance, all-purple gradient dominance, or a generic AI prompt box.
- Keep cards compact with 8px-ish radius. Do not nest cards inside cards.
- Text must stay readable; avoid text over busy previews without overlays.

Accessibility floor:

- Core controls and navigation targets should be keyboard reachable.
- Inputs/sections need visible labels or headings.
- Selected/status states must not rely on color alone in future stories.

### Latest Technical Notes

Official Next.js docs state `create-next-app` supports TypeScript, Tailwind, ESLint, App Router, `src/`, import alias, and npm flags. The current CLI docs also note recommended defaults include TypeScript, ESLint, Tailwind, App Router, and agent guidance. Use the architecture command as the baseline, but adapt safely for a non-empty repo:

```bash
npx create-next-app@latest partyface-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

React official docs list React 19.2 as the latest major/minor documentation target as of this story creation. Let `create-next-app@latest` select compatible Next/React versions unless there is a concrete installation conflict.

Tailwind's official Next.js installation guide remains the source of truth for the generated Tailwind/PostCSS wiring. Do not invent a custom Tailwind setup if the Next scaffold already provides one.

Sources:
- Next.js create-next-app CLI: https://nextjs.org/docs/pages/api-reference/cli/create-next-app
- React versions: https://react.dev/versions
- Tailwind with Next.js: https://tailwindcss.com/docs/installation/framework-guides/nextjs

### Testing Requirements

Before marking this story complete, run and record:

- `npm run build`
- The configured lint command, normally `npm run lint` if generated by the scaffold.
- If the scaffold uses a combined check or no lint script is generated, document the actual verification command and result.

Manual verification:

- `npm run dev` starts a local Next.js server.
- The browser first screen shows the PartyFace Creation Studio shell.
- No browser-visible code references `COMFY_API_KEY`.

### Project Structure Notes

Expected after this story:

```text
src/
  app/
    globals.css
    layout.tsx
    page.tsx
  components/
    ui/
  features/
    studio/
      CreationStudio.tsx
  lib/
    api/
    comfy/
    domain/
    templates/
  styles/
    tokens.css
```

Avoid adding Comfy workflow implementation in this story. `src/lib/comfy` may contain a placeholder/readme or remain minimal until Stories 2.1 and 3.1.

### References

- Epic/story source: `_bmad-output/planning-artifacts/epics.md` section "Story 1.1: Set Up Initial Project from Next.js Starter"
- Architecture source: `_bmad-output/planning-artifacts/architecture.md` sections "Selected Starter", "Implementation Patterns & Consistency Rules", and "Project Structure & Boundaries"
- UX source: `_bmad-output/planning-artifacts/ux-designs/ux-PartyFace-2026-05-31/DESIGN.md`
- UX behavior source: `_bmad-output/planning-artifacts/ux-designs/ux-PartyFace-2026-05-31/EXPERIENCE.md`
- Readiness source: `_bmad-output/planning-artifacts/implementation-readiness-report-2026-05-31.md`

## Dev Agent Record

### Agent Model Used

Codex GPT-5.

### Debug Log References

- `npm run lint` passed.
- `npm run build` initially hit a sandbox-level Turbopack process/port permission error, then passed when rerun outside the sandbox.
- `npm run dev` started successfully on `http://localhost:3001` because port 3000 was already occupied.
- Local HTTP check returned `200 OK` and rendered the PartyFace Creation Studio shell.
- Code review found no blocking issues.
- Final `npm run lint` and `npm run build` passed after README/BYOLOMAD updates.

### Completion Notes List

- Story context created by BMAD create-story workflow.
- Migrated the repo to a root-level Next.js App Router + TypeScript + Tailwind scaffold.
- Preserved the original static canvas prototype in `legacy-static/`.
- Added a disco-glam Creation Studio shell with setup sections, Person 1/2 language, Still/Motion output tracks, and Favorites/Compare area.
- Added server-only Comfy credential documentation through `.env.example`; no `NEXT_PUBLIC_COMFY_API_KEY` reference was introduced.
- `npm install` reported 2 moderate audit findings in dependencies; no forced audit fix was applied because it may introduce breaking dependency changes.

### File List

- `_bmad-output/implementation-artifacts/1-1-set-up-initial-project-from-next-js-starter.md`
- `.env.example`
- `.gitignore`
- `README.md`
- `eslint.config.mjs`
- `legacy-static/app.js`
- `legacy-static/index.html`
- `legacy-static/styles.css`
- `next-env.d.ts`
- `next.config.ts`
- `package-lock.json`
- `package.json`
- `postcss.config.mjs`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/components/ui/README.md`
- `src/features/studio/CreationStudio.tsx`
- `src/lib/api/responses.ts`
- `src/lib/comfy/README.md`
- `src/lib/domain/generation.ts`
- `src/lib/templates/starterTemplates.ts`
- `src/styles/tokens.css`
- `tsconfig.json`
