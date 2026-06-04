export type GenerationStyleId = "cutout-heads" | "cinematic-blend";

export type GenerationStyle = {
  id: GenerationStyleId;
  name: string;
  shortName: string;
  description: string;
  promptInstruction: string;
};

export const generationStyles: GenerationStyle[] = [
  {
    id: "cutout-heads",
    name: "Cutout Heads",
    shortName: "Cutout",
    description: "Playful photo heads pasted onto generated bodies.",
    promptInstruction:
      "Generation style: Cutout Heads. Use the uploaded faces as clearly visible oversized photographic cutout heads pasted onto generated bodies. Keep the faces recognizable and intentionally not fully blended: crisp cutout edges, thin white sticker outline, subtle drop shadow, slightly exaggerated head scale, and playful collage proportions.",
  },
  {
    id: "cinematic-blend",
    name: "Cinematic Blend",
    shortName: "Blend",
    description: "A polished AI poster with faces blended into the scene.",
    promptInstruction:
      "Generation style: Cinematic Blend. Use the uploaded faces as natural identity references and blend them into a polished AI-generated poster. Keep the faces recognizable while matching the lighting, costume, pose, and scene style.",
  },
];

export const defaultGenerationStyle = generationStyles[0];

export function findGenerationStyle(styleId?: string) {
  return (
    generationStyles.find((style) => style.id === styleId) ??
    defaultGenerationStyle
  );
}
