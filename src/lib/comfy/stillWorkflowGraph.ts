import type { UploadedComfyInputImage } from "./comfyCloudClient";

type ComfyNode = {
  class_type: string;
  inputs: Record<string, unknown>;
  _meta?: {
    title: string;
  };
};

export type BuildNanoBananaStillWorkflowInput = {
  prompt: string;
  seed: number;
  uploadedImages: UploadedComfyInputImage[];
  filenamePrefix: string;
};

export function buildNanoBananaStillWorkflow({
  prompt,
  seed,
  uploadedImages,
  filenamePrefix,
}: BuildNanoBananaStillWorkflowInput): Record<string, ComfyNode> {
  const workflow: Record<string, ComfyNode> = {};

  uploadedImages.slice(0, 2).forEach((image, index) => {
    const nodeId = String(index + 1);

    workflow[nodeId] = {
      class_type: "LoadImage",
      inputs: {
        image: image.comfyFileName,
      },
      _meta: {
        title: `Load ${image.label}`,
      },
    };
  });

  const imageInput =
    uploadedImages.length > 1
      ? addTwoImageBatchNode(workflow)
      : (["1", 0] as [string, number]);

  workflow["10"] = {
    class_type: "GeminiImage2Node",
    inputs: {
      prompt,
      model: "gemini-3-pro-image-preview",
      seed,
      aspect_ratio: "4:5",
      resolution: "2K",
      response_modalities: "IMAGE",
      images: imageInput,
    },
    _meta: {
      title: "Nano Banana Pro birthday still",
    },
  };

  workflow["20"] = {
    class_type: "SaveImage",
    inputs: {
      images: ["10", 0],
      filename_prefix: filenamePrefix,
    },
    _meta: {
      title: "Save PartyFace still",
    },
  };

  return workflow;
}

function addTwoImageBatchNode(workflow: Record<string, ComfyNode>) {
  workflow["8"] = {
    class_type: "ImageBatch",
    inputs: {
      image1: ["1", 0],
      image2: ["2", 0],
    },
    _meta: {
      title: "Batch face references",
    },
  };

  return ["8", 0] as [string, number];
}
