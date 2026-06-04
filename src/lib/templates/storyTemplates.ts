export type StoryBeat = {
  id: string;
  timeRange: string;
  title: string;
  caption: string;
  visualDirection: string;
};

export type StoryTemplate = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  musicMood: string;
  generationGuidance: string;
  accentColor: string;
  beats: StoryBeat[];
};

export type StoryTemplatePayload = {
  id: string;
  name: string;
  musicMood: string;
  generationGuidance: string;
  beats: StoryBeat[];
};

export const storyTemplates: StoryTemplate[] = [
  {
    id: "disco-birthday-entrance",
    name: "Disco Birthday Entrance",
    shortName: "Disco",
    description: "A celebrity entrance, dance-floor reveal, and neon birthday finale.",
    musicMood: "Upbeat disco-funk with a clear chorus drop near the final reveal.",
    generationGuidance:
      "Build a 30-second disco birthday arc with mirrorball lighting, playful dancing, confetti, and readable neon birthday callouts.",
    accentColor: "#FF3DA7",
    beats: [
      {
        id: "entrance",
        timeRange: "0-6s",
        title: "Neon Invite",
        caption: "The party doors open for [Name].",
        visualDirection: "Disco lights wake up, crowd silhouettes turn, mirrorball sparkles.",
      },
      {
        id: "arrival",
        timeRange: "6-13s",
        title: "Icon Arrival",
        caption: "[Name] enters like the main event.",
        visualDirection: "Cutout face on glam outfit, camera push, paparazzi-style flashes.",
      },
      {
        id: "dance",
        timeRange: "13-23s",
        title: "Premium Moves",
        caption: "Still iconic. Still premium.",
        visualDirection: "Two or three dance poses, glitter trails, animated text beats.",
      },
      {
        id: "finale",
        timeRange: "23-30s",
        title: "Birthday Drop",
        caption: "Happy Birthday, [Name]!",
        visualDirection: "Confetti, cake reveal, crowd cheer, big neon birthday title.",
      },
    ],
  },
  {
    id: "superhero-birthday-save",
    name: "Superhero Birthday Save",
    shortName: "Hero",
    description: "A birthday emergency becomes a heroic cake-and-confetti rescue.",
    musicMood: "Playful heroic pop with brass hits and a triumphant ending.",
    generationGuidance:
      "Build a 30-second comic-book birthday rescue with heroic poses, city lights, cake delivery, and celebratory action effects.",
    accentColor: "#2DD4FF",
    beats: [
      {
        id: "alert",
        timeRange: "0-5s",
        title: "Birthday Alert",
        caption: "Birthday emergency detected.",
        visualDirection: "Comic city skyline, alert lights, bold panel text.",
      },
      {
        id: "landing",
        timeRange: "5-12s",
        title: "Hero Landing",
        caption: "[Name] arrives to save the day.",
        visualDirection: "Hero landing pose, cape motion, cutout face kept stable.",
      },
      {
        id: "rescue",
        timeRange: "12-23s",
        title: "Cake Rescue",
        caption: "Defeating boring plans with cake.",
        visualDirection: "Cake, balloons, and confetti blast away dull gray scenery.",
      },
      {
        id: "victory",
        timeRange: "23-30s",
        title: "Victory Pose",
        caption: "Happy Birthday, legend.",
        visualDirection: "Comic burst finale, heroic group pose, readable birthday title.",
      },
    ],
  },
  {
    id: "red-carpet-awards",
    name: "Red Carpet Awards",
    shortName: "Awards",
    description: "A glam arrival with playful award-show birthday callouts.",
    musicMood: "Glam pop with camera flashes, applause, and a polished finale.",
    generationGuidance:
      "Build a 30-second red-carpet birthday awards sequence with paparazzi flashes, trophy moments, and customizable award captions.",
    accentColor: "#E11D48",
    beats: [
      {
        id: "flashbulbs",
        timeRange: "0-6s",
        title: "Flashbulbs",
        caption: "Tonight's honoree has arrived.",
        visualDirection: "Velvet rope, camera flashes, crowd silhouettes.",
      },
      {
        id: "walk",
        timeRange: "6-13s",
        title: "Red Carpet Walk",
        caption: "[Name], birthday icon of the year.",
        visualDirection: "Confident walk cycle, glam outfit, cutout face as celebrity closeup.",
      },
      {
        id: "awards",
        timeRange: "13-23s",
        title: "Award Beats",
        caption: "Best vibes. Best laugh. Best group chat presence.",
        visualDirection: "Award cards flip in, trophy sparkle, applause accents.",
      },
      {
        id: "acceptance",
        timeRange: "23-30s",
        title: "Acceptance Speech",
        caption: "Happy Birthday, [Name]!",
        visualDirection: "Cake trophy reveal, final step-and-repeat birthday title.",
      },
    ],
  },
  {
    id: "birthday-heist",
    name: "Birthday Heist",
    shortName: "Heist",
    description: "A tiny mission to steal cake, sparkle, and excellent birthday vibes.",
    musicMood: "Funky spy groove that turns into a party beat at the end.",
    generationGuidance:
      "Build a 30-second playful birthday heist with mission cards, quick cuts, cake vault, and party escape.",
    accentColor: "#FFC857",
    beats: [
      {
        id: "briefing",
        timeRange: "0-5s",
        title: "Mission Briefing",
        caption: "Operation: Best Birthday Ever.",
        visualDirection: "Spy dossier, dramatic tabletop, birthday target board.",
      },
      {
        id: "sneak",
        timeRange: "5-12s",
        title: "Sneak In",
        caption: "[Name] enters the vault of fun.",
        visualDirection: "Laser beams, playful tiptoe pose, cutout face on spy outfit.",
      },
      {
        id: "loot",
        timeRange: "12-23s",
        title: "Party Loot",
        caption: "Cake secured. Confetti secured. Vibes secured.",
        visualDirection: "Cake, balloons, and glitter packed into a glowing bag.",
      },
      {
        id: "escape",
        timeRange: "23-30s",
        title: "Party Escape",
        caption: "Happy Birthday, [Name]!",
        visualDirection: "Vault doors open into a party, disco lights and final title.",
      },
    ],
  },
];

export const defaultStoryTemplate = storyTemplates[0];

export function findStoryTemplate(templateId?: string) {
  return (
    storyTemplates.find((template) => template.id === templateId) ??
    defaultStoryTemplate
  );
}

export function buildStoryTemplatePayload(
  template: StoryTemplate,
  captionsByBeatId: Record<string, string>,
): StoryTemplatePayload {
  return {
    id: template.id,
    name: template.name,
    musicMood: template.musicMood,
    generationGuidance: template.generationGuidance,
    beats: template.beats.map((beat) => ({
      ...beat,
      caption: captionsByBeatId[beat.id] ?? beat.caption,
    })),
  };
}
