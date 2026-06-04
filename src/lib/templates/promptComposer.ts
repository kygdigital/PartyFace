import type { StarterTemplate } from "./starterTemplates";
import type { BirthdayDetails } from "@/lib/domain/project";

export const birthdayToneOptions = [
  "Playful",
  "Glam",
  "Sweet",
  "Iconic",
  "Chaotic good",
] as const;

export const emptyBirthdayDetails: BirthdayDetails = {
  recipientName: "",
  age: "",
  message: "",
  tone: birthdayToneOptions[0],
};

export function composeBirthdayPrompt(
  template: StarterTemplate,
  details: BirthdayDetails,
) {
  const personalDetails = [
    details.recipientName ? `recipient name: ${details.recipientName}` : null,
    details.age ? `birthday age: ${details.age}` : null,
    details.tone ? `tone: ${details.tone}` : null,
    details.message ? `personal message: "${details.message}"` : null,
  ].filter(Boolean);

  if (personalDetails.length === 0) {
    return template.defaultPrompt;
  }

  return `${template.defaultPrompt} Personalize the scene with ${personalDetails.join(", ")}.`;
}
