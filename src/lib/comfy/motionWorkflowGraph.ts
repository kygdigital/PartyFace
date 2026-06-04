import type { UploadedComfyInputImage } from "./comfyCloudClient";

type ComfyNode = {
  class_type: string;
  inputs: Record<string, unknown>;
  _meta?: {
    title: string;
  };
};

export type BuildSeedanceMotionWorkflowInput = {
  stillPrompt: string;
  motionPrompt: string;
  negativePrompt: string;
  seed: number;
  durationSeconds: number;
  uploadedImages: UploadedComfyInputImage[];
  filenamePrefix: string;
};

export function buildSeedanceMotionWorkflow({
  stillPrompt,
  motionPrompt,
  negativePrompt,
  seed,
  durationSeconds,
  uploadedImages,
  filenamePrefix,
}: BuildSeedanceMotionWorkflowInput): Record<string, ComfyNode> {
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
      prompt: stillPrompt,
      model: "gemini-3-pro-image-preview",
      seed,
      aspect_ratio: "4:5",
      resolution: "1K",
      response_modalities: "IMAGE",
      images: imageInput,
    },
    _meta: {
      title: "PartyFace first frame",
    },
  };

  workflow["30"] = {
    class_type: "ByteDanceImageToVideoNode",
    inputs: {
      model: "seedance-1-0-pro-fast-251015",
      prompt: motionPrompt,
      image: ["10", 0],
      resolution: "720p",
      aspect_ratio: "adaptive",
      duration: durationSeconds,
      negative_prompt: negativePrompt,
      seed,
      camera_fixed: false,
      watermark: false,
      generate_audio: false,
    },
    _meta: {
      title: "Seedance birthday motion",
    },
  };

  workflow["40"] = {
    class_type: "SaveVideo",
    inputs: {
      video: ["30", 0],
      filename_prefix: filenamePrefix,
      format: "mp4",
      codec: "h264",
    },
    _meta: {
      title: "Save PartyFace motion",
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
