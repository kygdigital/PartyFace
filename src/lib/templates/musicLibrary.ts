export type BeatGrid = {
  bpm: number;
  downbeatOffsetSeconds: number;
  beatsPerBar: number;
};

export type BeatMapEntry = {
  bar: number;
  beat: number;
  timestampSeconds: number;
};

export type MusicLibraryTrack = {
  id: string;
  title: string;
  file: string;
  source: string;
  theme: string;
  vibeTags: string[];
  bpm: number;
  key: string;
  durationSeconds: number;
  vocal: string;
  beatGrid: BeatGrid;
  beatMap: BeatMapEntry[] | null;
  beatMapSource: "computed_on_ingest" | "manual" | string;
  previewUrl: string;
};

export type BeatTimestamp = {
  bar: number;
  beat: number;
  timestampSeconds: number;
  label: string;
};

export const musicLibraryTracks: MusicLibraryTrack[] = [
  {
    id: "glam-disco-116bpm-01",
    title: "Birthday Royale (Glam Disco)",
    file: "library/glam-disco-116bpm-01.mp3",
    source: "ace-step-1.5-xl-turbo",
    theme: "red_carpet_glam",
    vibeTags: ["disco", "glam", "celebratory", "danceable"],
    bpm: 116,
    key: "F major",
    durationSeconds: 120,
    vocal: "female_lead",
    beatGrid: {
      bpm: 116,
      downbeatOffsetSeconds: 0,
      beatsPerBar: 4,
    },
    beatMap: null,
    beatMapSource: "computed_on_ingest",
    previewUrl: "/audio/partyface-90s-stock-loop.mp3",
  },
  {
    id: "electro-dancepop-124bpm-01",
    title: "Birthday Royale (Electro Dance-Pop)",
    file: "library/electro-dancepop-124bpm-01.mp3",
    source: "ace-step-1.5-xl-turbo",
    theme: "red_carpet_glam",
    vibeTags: ["dance-pop", "electro", "club", "euphoric"],
    bpm: 124,
    key: "C major",
    durationSeconds: 120,
    vocal: "female_lead",
    beatGrid: {
      bpm: 124,
      downbeatOffsetSeconds: 0,
      beatsPerBar: 4,
    },
    beatMap: null,
    beatMapSource: "computed_on_ingest",
    previewUrl: "/audio/partyface-90s-stock-loop.mp3",
  },
];

export const defaultMusicLibraryTrack = musicLibraryTracks[0];

export function findMusicLibraryTrack(trackId?: string) {
  return (
    musicLibraryTracks.find((track) => track.id === trackId) ??
    defaultMusicLibraryTrack
  );
}

export function computeBeatTimestamp(
  track: MusicLibraryTrack,
  bar: number,
  beat: number,
) {
  const explicitTimestamp = track.beatMap?.find(
    (entry) => entry.bar === bar && entry.beat === beat,
  )?.timestampSeconds;

  if (typeof explicitTimestamp === "number") return explicitTimestamp;

  const beatIndex =
    (bar - 1) * track.beatGrid.beatsPerBar + Math.max(beat - 1, 0);
  const secondsPerBeat = 60 / track.beatGrid.bpm;

  return roundSeconds(track.beatGrid.downbeatOffsetSeconds + beatIndex * secondsPerBeat);
}

export function buildBeatGridPreview(
  track: MusicLibraryTrack,
  barCount = 4,
): BeatTimestamp[] {
  return Array.from({ length: barCount }).flatMap((_, barIndex) =>
    Array.from({ length: track.beatGrid.beatsPerBar }).map((__, beatIndex) => {
      const bar = barIndex + 1;
      const beat = beatIndex + 1;

      return {
        bar,
        beat,
        timestampSeconds: computeBeatTimestamp(track, bar, beat),
        label: `${bar}.${beat}`,
      };
    }),
  );
}

export function findNearestBeatMarker(
  track: MusicLibraryTrack,
  timestampSeconds: number,
) {
  const secondsPerBeat = 60 / track.beatGrid.bpm;
  const beatIndex = Math.max(
    0,
    Math.round((timestampSeconds - track.beatGrid.downbeatOffsetSeconds) / secondsPerBeat),
  );
  const bar = Math.floor(beatIndex / track.beatGrid.beatsPerBar) + 1;
  const beat = (beatIndex % track.beatGrid.beatsPerBar) + 1;

  return {
    bar,
    beat,
    label: `${bar}.${beat}`,
    timestampSeconds: computeBeatTimestamp(track, bar, beat),
  };
}

function roundSeconds(seconds: number) {
  return Math.round(seconds * 100) / 100;
}
