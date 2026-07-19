# PartyFace — Review Findings & Mitigations (PRD v2)

**Source artifact:** `docs/product-requirements-v2.md` (Draft, 2026-07-19)
**Review:** Review Board, single-pass, generic PRD bar (prototype-calibrated) — 2026-07-19
**Status:** **Needs Review** — safe to iterate, not yet safe to hand to build.

> How to use this doc: each finding lists the **evidence**, a **recommended** fix, and the **lightweight** fix (the minimum that unblocks the prototype). Update `product-requirements-v2.md` → v3 using the "Lightweight" column unless you want to invest ahead of validation. Check off the must-fix list at the bottom as you resolve each.

---

## Priority must-fix (blockers & key concerns)

### 1. [BLOCKER · Architecture] Cutout-on-moving-figure mechanism is unspecified
- **Evidence:** FR-8 asserts "choreographed movement" (l.159) and choreo presets are enumerated (l.90–102), but nothing defines how a face cutout rides a *moving* body.
- **Recommended:** Each choreo preset ships as an animation asset = transparent body loop (PNG seq / alpha WebM) **+ a per-frame head-anchor track** `[{frame,x,y,scale,rotation}]`; renderer composites the alpha-matted face at the anchor. Deterministic, no runtime AI.
- **Lightweight:** Don't build a rig. Take **one** pre-made dance clip, overlay the face PNG at a **fixed anchor with a simple BPM-synced bob** (ffmpeg `overlay` with a sine `y=` expression). Prove it on **one** template only.
- **Owner:** Eng lead.

### 2. [BLOCKER · Architecture] Render engine undecided (Open Q1)
- **Evidence:** Open Q1 (l.183): server ffmpeg vs. browser canvas/WebCodecs — the renderer's critical path, unresolved.
- **Recommended:** Server-side **ffmpeg** for MVP (backdrop → body loop → face overlay → text → audio mux); add a fast low-res "draft" render; defer WebCodecs.
- **Lightweight:** A single **ffmpeg script/CLI** (`make-card.sh`: clip + face + song + name → MP4). No app renderer, no streaming preview. (Same pattern already run manually this session.)
- **Owner:** Eng.

### 3. [CONCERN · Privacy] "Personal media stays local" contradicts faces going through Comfy Cloud
- **Evidence:** NFR "personal media should remain local" (l.166–167) vs. face cutouts listed as an upstream Comfy Cloud ingredient (l.20–21).
- **Recommended:** Cut out faces **locally** (macOS Vision / `rembg`); keep Comfy Cloud for **figure art & backdrops only** (no PII). Add consent + retention only if cloud face processing is ever introduced.
- **Lightweight:** Same — process faces locally, never upload them; add one sentence: "faces processed locally; only theme art is cloud-generated."
- **Owner:** You / Privacy.

### 4. [CONCERN · Product] "3-5 templates" contradicts building only Red Carpet Glam
- **Evidence:** Success metric "compare at least 3-5 creative template directions" (l.178) vs. scope building only Red Carpet Glam fully (l.47, l.122).
- **Recommended / Lightweight (same):** Build **1** fully renderable + 3-4 **static preview tiles** (mock image + one-line vibe). Reword metric to "compare 3-5, **render 1**."
- **Owner:** PM.

### 5. [CONCERN · Product] Success metrics have no numbers or counter-metric
- **Evidence:** Success Metrics (l.172–179) are all qualitative/binary; no numeric, time-bound target, no guardrail.
- **Recommended:** % started→exported; time-to-first-card; guardrail render-success-rate ≥ X%.
- **Lightweight:** Three hand-eyeballed numbers — time-to-card < 5 min; testers complete it; "reads as a cutout card" ≥ 4/5 friends. No instrumentation.
- **Owner:** PM.

### 6. [CONCERN · UX] Face-photo quality unaddressed + user renders blind
- **Evidence:** No photo-quality guidance in flow (l.104–114); FR-7 "plan preview" (l.151–154) is text, not visual; no render-progress state.
- **Recommended:** Live upload validation (single frontal face, min resolution, framing) + auto-crop; render-progress state; low-res visual draft.
- **Lightweight:** A **line of copy + one good/bad example image** on upload (no auto-validation); render a **5-second low-res draft** instead of the full card.
- **Owner:** UX.

