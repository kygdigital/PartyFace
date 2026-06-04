import type {
  GenerationJobRecord,
  GenerationJobStatus,
  MotionOutputVariant,
  StillOutputVariant,
} from "@/lib/domain/generation";
import {
  getComfyPromptOutputUrls,
  getComfyPromptStatus,
  getComfyPromptVideoUrls,
} from "./comfyCloudClient";
import type {
  FinalVideoGenerationStartResult,
  StillGenerationStartResult,
} from "./workflowTypes";
import type { MotionGenerationStartResult } from "./workflowTypes";

type JobStore = Map<string, GenerationJobRecord>;

const globalForJobs = globalThis as typeof globalThis & {
  partyFaceJobStore?: JobStore;
};

const jobStore = globalForJobs.partyFaceJobStore ?? new Map<string, GenerationJobRecord>();
globalForJobs.partyFaceJobStore = jobStore;

export function recordStillGenerationJob(
  result: StillGenerationStartResult,
): GenerationJobRecord {
  return recordGenerationJob({
    jobId: result.jobId,
    outputType: "still",
    status: result.status,
    workflowId: result.workflowId,
    mode: result.mode,
    variantCount: result.variantCount,
    providerJobIds: result.providerJobIds,
    promptSnapshot: result.promptSnapshot,
  });
}

export function recordMotionGenerationJob(
  result: MotionGenerationStartResult,
): GenerationJobRecord {
  return recordGenerationJob({
    jobId: result.jobId,
    outputType: "motion",
    status: result.status,
    workflowId: result.workflowId,
    mode: result.mode,
    variantCount: 1,
    providerJobIds: result.providerJobIds,
    promptSnapshot: result.promptSnapshot,
  });
}

export function recordFinalVideoGenerationJob(
  result: FinalVideoGenerationStartResult,
): GenerationJobRecord {
  return recordGenerationJob({
    jobId: result.jobId,
    outputType: "final-video",
    status: result.status,
    workflowId: result.workflowId,
    mode: result.mode,
    variantCount: result.clipCount,
    providerJobIds: result.providerJobIds,
    clipStatuses: result.clipStatuses,
    promptSnapshot: result.promptSnapshot,
    motionPlanSnapshot: result.motionPlanSnapshot,
  });
}

function recordGenerationJob(
  result: Pick<
    GenerationJobRecord,
    | "jobId"
    | "outputType"
    | "status"
    | "workflowId"
    | "mode"
    | "variantCount"
    | "providerJobIds"
    | "clipStatuses"
    | "promptSnapshot"
    | "motionPlanSnapshot"
    | "outputs"
  >,
): GenerationJobRecord {
  const now = new Date().toISOString();
  const job: GenerationJobRecord = {
    jobId: result.jobId,
    outputType: result.outputType,
    status: result.status,
    workflowId: result.workflowId,
    mode: result.mode,
    variantCount: result.variantCount,
    providerJobIds: result.providerJobIds,
    clipStatuses: result.clipStatuses,
    promptSnapshot: result.promptSnapshot,
    motionPlanSnapshot: result.motionPlanSnapshot,
    outputs: result.outputs,
    createdAt: now,
    updatedAt: now,
  };

  jobStore.set(job.jobId, job);
  return job;
}

export async function getGenerationJob(
  jobId: string,
): Promise<GenerationJobRecord | null> {
  const job = jobStore.get(jobId);
  if (!job) return null;

  if (job.mode === "comfy" && job.providerJobIds?.length) {
    return refreshComfyGenerationJob(job);
  }

  if (job.mode !== "mock" || job.status === "failed") return job;

  const nextClipStatuses =
    job.outputType === "final-video" ? getMockClipStatuses(job) : job.clipStatuses;
  const nextStatus =
    job.outputType === "final-video"
      ? mergeProviderStatuses(
          nextClipStatuses?.map((clipStatus) => clipStatus.status) ?? [],
        )
      : getMockJobStatus(job.createdAt);

  if (nextStatus !== job.status || nextClipStatuses !== job.clipStatuses) {
    const updatedJob = {
      ...job,
      status: nextStatus,
      clipStatuses: nextClipStatuses,
      updatedAt: new Date().toISOString(),
    };
    jobStore.set(jobId, updatedJob);
    return updatedJob;
  }

  return job;
}

async function refreshComfyGenerationJob(
  job: GenerationJobRecord,
): Promise<GenerationJobRecord> {
  if (job.status === "failed") return job;

  if (job.status === "complete") {
    if (job.outputs?.length) return job;

    const outputs = await buildRealOutputs(job);
    const updatedJob = {
      ...job,
      outputs,
      updatedAt: new Date().toISOString(),
    };
    jobStore.set(job.jobId, updatedJob);

    return updatedJob;
  }

  try {
    const providerStatuses = await Promise.all(
      job.providerJobIds?.map((providerJobId) =>
        getComfyPromptStatus(providerJobId),
      ) ?? [],
    );
    const nextStatus = mergeProviderStatuses(providerStatuses);
    const outputs =
      nextStatus === "complete" && !job.outputs?.length
        ? await buildRealOutputs(job)
        : job.outputs;
    const clipStatuses =
      job.outputType === "final-video"
        ? buildProviderClipStatuses(job, providerStatuses, outputs)
        : job.clipStatuses;

    if (
      nextStatus === job.status &&
      outputs === job.outputs &&
      clipStatuses === job.clipStatuses
    ) {
      return job;
    }

    const updatedJob = {
      ...job,
      status: nextStatus,
      outputs,
      clipStatuses,
      updatedAt: new Date().toISOString(),
    };
    jobStore.set(job.jobId, updatedJob);

    return updatedJob;
  } catch {
    return job;
  }
}

