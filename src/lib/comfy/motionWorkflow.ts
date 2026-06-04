import type { PartyFaceSetupPayload } from "@/lib/domain/project";
import { buildMotionGenerationPlan } from "@/lib/templates/motionPlan";
import {
  submitComfyWorkflow,
  uploadComfyInputImage,
} from "./comfyCloudClient";
import { buildStillImageReferences } from "./stillImageReferences";
import { buildSeedanceMotionWorkflow } from "./motionWorkflowGraph";
import type {
  ComfyWorkflowMode,
  MotionGenerationStartResult,
  MotionWorkflowAdapterOptions,
  MotionWorkflowRequest,
  MotionWorkflowSelection,
} from "./workflowTypes";

const DEFAULT_NEGATIVE_PROMPT =
  "low quality, flicker, warped face, distorted body, unreadable text, watermark, harsh cuts, contact sheet, storyboard grid, multi-panel layout, split screen, tiled frames, collage panels, comic strip panels";

const MOCK_JOB_PREFIX = "mock-motion";
const MAX_MOTION_SEED = 2_147_483_647;

// Selected motion workflow for the PartyFace MVP:
// Use a two-step Comfy Cloud graph: first create a Nano Banana/Gemini still
// frame from the PartyFace setup and uploaded face references, then animate
// that first frame with ByteDance/Seedance Image-to-Video and save an MP4.
//
// Discovery notes:
// - ByteDanceImageToVideoNode accepts IMAGE input, prompt, resolution,
//   aspect_ratio, duration, seed, camera_fixed, watermark, and generate_audio.
// - SaveVideo accepts VIDEO input and can save mp4/h264.
// - Motion stays muted in the browser regardless of provider audio support.
export const selectedMotionWorkflow: MotionWorkflowSelection = {
  workflowId: "partyface-seedance-motion-v1",
  displayName: "PartyFace Seedance Motion",
  modelName: "ByteDance Seedance Image to Video",
  outputType: "motion-video",
  expectedFormat: "video/mp4",
  preview: {
    browserPlayable: true,
    autoplayWithSound: false,
    posterStrategy: "generated-first-frame",
  },
  durationSeconds: {
    target: 5,
    minimum: 3,
    maximum: 12,
  },
  comfyContract: {
    submissionPath: "submit_workflow",
    nodes: {
      stillGeneration: {
        id: "10",
        classType: "GeminiImage2Node",
        selectedModel: "gemini-3-pro-image-preview",
      },
      motionGeneration: {
        id: "30",
        classType: "ByteDanceImageToVideoNode",
        selectedModel: "seedance-1-0-pro-fast-251015",
      },
      output: {
        id: "40",
        classType: "SaveVideo",
      },
    },
    defaultInputs: {
      resolution: "720p",
      aspect_ratio: "adaptive",
      duration: 5,
      format: "mp4",
      codec: "h264",
      watermark: false,
      generate_audio: false,
    },
    unresolvedInputs: [
      "Whether Seedance or Kling produces better motion for cutout-head composites",
      "Whether to animate only the generated still or use separate face/body layers later",
    ],
  },
  assumptions: [
    "Real motion submission is server-side only and begins in the API route story.",
    "Mock mode is the fallback until the real motion workflow is stable.",
    "Motion previews are muted by default and require an explicit user action for sound.",
  ],
};

export function resolveMotionWorkflowMode(
  requestedMode?: ComfyWorkflowMode,
): ComfyWorkflowMode {
  if (requestedMode) return requestedMode;

  return process.env.PARTYFACE_MOTION_WORKFLOW_MODE === "comfy" &&
    process.env.COMFY_API_KEY
    ? "comfy"
    : "mock";
}

export function buildMotionWorkflowRequest(
  setup: PartyFaceSetupPayload,
  options: MotionWorkflowAdapterOptions = {},
): MotionWorkflowRequest {
  const mode = resolveMotionWorkflowMode(options.mode);
  const generationPlan = buildMotionGenerationPlan(setup);
  const durationSeconds = clampDuration(
    options.durationSeconds ?? selectedMotionWorkflow.durationSeconds.target,
  );

  return {
    mode,
    workflow: selectedMotionWorkflow,
    setup,
    generationPlan,
    prompt: buildMotionPrompt(setup, generationPlan),
    negativePrompt: DEFAULT_NEGATIVE_PROMPT,
    imageReferences: buildStillImageReferences(setup, selectedMotionWorkflow),
    seed: normalizeMotionSeed(options.seed ?? Date.now()),
    durationSeconds,
  };
}

