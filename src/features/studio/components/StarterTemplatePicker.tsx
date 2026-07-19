import type { StarterTemplate } from "@/lib/templates/starterTemplates";

type StarterTemplatePickerProps = {
  selectedTemplateId: string;
  templates: StarterTemplate[];
  onSelectTemplate: (templateId: string) => void;
};

export function StarterTemplatePicker({
  selectedTemplateId,
  templates,
  onSelectTemplate,
}: StarterTemplatePickerProps) {
  return (
    <section className="rounded-lg border border-[var(--pf-line)] bg-[var(--pf-surface-raised)] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
          Starter Templates
        </p>
        <span className="rounded-full border border-[var(--pf-line)] px-2 py-1 text-[11px] font-extrabold text-[var(--pf-violet)]">
          Pick first
        </span>
      </div>
      <div className="grid gap-2" role="listbox" aria-label="Starter Templates">
        {templates.map((template) => {
          const selected = template.id === selectedTemplateId;

          return (
            <button
              key={template.id}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onSelectTemplate(template.id)}
              className={`rounded-lg border p-3 text-left transition ${
                selected
                  ? "border-[var(--pf-neon-pink)] bg-[rgb(255_61_167_/_0.08)] shadow-[0_0_0_3px_rgb(255_61_167_/_0.12)]"
                  : "border-[var(--pf-line)] bg-white hover:border-[var(--pf-neon-pink)]"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className="mt-1 block h-9 w-9 rounded-lg"
                  style={{ backgroundColor: template.accentColor }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-black text-[var(--pf-ink)]">
                      {template.name}
                    </span>
                    {selected ? (
                      <span className="text-xs font-black text-[var(--pf-neon-pink)]">
                        Selected
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-xs font-semibold leading-5 text-[var(--pf-muted)]">
                    {template.description}
                  </span>
                  <span className="mt-2 flex gap-2">
                    {template.support.still ? <SupportBadge label="Still" /> : null}
                    {template.support.motion ? <SupportBadge label="Motion" /> : null}
                    <SupportBadge
                      label={
                        template.renderStatus === "local-renderable"
                          ? "Local render"
                          : "Preview only"
                      }
                    />
                  </span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SupportBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-[var(--pf-surface)] px-2 py-1 text-[11px] font-black text-[var(--pf-muted)]">
      {label}
    </span>
  );
}
