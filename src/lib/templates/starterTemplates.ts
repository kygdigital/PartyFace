export type OutputSupport = {
  still: boolean;
  motion: boolean;
};

export type StarterTemplate = {
  id: string;
  name: string;
  description: string;
  birthdayVibe: string;
  defaultPrompt: string;
  accentColor: string;
  support: OutputSupport;
  renderStatus: "local-renderable" | "preview-only";
};

export const starterTemplates: StarterTemplate[] = [
  {
    id: "disco-glam-birthday",
    name: "Disco Glam Birthday",
    description: "Neon lights, mirrorball sparkle, premium party energy.",
    birthdayVibe: "Disco glam",
    defaultPrompt:
      "Premium disco-glam birthday scene with mirrorball sparkle, neon pink and gold lighting, joyful friends, polished editorial styling, and celebratory party atmosphere.",
    accentColor: "#FF3DA7",
    support: { still: true, motion: true },
    renderStatus: "preview-only",
  },
  {
    id: "luxury-magazine-cover",
    name: "Luxury Magazine Cover",
    description: "Glossy cover star treatment with bold birthday text.",
    birthdayVibe: "Luxury editorial",
    defaultPrompt:
      "High-end birthday magazine cover, glamorous portrait lighting, polished fashion styling, elegant headline space, premium celebration mood.",
    accentColor: "#FFC857",
    support: { still: true, motion: true },
    renderStatus: "preview-only",
  },
  {
    id: "nineties-music-video",
    name: "90s Music Video",
    description: "Colorful throwback video set with playful choreography.",
    birthdayVibe: "90s music video",
    defaultPrompt:
      "Playful 90s music video birthday scene, bright stage lights, fun choreography, saturated color, nostalgic pop-video energy, shareable celebration.",
    accentColor: "#2DD4FF",
    support: { still: true, motion: true },
    renderStatus: "preview-only",
  },
  {
    id: "superhero-birthday-duo",
    name: "Superhero Birthday Duo",
    description: "Comic-book birthday heroes with dramatic celebration poses.",
    birthdayVibe: "Superhero birthday",
    defaultPrompt:
      "Birthday superhero duo in a dynamic comic-book scene, dramatic poses, confetti burst, heroic lighting, celebratory city backdrop.",
    accentColor: "#7C3AED",
    support: { still: true, motion: true },
    renderStatus: "preview-only",
  },
  {
    id: "red-carpet-paparazzi",
    name: "Red Carpet Paparazzi",
    description: "Flashbulbs, velvet ropes, and birthday icon treatment.",
    birthdayVibe: "Red carpet",
    defaultPrompt:
      "Red carpet birthday celebration with paparazzi flashes, velvet ropes, glamorous outfits, iconic celebrity arrival energy, polished party poster look.",
    accentColor: "#E11D48",
    support: { still: true, motion: true },
    renderStatus: "local-renderable",
  },
];
