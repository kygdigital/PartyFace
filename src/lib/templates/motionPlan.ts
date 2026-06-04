import type { PartyFaceSetupPayload } from "@/lib/domain/project";
import {
  buildAudioStrategy,
  summarizeAudioStrategy,
  type AudioStrategy,
} from "./audioStrategy";

export type MotionClipPlan = {
  clipId: string;
  beatId: string;
  sequence: number;
  timeRange: string;
  durationSeconds: number;
  title: string;
  caption: string;
  visualPrompt: string;
  transition: string;
  cameraDirection: string;
  audioCue: string;
};

export type MotionGenerationPlan = {
  planId: string;
  strategy: "multi-clip-stitch" | "single-long-video";
  targetDurationSeconds: number;
  musicMood: string;
  audioStrategy: AudioStrategy;
  summary: string;
  outputSummary: string;
  clips: MotionClipPlan[];
};

const DEFAULT_TARGET_DURATION_SECONDS = 30;

export function buildMotionGenerationPlan(
  setup: PartyFaceSetupPayload,
): MotionGenerationPlan {
  const audioStrategy = buildAudioStrategy(setup.storyTemplate, setup.songScript);
  const clips = setup.storyTemplate.beats.map((beat, index) => {
    const durationSeconds =
      parseTimeRangeDuration(beat.timeRange) ??
      Math.round(DEFAULT_TARGET_DURATION_SECONDS / setup.storyTemplate.beats.length);

    return {
      clipId: `${setup.storyTemplate.id}-${beat.id}`,
      beatId: beat.id,
      sequence: index + 1,
      timeRange: beat.timeRange,
      durationSeconds,
      title: beat.title,
      caption: personalizeCaption(beat.caption, setup.birthdayDetails.recipientName),
      visualPrompt: buildClipPrompt(setup, beat.visualDirection, beat.caption),
      transition: index === 0 ? "Open on an establishing reveal." : "Use a quick music-synced transition from the previous beat.",
      cameraDirection:
        index === setup.storyTemplate.beats.length - 1
          ? "End with a stable hero frame and readable birthday message."
          : "Keep the camera movement gentle enough for stable face cutouts.",
      audioCue:
        index === setup.storyTemplate.beats.length - 1
          ? "Land on the chorus/drop for the final birthday title."
          : "Use beat-matched movement that supports the selected music mood.",
    };
  });

  return {
    planId: `${setup.storyTemplate.id}-30s-plan`,
    strategy: "multi-clip-stitch",
    targetDurationSeconds: clips.reduce(
      (totalSeconds, clip) => totalSeconds + clip.durationSeconds,
      0,
    ),
    musicMood: setup.storyTemplate.musicMood,
    audioStrategy,
    summary: `${setup.storyTemplate.name}: ${setup.storyTemplate.generationGuidance}`,
    outputSummary: setup.songScript
      ? `${setup.storyTemplate.name} birthday video with ${setup.songScript.title}`
      : `${setup.storyTemplate.name} birthday video`,
    clips,
  };
}

export function summarizeMotionGenerationPlan(plan: MotionGenerationPlan) {
  return [
    `Video plan: ${plan.strategy}, ${plan.targetDurationSeconds}s target.`,
    summarizeAudioStrategy(plan.audioStrategy),
    `Clips: ${plan.clips
      .map(
        (clip) =>
          `${clip.sequence}. ${clip.timeRange} ${clip.title}: ${clip.caption}. ${clip.visualPrompt}`,
      )
      .join(" | ")}`,
  ].join(" ");
}

function buildClipPrompt(
  setup: PartyFaceSetupPayload,
  visualDirection: string,
  caption: string,
) {
  return [
    visualDirection,
    setup.generationStyle.promptInstruction,
    caption ? `On-screen caption: ${personalizeCaption(caption, setup.birthdayDetails.recipientName)}.` : null,
    setup.birthdayDetails.message
      ? `Birthday message context: ${setup.birthdayDetails.message}.`
      : null,
  ]
    .filter(Boolean)
    .join(" ");
}

function personalizeCaption(caption: string, recipientName: string) {
  if (!recipientName.trim()) return caption;
  return caption.replaceAll("[Name]", recipientName.trim());
}

function parseTimeRangeDuration(timeRange: string) {
  const match = timeRange.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)s/i);
  if (!match) return null;

  const start = Number(match[1]);
  const end = Number(match[2]);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return null;
  }

  return Math.round((end - start) * 10) / 10;
}