### 7. [CONCERN · Architecture] Duration target vs. beat skeleton mismatch
- **Evidence:** Target 30-45s (l.24, l.56, l.175) vs. reference/prior beat skeleton spanning ~72s (outro at bar 30 ≈ 60s @116 BPM).
- **Recommended:** Define beat starts as a **fraction of song duration** (or scale bars) so any 30-45s track fits.
- **Lightweight:** **Hardcode** beat timings for the one template at ~35s; add proportional timing only once there's >1 template.
- **Owner:** PM + Eng.

---

## Full per-lens findings (for completeness)

### Product & Scope
- **Strong:** Explicit In/Out of Scope (l.42–67) with real non-goals; clear job-to-be-done (l.29–38).
- [concern] Success metrics lack numbers + counter-metric → **#5**.
- [concern] 3-5 templates vs. build-1 contradiction → **#4**.
- [nit] Open Questions (l.181–191) carry no owner/date — assign them.

### Architecture & Feasibility
- [blocker] Cutout/animation mechanism → **#1**.
- [blocker] Render engine undecided → **#2**.
- [concern] Choreo presets have no "preset → animation asset" contract; FR-6 assumes body loops retime to arbitrary BPM (116 vs 124) — state the assumption.
- [concern] Duration vs. beat skeleton → **#7**.
- **Strong:** "Comfy not required at render time" (l.25, l.165) + deterministic renderer NFR (l.163) are the right boundaries.

### UX & Accessibility
- [concern] Face-photo quality + blind render → **#6**.
- **Strong:** Failure modes named in NFRs (l.168–169).
- [nit] Accessibility unmentioned — note once as deferred for a desktop prototype.

### Privacy & Security
- [concern] Local-media vs. Comfy Cloud faces contradiction → **#3**.
- [concern] No retention/deletion statement for faces or rendered cards — add one line.
- [nit] No consent note for the people whose faces are used — flag before any sharing feature.

### Regulatory & Compliance
- Largely **N/A** for a single-user desktop prototype (no accounts/payments/public launch, l.60, l.67). Two items open for later:
  - [open] Right-of-publicity / likeness (and BIPA-style biometric laws) before any public launch or if faces reach a third-party cloud. *(Owner: Regulatory/Privacy, revisit before launch.)*
  - [open] Ownership/licensing of ACE-Step-generated music for **shareable** cards. *(Owner: TBD, before distribution.)*

### Go-to-Market & Comms
- Mostly out of scope for a prototype.
- [concern] No go/no-go gate to greenlight past the prototype — add a short "proceed if…" criterion.
- [nit] Positioning ("modern, higher-quality JibJab," l.8) is a strong repeatable one-liner — keep it.

---

## Open questions — recommended resolutions
- **Q1 (render engine):** server-side ffmpeg for MVP; defer WebCodecs. → **#2**
- **Q2 (music file location):** `public/library/` for the prototype; object storage later.
- **Q3 (registry JSON location):** keep in `docs/` for now; move to `src/lib/partyface-registry/` when implementation starts (single source of truth).
- **Q4 (outro):** **assembly tail**, not a numbered beat.

---

## Lightest viable prototype (restated)
> **One** template (Red Carpet Glam) + **one** pre-made dance clip + face overlaid with a BPM bob + **one** library song, stitched by a **single ffmpeg script**. Faces cut out **locally**. Other themes are static preview images. Test on ~5 friends.

This is essentially the pipeline already run this session, productized into one script — no renderer engine, no rig, no cloud face handling. It resolves both blockers by *avoiding* them for v1 (hand-finish one card style, validate the feeling first).

**Deferred on purpose:** anchor-track/rig system, multi-template rendering, proportional beats, WebCodecs preview, any cloud face processing.

---

## Must-fix checklist (for v3)
- [ ] #1 Cutout/animation mechanism defined (lightweight: fixed anchor + BPM bob on one clip)
- [ ] #2 Render engine decided (lightweight: single ffmpeg script)
- [ ] #3 Faces processed locally + one-line data-flow correction
- [ ] #4 3-5-templates metric reworded ("compare 3-5, render 1")
- [ ] #5 Numeric, time-bound success metric + guardrail added
- [ ] #6 Face-photo guidance + draft-preview story added
- [ ] #7 Duration reconciled with beat skeleton (lightweight: hardcode ~35s)
- [ ] Open Qs Q2/Q3/Q4 resolved in the PRD
- [ ] Open Questions assigned owner + date
