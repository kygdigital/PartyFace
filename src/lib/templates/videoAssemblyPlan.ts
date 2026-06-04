import type { MotionGenerationPlan } from "./motionPlan";

export type VideoAssemblyStepStatus = "planned" | "future";

export type VideoAssemblyStep = {
  id: string;
  title: string;
  status: VideoAssemblyStepStatus;
  detail: string;
};

export type VideoAssemblyPlan = {
  planId: string;
  outputFormat: "mp4";
  aspectRatio: "4:5";
  targetDurationSeconds: number;
  audioMode: string;
  clipCount: number;
  exportNameHint: string;
  steps: VideoAssemblyStep[];
};

export function buildVideoAssemblyPlan(
  motionPlan: MotionGenerationPlan,
): VideoAssemblyPlan {
  return {
    planId: `${motionPlan.planId}-assembly`,
    outputFormat: "mp4",
    aspectRatio: "4:5",
    targetDurationSeconds: motionPlan.targetDurationSeconds,
    audioMode: motionPlan.audioStrategy.label,
    clipCount: motionPlan.clips.length,
    exportNameHint: "partyface-birthday-video.mp4",
    steps: [
      {
        id: "generate-clips",
        title: "Generate beat clips",
        status: "planned",
        detail: `Create ${motionPlan.clips.length} short clips from the storyboard beats using the selected face references and cutout style.`,
      },
      {
        id: "normalize-clips",
        title: "Normalize timing and frame",
        status: "planned",
        detail: `Keep clips in ${motionPlan.targetDurationSeconds}s total, 4:5 framing, browser-playable MP4-compatible video.`,
      },
      {
        id: "stitch-clips",
        title: "Stitch with transitions",
        status: "future",
        detail:
          "Join clips in beat order with simple music-synced cuts before adding more elaborate transitions.",
      },
      {
        id: "attach-audio",
        title: "Attach music loop",
        status: "future",
        detail: [
          `${motionPlan.audioStrategy.label}: ${motionPlan.audioStrategy.loopHint}.`,
          motionPlan.audioStrategy.songTitle
            ? `Song script: ${motionPlan.audioStrategy.songTitle}.`
            : null,
          motionPlan.audioStrategy.stockLoopFitNotes
            ? `Fit notes: ${motionPlan.audioStrategy.stockLoopFitNotes}.`
            : null,
        ]
          .filter(Boolean)
          .join(" "),
      },
      {
        id: "final-export",
        title: "Export final video card",
        status: "future",
        detail: `Render ${motionPlan.outputSummary ?? "the assembled birthday card"} as ${motionPlan.targetDurationSeconds}s ${motionPlan.audioStrategy.label} MP4.`,
      },
    ],
  };
}
