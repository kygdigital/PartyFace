import { NextResponse } from "next/server";
import { apiFailure, apiSuccess, type ApiResponse } from "@/lib/api/responses";
import { getGenerationJob } from "@/lib/comfy/jobs";
import type { GenerationJobRecord } from "@/lib/domain/generation";

type JobRouteContext = {
  params: Promise<{
    jobId: string;
  }>;
};

export async function GET(_request: Request, context: JobRouteContext) {
  const { jobId } = await context.params;
  const job = await getGenerationJob(jobId);

  if (!job) {
    return NextResponse.json(
      apiFailure("job_not_found", "That generation job could not be found.", false),
      { status: 404 },
    );
  }

  return NextResponse.json<ApiResponse<GenerationJobRecord>>(apiSuccess(job));
}
