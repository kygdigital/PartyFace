import type {
  GenerationClipStatus,
  GenerationJobRecord,
  MotionOutputVariant,
} from "@/lib/domain/generation";

type FinalVideoProgressProps = {
  job: GenerationJobRecord | null;
  outputs: MotionOutputVariant[];
  isReadyToGenerate: boolean;
  isActive: boolean;
  error: string | null;
  onGenerateFinalVideo: () => void;
  onExportFinalVideo: () => void;
};

export function FinalVideoProgress({
  job,
  outputs,
  isReadyToGenerate,
  isActive,
  error,
  onGenerateFinalVideo,
  onExportFinalVideo,
}: FinalVideoProgressProps) {
  const clipStatuses = job?.clipStatuses ?? [];
  const completeCount = clipStatuses.filter((clip) => clip.status === "complete").length;
  const isComplete = job?.status === "complete";

  return (
    <section className="rounded-lg border border-[var(--pf-line)] bg-[var(--pf-surface-raised)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
            Final Video Progress
          </p>
          <h3 className="mt-2 text-xl font-black text-[var(--pf-ink)]">
            30-second video checkpoint
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {isComplete ? (
            <button
              type="button"
              onClick={onExportFinalVideo}
              className="min-h-10 rounded-lg bg-[var(--pf-electric-blue)] px-4 text-sm font-black text-[var(--pf-ink)]"
            >
              Export demo
            </button>
          ) : null}
          <button
            type="button"
            disabled={!isReadyToGenerate || isActive}
            onClick={onGenerateFinalVideo}
            className="min-h-10 rounded-lg bg-[var(--pf-surface-night)] px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-[var(--pf-surface)] disabled:text-[var(--pf-muted)]"
          >
            {job ? "Regenerate beat clips" : "Generate beat clips"}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-bold text-[var(--pf-muted)]">
        <span className="rounded-full bg-[var(--pf-surface)] px-3 py-1">
          {job ? job.status : "not started"}
        </span>
        {job ? (
          <span className="rounded-full bg-[var(--pf-surface)] px-3 py-1">
            {completeCount}/{clipStatuses.length || job.variantCount} clips complete
          </span>
        ) : null}
        {error ? (
          <span className="rounded-full bg-[rgb(225_29_72_/_0.10)] px-3 py-1 text-[rgb(190_18_60)]">
            {error}
          </span>
        ) : null}
      </div>

      {clipStatuses.length > 0 ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {clipStatuses.map((clip) => (
            <ClipStatusCard key={clip.clipId} clip={clip} />
          ))}
        </div>
      ) : (
        <p className="mt-4 max-w-3xl text-sm font-medium leading-6 text-[var(--pf-muted)]">
          Generate beat clips when you are ready to test the 30-second final-video path.
          Mock mode previews the job contract; Comfy mode submits one Seedance job per
          story beat.
        </p>
      )}

      {isComplete ? (
        <div className="mt-4 rounded-lg border border-[rgb(36_188_129_/_0.24)] bg-[rgb(36_188_129_/_0.08)] p-4">
          <p className="text-sm font-black text-[rgb(22_135_92)]">
            Demo checkpoint ready
          </p>
          <p className="mt-2 text-sm font-medium leading-6 text-[var(--pf-muted)]">
            PartyFace has generated the storyboard clips and can export the current
            final-video demo artifact. In mock mode this exports a reviewable demo
            card; in Comfy mode this exports the first completed clip while full
            server-side stitching remains the next production renderer step.
          </p>
        </div>
      ) : null}

      {outputs.length > 0 ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {outputs.map((output) => (
            <article
              key={output.variantId}
              className="overflow-hidden rounded-lg border border-[var(--pf-line)] bg-white"
            >
              <div className="grid aspect-video bg-[var(--pf-surface-night)]">
                {output.videoUrl ? (
                  <video
                    src={output.videoUrl}
                    className="h-full w-full object-cover"
                    controls
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <div className="grid content-center p-4 text-center text-white">
                    <p className="font-serif text-3xl font-black">{output.title}</p>
                    <p className="mt-2 text-sm font-bold text-white/72">
                      {output.durationSeconds}s demo export
                    </p>
                  </div>
                )}
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
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ClipStatusCard({ clip }: { clip: GenerationClipStatus }) {
  return (
    <article className="rounded-lg border border-[var(--pf-line)] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-[var(--pf-surface-night)] px-2 py-1 text-[11px] font-black text-white">
          {clip.timeRange}
        </span>
        <span className={statusClassName(clip.status)}>{clip.status}</span>
      </div>
      <h4 className="mt-3 text-sm font-black text-[var(--pf-ink)]">
        {clip.sequence}. {clip.title}
      </h4>
      <p className="mt-2 text-xs font-medium leading-5 text-[var(--pf-muted)]">
        {clip.providerJobId
          ? `Provider job ${clip.providerJobId}`
          : clip.outputVariantId
            ? `Output ${clip.outputVariantId}`
            : "Waiting for clip output."}
      </p>
    </article>
  );
}

function statusClassName(status: GenerationClipStatus["status"]) {
  const baseClass = "rounded-full px-2 py-1 text-[11px] font-black";

  if (status === "complete") {
    return `${baseClass} bg-[rgb(36_188_129_/_0.14)] text-[rgb(22_135_92)]`;
  }

  if (status === "failed") {
    return `${baseClass} bg-[rgb(225_29_72_/_0.10)] text-[rgb(190_18_60)]`;
  }

  if (status === "generating") {
    return `${baseClass} bg-[rgb(255_200_87_/_0.24)] text-[rgb(133_91_10)]`;
  }

  return `${baseClass} bg-[var(--pf-surface)] text-[var(--pf-muted)]`;
}
