import { NextResponse } from "next/server";
import { apiFailure, apiSuccess, type ApiResponse } from "@/lib/api/responses";
import { recordStillGenerationJob } from "@/lib/comfy/jobs";
import { StillImageReferenceError } from "@/lib/comfy/stillImageReferences";
import { partyFaceSetupPayloadSchema } from "@/lib/domain/schemas";
import { startStillGeneration } from "@/lib/comfy/stillWorkflow";
import type { StillGenerationStartResult } from "@/lib/comfy/workflowTypes";

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
        "Add at least one usable face photo and a prompt before generating stills.",
      ),
      { status: 400 },
    );
  }

  try {
    const job = await startStillGeneration(payloadResult.data);
    recordStillGenerationJob(job);

    return NextResponse.json<ApiResponse<StillGenerationStartResult>>(
      apiSuccess(job),
      { status: 202 },
    );
  } catch (error) {
    if (error instanceof StillImageReferenceError) {
      return NextResponse.json(
        apiFailure("still_reference_unavailable", error.message),
        { status: 422 },
      );
    }

    return NextResponse.json(
      apiFailure(
        "still_generation_unavailable",
        "Still generation is not available yet. Try mock mode or check the Comfy workflow setup.",
      ),
      { status: 503 },
    );
  }
}
