import type { GenerationStyleId } from "@/lib/templates/generationStyles";
import { generationStyles } from "@/lib/templates/generationStyles";

type GenerationStyleSelectorProps = {
  selectedStyleId: GenerationStyleId;
  onSelectStyle: (styleId: GenerationStyleId) => void;
};

export function GenerationStyleSelector({
  selectedStyleId,
  onSelectStyle,
}: GenerationStyleSelectorProps) {
  return (
    <section className="rounded-lg border border-[var(--pf-line)] bg-[var(--pf-surface-raised)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
            Generation Style
          </p>
          <h2 className="mt-1 text-base font-black text-[var(--pf-ink)]">
            Face treatment
          </h2>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-[var(--pf-surface)] p-1">
        {generationStyles.map((style) => {
          const isSelected = style.id === selectedStyleId;

          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onSelectStyle(style.id)}
              className={`min-h-10 rounded-md px-3 text-sm font-black ${
                isSelected
                  ? "bg-white text-[var(--pf-ink)] shadow-[0_8px_24px_rgb(33_24_32_/_0.10)]"
                  : "text-[var(--pf-muted)]"
              }`}
            >
              {style.shortName}
            </button>
          );
        })}
      </div>

      <p className="mt-3 min-h-10 text-sm font-medium leading-5 text-[var(--pf-muted)]">
        {
          generationStyles.find((style) => style.id === selectedStyleId)
            ?.description
        }
      </p>
    </section>
  );
}
