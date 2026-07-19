import { NextResponse } from "next/server";
import { apiFailure, apiSuccess, type ApiResponse } from "@/lib/api/responses";
import type { GenerationJobRecord } from "@/lib/domain/generation";
import { partyFaceSetupPayloadSchema } from "@/lib/domain/schemas";
import {
  renderRedCarpetCard,
  type RedCarpetRenderMode,
} from "@/lib/renderer/redCarpetRenderer";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      apiFailure("invalid_json", "Send a valid local render payload."),
      { status: 400 },
    );
  }

  const renderMode = readRenderMode(body);
  const setupResult = partyFaceSetupPayloadSchema.safeParse(body);

  if (!setupResult.success) {
    return NextResponse.json(
      apiFailure(
        "invalid_local_render_setup",
        "Add a renderable Red Carpet template, local face photo, recipient details, and registered track.",
      ),
      { status: 400 },
    );
  }

  try {
    const result = await renderRedCarpetCard(setupResult.data, renderMode);

    return NextResponse.json<ApiResponse<GenerationJobRecord>>(
      apiSuccess(result.job),
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      apiFailure(
        "local_render_failed",
        error instanceof Error
          ? error.message
          : "The local Red Carpet render could not be created.",
      ),
      { status: 422 },
    );
  }
}

function readRenderMode(body: unknown): RedCarpetRenderMode {
  if (
    body &&
    typeof body === "object" &&
    "renderMode" in body &&
    body.renderMode === "full"
  ) {
    return "full";
  }

  return "draft";
}
