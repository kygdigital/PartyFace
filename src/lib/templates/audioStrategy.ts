import type { StoryTemplatePayload } from "./storyTemplates";
import type { PartyFaceSongScriptInput } from "@/lib/domain/project";

export type AudioStrategyMode = "stock-loop" | "generated-music" | "provider-native-audio";

export type AudioStrategy = {
  mode: AudioStrategyMode;
  label: string;
  musicMood: string;
  loopHint: string;
  bpmRange: string;
  previewUrl: string;
  structure: string;
  songTitle?: string;
  stockLoopFitNotes?: string;
  handoffPrompt?: string;
  implementationNote: string;
};

export const audioStrategyModes: Record<AudioStrategyMode, string> = {
  "stock-loop": "Stock Loop",
  "generated-music": "Generated Music",
  "provider-native-audio": "Provider Audio",
};

export function buildAudioStrategy(
  storyTemplate: StoryTemplatePayload,
  songScript?: PartyFaceSongScriptInput,
): AudioStrategy {
  return {
    mode: "stock-loop",
    label: audioStrategyModes["stock-loop"],
    musicMood: storyTemplate.musicMood,
    loopHint: selectLoopHint(storyTemplate.musicMood),
    bpmRange: selectBpmRange(storyTemplate.musicMood),
    previewUrl: selectPreviewUrl(storyTemplate.musicMood),
    structure:
      "Use a 30-second edit with an intro, two middle phrase changes, and a final chorus/drop aligned to the last story beat.",
    songTitle: songScript?.title,
    stockLoopFitNotes: songScript?.stockLoopFitNotes,
    handoffPrompt: songScript?.handoffPrompt,
    implementationNote:
      "MVP should start by pairing generated video with curated stock loops. Generated music and provider-native audio remain future options once licensing, consistency, and render stitching are validated.",
  };
}

export function summarizeAudioStrategy(strategy: AudioStrategy) {
  return [
    `Audio strategy: ${strategy.label}.`,
    `Mood: ${strategy.musicMood}.`,
    `Loop target: ${strategy.loopHint}.`,
    `Tempo: ${strategy.bpmRange}.`,
    strategy.songTitle ? `Song script: ${strategy.songTitle}.` : null,
    strategy.stockLoopFitNotes ? `Stock loop fit: ${strategy.stockLoopFitNotes}.` : null,
    strategy.structure,
  ]
    .filter(Boolean)
    .join(" ");
}

function selectLoopHint(musicMood: string) {
  const normalizedMood = musicMood.toLowerCase();

  if (normalizedMood.includes("heroic")) {
    return "heroic pop loop with brass stabs, big drums, and playful action accents";
  }

  if (normalizedMood.includes("glam")) {
    return "glam pop loop with applause hits, camera-flash accents, and a polished chorus";
  }

  if (normalizedMood.includes("spy")) {
    return "funky spy groove with bass riff, hand percussion, and a celebratory final lift";
  }

  return "upbeat disco-funk loop with mirrorball shimmer, claps, and a clear final drop";
}

function selectBpmRange(musicMood: string) {
  const normalizedMood = musicMood.toLowerCase();

  if (normalizedMood.includes("heroic")) return "112-126 BPM";
  if (normalizedMood.includes("glam")) return "118-128 BPM";
  if (normalizedMood.includes("spy")) return "100-116 BPM";

  return "116-124 BPM";
}

function selectPreviewUrl(musicMood: string) {
  const normalizedMood = musicMood.toLowerCase();

  if (normalizedMood.includes("90s") || normalizedMood.includes("pop dance")) {
    return "/audio/partyface-90s-stock-loop.mp3";
  }

  return "/audio/partyface-90s-stock-loop.mp3";
}
