import { z } from "zod";

export const birthdayDetailsSchema = z.object({
  recipientName: z.string(),
  age: z.string(),
  message: z.string(),
  tone: z.string(),
});

export const partyFaceSubjectPhotoSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().optional(),
  sizeBytes: z.number().int().nonnegative().optional(),
  uploadRef: z
    .string()
    .refine(
      (value) =>
        value.startsWith("https://") ||
        /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(value),
      "Use an HTTPS image URL or browser image data URL.",
    )
    .optional(),
  referenceRole: z.literal("face-reference").optional(),
});

export const partyFaceSubjectInputSchema = z.object({
  slotId: z.enum(["person-1", "person-2"]),
  label: z.string().min(1),
  optional: z.boolean(),
  photo: partyFaceSubjectPhotoSchema,
});

export const partyFaceTemplateInputSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  birthdayVibe: z.string().min(1),
});

export const partyFaceGenerationStyleInputSchema = z.object({
  id: z.enum(["cutout-heads", "cinematic-blend"]),
  name: z.string().min(1),
  promptInstruction: z.string().min(1),
});

export const partyFaceStoryBeatInputSchema = z.object({
  id: z.string().min(1),
  timeRange: z.string().min(1),
  title: z.string().min(1),
  caption: z.string().min(1),
  visualDirection: z.string().min(1),
});

export const partyFaceStoryTemplateInputSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  musicMood: z.string().min(1),
  generationGuidance: z.string().min(1),
  beats: z.array(partyFaceStoryBeatInputSchema).min(1).max(6),
});

export const partyFaceSongScriptInputSchema = z.object({
  templateId: z.string().min(1),
  title: z.string().min(1),
  styleNotes: z.string().min(1),
  tempoMood: z.string().min(1),
  stockLoopFitNotes: z.string().min(1),
  desiredDurationSeconds: z.number().positive(),
  lyrics: z.string().min(1),
  handoffPrompt: z.string().min(1),
});

export const partyFaceMusicTrackInputSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  file: z.string().min(1),
  source: z.string().min(1),
  theme: z.string().min(1),
  vibeTags: z.array(z.string().min(1)).min(1),
  bpm: z.number().positive(),
  key: z.string().min(1),
  durationSeconds: z.number().positive(),
  vocal: z.string().min(1),
  beatGrid: z.object({
    bpm: z.number().positive(),
    downbeatOffsetSeconds: z.number().nonnegative(),
    beatsPerBar: z.number().int().positive(),
  }),
  beatMapSource: z.string().min(1),
  previewUrl: z.string().min(1),
});

export const partyFaceSetupPayloadSchema = z.object({
  template: partyFaceTemplateInputSchema,
  generationStyle: partyFaceGenerationStyleInputSchema,
  storyTemplate: partyFaceStoryTemplateInputSchema,
  songScript: partyFaceSongScriptInputSchema.optional(),
  musicTrack: partyFaceMusicTrackInputSchema,
  birthdayDetails: birthdayDetailsSchema,
  prompt: z.string().min(1),
  subjects: z.array(partyFaceSubjectInputSchema).min(1).max(2),
});
