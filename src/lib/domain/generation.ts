import type { MotionGenerationPlan } from "@/lib/templates/motionPlan";

export type GenerationJobStatus =
  | "idle"
  | "uploading"
  | "ready"
  | "queued"
  | "generating"
  | "complete"
  | "failed";

export type GenerationOutputType = "still" | "motion" | "final-video";

export type GenerationJobRecord = {
  jobId: string;
  outputType: GenerationOutputType;
  status: GenerationJobStatus;
  workflowId: string;
  mode: "mock" | "comfy" | "local";
  variantCount: number;
  providerJobIds?: string[];
  clipStatuses?: GenerationClipStatus[];
  promptSnapshot?: string;
  motionPlanSnapshot?: MotionGenerationPlan;
  outputs?: StillOutputVariant[] | MotionOutputVariant[];
  createdAt: string;
  updatedAt: string;
};

export type GenerationClipStatus = {
  clipId: string;
  title: string;
  sequence: number;
  timeRange: string;
  status: GenerationJobStatus;
  providerJobId?: string;
  outputVariantId?: string;
};

export type StillOutputVariant = {
  variantId: string;
  jobId: string;
  title: string;
  subtitle: string;
  promptSnapshot: string;
  styleNotes: string[];
  imageUrl?: string;
  downloadUrl?: string;
};

export type MotionOutputVariant = {
  variantId: string;
  jobId: string;
  title: string;
  subtitle: string;
  promptSnapshot: string;
  durationSeconds: number;
  previewKind: "mock-css" | "video-url";
  videoUrl?: string;
  downloadUrl?: string;
};

export function isActiveGenerationStatus(status: GenerationJobStatus) {
  return status === "uploading" || status === "queued" || status === "generating";
}
