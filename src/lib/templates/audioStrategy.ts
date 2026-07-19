import type { StoryTemplatePayload } from "./storyTemplates";
import type {
  PartyFaceMusicTrackInput,
  PartyFaceSongScriptInput,
} from "@/lib/domain/project";

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
  trackId?: string;
  trackTitle?: string;
  trackFile?: string;
  bpm?: number;
  key?: string;
  beatMapSource?: string;
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
  musicTrack?: PartyFaceMusicTrackInput,
): AudioStrategy {
  return {
    mode: musicTrack ? "generated-music" : "stock-loop",
    label: musicTrack
      ? audioStrategyModes["generated-music"]
      : audioStrategyModes["stock-loop"],
    musicMood: storyTemplate.musicMood,
    loopHint: musicTrack
      ? `${musicTrack.title} registered at ${musicTrack.bpm} BPM`
      : selectLoopHint(storyTemplate.musicMood),
    bpmRange: musicTrack
      ? `${musicTrack.bpm} BPM`
      : selectBpmRange(storyTemplate.musicMood),
    previewUrl: musicTrack?.previewUrl ?? selectPreviewUrl(storyTemplate.musicMood),
    structure:
      "Use a 30-45 second edit with an intro, two middle phrase changes, and a final chorus/drop aligned to the last story beat.",
    songTitle: songScript?.title,
    stockLoopFitNotes: songScript?.stockLoopFitNotes,
    handoffPrompt: songScript?.handoffPrompt,
    trackId: musicTrack?.id,
    trackTitle: musicTrack?.title,
    trackFile: musicTrack?.file,
    bpm: musicTrack?.bpm,
    key: musicTrack?.key,
    beatMapSource: musicTrack?.beatMapSource,
    implementationNote:
      "MVP references registered generated music tracks. New songs are produced upstream and added to the library before runtime use.",
  };
}

export function summarizeAudioStrategy(strategy: AudioStrategy) {
  return [
    `Audio strategy: ${strategy.label}.`,
    `Mood: ${strategy.musicMood}.`,
    `Loop target: ${strategy.loopHint}.`,
    `Tempo: ${strategy.bpmRange}.`,
    strategy.trackId ? `Track: ${strategy.trackId}.` : null,
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
