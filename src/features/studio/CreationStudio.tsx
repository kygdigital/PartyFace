"use client";

import { useEffect, useMemo, useState } from "react";
import { starterTemplates } from "@/lib/templates/starterTemplates";
import {
  birthdayToneOptions,
  composeBirthdayPrompt,
  emptyBirthdayDetails,
} from "@/lib/templates/promptComposer";
import {
  defaultGenerationStyle,
  findGenerationStyle,
  type GenerationStyleId,
} from "@/lib/templates/generationStyles";
import {
  buildStoryTemplatePayload,
  defaultStoryTemplate,
  findStoryTemplate,
  storyTemplates,
} from "@/lib/templates/storyTemplates";
import { buildMotionGenerationPlan } from "@/lib/templates/motionPlan";
import { buildVideoAssemblyPlan } from "@/lib/templates/videoAssemblyPlan";
import { BirthdayPromptComposer } from "./components/BirthdayPromptComposer";
import { BenchmarkComparison } from "./components/BenchmarkComparison";
import { GenerationStyleSelector } from "./components/GenerationStyleSelector";
import { StoryTemplatePlanner } from "./components/StoryTemplatePlanner";
import { StarterTemplatePicker } from "./components/StarterTemplatePicker";
import { PersonSlots } from "./components/PersonSlots";
import { MotionPreview } from "./components/MotionPreview";
import { MotionPlanPreview } from "./components/MotionPlanPreview";
import { VideoAssemblyPlanPreview } from "./components/VideoAssemblyPlanPreview";
import { FinalVideoProgress } from "./components/FinalVideoProgress";
import { FavoritesSummary } from "./components/FavoritesSummary";
import { StillVariantGallery } from "./components/StillVariantGallery";
import { assessFacePhoto } from "./facePhotoValidation";
import { exportMotionVariant, exportStillVariant } from "./exportOutputs";
import { buildPartyFaceSetupPayload } from "./setupPayload";
import { createMockMotionVariant } from "./mockMotionVariants";
import { createMockStillVariants } from "./mockStillVariants";
import type { PersonSlot, PersonSlotId } from "./studioTypes";
import type { ApiResponse } from "@/lib/api/responses";
import type {
  FinalVideoGenerationStartResult,
  MotionGenerationStartResult,
  StillGenerationStartResult,
} from "@/lib/comfy/workflowTypes";
import {
  isActiveGenerationStatus,
  type GenerationJobRecord,
  type GenerationJobStatus,
  type MotionOutputVariant,
  type StillOutputVariant,
} from "@/lib/domain/generation";
import type { PartyFaceSetupPayload } from "@/lib/domain/project";

const initialPersonSlots: PersonSlot[] = [
  {
    id: "person-1",
    label: "Person 1",
    optional: false,
    photo: null,
  },
  {
    id: "person-2",
    label: "Person 2",
    optional: true,
    photo: null,
  },
];

