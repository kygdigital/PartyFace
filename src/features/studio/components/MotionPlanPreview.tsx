import type { MotionGenerationPlan } from "@/lib/templates/motionPlan";

type MotionPlanPreviewProps = {
  plan: MotionGenerationPlan;
};

export function MotionPlanPreview({ plan }: MotionPlanPreviewProps) {
  return (
    <section className="rounded-lg border border-[var(--pf-line)] bg-[var(--pf-surface-raised)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
            Motion Plan
          </p>
          <h3 className="mt-2 text-xl font-black text-[var(--pf-ink)]">
            {plan.targetDurationSeconds}s storyboard plan
          </h3>
        </div>
        <span className="rounded-full bg-[var(--pf-surface)] px-3 py-1 text-xs font-black text-[var(--pf-muted)]">
          {plan.strategy}
        </span>
      </div>

      <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-[var(--pf-muted)]">
        {plan.summary}
      </p>
      <p className="mt-2 text-sm font-bold leading-6 text-[var(--pf-muted)]">
        Music: {plan.musicMood}
      </p>

      <div className="mt-4 grid gap-3 rounded-lg border border-[var(--pf-line)] bg-white p-4 md:grid-cols-[180px_minmax(0,1fr)]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
            Audio Strategy
          </p>
          <p className="mt-2 text-sm font-black text-[var(--pf-ink)]">
            {plan.audioStrategy.label}
          </p>
        </div>
        <div className="grid gap-2 text-sm font-medium leading-6 text-[var(--pf-muted)]">
          <p>{plan.audioStrategy.loopHint}</p>
          <p>
            {plan.audioStrategy.bpmRange}. {plan.audioStrategy.structure}
          </p>
          <audio
            controls
            preload="metadata"
            src={plan.audioStrategy.previewUrl}
            className="mt-1 w-full"
          >
            <a href={plan.audioStrategy.previewUrl}>Preview stock loop</a>
          </audio>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {plan.clips.map((clip) => (
          <article
            key={clip.clipId}
            className="rounded-lg border border-[var(--pf-line)] bg-white p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-[var(--pf-surface-night)] px-2 py-1 text-[11px] font-black text-white">
                {clip.timeRange}
              </span>
              <span className="text-xs font-black text-[var(--pf-muted)]">
                {clip.durationSeconds}s
              </span>
            </div>
            <h4 className="mt-3 text-sm font-black text-[var(--pf-ink)]">
              {clip.sequence}. {clip.title}
            </h4>
            <p className="mt-2 text-sm font-semibold leading-5 text-[var(--pf-ink)]">
              {clip.caption}
            </p>
            <p className="mt-3 line-clamp-4 text-xs font-medium leading-5 text-[var(--pf-muted)]">
              {clip.visualPrompt}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
