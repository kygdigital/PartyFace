import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { apiFailure } from "@/lib/api/responses";
import { getLocalRenderPath } from "@/lib/renderer/redCarpetRenderer";

export const runtime = "nodejs";

type LocalRenderRouteContext = {
  params: Promise<{
    jobId: string;
    fileName: string;
  }>;
};

export async function GET(_request: Request, context: LocalRenderRouteContext) {
  const { jobId, fileName } = await context.params;
  const filePath = getLocalRenderPath(jobId, fileName);

  if (!filePath) {
    return NextResponse.json(
      apiFailure("render_not_found", "That local render file is not available.", false),
      { status: 404 },
    );
  }

  try {
    const file = await readFile(filePath);

    return new NextResponse(file, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `inline; filename="${fileName}"`,
      },
    });
  } catch {
    return NextResponse.json(
      apiFailure("render_not_found", "That local render file is not available.", false),
      { status: 404 },
    );
  }
}