export function CreationStudio() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(starterTemplates[0].id);
  const [selectedGenerationStyleId, setSelectedGenerationStyleId] =
    useState<GenerationStyleId>(defaultGenerationStyle.id);
  const [selectedStoryTemplateId, setSelectedStoryTemplateId] = useState(
    defaultStoryTemplate.id,
  );
  const [storyBeatCaptions, setStoryBeatCaptions] = useState<Record<string, string>>({});
  const [personSlots, setPersonSlots] = useState<PersonSlot[]>(initialPersonSlots);
  const [birthdayDetails, setBirthdayDetails] = useState(emptyBirthdayDetails);
  const [customPromptText, setCustomPromptText] = useState("");
  const [isPromptCustomized, setIsPromptCustomized] = useState(false);
  const [stillJobId, setStillJobId] = useState<string | null>(null);
  const [stillJobStatus, setStillJobStatus] = useState<GenerationJobStatus>("idle");
  const [stillGenerationError, setStillGenerationError] = useState<string | null>(null);
  const [stillJobSetupSnapshot, setStillJobSetupSnapshot] =
    useState<PartyFaceSetupPayload | null>(null);
  const [stillVariants, setStillVariants] = useState<StillOutputVariant[]>([]);
  const [favoriteStillVariantIds, setFavoriteStillVariantIds] = useState<string[]>([]);
  const [motionJobId, setMotionJobId] = useState<string | null>(null);
  const [motionJobStatus, setMotionJobStatus] =
    useState<GenerationJobStatus>("idle");
  const [motionGenerationError, setMotionGenerationError] = useState<string | null>(null);
  const [motionJobSetupSnapshot, setMotionJobSetupSnapshot] =
    useState<PartyFaceSetupPayload | null>(null);
  const [motionVariants, setMotionVariants] = useState<MotionOutputVariant[]>([]);
  const [favoriteMotionVariantIds, setFavoriteMotionVariantIds] = useState<string[]>([]);
  const [finalVideoJobId, setFinalVideoJobId] = useState<string | null>(null);
  const [finalVideoJobStatus, setFinalVideoJobStatus] =
    useState<GenerationJobStatus>("idle");
  const [finalVideoGenerationError, setFinalVideoGenerationError] =
    useState<string | null>(null);
  const [finalVideoJobRecord, setFinalVideoJobRecord] =
    useState<GenerationJobRecord | null>(null);
  const selectedTemplate = useMemo(
    () => starterTemplates.find((template) => template.id === selectedTemplateId) ?? starterTemplates[0],
    [selectedTemplateId],
  );
  const selectedGenerationStyle = useMemo(
    () => findGenerationStyle(selectedGenerationStyleId),
    [selectedGenerationStyleId],
  );
  const selectedStoryTemplate = useMemo(
    () => findStoryTemplate(selectedStoryTemplateId),
    [selectedStoryTemplateId],
  );
  const storyTemplatePayload = useMemo(
    () => buildStoryTemplatePayload(selectedStoryTemplate, storyBeatCaptions),
    [selectedStoryTemplate, storyBeatCaptions],
  );
  const composedPrompt = useMemo(
    () => composeBirthdayPrompt(selectedTemplate, birthdayDetails),
    [birthdayDetails, selectedTemplate],
  );
  const promptText = isPromptCustomized ? customPromptText : composedPrompt;
  const setupPayload = useMemo(
    () =>
      buildPartyFaceSetupPayload({
        template: selectedTemplate,
        generationStyle: selectedGenerationStyle,
        storyTemplate: storyTemplatePayload,
        birthdayDetails,
        prompt: promptText,
        personSlots,
      }),
    [
      birthdayDetails,
      personSlots,
      promptText,
      selectedGenerationStyle,
      storyTemplatePayload,
      selectedTemplate,
    ],
  );
  const motionGenerationPlan = useMemo(
    () => buildMotionGenerationPlan(setupPayload),
    [setupPayload],
  );
  const videoAssemblyPlan = useMemo(
    () => buildVideoAssemblyPlan(motionGenerationPlan),
    [motionGenerationPlan],
  );
  const hasUsablePerson = setupPayload.subjects.length > 0;
  const hasPrompt = promptText.trim().length > 0;
  const missingSetupItems = [
    hasUsablePerson ? null : "Add at least one usable face photo.",
    hasPrompt ? null : "Add or reset a generation prompt.",
  ].filter((item): item is string => Boolean(item));
  const isReadyToGenerate = missingSetupItems.length === 0;
  const isStillJobActive = isActiveGenerationStatus(stillJobStatus);
  const isMotionJobActive = isActiveGenerationStatus(motionJobStatus);
  const isFinalVideoJobActive = isActiveGenerationStatus(finalVideoJobStatus);
  const hasStillVariants = stillVariants.length > 0;
  const hasMotionVariants = motionVariants.length > 0;
  const selectedStillVariant =
    stillVariants.find((variant) =>
      favoriteStillVariantIds.includes(variant.variantId),
    ) ??
    stillVariants[0] ??
    null;
  const selectedMotionVariant =
    motionVariants.find((variant) =>
      favoriteMotionVariantIds.includes(variant.variantId),
    ) ??
    motionVariants[0] ??
    null;
  const stillFavorite =
    stillVariants.find((variant) =>
      favoriteStillVariantIds.includes(variant.variantId),
    ) ?? null;
  const motionFavorite =
    motionVariants.find((variant) =>
      favoriteMotionVariantIds.includes(variant.variantId),
    ) ?? null;
  const outputTracks = [
    {
      id: "still" as const,
      eyebrow: "Still Output",
      title: "Birthday poster variants",
      status:
        !isReadyToGenerate
          ? "Setup incomplete"
          : stillJobStatus !== "idle"
          ? stillJobStatus
          : "Ready",
      body:
        !isReadyToGenerate
          ? "Complete the setup requirements above to unlock still generation."
          : stillJobStatus === "complete"
            ? "Still generation is complete. Edit the prompt and regenerate to append another set."
          : isStillJobActive
            ? "Still generation is running. Setup inputs stay preserved while the job progresses."
          : stillJobId
            ? `Still job ${stillJobId} is queued.`
          : "This track will generate multiple still variants and keep favorites for comparison.",
    },
    {
      id: "motion" as const,
      eyebrow: "Motion Output",
      title: "Short birthday motion",
      status:
        !isReadyToGenerate
          ? "Setup incomplete"
          : motionJobStatus !== "idle"
          ? motionJobStatus
          : "Ready",
      body:
        !isReadyToGenerate
          ? "Complete the setup requirements above to unlock motion generation."
          : motionJobId
          ? `Motion job ${motionJobId} is ${motionJobStatus}.`
          : "This track will generate a browser-playable animated card or short video.",
    },
    {
      id: "final-video" as const,
      eyebrow: "Final Video",
      title: "30-second beat clips",
      status:
        !isReadyToGenerate
          ? "Setup incomplete"
          : finalVideoJobStatus !== "idle"
            ? finalVideoJobStatus
            : "Ready",
      body:
        !isReadyToGenerate
          ? "Complete the setup requirements above to unlock final video generation."
          : finalVideoJobId
            ? `Final video job ${finalVideoJobId} is ${finalVideoJobStatus}.`
            : "This track generates one beat clip per storyboard scene before stitching.",
    },
  ];

  useEffect(() => {
    if (!stillJobId || !isActiveGenerationStatus(stillJobStatus)) return;

    const pollJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${stillJobId}`);
        const result = (await response.json()) as ApiResponse<GenerationJobRecord>;

        if (result.ok) {
          setStillJobStatus(result.data.status);

          if (result.data.status === "complete" && stillJobSetupSnapshot) {
            setStillVariants((currentVariants) => {
              const hasCurrentJobVariants = currentVariants.some(
                (variant) => variant.jobId === result.data.jobId,
              );

              if (hasCurrentJobVariants) return currentVariants;

              if (
                result.data.outputType === "still" &&
                hasStillOutputs(result.data.outputs)
              ) {
                return [...currentVariants, ...result.data.outputs];
              }

              return [
                ...currentVariants,
                ...createMockStillVariants(
                  result.data.jobId,
                  stillJobSetupSnapshot,
                  result.data.variantCount,
                ),
              ];
            });
          }

          return;
        }

        setStillJobStatus("failed");
        setStillGenerationError(result.error.message);
      } catch {
        setStillJobStatus("failed");
        setStillGenerationError("Still generation status could not be checked.");
      }
    };

    pollJob();
    const intervalId = window.setInterval(pollJob, 1200);

    return () => window.clearInterval(intervalId);
  }, [stillJobId, stillJobSetupSnapshot, stillJobStatus]);

  useEffect(() => {
    if (!motionJobId || !isActiveGenerationStatus(motionJobStatus)) return;

    const pollJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${motionJobId}`);
        const result = (await response.json()) as ApiResponse<GenerationJobRecord>;

        if (result.ok) {
          setMotionJobStatus(result.data.status);

          if (result.data.status === "complete" && motionJobSetupSnapshot) {
            setMotionVariants((currentVariants) => {
              const hasCurrentJobVariant = currentVariants.some(
                (variant) => variant.jobId === result.data.jobId,
              );

              if (hasCurrentJobVariant) return currentVariants;

              if (
                result.data.outputType === "motion" &&
                hasMotionOutputs(result.data.outputs)
              ) {
                return [...currentVariants, ...result.data.outputs];
              }

              return [
                ...currentVariants,
                createMockMotionVariant(result.data.jobId, motionJobSetupSnapshot, 5),
              ];
            });
          }

          return;
        }

        setMotionJobStatus("failed");
        setMotionGenerationError(result.error.message);
      } catch {
        setMotionJobStatus("failed");
        setMotionGenerationError("Motion generation status could not be checked.");
      }
    };

    pollJob();
    const intervalId = window.setInterval(pollJob, 1200);

    return () => window.clearInterval(intervalId);
  }, [motionJobId, motionJobSetupSnapshot, motionJobStatus]);

  useEffect(() => {
    if (!finalVideoJobId || !isActiveGenerationStatus(finalVideoJobStatus)) return;

    const pollJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${finalVideoJobId}`);
        const result = (await response.json()) as ApiResponse<GenerationJobRecord>;

        if (result.ok) {
          setFinalVideoJobRecord(result.data);
          setFinalVideoJobStatus(result.data.status);
          return;
        }

        setFinalVideoJobStatus("failed");
        setFinalVideoGenerationError(result.error.message);
      } catch {
        setFinalVideoJobStatus("failed");
        setFinalVideoGenerationError("Final video status could not be checked.");
      }
    };

    pollJob();
    const intervalId = window.setInterval(pollJob, 1200);

    return () => window.clearInterval(intervalId);
  }, [finalVideoJobId, finalVideoJobStatus]);

  async function handleUploadPhoto(slotId: PersonSlotId, file: File) {
    const usability = await assessFacePhoto(file);
    const previewUrl = URL.createObjectURL(file);
    const uploadRef = await readFileAsDataUrl(file);

    setPersonSlots((currentSlots) =>
      currentSlots.map((slot) => {
        if (slot.id !== slotId) return slot;
        if (slot.photo) URL.revokeObjectURL(slot.photo.previewUrl);

        return {
          ...slot,
          photo: {
            fileName: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
            previewUrl,
            uploadRef,
            usability,
          },
        };
      }),
    );
  }

  function handleRemovePhoto(slotId: PersonSlotId) {
    setPersonSlots((currentSlots) =>
      currentSlots.map((slot) => {
        if (slot.id !== slotId) return slot;
        if (slot.photo) URL.revokeObjectURL(slot.photo.previewUrl);
        return { ...slot, photo: null };
      }),
    );
  }

  function handleSelectTemplate(templateId: string) {
    setSelectedTemplateId(templateId);
    setCustomPromptText("");
    setIsPromptCustomized(false);
  }

  function handleSelectStoryTemplate(templateId: string) {
    setSelectedStoryTemplateId(templateId);
    setStoryBeatCaptions({});
  }

  function handleChangeBeatCaption(beatId: string, caption: string) {
    setStoryBeatCaptions((currentCaptions) => ({
      ...currentCaptions,
      [beatId]: caption,
    }));
  }

  function handleChangePrompt(nextPrompt: string) {
    setCustomPromptText(nextPrompt);
    setIsPromptCustomized(nextPrompt !== composedPrompt);
  }

  function handleResetPrompt() {
    setCustomPromptText("");
    setIsPromptCustomized(false);
  }

  async function handleStillGenerate() {
    if (!isReadyToGenerate || isStillJobActive) return;

    setStillJobStatus("uploading");
    setStillGenerationError(null);
    setStillJobSetupSnapshot(setupPayload);

    try {
      const response = await fetch("/api/generate/still", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(setupPayload),
      });
      const result = (await response.json()) as ApiResponse<StillGenerationStartResult>;

      if (result.ok) {
        setStillJobId(result.data.jobId);
        setStillJobStatus(result.data.status);
        return;
      }

      setStillJobStatus("failed");
      setStillGenerationError(result.error.message);
    } catch {
      setStillJobStatus("failed");
      setStillGenerationError("Still generation could not start. Please try again.");
    }
  }

  async function handleMotionGenerate() {
    if (!isReadyToGenerate || isMotionJobActive) return;

    setMotionJobStatus("uploading");
    setMotionGenerationError(null);
    setMotionJobSetupSnapshot(setupPayload);

    try {
      const response = await fetch("/api/generate/motion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(setupPayload),
      });
      const result = (await response.json()) as ApiResponse<MotionGenerationStartResult>;

      if (result.ok) {
        setMotionJobId(result.data.jobId);
        setMotionJobStatus(result.data.status);
        return;
      }

      setMotionJobStatus("failed");
      setMotionGenerationError(result.error.message);
    } catch {
      setMotionJobStatus("failed");
      setMotionGenerationError("Motion generation could not start. Please try again.");
    }
  }

  async function handleFinalVideoGenerate() {
    if (!isReadyToGenerate || isFinalVideoJobActive) return;

    setFinalVideoJobStatus("uploading");
    setFinalVideoGenerationError(null);
    setFinalVideoJobRecord(null);

    try {
      const response = await fetch("/api/generate/final-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(setupPayload),
      });
      const result = (await response.json()) as ApiResponse<FinalVideoGenerationStartResult>;

      if (result.ok) {
        setFinalVideoJobId(result.data.jobId);
        setFinalVideoJobStatus(result.data.status);
        setFinalVideoJobRecord({
          jobId: result.data.jobId,
          outputType: "final-video",
          status: result.data.status,
          workflowId: result.data.workflowId,
          mode: result.data.mode,
          variantCount: result.data.clipCount,
          providerJobIds: result.data.providerJobIds,
          clipStatuses: result.data.clipStatuses,
          promptSnapshot: result.data.promptSnapshot,
          motionPlanSnapshot: result.data.motionPlanSnapshot,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        return;
      }

      setFinalVideoJobStatus("failed");
      setFinalVideoGenerationError(result.error.message);
    } catch {
      setFinalVideoJobStatus("failed");
      setFinalVideoGenerationError(
        "Final video generation could not start. Please try again.",
      );
    }
  }

  function handleToggleStillFavorite(variantId: string) {
    setFavoriteStillVariantIds((currentIds) =>
      currentIds.includes(variantId)
        ? currentIds.filter((currentId) => currentId !== variantId)
        : [...currentIds, variantId],
    );
  }

  return (
    <main className="min-h-screen w-full">
      <div className="mx-auto grid min-h-screen w-full max-w-[1440px] gap-6 px-5 py-5 lg:grid-cols-[400px_minmax(0,1fr)] lg:px-7 lg:py-7">
        <aside className="rounded-lg border border-[var(--pf-line)] bg-[rgb(255_255_255_/_0.86)] p-5 shadow-[0_20px_70px_rgb(33_24_32_/_0.12)] backdrop-blur">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-[var(--pf-surface-night)] text-sm font-black text-white">
              PF
            </div>
            <div>
              <h1 className="font-serif text-3xl font-black leading-none text-[var(--pf-ink)]">
                PartyFace
              </h1>
              <p className="mt-1 text-sm font-semibold text-[var(--pf-muted)]">
                Birthday creation studio
              </p>
            </div>
          </div>

          <div className="grid gap-3" aria-label="Creation setup">
            <StarterTemplatePicker
              selectedTemplateId={selectedTemplateId}
              templates={starterTemplates}
              onSelectTemplate={handleSelectTemplate}
            />

            <PersonSlots
              slots={personSlots}
              onUploadPhoto={handleUploadPhoto}
              onRemovePhoto={handleRemovePhoto}
            />

            <GenerationStyleSelector
              selectedStyleId={selectedGenerationStyleId}
              onSelectStyle={setSelectedGenerationStyleId}
            />

            <StoryTemplatePlanner
              selectedTemplateId={selectedStoryTemplateId}
              templates={storyTemplates}
              captionsByBeatId={storyBeatCaptions}
              onSelectTemplate={handleSelectStoryTemplate}
              onChangeBeatCaption={handleChangeBeatCaption}
            />

            <BirthdayPromptComposer
              details={birthdayDetails}
              promptText={promptText}
              isPromptCustomized={isPromptCustomized}
              toneOptions={birthdayToneOptions}
              onChangeDetails={setBirthdayDetails}
              onChangePrompt={handleChangePrompt}
              onResetPrompt={handleResetPrompt}
            />
          </div>
        </aside>

        <section className="grid min-w-0 gap-6">
          <div className="overflow-hidden rounded-lg bg-[var(--pf-surface-night)] text-white shadow-[0_28px_90px_rgb(26_16_40_/_0.22)]">
            <div className="grid gap-8 p-6 md:grid-cols-[1fr_300px] md:p-8">
              <div className="flex min-h-[300px] flex-col justify-between gap-10">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-disco-gold)]">
                    {birthdayDetails.tone || selectedTemplate.birthdayVibe}
                  </p>
                  <h2 className="mt-4 max-w-2xl font-serif text-5xl font-black leading-none md:text-6xl">
                    {selectedTemplate.name}
                  </h2>
                  <p className="mt-5 max-w-xl text-base font-semibold leading-7 text-white/74">
                    {selectedTemplate.description}{" "}
                    {birthdayDetails.recipientName
                      ? `${birthdayDetails.recipientName}'s details are now in the prompt.`
                      : "Template defaults are ready for the prompt and generation tracks."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={!isReadyToGenerate || isStillJobActive}
                    onClick={handleStillGenerate}
                    className="min-h-11 rounded-lg bg-[var(--pf-neon-pink)] px-4 text-sm font-black text-white shadow-[0_12px_36px_rgb(255_61_167_/_0.34)] disabled:cursor-not-allowed disabled:bg-white/18 disabled:text-white/52 disabled:shadow-none"
                  >
                    {hasStillVariants ? "Regenerate stills" : "Generate stills"}
                  </button>
                  <button
                    type="button"
                    disabled={!isReadyToGenerate || isMotionJobActive}
                    onClick={handleMotionGenerate}
                    className="min-h-11 rounded-lg border border-white/24 bg-white/10 px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:text-white/52"
                  >
                    {hasMotionVariants ? "Regenerate motion" : "Generate motion"}
                  </button>
                </div>
              </div>

              <div className="grid content-center gap-3">
                <div className="rounded-lg border border-white/12 bg-white/10 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-white/58">
                    Person slots
                  </p>
                  <div className="mt-4 flex gap-3">
                    {personSlots.map((slot, index) => (
                      <div
                        key={slot.id}
                        className={`grid h-24 w-24 place-items-center overflow-hidden rounded-full border-2 border-dashed bg-white/8 text-sm font-black ${
                          index === 0
                            ? "border-[var(--pf-disco-gold)]"
                            : "border-[var(--pf-electric-blue)]"
                        }`}
                      >
                        {slot.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={slot.photo.previewUrl}
                            alt={`${slot.label} preview`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          slot.label
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-white/12 bg-white/10 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-black uppercase tracking-[0.08em] text-white/58">
                      Setup status
                    </p>
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-black ${
                        isReadyToGenerate
                          ? "bg-[rgb(36_188_129_/_0.18)] text-[rgb(125_243_190)]"
                          : "bg-white/10 text-white/64"
                      }`}
                    >
                      {isReadyToGenerate ? "Ready" : "Needs setup"}
                    </span>
                  </div>
                  <ul className="mt-3 grid gap-2 text-sm font-semibold leading-6 text-white/78">
                    {isReadyToGenerate ? (
                      <>
                        <li>Ready for still and motion generation previews.</li>
                        <li>
                          {setupPayload.subjects.length} face reference
                          {setupPayload.subjects.length === 1 ? "" : "s"} ready for
                          Nano Banana.
                        </li>
                        <li>{setupPayload.generationStyle.name} style selected.</li>
                        <li>{setupPayload.storyTemplate.name} story arc selected.</li>
                        {stillJobId ? (
                          <li>
                            Still job {stillJobId}: {stillJobStatus}
                          </li>
                        ) : null}
                        {stillGenerationError ? <li>{stillGenerationError}</li> : null}
                        {motionJobId ? (
                          <li>
                            Motion job {motionJobId}: {motionJobStatus}
                          </li>
                        ) : null}
                        {motionGenerationError ? <li>{motionGenerationError}</li> : null}
                        {finalVideoJobId ? (
                          <li>
                            Final video job {finalVideoJobId}: {finalVideoJobStatus}
                          </li>
                        ) : null}
                        {finalVideoGenerationError ? (
                          <li>{finalVideoGenerationError}</li>
                        ) : null}
                      </>
                    ) : (
                      missingSetupItems.map((item) => <li key={item}>{item}</li>)
                    )}
                  </ul>
                </div>

                <div className="rounded-lg border border-white/12 bg-white/10 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-white/58">
                    Prompt preview
                  </p>
                  <p className="mt-3 text-sm font-semibold leading-6 text-white/78">
                    {promptText}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {outputTracks.map((track) => (
              <section
                key={track.eyebrow}
                className="rounded-lg border border-[var(--pf-line)] bg-[var(--pf-surface-raised)] p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pf-muted)]">
                    {track.eyebrow}
                  </p>
                  <span className="rounded-full bg-[var(--pf-surface)] px-3 py-1 text-xs font-black text-[var(--pf-muted)]">
                    {track.status}
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-black text-[var(--pf-ink)]">
                  {track.title}
                </h3>
                <p className="mt-2 text-sm font-medium leading-6 text-[var(--pf-muted)]">
                  {track.body}
                </p>
              </section>
            ))}
          </div>

          <MotionPlanPreview plan={motionGenerationPlan} />

          <VideoAssemblyPlanPreview plan={videoAssemblyPlan} />

          <FinalVideoProgress
            job={finalVideoJobRecord}
            isReadyToGenerate={isReadyToGenerate}
            isActive={isFinalVideoJobActive}
            error={finalVideoGenerationError}
            onGenerateFinalVideo={handleFinalVideoGenerate}
          />

          <MotionPreview
            variants={motionVariants}
            favoriteVariantIds={favoriteMotionVariantIds}
            onToggleFavorite={(variantId) =>
              setFavoriteMotionVariantIds((currentIds) =>
                currentIds.includes(variantId)
                  ? currentIds.filter((currentId) => currentId !== variantId)
                  : [...currentIds, variantId],
              )
            }
            onClearFavorites={() => setFavoriteMotionVariantIds([])}
            onExportMotion={() => exportMotionVariant(selectedMotionVariant)}
          />

          <StillVariantGallery
            variants={stillVariants}
            favoriteVariantIds={favoriteStillVariantIds}
            onToggleFavorite={handleToggleStillFavorite}
            onClearFavorites={() => setFavoriteStillVariantIds([])}
            onExportStill={() => exportStillVariant(selectedStillVariant)}
          />

          <FavoritesSummary
            stillFavorite={stillFavorite}
            motionFavorite={motionFavorite}
            onExportStill={() => exportStillVariant(selectedStillVariant)}
            onExportMotion={() => exportMotionVariant(selectedMotionVariant)}
          />

          <BenchmarkComparison
            hasStillFavorite={Boolean(stillFavorite)}
            hasMotionFavorite={Boolean(motionFavorite)}
            onExportStill={() => exportStillVariant(selectedStillVariant)}
            onExportMotion={() => exportMotionVariant(selectedMotionVariant)}
          />
        </section>
      </div>
    </main>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Photo could not be prepared for upload."));
    };

    reader.onerror = () => reject(new Error("Photo could not be prepared for upload."));
    reader.readAsDataURL(file);
  });
}

function hasStillOutputs(
  outputs: GenerationJobRecord["outputs"],
): outputs is StillOutputVariant[] {
  return Boolean(outputs?.every((output) => "styleNotes" in output));
}

function hasMotionOutputs(
  outputs: GenerationJobRecord["outputs"],
): outputs is MotionOutputVariant[] {
  return Boolean(outputs?.every((output) => "previewKind" in output));
}
