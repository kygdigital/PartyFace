import type { BirthdayDetails, PartyFaceSongScriptInput } from "@/lib/domain/project";

export type SongScriptSectionType = "intro" | "verse" | "pre-chorus" | "chorus" | "spoken" | "chant" | "bridge";

export type SongScriptSection = {
  type: SongScriptSectionType;
  label: string;
  lines: string[];
};

export type TemplateSongScript = {
  templateId: string;
  title: string;
  styleNotes: string;
  tempoMood: string;
  stockLoopFitNotes: string;
  desiredDurationSeconds: number;
  sections: SongScriptSection[];
};

const fallbackName = "the birthday star";

export const templateSongScripts: TemplateSongScript[] = [
  {
    templateId: "disco-glam-birthday",
    title: "Premium Birthday Glow",
    styleNotes: "Short disco greeting-card jingle with group chants, claps, mirrorball sparkle, and goofy cutout-head dance callouts.",
    tempoMood: "Upbeat disco-funk, 116-124 BPM, joyful and glamorous.",
    stockLoopFitNotes: "The MVP stock loop works as a disco-adjacent preview bed for claps, dancing, and the final chorus drop.",
    desiredDurationSeconds: 30,
    sections: [
      {
        type: "spoken",
        label: "Intro - spoken",
        lines: [
          "Mirrorball check.",
          "[Name] check.",
          "Tiny dance floor, huge birthday energy.",
        ],
      },
      {
        type: "chant",
        label: "Dance hook",
        lines: [
          "Head bob left, head bob right",
          "[Name] is glowing in the party light",
          "Shoulders shimmy, candles bright",
          "Happy birthday, do it twice",
        ],
      },
      {
        type: "chorus",
        label: "Chorus",
        lines: [
          "Happy, happy birthday",
          "Dance it out, [Name]",
          "Happy, happy birthday",
          "Premium all day",
        ],
      },
      {
        type: "chant",
        label: "Final callout",
        lines: [
          "Clap clap, pose",
          "Cake cake, glow",
          "Everybody yell: [Name]!",
        ],
      },
    ],
  },
  {
    templateId: "luxury-magazine-cover",
    title: "Cover Star Birthday",
    styleNotes: "Glossy greeting-card jingle with camera-flash sound cues, short sung hooks, and cutout-head pose moments.",
    tempoMood: "Polished glam pop, 104-118 BPM, confident and celebratory.",
    stockLoopFitNotes: "The stock loop is a temporary upbeat preview bed; final generated music should feel more glossy and editorial.",
    desiredDurationSeconds: 30,
    sections: [
      {
        type: "spoken",
        label: "Intro - spoken",
        lines: [
          "Cover shoot starts now.",
          "[Name], chin up.",
          "Birthday face: perfect.",
        ],
      },
      {
        type: "chant",
        label: "Pose hook",
        lines: [
          "Flash flash, turn around",
          "Big head dancing, tiny town",
          "Smile smile, strike that pose",
          "[Name] is the headline, everybody knows",
        ],
      },
      {
        type: "chorus",
        label: "Chorus",
        lines: [
          "Happy birthday, cover star",
          "Look how loved you are",
          "Happy birthday, cover star",
          "Famous from near and far",
        ],
      },
      {
        type: "spoken",
        label: "Photo break",
        lines: [
          "Freeze.",
          "Smile.",
          "That is the birthday cover.",
        ],
      },
    ],
  },
  {
    templateId: "nineties-music-video",
    title: "Hey Hey Birthday",
    styleNotes: "Short 90s greeting-card dance jingle with crew callouts, simple repeatable hooks, and cutout-head choreography.",
    tempoMood: "Colorful 90s dance-pop, 112-122 BPM, playful and choreographed.",
    stockLoopFitNotes: "The included 90s stock loop is the strongest MVP match for this template and supports dance-crew timing.",
    desiredDurationSeconds: 30,
    sections: [
      {
        type: "spoken",
        label: "Intro - spoken",
        lines: [
          "Birthday crew, roll call.",
          "[Name] in the middle.",
          "Big head mode. Five, six, seven, eight.",
        ],
      },
      {
        type: "chant",
        label: "Dance hook",
        lines: [
          "Step touch, head bounce",
          "Birthday joy in large amounts",
          "Wave hands, point down",
          "[Name] is dancing all over town",
        ],
      },
      {
        type: "chorus",
        label: "Chorus",
        lines: [
          "Hey hey, happy birthday",
          "Hey hey, [Name] all day",
          "Hey hey, tiny body sway",
          "Hey hey, do it the 90s way",
        ],
      },
      {
        type: "chant",
        label: "Freeze-frame callout",
        lines: [
          "Freeze frame.",
          "Big smile.",
          "Birthday legend.",
          "Run it back.",
        ],
      },
    ],
  },
  {
    templateId: "superhero-birthday-duo",
    title: "Birthday Hero Mode",
    styleNotes: "Short heroic birthday jingle with comic-book spoken hits, chanty group vocals, and cutout-head power poses.",
    tempoMood: "Playful heroic pop, 112-126 BPM, bold and funny.",
    stockLoopFitNotes: "The stock loop can preview motion timing, but final music should add heroic brass and action hits.",
    desiredDurationSeconds: 30,
    sections: [
      {
        type: "spoken",
        label: "Intro - spoken",
        lines: [
          "Birthday alert.",
          "Cake in danger.",
          "[Name], activate hero mode.",
        ],
      },
      {
        type: "chant",
        label: "Action hook",
        lines: [
          "Cape flip, head nod",
          "Birthday power, party squad",
          "Cake saved, candles glow",
          "[Name] does the hero pose",
        ],
      },
      {
        type: "chorus",
        label: "Chorus",
        lines: [
          "Happy birthday, hero",
          "Zoom zoom, go go",
          "Happy birthday, hero",
          "Confetti kaboom, whoa",
        ],
      },
      {
        type: "spoken",
        label: "Comic break",
        lines: [
          "Bad vibes defeated.",
          "Cake secured.",
          "Victory dance.",
        ],
      },
    ],
  },
  {
    templateId: "red-carpet-paparazzi",
    title: "Birthday Superstar",
    styleNotes: "Short red-carpet greeting-card jingle with paparazzi flash cues, applause, and silly celebrity cutout poses.",
    tempoMood: "Glam pop, 118-128 BPM, polished and celebratory.",
    stockLoopFitNotes: "The stock loop works as an upbeat temporary bed; final music should add applause and camera-flash accents.",
    desiredDurationSeconds: 30,
    sections: [
      {
        type: "spoken",
        label: "Intro - spoken",
        lines: [
          "Camera one, camera two.",
          "[Name] just arrived.",
          "Please scream respectfully.",
        ],
      },
      {
        type: "chant",
        label: "Walk hook",
        lines: [
          "Flash flash, wave wave",
          "Birthday icon on display",
          "Step step, head sway",
          "[Name] owns the carpet today",
        ],
      },
      {
        type: "chorus",
        label: "Chorus",
        lines: [
          "Happy birthday, superstar",
          "Wave to the cameras",
          "Happy birthday, superstar",
          "You are fabulous, obviously",
        ],
      },
      {
        type: "chant",
        label: "Award callout",
        lines: [
          "Best vibes: [Name]",
          "Best laugh: [Name]",
          "Best dance: [Name]",
          "Accept the cake.",
        ],
      },
    ],
  },
];

