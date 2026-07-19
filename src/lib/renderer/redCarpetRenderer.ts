import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import type { GenerationJobRecord, MotionOutputVariant } from "@/lib/domain/generation";
import type { PartyFaceSetupPayload } from "@/lib/domain/project";

const execFileAsync = promisify(execFile);

const RENDER_ROOT = path.join(process.cwd(), ".partyface-renders");
const RENDERABLE_TEMPLATE_ID = "red-carpet-paparazzi";

export type RedCarpetRenderMode = "draft" | "full";

export type RedCarpetRenderResult = {
  job: GenerationJobRecord;
};

export function isRedCarpetRenderable(setup: PartyFaceSetupPayload) {
  return setup.template.id === RENDERABLE_TEMPLATE_ID;
}

export async function renderRedCarpetCard(
  setup: PartyFaceSetupPayload,
  mode: RedCarpetRenderMode,
): Promise<RedCarpetRenderResult> {
  if (!isRedCarpetRenderable(setup)) {
    throw new Error("Only Red Carpet Paparazzi is renderable in the v3 prototype.");
  }

  if (!setup.subjects.length) {
    throw new Error("Add at least one usable local face photo before rendering.");
  }

  const jobId = `local-red-carpet-${mode}-${Date.now()}`;
  const jobDir = path.join(RENDER_ROOT, jobId);
  await mkdir(jobDir, { recursive: true });

  const facePaths = await Promise.all(
    setup.subjects.slice(0, 2).map((subject, index) =>
      writeFaceInput(jobDir, subject.photo.uploadRef, index + 1),
    ),
  );
  const outputFileName = mode === "draft" ? "draft.mp4" : "birthday-royale.mp4";
  const outputPath = path.join(jobDir, outputFileName);
  const audioPath = path.join(process.cwd(), "public", setup.musicTrack.file);
  const durationSeconds = mode === "draft" ? 5 : 35;
  const scriptPath = path.join(process.cwd(), "scripts", "make-card.sh");

  await execFileAsync(scriptPath, [
    "--mode",
    mode,
    "--out",
    outputPath,
    "--audio",
    audioPath,
    "--name",
    setup.birthdayDetails.recipientName.trim() || "Birthday Icon",
    "--bpm",
    String(setup.musicTrack.bpm),
    "--face1",
    facePaths[0],
    ...(facePaths[1] ? ["--face2", facePaths[1]] : []),
  ]);

  const output: MotionOutputVariant = {
    variantId: `${jobId}-output`,
    jobId,
    title: mode === "draft" ? "5-second draft preview" : "Birthday Royale MP4",
    subtitle:
      mode === "draft"
        ? "Low-res local ffmpeg render with fixed anchor bob"
        : "Local ~35 second Red Carpet Glam render with music",
    promptSnapshot: buildRendererSnapshot(setup, mode),
    durationSeconds,
    previewKind: "video-url",
    videoUrl: `/api/local-renders/${jobId}/${outputFileName}`,
    downloadUrl: `/api/local-renders/${jobId}/${outputFileName}`,
  };
  const now = new Date().toISOString();

  return {
    job: {
      jobId,
      outputType: "final-video",
      status: "complete",
      workflowId: "red-carpet-local-ffmpeg-v1",
      mode: "local",
      variantCount: 1,
      promptSnapshot: output.promptSnapshot,
      outputs: [output],
      createdAt: now,
      updatedAt: now,
    },
  };
}

export function getLocalRenderPath(jobId: string, fileName: string) {
  if (!/^local-red-carpet-(draft|full)-\d+$/.test(jobId)) return null;
  if (fileName !== "draft.mp4" && fileName !== "birthday-royale.mp4") return null;

  return path.join(RENDER_ROOT, jobId, fileName);
}

function buildRendererSnapshot(setup: PartyFaceSetupPayload, mode: RedCarpetRenderMode) {
  return [
    `Renderer: ${mode} Red Carpet Glam local ffmpeg.`,
    `Track: ${setup.musicTrack.title} at ${setup.musicTrack.bpm} BPM.`,
    `Faces: ${setup.subjects.length} local cutout input${setup.subjects.length === 1 ? "" : "s"}.`,
    "Motion: fixed head anchor with BPM-synced vertical bob.",
    "Privacy: faces are decoded locally and are not sent to Comfy Cloud.",
  ].join(" ");
}

async function writeFaceInput(
  jobDir: string,
  uploadRef: string | undefined,
  index: number,
) {
  const parsed = parseDataUrl(uploadRef);
  if (!parsed) {
    throw new Error("Face uploads must be browser image data URLs for local render.");
  }

  const extension = parsed.mimeType.includes("png") ? "png" : "jpg";
  const filePath = path.join(jobDir, `face-${index}.${extension}`);
  await writeFile(filePath, parsed.buffer);
  return filePath;
}

function parseDataUrl(uploadRef: string | undefined) {
  const match = uploadRef?.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;

  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}
