import type {
  PartyFaceSetupPayload,
  PartyFaceSubjectInput,
} from "@/lib/domain/project";

type ImageReferenceWorkflow = {
  comfyContract?: {
    submissionPath: "submit_workflow" | "partner_generate";
  };
};

export type StillImageReferenceTransport =
  | "partner-generate-media-url"
  | "comfy-image-upload";

export type StillImageReference = {
  slotId: PartyFaceSubjectInput["slotId"];
  label: string;
  fileName: string;
  mimeType?: string;
  source: "https-url" | "data-url";
  value: string;
  workflowInput:
    | "partner_generate.medias[].value"
    | "submit_workflow.LoadImage.image";
  transport: StillImageReferenceTransport;
  providerCandidates: Array<"nano-banana" | "krea-2">;
};

export class StillImageReferenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StillImageReferenceError";
  }
}

export function buildStillImageReferences(
  setup: PartyFaceSetupPayload,
  workflow: ImageReferenceWorkflow,
): StillImageReference[] {
  return setup.subjects.map((subject) =>
    buildStillImageReference(subject, workflow),
  );
}

function buildStillImageReference(
  subject: PartyFaceSubjectInput,
  workflow: ImageReferenceWorkflow,
): StillImageReference {
  const uploadRef = subject.photo.uploadRef?.trim();

  if (!uploadRef) {
    throw new StillImageReferenceError(
      `${subject.label} needs an image reference before real still generation can start.`,
    );
  }

  if (uploadRef.startsWith("https://")) {
    return {
      slotId: subject.slotId,
      label: subject.label,
      fileName: subject.photo.fileName,
      mimeType: subject.photo.mimeType,
      source: "https-url",
      value: uploadRef,
      workflowInput: "partner_generate.medias[].value",
      transport: "partner-generate-media-url",
      providerCandidates: ["nano-banana", "krea-2"],
    };
  }

  if (/^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(uploadRef)) {
    return {
      slotId: subject.slotId,
      label: subject.label,
      fileName: subject.photo.fileName,
      mimeType: subject.photo.mimeType,
      source: "data-url",
      value: uploadRef,
      workflowInput:
        workflow.comfyContract?.submissionPath === "partner_generate"
          ? "partner_generate.medias[].value"
          : "submit_workflow.LoadImage.image",
      transport:
        workflow.comfyContract?.submissionPath === "partner_generate"
          ? "partner-generate-media-url"
          : "comfy-image-upload",
      providerCandidates: ["nano-banana", "krea-2"],
    };
  }

  throw new StillImageReferenceError(
    `${subject.label} has an unsupported image reference format.`,
  );
}
