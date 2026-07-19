import type {
  BirthdayDetails,
  PartyFaceSetupPayload,
  PartyFaceSongScriptInput,
} from "@/lib/domain/project";
import type { GenerationStyle } from "@/lib/templates/generationStyles";
import type { MusicLibraryTrack } from "@/lib/templates/musicLibrary";
import type { StoryTemplatePayload } from "@/lib/templates/storyTemplates";
import type { StarterTemplate } from "@/lib/templates/starterTemplates";
import type { PersonSlot } from "./studioTypes";

type BuildPartyFaceSetupPayloadInput = {
  template: StarterTemplate;
  generationStyle: GenerationStyle;
  storyTemplate: StoryTemplatePayload;
  songScript?: PartyFaceSongScriptInput;
  musicTrack: MusicLibraryTrack;
  birthdayDetails: BirthdayDetails;
  prompt: string;
  personSlots: PersonSlot[];
};

export function buildPartyFaceSetupPayload({
  template,
  generationStyle,
  storyTemplate,
  songScript,
  musicTrack,
  birthdayDetails,
  prompt,
  personSlots,
}: BuildPartyFaceSetupPayloadInput): PartyFaceSetupPayload {
  return {
    template: {
      id: template.id,
      name: template.name,
      birthdayVibe: template.birthdayVibe,
    },
    generationStyle: {
      id: generationStyle.id,
      name: generationStyle.name,
      promptInstruction: generationStyle.promptInstruction,
    },
    storyTemplate,
    songScript,
    musicTrack: {
      id: musicTrack.id,
      title: musicTrack.title,
      file: musicTrack.file,
      source: musicTrack.source,
      theme: musicTrack.theme,
      vibeTags: musicTrack.vibeTags,
      bpm: musicTrack.bpm,
      key: musicTrack.key,
      durationSeconds: musicTrack.durationSeconds,
      vocal: musicTrack.vocal,
      beatGrid: musicTrack.beatGrid,
      beatMapSource: musicTrack.beatMapSource,
      previewUrl: musicTrack.previewUrl,
    },
    birthdayDetails,
    prompt,
    subjects: personSlots
      .filter((slot) => slot.photo?.usability.status === "usable")
      .map((slot) => ({
        slotId: slot.id,
        label: slot.label,
        optional: slot.optional,
        photo: {
          fileName: slot.photo?.fileName ?? "",
          mimeType: slot.photo?.mimeType,
          sizeBytes: slot.photo?.sizeBytes,
          uploadRef: slot.photo?.uploadRef,
          referenceRole: "face-reference",
        },
      })),
  };
}
