import type { PartyFaceSetupPayload } from "@/lib/domain/project";
import {
  buildMotionGenerationPlan,
  summarizeMotionGenerationPlan,
} from "@/lib/templates/motionPlan";
import {
  submitComfyWorkflow,
  uploadComfyInputImage,
} from "./comfyCloudClient";
import { buildSeedanceMotionWorkflow } from "./motionWorkflowGraph";
import { normalizeMotionSeed, selectedMotionWorkflow } from "./motionWorkflow";
import { buildStillImageReferences } from "./stillImageReferences";
import type {
  ComfyWorkflowMode,
  FinalVideoGenerationStartResult,
  MotionWorkflowAdapterOptions,
} from "./workflowTypes";

const DEFAULT_NEGATIVE_PROMPT =
  "low quality, flicker, warped face, distorted body, unreadable text, watermark, harsh cuts";

const MOCK_JOB_PREFIX = "mock-final-video";

export function resolveFinalVideoWorkflowMode(
  requestedMode?: ComfyWorkflowMode,
): ComfyWorkflowMode {
  if (requestedMode) return requestedMode;

  return process.env.PARTYFACE_FINAL_VIDEO_WORKFLOW_MODE === "comfy" &&
    process.env.COMFY_API_KEY
    ? "comfy"
    : "mock";
}

export async function startFinalVideoGeneration(
  setup: PartyFaceSetupPayload,
  options: MotionWorkflowAdapterOptions = {},
): Promise<FinalVideoGenerationStartResult> {
  const mode = resolveFinalVideoWorkflowMode(options.mode);
  const generationPlan = buildMotionGenerationPlan(setup);
  const baseSeed = normalizeMotionSeed(options.seed ?? Date.now());
  const promptSnapshot = summarizeMotionGenerationPlan(generationPlan);

  if (mode === "mock") {
    return {
      jobId: `${MOCK_JOB_PREFIX}-${Date.now()}`,
      status: "queued",
      mode,
      workflowId: `${selectedMotionWorkflow.workflowId}-per-beat`,
      clipCount: generationPlan.clips.length,
      durationSeconds: generationPlan.targetDurationSeconds,
      clipStatuses: buildInitialClipStatuses(generationPlan),
      promptSnapshot,
      motionPlanSnapshot: generationPlan,
    };
  }

  const imageReferences = buildStillImageReferences(setup, selectedMotionWorkflow);
  const uploadedImages = await Promise.all(
    imageReferences.map((reference) => uploadComfyInputImage(reference)),
  );

  const providerJobIds = await Promise.all(
    generationPlan.clips.map(async (clip, index) => {
      const workflow = buildSeedanceMotionWorkflow({
        stillPrompt: buildFinalVideoFirstFramePrompt(setup, clip.visualPrompt),
        motionPrompt: buildFinalVideoClipPrompt(setup, clip.visualPrompt),
        negativePrompt: DEFAULT_NEGATIVE_PROMPT,
        seed: normalizeMotionSeed(baseSeed + index + 1),
        durationSeconds: clip.durationSeconds,
        uploadedImages,
        filenamePrefix: `partyface/final-video/clip-${clip.sequence}`,
      });
      const result = await submitComfyWorkflow(workflow);

      return result.promptId;
    }),
  );

  return {
    jobId: `comfy-final-video-${Date.now()}`,
    status: "queued",
    mode,
    workflowId: `${selectedMotionWorkflow.workflowId}-per-beat`,
    clipCount: generationPlan.clips.length,
    durationSeconds: generationPlan.targetDurationSeconds,
    providerJobIds,
    clipStatuses: buildInitialClipStatuses(generationPlan, providerJobIds),
    promptSnapshot,
    motionPlanSnapshot: generationPlan,
  };
}

function buildInitialClipStatuses(
  generationPlan: ReturnType<typeof buildMotionGenerationPlan>,
  providerJobIds: string[] = [],
) {
  return generationPlan.clips.map((clip, index) => ({
    clipId: clip.clipId,
    title: clip.title,
    sequence: clip.sequence,
    timeRange: clip.timeRange,
    status: "queued" as const,
    providerJobId: providerJobIds[index],
  }));
}

function buildFinalVideoFirstFramePrompt(
  setup: PartyFaceSetupPayload,
  clipPrompt: string,
) {
  return [
    setup.prompt.trim(),
    clipPrompt,
    "Create a stable first frame for this specific story beat. Keep uploaded face references recognizable.",
  ].join(" ");
}

function buildFinalVideoClipPrompt(
  setup: PartyFaceSetupPayload,
  clipPrompt: string,
) {
  return [
    clipPrompt,
    "Animate only this story beat as one short clip for a stitched birthday video.",
    "Keep faces stable, readable, and recognizable. No sound required; music will be attached later.",
    setup.birthdayDetails.recipientName
      ? `Recipient: ${setup.birthdayDetails.recipientName}.`
      : null,
  ]
    .filter(Boolean)
    .join(" ");
}
