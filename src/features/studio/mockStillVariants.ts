import type { PartyFaceSetupPayload } from "@/lib/domain/project";
import type { StillOutputVariant } from "@/lib/domain/generation";

const variantStyles = [
  {
    title: "Neon Cover",
    subtitle: "Big birthday headline, glossy disco lighting",
    styleNotes: ["poster crop", "pink neon", "headline space"],
  },
  {
    title: "Dancefloor Hero",
    subtitle: "Full-scene party moment with premium sparkle",
    styleNotes: ["wide scene", "mirrorball", "friend-group energy"],
  },
  {
    title: "Icon Portrait",
    subtitle: "Closer editorial framing for a shareable card",
    styleNotes: ["portrait crop", "gold glow", "clean message area"],
  },
];

export function createMockStillVariants(
  jobId: string,
  setup: PartyFaceSetupPayload,
  count: number,
): StillOutputVariant[] {
  return Array.from({ length: count }, (_, index) => {
    const style = variantStyles[index % variantStyles.length];

    return {
      variantId: `${jobId}-variant-${index + 1}`,
      jobId,
      title: style.title,
      subtitle: style.subtitle,
      promptSnapshot: setup.prompt,
      styleNotes: [
        setup.template.name,
        setup.generationStyle.name,
        setup.birthdayDetails.tone,
        ...style.styleNotes,
      ],
    };
  });
}
