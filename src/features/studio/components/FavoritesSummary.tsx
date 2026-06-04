import type {
  MotionOutputVariant,
  StillOutputVariant,
} from "@/lib/domain/generation";

type FavoritesSummaryProps = {
  stillFavorite: StillOutputVariant | null;
  motionFavorite: MotionOutputVariant | null;
  onExportStill: () => void;
  onExportMotion: () => void;
};

export function FavoritesSummary({
  stillFavorite,
  motionFavorite,
  onExportStill,
  onExportMotion,
}: FavoritesSummaryProps) {
  return (
    <section className="rounded-lg border border-[var(--pf-line)] bg-[var(--pf-surface-raised)] p-5">
      <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
        Favorites / Compare
      </p>
      <h3 className="mt-3 text-xl font-black text-[var(--pf-ink)]">
        Review your strongest birthday outputs.
      </h3>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <FavoriteCard
          label="Still Output"
          title={stillFavorite?.title ?? "No still favorite yet"}
          body={
            stillFavorite?.subtitle ??
            "Favorite a still variant to make it your export-ready image pick."
          }
          isSelected={Boolean(stillFavorite)}
          actionLabel="Export still"
          onExport={onExportStill}
        />
        <FavoriteCard
          label="Motion Output"
          title={motionFavorite?.title ?? "No motion favorite yet"}
          body={
            motionFavorite?.subtitle ??
            "Favorite a motion preview to make it your export-ready animated pick."
          }
          isSelected={Boolean(motionFavorite)}
          actionLabel="Export motion"
          onExport={onExportMotion}
        />
      </div>
    </section>
  );
}

type FavoriteCardProps = {
  label: string;
  title: string;
  body: string;
  isSelected: boolean;
  actionLabel: string;
  onExport: () => void;
};

function FavoriteCard({
  label,
  title,
  body,
  isSelected,
  actionLabel,
  onExport,
}: FavoriteCardProps) {
  return (
    <article
      className={`rounded-lg border bg-white p-4 ${
        isSelected ? "border-[var(--pf-neon-pink)]" : "border-[var(--pf-line)]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
          {label}
        </p>
        <span className="rounded-full bg-[var(--pf-surface)] px-2 py-1 text-[11px] font-black text-[var(--pf-muted)]">
          {isSelected ? "Selected" : "Missing"}
        </span>
      </div>
      <div
        className={`mt-3 grid aspect-[4/3] content-end rounded-lg p-4 text-white ${
          isSelected
            ? "bg-[linear-gradient(135deg,#2A1546,#FF3DA7_54%,#FFC857)]"
            : "bg-[var(--pf-surface-night)]"
        }`}
      >
        <p className="font-serif text-3xl font-black leading-none">{title}</p>
      </div>
      <p className="mt-3 text-sm font-medium leading-6 text-[var(--pf-muted)]">
        {body}
      </p>
      <button
        type="button"
        disabled={!isSelected}
        onClick={onExport}
        className="mt-4 min-h-10 rounded-lg border border-[var(--pf-line)] bg-white px-3 text-xs font-black text-[var(--pf-ink)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {actionLabel}
      </button>
    </article>
  );
}