function mergeProviderStatuses(
  providerStatuses: GenerationJobStatus[],
): GenerationJobStatus {
  if (providerStatuses.some((status) => status === "failed")) return "failed";
  if (providerStatuses.every((status) => status === "complete")) return "complete";
  if (providerStatuses.some((status) => status === "generating")) {
    return "generating";
  }

  return "queued";
}

function getMockClipStatuses(job: GenerationJobRecord) {
  const clips = job.motionPlanSnapshot?.clips ?? [];
  const elapsedMs = Date.now() - new Date(job.createdAt).getTime();

  return clips.map((clip, index) => {
    const clipStartMs = 800 + index * 700;
    const clipCompleteMs = clipStartMs + 1800;
    const status =
      elapsedMs < clipStartMs
        ? "queued"
        : elapsedMs < clipCompleteMs
          ? "generating"
          : "complete";

    return {
      clipId: clip.clipId,
      title: clip.title,
      sequence: clip.sequence,
      timeRange: clip.timeRange,
      status: status as GenerationJobStatus,
      outputVariantId:
        status === "complete" ? `${job.jobId}-mock-clip-${index + 1}` : undefined,
    };
  });
}

function buildProviderClipStatuses(
  job: GenerationJobRecord,
  providerStatuses: GenerationJobStatus[],
  outputs: StillOutputVariant[] | MotionOutputVariant[] | undefined,
) {
  const clips = job.motionPlanSnapshot?.clips ?? [];

  return clips.map((clip, index) => {
    const output = outputs?.find((variant) =>
      variant.variantId.endsWith(`-${index + 1}`),
    );

    return {
      clipId: clip.clipId,
      title: clip.title,
      sequence: clip.sequence,
      timeRange: clip.timeRange,
      status: providerStatuses[index] ?? "queued",
      providerJobId: job.providerJobIds?.[index],
      outputVariantId: output?.variantId,
    };
  });
}

async function buildRealOutputs(
  job: GenerationJobRecord,
): Promise<StillOutputVariant[] | MotionOutputVariant[]> {
  if (job.outputType === "motion" || job.outputType === "final-video") {
    return buildRealMotionOutputs(job);
  }

  return buildRealStillOutputs(job);
}

async function buildRealStillOutputs(
  job: GenerationJobRecord,
): Promise<StillOutputVariant[]> {
  if (!job.providerJobIds?.length) return [];

  const outputUrlGroups = await Promise.all(
    job.providerJobIds.map((providerJobId) =>
      getComfyPromptOutputUrls(providerJobId),
    ),
  );

  return outputUrlGroups.flatMap((urls, groupIndex) =>
    urls.map((url, urlIndex) => {
      const variantNumber = groupIndex + urlIndex + 1;

      return {
        variantId: `${job.jobId}-real-${variantNumber}`,
        jobId: job.jobId,
        title: `Generated Still ${variantNumber}`,
        subtitle: "Nano Banana birthday poster output",
        promptSnapshot: job.promptSnapshot ?? "",
        styleNotes: ["Nano Banana", "real Comfy output", "image reference"],
        imageUrl: url,
        downloadUrl: url,
      };
    }),
  );
}

async function buildRealMotionOutputs(
  job: GenerationJobRecord,
): Promise<MotionOutputVariant[]> {
  if (!job.providerJobIds?.length) return [];

  const outputUrlGroups = await Promise.all(
    job.providerJobIds.map((providerJobId) =>
      getComfyPromptVideoUrls(providerJobId),
    ),
  );

  return outputUrlGroups.flatMap((urls, groupIndex) =>
    urls.map((url, urlIndex) => {
      const variantNumber = groupIndex + urlIndex + 1;

      return {
        variantId: `${job.jobId}-real-${variantNumber}`,
        jobId: job.jobId,
        title:
          job.outputType === "final-video"
            ? `Generated Beat Clip ${variantNumber}`
            : `Generated Motion ${variantNumber}`,
        subtitle:
          job.outputType === "final-video"
            ? "Seedance story beat clip"
            : "Seedance birthday motion output",
        promptSnapshot: job.promptSnapshot ?? "",
        durationSeconds:
          job.motionPlanSnapshot?.clips[groupIndex]?.durationSeconds ?? 5,
        previewKind: "video-url",
        videoUrl: url,
        downloadUrl: url,
      };
    }),
  );
}

function getMockJobStatus(createdAt: string): GenerationJobStatus {
  const elapsedMs = Date.now() - new Date(createdAt).getTime();

  if (elapsedMs < 1200) return "queued";
  if (elapsedMs < 3200) return "generating";
  return "complete";
}
