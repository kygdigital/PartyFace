import type { PartyFaceSetupPayload } from "@/lib/domain/project";
import {
  submitComfyWorkflow,
  uploadComfyInputImage,
} from "./comfyCloudClient";
import { buildStillImageReferences } from "./stillImageReferences";
import { buildNanoBananaStillWorkflow } from "./stillWorkflowGraph";
import type {
  ComfyWorkflowMode,
  StillGenerationStartResult,
  StillWorkflowAdapterOptions,
  StillWorkflowRequest,
  StillWorkflowSelection,
} from "./workflowTypes";

const DEFAULT_NEGATIVE_PROMPT =
  "low quality, blurry faces, distorted hands, extra limbs, unreadable text, watermark";

const MOCK_JOB_PREFIX = "mock-still";

// Selected real still workflow for PartyFace:
// Prefer Comfy Cloud's Gemini/Nano Banana image path for the first identity-aware
// birthday poster/card workflow. Discovery via the Comfy MCP confirmed:
// - Saved workflows exist, but none are an obvious PartyFace still graph.
// - Krea2ImageNode is available and strong for prompt-only/style-led posters.
// - Gemini/Nano Banana nodes are also available under api node/image/Gemini.
// - Nano Banana accepts IMAGE reference inputs, including multiple references,
//   which better matches PartyFace's core need: keep uploaded faces recognizable.
// - The Codex/Comfy MCP partner path exposes vertexai/nano-banana-pro and
//   vertexai/nano-banana-2 for discovery and ad hoc generation.
// - The PartyFace app uses Comfy Cloud's server-side /api/prompt workflow API
//   with Gemini/Nano Banana partner nodes so COMFY_API_KEY stays server-only.
//
// Open assumptions:
// - Story 5.3 uploads browser image references into Comfy Cloud input storage,
//   wires them through LoadImage/ImageBatch, and submits the workflow.
// - The MVP asks for two still variants by default to bias toward fewer, better
//   outputs and avoid accidental generation spend.
export const selectedStillWorkflow: StillWorkflowSelection = {
  workflowId: "partyface-nano-banana-still-v1",
  displayName: "PartyFace Nano Banana Still Poster",
  modelName: "Nano Banana Pro",
  outputType: "still-image",
  expectedFormat: "image/png",
  defaultVariantCount: 2,
  comfyContract: {
    submissionPath: "submit_workflow",
    nodes: {
      generation: {
        id: "partner",
        classType: "GeminiImage2Node",
        requiredInputs: ["prompt", "model", "seed"],
        optionalInputs: ["images", "files", "system_prompt"],
        selectedModel: "gemini-3-pro-image-preview",
      },
      output: {
        id: "asset-library",
        classType: "SaveImage",
      },
    },
    defaultInputs: {
      aspect_ratio: "4:5",
      resolution: "2K",
      response_modalities: "IMAGE",
      filename_prefix: "partyface/still",
    },
    unresolvedInputs: [
      "Whether Nano Banana Pro or Nano Banana 2 produces better identity preservation for 1-2 face references",
      "Whether Krea 2 should remain a user-selectable style/poster fallback",
    ],
  },
  assumptions: [
    "Real ComfyUI submission stays server-side through src/lib/comfy.",
    "Mock mode remains available until the Nano Banana workflow and face input strategy are stable.",
    "Identity preservation is more important than pure prompt-only polish for the first real still workflow.",
    "Krea 2 remains a strong fallback for style-led posters once the primary reference-image flow is working.",
  ],
};

export function resolveStillWorkflowMode(
  requestedMode?: ComfyWorkflowMode,
): ComfyWorkflowMode {
  if (requestedMode) return requestedMode;

  return process.env.PARTYFACE_STILL_WORKFLOW_MODE === "comfy" &&
    process.env.COMFY_API_KEY
    ? "comfy"
    : "mock";
}

export function buildStillWorkflowRequest(
  setup: PartyFaceSetupPayload,
  options: StillWorkflowAdapterOptions = {},
): StillWorkflowRequest {
  const mode = resolveStillWorkflowMode(options.mode);
  const variantCount = Math.max(
    1,
    options.variantCount ?? selectedStillWorkflow.defaultVariantCount,
  );
  const baseSeed = options.seed ?? Date.now();

  return {
    mode,
    workflow: selectedStillWorkflow,
    setup,
    prompt: buildStillPrompt(setup),
    negativePrompt: DEFAULT_NEGATIVE_PROMPT,
    imageReferences: buildStillImageReferences(setup, selectedStillWorkflow),
    variants: Array.from({ length: variantCount }, (_, index) => ({
      variantRequestId: `still-${index + 1}`,
      seed: baseSeed + index,
    })),
  };
}

export async function startStillGeneration(
  setup: PartyFaceSetupPayload,
  options: StillWorkflowAdapterOptions = {},
): Promise<StillGenerationStartResult> {
  const request = buildStillWorkflowRequest(setup, options);

  if (request.mode === "mock") {
    return {
      jobId: `${MOCK_JOB_PREFIX}-${Date.now()}`,
      status: "queued",
      mode: request.mode,
      workflowId: request.workflow.workflowId,
      variantCount: request.variants.length,
      referenceCount: request.imageReferences.length,
      promptSnapshot: request.prompt,
    };
  }

  const uploadedImages = await Promise.all(
    request.imageReferences.map((reference) => uploadComfyInputImage(reference)),
  );
  const providerJobIds = await Promise.all(
    request.variants.map(async (variant) => {
      const workflow = buildNanoBananaStillWorkflow({
        prompt: request.prompt,
        seed: variant.seed,
        uploadedImages,
        filenamePrefix: `partyface/still/${variant.variantRequestId}`,
      });
      const result = await submitComfyWorkflow(workflow);

      return result.promptId;
    }),
  );

  return {
    jobId: `comfy-still-${Date.now()}`,
    status: "queued",
    mode: request.mode,
    workflowId: request.workflow.workflowId,
    variantCount: request.variants.length,
    referenceCount: request.imageReferences.length,
    providerJobIds,
    promptSnapshot: request.prompt,
  };
}

function buildStillPrompt(setup: PartyFaceSetupPayload) {
  const subjectCount = setup.subjects.length;
  const subjectInstruction =
    subjectCount === 1
      ? "Feature the uploaded face photo as the birthday subject."
      : "Feature both uploaded face photos as the birthday subjects.";

  return [
    setup.prompt.trim(),
    setup.generationStyle.promptInstruction,
    subjectInstruction,
    `Template: ${setup.template.name}.`,
    setup.birthdayDetails.recipientName
      ? `Recipient: ${setup.birthdayDetails.recipientName}.`
      : null,
    setup.birthdayDetails.age ? `Age: ${setup.birthdayDetails.age}.` : null,
    setup.birthdayDetails.message
      ? `Readable birthday message: ${setup.birthdayDetails.message}.`
      : null,
  ]
    .filter(Boolean)
    .join(" ");
}
