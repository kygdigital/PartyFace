import type { TemplateSongScript } from "@/lib/templates/songScripts";

type SongScriptComposerProps = {
  songScript: TemplateSongScript;
  scriptText: string;
  personalizedPreview: string;
  handoffPrompt: string;
  isCustomized: boolean;
  copied: boolean;
  onChangeScript: (scriptText: string) => void;
  onResetScript: () => void;
  onCopyHandoff: () => void;
};

export function SongScriptComposer({
  songScript,
  scriptText,
  personalizedPreview,
  handoffPrompt,
  isCustomized,
  copied,
  onChangeScript,
  onResetScript,
  onCopyHandoff,
}: SongScriptComposerProps) {
  return (
    <section className="rounded-lg border border-[var(--pf-line)] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
            Song Script
          </p>
          <h3 className="mt-2 text-lg font-black text-[var(--pf-ink)]">
            {songScript.title}
          </h3>
        </div>
        <span className="rounded-full bg-[var(--pf-surface)] px-2 py-1 text-[11px] font-black text-[var(--pf-muted)]">
          {isCustomized ? "Custom" : "Template"}
        </span>
      </div>

      <p className="mt-3 text-sm font-medium leading-6 text-[var(--pf-muted)]">
        {songScript.styleNotes}
      </p>
      <p className="mt-2 text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
        {songScript.tempoMood}
      </p>

      <label className="mt-4 block">
        <span className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
          Editable lyrics and spoken callouts
        </span>
        <textarea
          value={scriptText}
          onChange={(event) => onChangeScript(event.target.value)}
          rows={14}
          className="mt-2 min-h-72 w-full resize-y rounded-lg border border-[var(--pf-line)] bg-[var(--pf-surface)] p-3 font-mono text-xs font-semibold leading-5 text-[var(--pf-ink)] outline-none focus:border-[var(--pf-neon-pink)]"
        />
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onResetScript}
          disabled={!isCustomized}
          className="min-h-9 rounded-lg border border-[var(--pf-line)] bg-white px-3 text-xs font-black text-[var(--pf-ink)] disabled:cursor-not-allowed disabled:text-[var(--pf-muted)]"
        >
          Reset song
        </button>
        <button
          type="button"
          onClick={onCopyHandoff}
          className="min-h-9 rounded-lg bg-[var(--pf-surface-night)] px-3 text-xs font-black text-white"
        >
          {copied ? "Copied handoff" : "Copy song handoff"}
        </button>
      </div>

      <div className="mt-4 rounded-lg border border-[var(--pf-line)] bg-[var(--pf-surface)] p-3">
        <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
          Personalized preview
        </p>
        <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap text-xs font-semibold leading-5 text-[var(--pf-ink)]">
          {personalizedPreview}
        </pre>
      </div>

      <div className="mt-4 rounded-lg border border-[var(--pf-line)] bg-white p-3">
        <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
          Stock loop preview bed
        </p>
        <p className="mt-2 text-sm font-medium leading-6 text-[var(--pf-muted)]">
          {songScript.stockLoopFitNotes}
        </p>
        <audio
          className="mt-3 w-full"
          controls
          preload="metadata"
          src="/audio/partyface-90s-stock-loop.mp3"
        />
      </div>

      <details className="mt-4 rounded-lg border border-[var(--pf-line)] bg-[var(--pf-surface)] p-3">
        <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
          Prompt-ready handoff
        </summary>
        <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap text-xs font-semibold leading-5 text-[var(--pf-ink)]">
          {handoffPrompt}
        </pre>
      </details>
    </section>
  );
}
