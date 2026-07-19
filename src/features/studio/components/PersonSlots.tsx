import type { ChangeEvent } from "react";
import type { PersonSlot, PersonSlotId } from "../studioTypes";

type PersonSlotsProps = {
  slots: PersonSlot[];
  onUploadPhoto: (slotId: PersonSlotId, file: File) => void;
  onRemovePhoto: (slotId: PersonSlotId) => void;
};

export function PersonSlots({ slots, onUploadPhoto, onRemovePhoto }: PersonSlotsProps) {
  return (
    <section className="rounded-lg border border-[var(--pf-line)] bg-[var(--pf-surface-raised)] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
          People
        </p>
        <span className="rounded-full border border-[var(--pf-line)] px-2 py-1 text-[11px] font-extrabold text-[var(--pf-violet)]">
          2 slots
        </span>
      </div>

      <div className="grid gap-3">
        {slots.map((slot) => {
          const needsRetry = slot.photo?.usability.status === "needs-retry";

          return (
            <div
              key={slot.id}
              className={`rounded-lg border bg-white p-3 ${
                needsRetry ? "border-[var(--pf-neon-pink)]" : "border-[var(--pf-line)]"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-dashed border-[var(--pf-line)] bg-[var(--pf-surface)] text-xs font-black text-[var(--pf-muted)]">
                  {slot.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={slot.photo.previewUrl}
                      alt={`${slot.label} preview`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>Add face</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-black text-[var(--pf-ink)]">
                      {slot.label}
                    </h2>
                    {slot.optional ? (
                      <span className="rounded-full bg-[var(--pf-surface)] px-2 py-1 text-[11px] font-black text-[var(--pf-muted)]">
                        Optional
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-1 truncate text-xs font-semibold text-[var(--pf-muted)]">
                    {slot.photo?.fileName ?? "Upload one face photo for this person."}
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-[var(--pf-muted)]">
                    {slot.photo
                      ? "Local circular cutout preview. This renderer keeps the face file on this machine."
                      : "Best results: one front-facing face, clear light, no heavy crop."}
                  </p>

                  {slot.photo ? (
                    <p
                      className={`mt-2 rounded-lg px-3 py-2 text-xs font-bold leading-5 ${
                        needsRetry
                          ? "bg-[rgb(255_61_167_/_0.10)] text-[var(--pf-neon-pink)]"
                          : "bg-[rgb(36_188_129_/_0.12)] text-[rgb(24_123_87)]"
                      }`}
                    >
                      {slot.photo.usability.message}
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <label className="inline-flex min-h-9 cursor-pointer items-center rounded-lg bg-[var(--pf-neon-pink)] px-3 text-xs font-black text-white">
                      {slot.photo ? "Replace" : "Upload"}
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(event) => handleFileChange(event, slot.id, onUploadPhoto)}
                      />
                    </label>
                    {slot.photo ? (
                      <button
                        type="button"
                        onClick={() => onRemovePhoto(slot.id)}
                        className="min-h-9 rounded-lg border border-[var(--pf-line)] px-3 text-xs font-black text-[var(--pf-ink)]"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function handleFileChange(
  event: ChangeEvent<HTMLInputElement>,
  slotId: PersonSlotId,
  onUploadPhoto: (slotId: PersonSlotId, file: File) => void,
) {
  const file = event.target.files?.[0];
  if (!file) return;

  onUploadPhoto(slotId, file);
  event.target.value = "";
}
