import type { StillOutputVariant } from "@/lib/domain/generation";

type StillVariantGalleryProps = {
  variants: StillOutputVariant[];
  favoriteVariantIds: string[];
  onToggleFavorite: (variantId: string) => void;
  onClearFavorites: () => void;
  onExportStill: () => void;
};

export function StillVariantGallery({
  variants,
  favoriteVariantIds,
  onToggleFavorite,
  onClearFavorites,
  onExportStill,
}: StillVariantGalleryProps) {
  const variantGroups = variants.reduce<Record<string, StillOutputVariant[]>>(
    (groups, variant) => {
      groups[variant.jobId] = [...(groups[variant.jobId] ?? []), variant];
      return groups;
    },
    {},
  );

  if (variants.length === 0) {
    return (
      <section className="rounded-lg border border-[var(--pf-line)] bg-[var(--pf-surface-raised)] p-5">
        <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
          Still Variants
        </p>
        <h3 className="mt-3 text-xl font-black text-[var(--pf-ink)]">
          Generated stills will appear here.
        </h3>
        <p className="mt-2 text-sm font-medium leading-6 text-[var(--pf-muted)]">
          Complete a still generation run to compare poster/card options.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-[var(--pf-line)] bg-[var(--pf-surface-raised)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
            Still Variants
          </p>
          <h3 className="mt-2 text-xl font-black text-[var(--pf-ink)]">
            Compare generated poster options.
          </h3>
        </div>
        {favoriteVariantIds.length > 0 ? (
          <button
            type="button"
            onClick={onClearFavorites}
            className="min-h-10 rounded-lg border border-[var(--pf-line)] bg-white px-3 text-xs font-black text-[var(--pf-ink)]"
          >
            Clear favorites
          </button>
        ) : null}
        <button
          type="button"
          onClick={onExportStill}
          className="min-h-10 rounded-lg bg-[var(--pf-neon-pink)] px-3 text-xs font-black text-white"
        >
          Export still
        </button>
      </div>

      <div className="mt-4 grid gap-5">
        {Object.entries(variantGroups).map(([jobId, jobVariants]) => (
          <div key={jobId}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
                Generation {jobId}
              </p>
              <span className="rounded-full bg-[var(--pf-surface)] px-2 py-1 text-[11px] font-black text-[var(--pf-muted)]">
                {jobVariants.length} variants
              </span>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {jobVariants.map((variant, index) => {
                const isFavorite = favoriteVariantIds.includes(variant.variantId);

                return (
                  <article
                    key={variant.variantId}
                    className={`overflow-hidden rounded-lg border bg-white ${
                      isFavorite
                        ? "border-[var(--pf-neon-pink)]"
                        : "border-[var(--pf-line)]"
                    }`}
                  >
                    {variant.imageUrl ? (
                      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--pf-surface-night)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={variant.imageUrl}
                          alt={variant.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-black/46 px-3 py-1 text-xs font-black text-white">
                            {variant.variantId}
                          </span>
                          {isFavorite ? (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[var(--pf-neon-pink)]">
                              Favorite
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`grid aspect-[4/3] content-between p-4 text-white ${
                          index % 2 === 0
                            ? "bg-[linear-gradient(135deg,#2A1546,#FF3DA7_54%,#FFC857)]"
                            : "bg-[linear-gradient(135deg,#151B46,#2DD4FF_50%,#7C3AED)]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="rounded-full bg-black/24 px-3 py-1 text-xs font-black">
                            {variant.variantId}
                          </span>
                          {isFavorite ? (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[var(--pf-neon-pink)]">
                              Favorite
                            </span>
                          ) : null}
                        </div>
                        <div>
                          <p className="font-serif text-4xl font-black leading-none">
                            {variant.title}
                          </p>
                          <p className="mt-2 max-w-sm text-sm font-bold leading-6 text-white/82">
                            {variant.subtitle}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {variant.styleNotes.map((note) => (
                          <span
                            key={note}
                            className="rounded-full bg-[var(--pf-surface)] px-2 py-1 text-[11px] font-black text-[var(--pf-muted)]"
                          >
                            {note}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 line-clamp-3 text-sm font-medium leading-6 text-[var(--pf-muted)]">
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
                        {isFavorite ? "Favorited" : "Favorite"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
