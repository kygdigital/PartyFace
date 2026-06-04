import { NextResponse } from "next/server";
import { apiFailure, apiSuccess, type ApiResponse } from "@/lib/api/responses";
import { recordFinalVideoGenerationJob } from "@/lib/comfy/jobs";
import { startFinalVideoGeneration } from "@/lib/comfy/finalVideoWorkflow";
import type { FinalVideoGenerationStartResult } from "@/lib/comfy/workflowTypes";
import { partyFaceSetupPayloadSchema } from "@/lib/domain/schemas";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      apiFailure("invalid_json", "Send a valid JSON setup payload."),
      { status: 400 },
    );
  }

  const payloadResult = partyFaceSetupPayloadSchema.safeParse(body);

  if (!payloadResult.success) {
    return NextResponse.json(
      apiFailure(
        "invalid_setup",
        "Add at least one usable face photo, prompt, and story before generating final video clips.",
      ),
      { status: 400 },
    );
  }

  try {
    const job = await startFinalVideoGeneration(payloadResult.data);
    recordFinalVideoGenerationJob(job);

    return NextResponse.json<ApiResponse<FinalVideoGenerationStartResult>>(
      apiSuccess(job),
      { status: 202 },
    );
  } catch {
    return NextResponse.json(
      apiFailure(
        "final_video_generation_unavailable",
        "Final video clip generation is not available yet. Try mock mode or check the Comfy workflow setup.",
      ),
      { status: 503 },
    );
  }
}
