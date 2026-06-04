type BenchmarkComparisonProps = {
  hasStillFavorite: boolean;
  hasMotionFavorite: boolean;
  onExportStill: () => void;
  onExportMotion: () => void;
};

export function BenchmarkComparison({
  hasStillFavorite,
  hasMotionFavorite,
  onExportStill,
  onExportMotion,
}: BenchmarkComparisonProps) {
  return (
    <section className="rounded-lg border border-[var(--pf-line)] bg-[var(--pf-surface-raised)] p-5">
      <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
        Benchmark Review
      </p>
      <h3 className="mt-3 text-xl font-black text-[var(--pf-ink)]">
        PartyFace vs. template benchmark
      </h3>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-[var(--pf-line)] bg-white p-4">
          <div className="grid aspect-video content-end rounded-lg bg-[linear-gradient(135deg,#2A1546,#FF3DA7_50%,#FFC857)] p-4 text-white">
            <p className="font-serif text-4xl font-black leading-none">
              PartyFace Picks
            </p>
          </div>
          <div className="mt-3 grid gap-2 text-sm font-bold text-[var(--pf-muted)]">
            <p>{hasStillFavorite ? "Still favorite ready" : "Still favorite missing"}</p>
            <p>{hasMotionFavorite ? "Motion favorite ready" : "Motion favorite missing"}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!hasStillFavorite}
              onClick={onExportStill}
              className="min-h-10 rounded-lg bg-[var(--pf-neon-pink)] px-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export still
            </button>
            <button
              type="button"
              disabled={!hasMotionFavorite}
              onClick={onExportMotion}
              className="min-h-10 rounded-lg bg-[var(--pf-electric-blue)] px-3 text-xs font-black text-[var(--pf-ink)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export motion
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-dashed border-[var(--pf-line)] bg-white p-4">
          <div className="grid aspect-video content-end rounded-lg bg-[var(--pf-surface-night)] p-4 text-white">
            <p className="font-serif text-4xl font-black leading-none">
              Benchmark
            </p>
          </div>
          <p className="mt-3 text-sm font-medium leading-6 text-[var(--pf-muted)]">
            Placeholder for the JibJab-style reference output used in small-group review.
          </p>
        </div>
      </div>
    </section>
  );
}