export async function startMotionGeneration(
  setup: PartyFaceSetupPayload,
  options: MotionWorkflowAdapterOptions = {},
): Promise<MotionGenerationStartResult> {
  const request = buildMotionWorkflowRequest(setup, options);

  if (request.mode === "mock") {
    return {
      jobId: `${MOCK_JOB_PREFIX}-${Date.now()}`,
      status: "queued",
      mode: request.mode,
      workflowId: request.workflow.workflowId,
      durationSeconds: request.durationSeconds,
      promptSnapshot: request.prompt,
      motionPlanSnapshot: request.generationPlan,
    };
  }

  const uploadedImages = await Promise.all(
    request.imageReferences.map((reference) => uploadComfyInputImage(reference)),
  );
  const workflow = buildSeedanceMotionWorkflow({
    stillPrompt: buildMotionFirstFramePrompt(setup),
    motionPrompt: request.prompt,
    negativePrompt: request.negativePrompt,
    seed: request.seed,
    durationSeconds: request.durationSeconds,
    uploadedImages,
    filenamePrefix: "partyface/motion/motion-1",
  });
  const result = await submitComfyWorkflow(workflow);

  return {
    jobId: `comfy-motion-${Date.now()}`,
    status: "queued",
    mode: request.mode,
    workflowId: request.workflow.workflowId,
    durationSeconds: request.durationSeconds,
    providerJobIds: [result.promptId],
    promptSnapshot: request.prompt,
    motionPlanSnapshot: request.generationPlan,
  };
}

function clampDuration(durationSeconds: number) {
  return Math.min(
    selectedMotionWorkflow.durationSeconds.maximum,
    Math.max(selectedMotionWorkflow.durationSeconds.minimum, durationSeconds),
  );
}

export function normalizeMotionSeed(seed: number) {
  return Math.max(0, Math.floor(seed) % MAX_MOTION_SEED);
}

function buildMotionPrompt(
  setup: PartyFaceSetupPayload,
  generationPlan = buildMotionGenerationPlan(setup),
) {
  const subjectInstruction =
    setup.subjects.length === 1
      ? "Animate the uploaded face photo as the birthday subject."
      : "Animate both uploaded face photos as the birthday subjects.";

  return [
    setup.prompt.trim(),
    setup.generationStyle.promptInstruction,
    subjectInstruction,
    "Animate the birthday poster as one continuous full-screen video shot: a single scene, one camera view, no storyboard grid, no tiled frames, no split-screen, no contact sheet, no comic panels. Use gentle camera push, shimmer, confetti, outfit movement where appropriate, sparkle, and party energy. Keep faces stable and recognizable. No sound required.",
    summarizeSingleMotionStoryDirection(generationPlan),
    `Template: ${setup.template.name}.`,
    setup.birthdayDetails.recipientName
      ? `Recipient: ${setup.birthdayDetails.recipientName}.`
      : null,
    setup.birthdayDetails.message
      ? `Readable birthday message: ${setup.birthdayDetails.message}.`
      : null,
  ]
    .filter(Boolean)
    .join(" ");
}

function buildMotionFirstFramePrompt(setup: PartyFaceSetupPayload) {
  const subjectInstruction =
    setup.subjects.length === 1
      ? "Feature the uploaded face photo as the birthday subject."
      : "Feature both uploaded face photos as the birthday subjects.";

  return [
    setup.prompt.trim(),
    setup.generationStyle.promptInstruction,
    subjectInstruction,
    "Create one clean full-screen first frame for an image-to-video birthday motion card. Use a single scene and one camera view. Do not create a storyboard grid, multi-panel layout, contact sheet, split-screen, tiled frames, or comic panels. Leave enough visual stability for animation.",
    summarizeSingleMotionStoryDirection(buildMotionGenerationPlan(setup)),
    `Template: ${setup.template.name}.`,
    setup.birthdayDetails.recipientName
      ? `Recipient: ${setup.birthdayDetails.recipientName}.`
      : null,
    setup.birthdayDetails.message
      ? `Readable birthday message: ${setup.birthdayDetails.message}.`
      : null,
  ]
    .filter(Boolean)
    .join(" ");
}

function summarizeSingleMotionStoryDirection(
  generationPlan: ReturnType<typeof buildMotionGenerationPlan>,
) {
  const featuredClip = generationPlan.clips[1] ?? generationPlan.clips[0];
  const finaleClip = generationPlan.clips[generationPlan.clips.length - 1];

  return [
    `Story mood: ${generationPlan.summary}.`,
    featuredClip
      ? `Primary action for this short clip: ${featuredClip.title}: ${featuredClip.caption}. ${featuredClip.visualPrompt}`
      : null,
    finaleClip
      ? `End feeling: ${finaleClip.caption}. Keep the ending as an overlay or final pose inside the same single scene.`
      : null,
  ]
    .filter(Boolean)
    .join(" ");
}
