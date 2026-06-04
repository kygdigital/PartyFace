import type { MotionOutputVariant } from "@/lib/domain/generation";

type MotionPreviewProps = {
  variants: MotionOutputVariant[];
  favoriteVariantIds: string[];
  onToggleFavorite: (variantId: string) => void;
  onClearFavorites: () => void;
  onExportMotion: () => void;
};

export function MotionPreview({
  variants,
  favoriteVariantIds,
  onToggleFavorite,
  onClearFavorites,
  onExportMotion,
}: MotionPreviewProps) {
  if (variants.length === 0) return null;

  return (
    <section className="rounded-lg border border-[var(--pf-line)] bg-[var(--pf-surface-raised)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
            Motion Preview
          </p>
          <h3 className="mt-2 text-xl font-black text-[var(--pf-ink)]">
            Review short birthday motion outputs.
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-[var(--pf-surface)] px-3 py-1 text-xs font-black text-[var(--pf-muted)]">
            Muted preview
          </span>
          {favoriteVariantIds.length > 0 ? (
            <button
              type="button"
              onClick={onClearFavorites}
              className="min-h-8 rounded-lg border border-[var(--pf-line)] bg-white px-3 text-xs font-black text-[var(--pf-ink)]"
            >
              Clear motion favorites
            </button>
          ) : null}
          <button
            type="button"
            onClick={onExportMotion}
            className="min-h-8 rounded-lg bg-[var(--pf-electric-blue)] px-3 text-xs font-black text-[var(--pf-ink)]"
          >
            Export motion
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4">
        {variants.map((variant) => {
          const isFavorite = favoriteVariantIds.includes(variant.variantId);

          return (
            <article
              key={variant.variantId}
              className={`overflow-hidden rounded-lg border bg-white ${
                isFavorite ? "border-[var(--pf-neon-pink)]" : "border-[var(--pf-line)]"
              }`}
            >
              <div className="grid aspect-video bg-[var(--pf-surface-night)] text-white">
                {variant.videoUrl ? (
                  <video
                    src={variant.videoUrl}
                    className="h-full w-full object-cover"
                    controls
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <div
                    role="img"
                    aria-label="Muted animated birthday motion preview"
                    className="grid animate-[pulse_2s_ease-in-out_infinite] content-between bg-[linear-gradient(135deg,#211344,#FF3DA7_48%,#FFC857)] p-5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-black/24 px-3 py-1 text-xs font-black">
                        {variant.durationSeconds}s
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[var(--pf-neon-pink)]">
                        {isFavorite ? "Favorite" : "No sound autoplay"}
                      </span>
                    </div>
                    <div>
                      <p className="font-serif text-5xl font-black leading-none">
                        {variant.title}
                      </p>
                      <p className="mt-2 max-w-md text-sm font-bold leading-6 text-white/82">
                        {variant.subtitle}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4">
                <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
                  {variant.variantId}
                </p>
                <p className="mt-3 text-sm font-medium leading-6 text-[var(--pf-muted)]">
                  {variant.promptSnapshot}
                </p>
                <button
                  type="button"
                  onClick={() => onToggleFavorite(variant.variantId)}
                  className={`mt-4 min-h-10 rounded-lg px-3 text-xs font-black ${
                    isFavorite
                      ? "bg-[var(--pf-neon-pink)] text-white"
                      : "border border-[var(--pf-line)] bg-white text-[var(--pf-ink)]"
                  }`}
                >
                  {isFavorite ? "Favorited" : "Favorite motion"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
