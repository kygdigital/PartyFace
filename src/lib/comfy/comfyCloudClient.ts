import type { GenerationJobStatus } from "@/lib/domain/generation";
import type { StillImageReference } from "./stillImageReferences";

type ComfyPromptResponse = {
  prompt_id?: string;
  node_errors?: Record<string, unknown>;
};

type ComfyUploadResponse = {
  name?: string;
  filename?: string;
  subfolder?: string;
  type?: string;
};

type ComfyJobStatusResponse = {
  status?:
    | "pending"
    | "queued"
    | "waiting_to_dispatch"
    | "in_progress"
    | "executing"
    | "completed"
    | "success"
    | "failed"
    | "error"
    | "cancelled";
};

type ComfyJobDetailsResponse = {
  outputs?: Record<string, unknown>;
};

type ComfyOutputFile = {
  filename: string;
  subfolder?: string;
  type?: string;
};

export class ComfyCloudClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ComfyCloudClientError";
  }
}

export type UploadedComfyInputImage = {
  slotId: StillImageReference["slotId"];
  label: string;
  fileName: string;
  comfyFileName: string;
};

export type SubmitComfyWorkflowResult = {
  promptId: string;
};

export async function uploadComfyInputImage(
  reference: StillImageReference,
): Promise<UploadedComfyInputImage> {
  const { apiKey, baseUrl } = getComfyCloudConfig();
  const formData = new FormData();
  const { blob, fileName } = imageReferenceToBlob(reference);

  formData.append("image", blob, sanitizeFileName(fileName));
  formData.append("type", "input");
  formData.append("overwrite", "true");

  const response = await fetch(`${baseUrl}/api/upload/image`, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
    },
    body: formData,
  });

  const responseBody = await parseJsonResponse<ComfyUploadResponse>(response);
  const comfyFileName =
    responseBody.name ?? responseBody.filename ?? sanitizeFileName(fileName);

  if (!response.ok) {
    throw new ComfyCloudClientError(
      `Comfy image upload failed with HTTP ${response.status}.`,
    );
  }

  return {
    slotId: reference.slotId,
    label: reference.label,
    fileName,
    comfyFileName,
  };
}