export function findTemplateSongScript(templateId: string) {
  return (
    templateSongScripts.find((script) => script.templateId === templateId) ??
    templateSongScripts[0]
  );
}

export function formatSongScript(script: TemplateSongScript) {
  return script.sections
    .map((section) => {
      const lines = section.lines.join("\n");
      return `[${section.label}]\n${lines}`;
    })
    .join("\n\n");
}

export function personalizeSongScript(scriptText: string, details: BirthdayDetails) {
  const name = details.recipientName.trim() || fallbackName;
  const ageLine = details.age.trim() ? `Age ${details.age.trim()}, still iconic.` : "";
  const message = details.message.trim();

  return scriptText
    .replaceAll("[Name]", name)
    .replaceAll("[AgeLine]", ageLine)
    .replaceAll("[Message]", message);
}

export function buildSongScriptPayload(
  templateId: string,
  details: BirthdayDetails,
  scriptText: string,
): PartyFaceSongScriptInput {
  const script = findTemplateSongScript(templateId);
  const personalizedLyrics = personalizeSongScript(scriptText, details);

  return {
    templateId,
    title: script.title,
    styleNotes: script.styleNotes,
    tempoMood: script.tempoMood,
    stockLoopFitNotes: script.stockLoopFitNotes,
    desiredDurationSeconds: script.desiredDurationSeconds,
    lyrics: personalizedLyrics,
    handoffPrompt: buildSongHandoffPrompt(script, personalizedLyrics),
  };
}

export function buildSongHandoffPrompt(
  script: TemplateSongScript,
  personalizedLyrics: string,
) {
  return [
    `Create a ${script.desiredDurationSeconds}-second personalized birthday greeting-card jingle, not a full-length song.`,
    `Style: ${script.styleNotes}`,
    `Tempo and mood: ${script.tempoMood}`,
    "Performance direction: cutout heads on dancing bodies are bobbing, waving, posing, and lip-syncing simple hooks.",
    "Keep the vocal delivery playful, clear, short, and chanty. Favor repeatable hooks over long verses. Leave room for video cuts on section changes.",
    "Lyrics/script:",
    personalizedLyrics,
    "Usage note: only use this output if you have the rights to share the generated track.",
  ].join("\n\n");
}
