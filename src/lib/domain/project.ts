export type BirthdayDetails = {
  recipientName: string;
  age: string;
  message: string;
  tone: string;
};

export type PartyFaceSubjectSlotId = "person-1" | "person-2";

export type PartyFaceSubjectPhoto = {
  fileName: string;
  mimeType?: string;
  sizeBytes?: number;
  uploadRef?: string;
  referenceRole?: "face-reference";
};

export type PartyFaceSubjectInput = {
  slotId: PartyFaceSubjectSlotId;
  label: string;
  optional: boolean;
  photo: PartyFaceSubjectPhoto;
};

export type PartyFaceTemplateInput = {
  id: string;
  name: string;
  birthdayVibe: string;
};

export type PartyFaceGenerationStyleInput = {
  id: "cutout-heads" | "cinematic-blend";
  name: string;
  promptInstruction: string;
};

export type PartyFaceStoryBeatInput = {
  id: string;
  timeRange: string;
  title: string;
  caption: string;
  visualDirection: string;
};

export type PartyFaceStoryTemplateInput = {
  id: string;
  name: string;
  musicMood: string;
  generationGuidance: string;
  beats: PartyFaceStoryBeatInput[];
};

export type PartyFaceSongScriptInput = {
  templateId: string;
  title: string;
  styleNotes: string;
  tempoMood: string;
  stockLoopFitNotes: string;
  desiredDurationSeconds: number;
  lyrics: string;
  handoffPrompt: string;
};

export type PartyFaceMusicTrackInput = {
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
  beatGrid: {
    bpm: number;
    downbeatOffsetSeconds: number;
    beatsPerBar: number;
  };
  beatMapSource: string;
  previewUrl: string;
};

export type PartyFaceSetupPayload = {
  template: PartyFaceTemplateInput;
  generationStyle: PartyFaceGenerationStyleInput;
  storyTemplate: PartyFaceStoryTemplateInput;
  songScript?: PartyFaceSongScriptInput;
  musicTrack: PartyFaceMusicTrackInput;
  birthdayDetails: BirthdayDetails;
  prompt: string;
  subjects: PartyFaceSubjectInput[];
};
