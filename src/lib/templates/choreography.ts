import type { StoryBeat } from "./storyTemplates";
import type { MusicLibraryTrack } from "./musicLibrary";
import { findNearestBeatMarker } from "./musicLibrary";

export type ChoreographyBlock = {
  id: string;
  name: string;
  beats: number;
  bestForTemplates: string[];
  promptInstruction: string;
  cameraInstruction: string;
  faceStabilityNote: string;
};

export type ChoreographyCue = {
  block: ChoreographyBlock;
  beatWindow: string;
  castFormat: "solo" | "duo";
  promptInstruction: string;
  cameraInstruction: string;
  faceStabilityNote: string;
};

export const choreographyBlocks: ChoreographyBlock[] = [
  {
    id: "camera-flash-freeze",
    name: "Camera Flash Freeze",
    beats: 4,
    bestForTemplates: ["red-carpet-awards", "disco-birthday-entrance"],
    promptInstruction:
      "Hit flashbulb freeze poses on the downbeats, with oversized face cutouts bobbing slightly like playful paper puppets.",
    cameraInstruction:
      "Use a locked red-carpet camera with quick flash pulses rather than heavy motion.",
    faceStabilityNote:
      "Keep each face cutout flat, readable, and anchored above the costume neck.",
  },
  {
    id: "walk-hook",
    name: "Walk Hook",
    beats: 8,
    bestForTemplates: ["red-carpet-awards", "disco-birthday-entrance"],
    promptInstruction:
      "Use a simple step-touch walk cycle with heads bouncing on every other beat.",
    cameraInstruction:
      "Use a gentle forward push and keep the figures centered in full frame.",
    faceStabilityNote:
      "Avoid face warping; the cutout should move as one rigid sticker piece.",
  },
  {
    id: "head-sway",
    name: "Head Sway",
    beats: 8,
    bestForTemplates: ["disco-birthday-entrance", "birthday-heist"],
    promptInstruction:
      "Sway shoulders left and right while the cutout heads nod in time with the beat.",
    cameraInstruction:
      "Hold a medium-wide party shot so the cutout-head motion reads clearly.",
    faceStabilityNote:
      "Preserve face identity; do not blend the cutout into generated skin.",
  },
  {
    id: "hero-pose-hit",
    name: "Hero Pose Hit",
    beats: 4,
    bestForTemplates: ["superhero-birthday-save", "red-carpet-awards"],
    promptInstruction:
      "Snap into a big pose on the phrase ending, with confetti and text landing on the same beat.",
    cameraInstruction:
      "Use a clean hero frame with minimal shake and readable title space.",
    faceStabilityNote:
      "Hold the face cutout steady through the pose hit.",
  },
  {
    id: "group-point",
    name: "Group Point",
    beats: 4,
    bestForTemplates: ["disco-birthday-entrance", "red-carpet-awards"],
    promptInstruction:
      "Point toward the camera and birthday title together, then bounce back into the loop.",
    cameraInstruction:
      "Use a centered front-facing camera angle with the hands framing the title.",
    faceStabilityNote:
      "Keep face cutouts above the bodies; hands should not cover faces.",
  },
  {
    id: "confetti-drop",
    name: "Confetti Drop",
    beats: 4,
    bestForTemplates: [
      "disco-birthday-entrance",
      "superhero-birthday-save",
      "red-carpet-awards",
      "birthday-heist",
    ],
    promptInstruction:
      "Land the final birthday title, confetti drop, and cutout-head pose on the musical drop.",
    cameraInstruction:
      "End on a stable full-card composition suitable for a thumbnail.",
    faceStabilityNote:
      "Freeze the face cutouts cleanly for the final shareable frame.",
  },
];

export function buildChoreographyCue({
  templateId,
  beat,
  sequence,
  totalBeats,
  track,
  castCount,
}: {
  templateId: string;
  beat: StoryBeat;
  sequence: number;
  totalBeats: number;
  track: MusicLibraryTrack;
  castCount: number;
}): ChoreographyCue {
  const block = selectChoreographyBlock(templateId, beat.id, sequence, totalBeats);
  const timeWindow = parseTimeRange(beat.timeRange);
  const startMarker = findNearestBeatMarker(track, timeWindow?.startSeconds ?? 0);
  const endMarker = findNearestBeatMarker(track, timeWindow?.endSeconds ?? 0);
  const castFormat = castCount > 1 ? "duo" : "solo";
  const castInstruction =
    castFormat === "duo"
      ? "Use mirrored two-person choreography with both real face cutouts visible."
      : "Use a solo version of the choreography with one real face cutout centered.";

  return {
    block,
    beatWindow: `${startMarker.label} (${startMarker.timestampSeconds}s) to ${endMarker.label} (${endMarker.timestampSeconds}s)`,
    castFormat,
    promptInstruction: `${block.promptInstruction} ${castInstruction}`,
    cameraInstruction: block.cameraInstruction,
    faceStabilityNote: block.faceStabilityNote,
  };
}

function selectChoreographyBlock(
  templateId: string,
  beatId: string,
  sequence: number,
  totalBeats: number,
) {
  if (sequence === totalBeats) return findBlock("confetti-drop");

  const normalizedBeatId = beatId.toLowerCase();

  if (normalizedBeatId.includes("flash") || normalizedBeatId.includes("alert")) {
    return findBlock("camera-flash-freeze");
  }

  if (
    normalizedBeatId.includes("arrival") ||
    normalizedBeatId.includes("walk") ||
    normalizedBeatId.includes("sneak")
  ) {
    return findBlock("walk-hook");
  }

  if (
    normalizedBeatId.includes("landing") ||
    normalizedBeatId.includes("victory") ||
    normalizedBeatId.includes("acceptance")
  ) {
    return findBlock("hero-pose-hit");
  }

  if (templateId === "red-carpet-awards") return findBlock("group-point");

  return findBlock("head-sway");
}

function findBlock(blockId: string) {
  return (
    choreographyBlocks.find((block) => block.id === blockId) ??
    choreographyBlocks[0]
  );
}

function parseTimeRange(timeRange: string) {
  const match = timeRange.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)s/i);
  if (!match) return null;

  const startSeconds = Number(match[1]);
  const endSeconds = Number(match[2]);

  if (!Number.isFinite(startSeconds) || !Number.isFinite(endSeconds)) {
    return null;
  }

  return { startSeconds, endSeconds };
}
