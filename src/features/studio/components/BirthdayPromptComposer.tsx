import type { BirthdayDetails } from "@/lib/domain/project";

type BirthdayPromptComposerProps = {
  details: BirthdayDetails;
  promptText: string;
  isPromptCustomized: boolean;
  toneOptions: readonly string[];
  onChangeDetails: (details: BirthdayDetails) => void;
  onChangePrompt: (promptText: string) => void;
  onResetPrompt: () => void;
};

export function BirthdayPromptComposer({
  details,
  promptText,
  isPromptCustomized,
  toneOptions,
  onChangeDetails,
  onChangePrompt,
  onResetPrompt,
}: BirthdayPromptComposerProps) {
  return (
    <section className="rounded-lg border border-[var(--pf-line)] bg-[var(--pf-surface-raised)] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
          Birthday Details
        </p>
        <span
          className={`rounded-full border px-2 py-1 text-[11px] font-extrabold ${
            isPromptCustomized
              ? "border-[var(--pf-neon-pink)] text-[var(--pf-neon-pink)]"
              : "border-[var(--pf-line)] text-[var(--pf-violet)]"
          }`}
        >
          {isPromptCustomized ? "Customized" : "Template"}
        </span>
      </div>

      <div className="grid gap-3">
        <label className="grid gap-1 text-xs font-black text-[var(--pf-ink)]">
          Name
          <input
            type="text"
            value={details.recipientName}
            onChange={(event) =>
              onChangeDetails({ ...details, recipientName: event.target.value })
            }
            placeholder="Birthday person"
            className="min-h-10 rounded-lg border border-[var(--pf-line)] bg-white px-3 text-sm font-semibold text-[var(--pf-ink)] outline-none focus:border-[var(--pf-neon-pink)]"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-[110px_minmax(0,1fr)]">
          <label className="grid gap-1 text-xs font-black text-[var(--pf-ink)]">
            Age
            <input
              type="text"
              inputMode="numeric"
              value={details.age}
              onChange={(event) => onChangeDetails({ ...details, age: event.target.value })}
              placeholder="41"
              className="min-h-10 rounded-lg border border-[var(--pf-line)] bg-white px-3 text-sm font-semibold text-[var(--pf-ink)] outline-none focus:border-[var(--pf-neon-pink)]"
            />
          </label>

          <label className="grid gap-1 text-xs font-black text-[var(--pf-ink)]">
            Tone
            <select
              value={details.tone}
              onChange={(event) => onChangeDetails({ ...details, tone: event.target.value })}
              className="min-h-10 rounded-lg border border-[var(--pf-line)] bg-white px-3 text-sm font-semibold text-[var(--pf-ink)] outline-none focus:border-[var(--pf-neon-pink)]"
            >
              {toneOptions.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-1 text-xs font-black text-[var(--pf-ink)]">
          Message
          <input
            type="text"
            value={details.message}
            onChange={(event) => onChangeDetails({ ...details, message: event.target.value })}
            placeholder="Still iconic"
            className="min-h-10 rounded-lg border border-[var(--pf-line)] bg-white px-3 text-sm font-semibold text-[var(--pf-ink)] outline-none focus:border-[var(--pf-neon-pink)]"
          />
        </label>

        <label className="grid gap-1 text-xs font-black text-[var(--pf-ink)]">
          Prompt
          <textarea
            value={promptText}
            onChange={(event) => onChangePrompt(event.target.value)}
            rows={6}
            className="min-h-32 resize-y rounded-lg border border-[var(--pf-line)] bg-white px-3 py-3 text-sm font-semibold leading-6 text-[var(--pf-ink)] outline-none focus:border-[var(--pf-neon-pink)]"
          />
        </label>

        <button
          type="button"
          onClick={onResetPrompt}
          className="min-h-10 rounded-lg border border-[var(--pf-line)] bg-white px-3 text-xs font-black text-[var(--pf-ink)]"
        >
          Reset prompt
        </button>
      </div>
    </section>
  );
}
