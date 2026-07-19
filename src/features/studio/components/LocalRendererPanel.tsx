import type {
  GenerationJobRecord,
  MotionOutputVariant,
} from "@/lib/domain/generation";
import type { StarterTemplate } from "@/lib/templates/starterTemplates";

type LocalRendererPanelProps = {
  selectedTemplate: StarterTemplate;
  faceCount: number;
  trackTitle: string;
  job: GenerationJobRecord | null;
  outputs: MotionOutputVariant[];
  isReady: boolean;
  isActive: boolean;
  error: string | null;
  onGenerateDraft: () => void;
  onGenerateFull: () => void;
  onExport: () => void;
};

export function LocalRendererPanel({
  selectedTemplate,
  faceCount,
  trackTitle,
  job,
  outputs,
  isReady,
  isActive,
  error,
  onGenerateDraft,
  onGenerateFull,
  onExport,
}: LocalRendererPanelProps) {
  const isRenderable = selectedTemplate.renderStatus === "local-renderable";
  const canRender = isRenderable && isReady && !isActive;
  const output = outputs[0] ?? null;

  return (
    <section className="rounded-lg border border-[var(--pf-line)] bg-[var(--pf-surface-raised)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
            Red Carpet Local Renderer
          </p>
          <h3 className="mt-2 text-xl font-black text-[var(--pf-ink)]">
            {isRenderable ? "Renderable Birthday Royale" : "Preview-only theme"}
          </h3>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${
            isRenderable
              ? "bg-[rgb(36_188_129_/_0.14)] text-[rgb(22_135_92)]"
              : "bg-[var(--pf-surface)] text-[var(--pf-muted)]"
          }`}
        >
          {isRenderable ? "local ffmpeg" : "static preview"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <SummaryTile label="Faces" value={`${faceCount || 0} local`} />
        <SummaryTile label="Track" value={trackTitle} />
        <SummaryTile label="Target" value="5s draft / ~35s MP4" />
      </div>

      <div className="mt-4 rounded-lg border border-[var(--pf-line)] bg-white p-4">
        <p className="text-sm font-black text-[var(--pf-ink)]">
          Local-only prototype path
        </p>
        <p className="mt-2 text-sm font-medium leading-6 text-[var(--pf-muted)]">
          Uploaded faces are decoded into the local render folder and are not sent to
          Comfy Cloud for this renderer. The output remains local unless you download
          or share it.
        </p>
      </div>

      <div className="mt-4 rounded-lg border border-[var(--pf-line)] bg-white p-4">
        <p className="text-sm font-black text-[var(--pf-ink)]">
          Fixed anchor choreography
        </p>
        <p className="mt-2 text-sm font-medium leading-6 text-[var(--pf-muted)]">
          {faceCount > 1
            ? "Duo format: left and right head anchors mirror each other with alternating BPM bob."
            : "Solo format: one centered head anchor with BPM-synced vertical bob."}
        </p>
        <p className="mt-1 text-xs font-bold leading-5 text-[var(--pf-muted)]">
          No per-frame rig in v1; the cutout moves as a single sticker head.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!canRender}
          onClick={onGenerateDraft}
          className="min-h-10 rounded-lg border border-[var(--pf-line)] bg-white px-4 text-sm font-black text-[var(--pf-ink)] disabled:cursor-not-allowed disabled:text-[var(--pf-muted)]"
        >
          Generate 5s draft
        </button>
        <button
          type="button"
          disabled={!canRender}
          onClick={onGenerateFull}
          className="min-h-10 rounded-lg bg-[var(--pf-surface-night)] px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-[var(--pf-surface)] disabled:text-[var(--pf-muted)]"
        >
          Render local MP4
        </button>
        {output ? (
          <button
            type="button"
            onClick={onExport}
            className="min-h-10 rounded-lg bg-[var(--pf-electric-blue)] px-4 text-sm font-black text-[var(--pf-ink)]"
          >
            Download output
          </button>
        ) : null}
      </div>

      {!isRenderable ? (
        <p className="mt-3 text-sm font-bold leading-6 text-[var(--pf-muted)]">
          PRD v3 keeps this theme available for comparison, but only Red Carpet
          Paparazzi renders in the first prototype.
        </p>
      ) : null}

      {job || error ? (
        <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold text-[var(--pf-muted)]">
          <span className="rounded-full bg-[var(--pf-surface)] px-3 py-1">
            {isActive ? "rendering" : job?.status ?? "not started"}
          </span>
          {job ? (
            <span className="rounded-full bg-[var(--pf-surface)] px-3 py-1">
              {job.workflowId}
            </span>
          ) : null}
          {error ? (
            <span className="rounded-full bg-[rgb(225_29_72_/_0.10)] px-3 py-1 text-[rgb(190_18_60)]">
              {error}
            </span>
          ) : null}
        </div>
      ) : null}

      {output ? (
        <article className="mt-4 overflow-hidden rounded-lg border border-[var(--pf-line)] bg-white">
          <div className="grid aspect-[4/5] max-h-[560px] bg-[var(--pf-surface-night)]">
            {output.videoUrl ? (
              <video
                src={output.videoUrl}
                className="h-full w-full object-contain"
                controls
                playsInline
                preload="metadata"
              />
            ) : null}
          </div>
          <div className="p-4">
            <p className="text-sm font-black text-[var(--pf-ink)]">
              {output.title}
            </p>
            <p className="mt-1 text-xs font-bold text-[var(--pf-muted)]">
              {output.subtitle}
            </p>
          </div>
        </article>
      ) : null}
    </section>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-4">
      <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-black text-[var(--pf-ink)]">{value}</p>
    </div>
  );
}
