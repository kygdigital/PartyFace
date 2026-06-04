import type {
  GenerationClipStatus,
  GenerationJobStatus,
} from "@/lib/domain/generation";
import type { PartyFaceSetupPayload } from "@/lib/domain/project";
import type { MotionGenerationPlan } from "@/lib/templates/motionPlan";
import type { StillImageReference } from "./stillImageReferences";

export type ComfyWorkflowMode = "mock" | "comfy";

export type StillWorkflowSelection = {
  workflowId: string;
  displayName: string;
  modelName: string;
  outputType: "still-image";
  expectedFormat: "image/png";
  defaultVariantCount: number;
  comfyContract?: {
    submissionPath: "submit_workflow" | "partner_generate";
    nodes: {
      generation: {
        id: string;
        classType: string;
        requiredInputs: string[];
        selectedModel: string;
        optionalInputs?: string[];
      };
      output: {
        id: string;
        classType: string;
      };
    };
    defaultInputs: Record<string, string | number | boolean>;
    unresolvedInputs: string[];
  };
  assumptions: string[];
};

export type StillWorkflowAdapterOptions = {
  mode?: ComfyWorkflowMode;
  variantCount?: number;
  seed?: number;
};

export type StillVariantRequest = {
  variantRequestId: string;
  seed: number;
};

export type StillWorkflowRequest = {
  mode: ComfyWorkflowMode;
  workflow: StillWorkflowSelection;
  setup: PartyFaceSetupPayload;
  prompt: string;
  negativePrompt: string;
  imageReferences: StillImageReference[];
  variants: StillVariantRequest[];
};

export type StillGenerationStartResult = {
  jobId: string;
  status: Extract<GenerationJobStatus, "queued">;
  mode: ComfyWorkflowMode;
  workflowId: string;
  variantCount: number;
  referenceCount: number;
  providerJobIds?: string[];
  promptSnapshot?: string;
};

export type MotionWorkflowSelection = {
  workflowId: string;
  displayName: string;
  modelName: string;
  outputType: "motion-video";
  expectedFormat: "video/mp4";
  preview: {
    browserPlayable: true;
    autoplayWithSound: false;
    posterStrategy: "generated-first-frame" | "css-placeholder";
  };
  durationSeconds: {
    target: number;
    minimum: number;
    maximum: number;
  };
  comfyContract?: {
    submissionPath: "submit_workflow";
    nodes: {
      stillGeneration: {
        id: string;
        classType: string;
        selectedModel: string;
      };
      motionGeneration: {
        id: string;
        classType: string;
        selectedModel: string;
      };
      output: {
        id: string;
        classType: string;
      };
    };
    defaultInputs: Record<string, string | number | boolean>;
    unresolvedInputs: string[];
  };
  assumptions: string[];
};

export type MotionWorkflowAdapterOptions = {
  mode?: ComfyWorkflowMode;
  seed?: number;
  durationSeconds?: number;
};

export type MotionWorkflowRequest = {
  mode: ComfyWorkflowMode;
  workflow: MotionWorkflowSelection;
  setup: PartyFaceSetupPayload;
  generationPlan: MotionGenerationPlan;
  prompt: string;
  negativePrompt: string;
  imageReferences: StillImageReference[];
  seed: number;
  durationSeconds: number;
};

export type MotionGenerationStartResult = {
  jobId: string;
  status: Extract<GenerationJobStatus, "queued">;
  mode: ComfyWorkflowMode;
  workflowId: string;
  durationSeconds: number;
  providerJobIds?: string[];
  promptSnapshot?: string;
  motionPlanSnapshot?: MotionGenerationPlan;
};

export type FinalVideoGenerationStartResult = {
  jobId: string;
  status: Extract<GenerationJobStatus, "queued">;
  mode: ComfyWorkflowMode;
  workflowId: string;
  clipCount: number;
  durationSeconds: number;
  providerJobIds?: string[];
  clipStatuses?: GenerationClipStatus[];
  promptSnapshot?: string;
  motionPlanSnapshot: MotionGenerationPlan;
};
