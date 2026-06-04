import type { MotionOutputVariant } from "@/lib/domain/generation";
import type { PartyFaceSetupPayload } from "@/lib/domain/project";

export function createMockMotionVariant(
  jobId: string,
  setup: PartyFaceSetupPayload,
  durationSeconds: number,
): MotionOutputVariant {
  return {
    variantId: `${jobId}-motion-1`,
    jobId,
    title: `${setup.template.name} Motion`,
    subtitle: "Muted browser preview with party sparkle and camera movement",
    promptSnapshot: setup.prompt,
    durationSeconds,
    previewKind: "mock-css",
  };
}
