import type { StoryTemplate } from "@/lib/templates/storyTemplates";

type StoryTemplatePlannerProps = {
  templates: StoryTemplate[];
  selectedTemplateId: string;
  captionsByBeatId: Record<string, string>;
  onSelectTemplate: (templateId: string) => void;
  onChangeBeatCaption: (beatId: string, caption: string) => void;
};

export function StoryTemplatePlanner({
  templates,
  selectedTemplateId,
  captionsByBeatId,
  onSelectTemplate,
  onChangeBeatCaption,
}: StoryTemplatePlannerProps) {
  const selectedTemplate =
    templates.find((template) => template.id === selectedTemplateId) ??
    templates[0];

  return (
    <section className="rounded-lg border border-[var(--pf-line)] bg-[var(--pf-surface-raised)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
            Video Story
          </p>
          <h2 className="mt-1 text-base font-black text-[var(--pf-ink)]">
            30-second arc
          </h2>
        </div>
        <span className="rounded-full bg-[var(--pf-surface)] px-2 py-1 text-[11px] font-black text-[var(--pf-muted)]">
          4 beats
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {templates.map((template) => {
          const isSelected = template.id === selectedTemplate.id;

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelectTemplate(template.id)}
              className={`min-h-11 rounded-lg border px-3 text-left text-sm font-black transition ${
                isSelected
                  ? "border-transparent bg-[var(--pf-surface-night)] text-white shadow-[0_10px_26px_rgb(33_24_32_/_0.16)]"
                  : "border-[var(--pf-line)] bg-[var(--pf-surface)] text-[var(--pf-muted)]"
              }`}
            >
              {template.shortName}
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-lg bg-[var(--pf-surface)] p-3">
        <div className="flex items-start gap-3">
          <div
            className="mt-1 h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: selectedTemplate.accentColor }}
          />
          <div>
            <h3 className="text-sm font-black text-[var(--pf-ink)]">
              {selectedTemplate.name}
            </h3>
            <p className="mt-1 text-sm font-medium leading-5 text-[var(--pf-muted)]">
              {selectedTemplate.description}
            </p>
            <p className="mt-2 text-xs font-bold leading-5 text-[var(--pf-muted)]">
              Music: {selectedTemplate.musicMood}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-2">
        {selectedTemplate.beats.map((beat, index) => (
          <label
            key={beat.id}
            className="grid gap-2 rounded-lg border border-[var(--pf-line)] bg-white p-3"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
                {index + 1}. {beat.timeRange}
              </span>
              <span className="text-xs font-black text-[var(--pf-ink)]">
                {beat.title}
              </span>
            </span>
            <input
              value={captionsByBeatId[beat.id] ?? beat.caption}
              onChange={(event) => onChangeBeatCaption(beat.id, event.target.value)}
              className="min-h-10 rounded-md border border-[var(--pf-line)] bg-[var(--pf-surface)] px-3 text-sm font-semibold text-[var(--pf-ink)] outline-none focus:border-[var(--pf-neon-pink)]"
            />
          </label>
        ))}
      </div>
    </section>
  );
}