export async function submitComfyWorkflow(
  workflow: Record<string, unknown>,
): Promise<SubmitComfyWorkflowResult> {
  const { apiKey, baseUrl } = getComfyCloudConfig();

  const response = await fetch(`${baseUrl}/api/prompt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({
      prompt: workflow,
      extra_data: {
        api_key_comfy_org: apiKey,
      },
    }),
  });

  const responseBody = await parseJsonResponse<ComfyPromptResponse>(response);

  if (!response.ok || !responseBody.prompt_id) {
    throw new ComfyCloudClientError(
      `Comfy workflow submission failed with HTTP ${response.status}.`,
    );
  }

  if (
    responseBody.node_errors &&
    Object.keys(responseBody.node_errors).length > 0
  ) {
    throw new ComfyCloudClientError("Comfy workflow has node validation errors.");
  }

  return {
    promptId: responseBody.prompt_id,
  };
}

export async function getComfyPromptStatus(
  promptId: string,
): Promise<GenerationJobStatus> {
  const { apiKey, baseUrl } = getComfyCloudConfig();

  const response = await fetch(`${baseUrl}/api/job/${promptId}/status`, {
    headers: {
      "X-API-Key": apiKey,
    },
  });

  if (!response.ok) {
    throw new ComfyCloudClientError(
      `Comfy job status failed with HTTP ${response.status}.`,
    );
  }

  const responseBody = await parseJsonResponse<ComfyJobStatusResponse>(response);

  switch (responseBody.status) {
    case "pending":
    case "queued":
    case "waiting_to_dispatch":
      return "queued";
    case "in_progress":
    case "executing":
      return "generating";
    case "completed":
    case "success":
      return "complete";
    case "failed":
    case "error":
    case "cancelled":
      return "failed";
    default:
      return "queued";
  }
}

export async function getComfyPromptOutputUrls(
  promptId: string,
): Promise<string[]> {
  const { apiKey, baseUrl } = getComfyCloudConfig();

  const response = await fetch(`${baseUrl}/api/jobs/${promptId}`, {
    headers: {
      "X-API-Key": apiKey,
    },
  });

  if (!response.ok) {
    throw new ComfyCloudClientError(
      `Comfy job details failed with HTTP ${response.status}.`,
    );
  }

  const responseBody = await parseJsonResponse<ComfyJobDetailsResponse>(response);
  const imageFiles = extractImageFiles(responseBody.outputs ?? {});

  return Promise.all(imageFiles.map((file) => getComfySignedViewUrl(file)));
}

export async function getComfyPromptVideoUrls(
  promptId: string,
): Promise<string[]> {
  const { apiKey, baseUrl } = getComfyCloudConfig();

  const response = await fetch(`${baseUrl}/api/jobs/${promptId}`, {
    headers: {
      "X-API-Key": apiKey,
    },
  });

  if (!response.ok) {
    throw new ComfyCloudClientError(
      `Comfy job details failed with HTTP ${response.status}.`,
    );
  }

  const responseBody = await parseJsonResponse<ComfyJobDetailsResponse>(response);
  const videoFiles = extractVideoFiles(responseBody.outputs ?? {});

  return Promise.all(videoFiles.map((file) => getComfySignedViewUrl(file)));
}

async function getComfySignedViewUrl(file: ComfyOutputFile): Promise<string> {
  const { apiKey, baseUrl } = getComfyCloudConfig();
  const params = new URLSearchParams({
    filename: file.filename,
    subfolder: file.subfolder ?? "",
    type: file.type ?? "output",
  });

  const response = await fetch(`${baseUrl}/api/view?${params}`, {
    headers: {
      "X-API-Key": apiKey,
    },
    redirect: "manual",
  });

  if (response.status === 302 || response.status === 307) {
    const location = response.headers.get("location");
    if (location) return location;
  }

  if (response.ok) {
    return `${baseUrl}/api/view?${params}`;
  }

  throw new ComfyCloudClientError(
    `Comfy output URL failed with HTTP ${response.status}.`,
  );
}

function getComfyCloudConfig() {
  const apiKey = process.env.COMFY_API_KEY ?? process.env.COMFY_CLOUD_API_KEY;
  const baseUrl = process.env.COMFY_CLOUD_BASE_URL ?? "https://cloud.comfy.org";

  if (!apiKey) {
    throw new ComfyCloudClientError("COMFY_API_KEY is required for Comfy mode.");
  }

  return {
    apiKey,
    baseUrl: baseUrl.replace(/\/$/, ""),
  };
}

function imageReferenceToBlob(reference: StillImageReference) {
  if (reference.source !== "data-url") {
    throw new ComfyCloudClientError(
      "Only browser image data URLs are supported for Comfy upload right now.",
    );
  }

  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(
    reference.value,
  );

  if (!match) {
    throw new ComfyCloudClientError("Unsupported image reference data URL.");
  }

  const [, mimeType, base64] = match;
  const bytes = Buffer.from(base64, "base64");
  const blob = new Blob([bytes], { type: mimeType });

  return {
    blob,
    fileName: reference.fileName || `${reference.slotId}.png`,
  };
}

function extractImageFiles(outputs: Record<string, unknown>) {
  const files: ComfyOutputFile[] = [];

  for (const nodeOutput of Object.values(outputs)) {
    if (!isRecord(nodeOutput)) continue;
    const images = nodeOutput.images;
    if (!Array.isArray(images)) continue;

    for (const image of images) {
      if (!isRecord(image) || typeof image.filename !== "string") continue;

      files.push({
        filename: image.filename,
        subfolder:
          typeof image.subfolder === "string" ? image.subfolder : undefined,
        type: typeof image.type === "string" ? image.type : undefined,
      });
    }
  }

  return files;
}

function extractVideoFiles(outputs: Record<string, unknown>) {
  const files: ComfyOutputFile[] = [];

  for (const nodeOutput of Object.values(outputs)) {
    if (!isRecord(nodeOutput)) continue;
    const videos = nodeOutput.videos;
    const imageVideos = Array.isArray(nodeOutput.images)
      ? nodeOutput.images.filter(
          (image) =>
            isRecord(image) &&
            typeof image.filename === "string" &&
            image.filename.toLowerCase().endsWith(".mp4"),
        )
      : [];
    const videoLikeOutputs = [
      ...(Array.isArray(videos) ? videos : []),
      ...imageVideos,
    ];

    for (const video of videoLikeOutputs) {
      if (!isRecord(video) || typeof video.filename !== "string") continue;

      files.push({
        filename: video.filename,
        subfolder:
          typeof video.subfolder === "string" ? video.subfolder : undefined,
        type: typeof video.type === "string" ? video.type : undefined,
      });
    }
  }

  return files;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-") || "partyface-input.png";
}
