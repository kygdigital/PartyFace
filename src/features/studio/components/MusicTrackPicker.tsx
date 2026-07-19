import type { MusicLibraryTrack } from "@/lib/templates/musicLibrary";
import { buildBeatGridPreview } from "@/lib/templates/musicLibrary";

type MusicTrackPickerProps = {
  tracks: MusicLibraryTrack[];
  selectedTrackId: string;
  onSelectTrack: (trackId: string) => void;
};

export function MusicTrackPicker({
  tracks,
  selectedTrackId,
  onSelectTrack,
}: MusicTrackPickerProps) {
  const selectedTrack =
    tracks.find((track) => track.id === selectedTrackId) ?? tracks[0];
  const beatPreview = buildBeatGridPreview(selectedTrack, 2);

  return (
    <section className="rounded-lg border border-[var(--pf-line)] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
            Music Library
          </p>
          <h2 className="mt-1 text-base font-black text-[var(--pf-ink)]">
            Registered track
          </h2>
        </div>
        <span className="rounded-full bg-[var(--pf-surface)] px-2 py-1 text-[11px] font-black text-[var(--pf-muted)]">
          {selectedTrack.bpm} BPM
        </span>
      </div>

      <div className="mt-3 grid gap-2">
        {tracks.map((track) => {
          const isSelected = track.id === selectedTrack.id;

          return (
            <button
              key={track.id}
              type="button"
              onClick={() => onSelectTrack(track.id)}
              className={`rounded-lg border p-3 text-left transition ${
                isSelected
                  ? "border-transparent bg-[var(--pf-surface-night)] text-white shadow-[0_10px_26px_rgb(33_24_32_/_0.16)]"
                  : "border-[var(--pf-line)] bg-[var(--pf-surface)] text-[var(--pf-ink)]"
              }`}
            >
              <span className="block text-sm font-black">{track.title}</span>
              <span
                className={`mt-1 block text-xs font-bold ${
                  isSelected ? "text-white/68" : "text-[var(--pf-muted)]"
                }`}
              >
                {track.key} · {track.vocal.replaceAll("_", " ")} ·{" "}
                {track.vibeTags.join(", ")}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-lg border border-[var(--pf-line)] bg-[var(--pf-surface)] p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
              Beat grid preview
            </p>
            <p className="mt-1 text-sm font-bold text-[var(--pf-ink)]">
              {selectedTrack.beatGrid.beatsPerBar}/bar · downbeat{" "}
              {selectedTrack.beatGrid.downbeatOffsetSeconds}s
            </p>
          </div>
          <span className="rounded-full bg-white px-2 py-1 text-[11px] font-black text-[var(--pf-muted)]">
            {selectedTrack.beatMapSource}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {beatPreview.map((beat) => (
            <div
              key={beat.label}
              className="rounded-md bg-white px-2 py-2 text-center"
            >
              <p className="text-[11px] font-black text-[var(--pf-muted)]">
                {beat.label}
              </p>
              <p className="mt-1 text-xs font-black text-[var(--pf-ink)]">
                {beat.timestampSeconds.toFixed(2)}s
              </p>
            </div>
          ))}
        </div>

        <audio
          controls
          preload="metadata"
          src={selectedTrack.previewUrl}
          className="mt-3 w-full"
        >
          <a href={selectedTrack.previewUrl}>Preview track</a>
        </audio>
      </div>
    </section>
  );
}
