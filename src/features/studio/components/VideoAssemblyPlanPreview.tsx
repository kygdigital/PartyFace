import type { VideoAssemblyPlan } from "@/lib/templates/videoAssemblyPlan";

type VideoAssemblyPlanPreviewProps = {
  plan: VideoAssemblyPlan;
};

export function VideoAssemblyPlanPreview({ plan }: VideoAssemblyPlanPreviewProps) {
  return (
    <section className="rounded-lg border border-[var(--pf-line)] bg-[var(--pf-surface-raised)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
            Final Video Assembly
          </p>
          <h3 className="mt-2 text-xl font-black text-[var(--pf-ink)]">
            {plan.clipCount} clips to {plan.targetDurationSeconds}s {plan.outputFormat.toUpperCase()}
          </h3>
        </div>
        <span className="rounded-full bg-[var(--pf-surface)] px-3 py-1 text-xs font-black text-[var(--pf-muted)]">
          {plan.aspectRatio}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg bg-white p-4">
          <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
            Audio
          </p>
          <p className="mt-2 text-sm font-black text-[var(--pf-ink)]">
            {plan.audioMode}
          </p>
          <p className="mt-1 text-xs font-bold leading-5 text-[var(--pf-muted)]">
            {plan.musicTrackTitle}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4">
          <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
            Export
          </p>
          <p className="mt-2 text-sm font-black text-[var(--pf-ink)]">
            {plan.exportNameHint}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4">
          <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
            Contract
          </p>
          <p className="mt-2 text-sm font-black text-[var(--pf-ink)]">
            Generate, stitch, mux
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {plan.steps.map((step, index) => (
          <article
            key={step.id}
            className="grid gap-3 rounded-lg border border-[var(--pf-line)] bg-white p-4 md:grid-cols-[120px_minmax(0,1fr)_90px]"
          >
            <span className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
              Step {index + 1}
            </span>
            <div>
              <h4 className="text-sm font-black text-[var(--pf-ink)]">
                {step.title}
              </h4>
              <p className="mt-1 text-sm font-medium leading-6 text-[var(--pf-muted)]">
                {step.detail}
              </p>
            </div>
            <span
              className={`h-fit rounded-full px-3 py-1 text-center text-xs font-black ${
                step.status === "planned"
                  ? "bg-[rgb(36_188_129_/_0.14)] text-[rgb(22_135_92)]"
                  : "bg-[var(--pf-surface)] text-[var(--pf-muted)]"
              }`}
            >
              {step.status}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
