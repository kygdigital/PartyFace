import { apiFailure, apiSuccess, type ApiResponse } from "@/lib/api/responses";
import type {
  MotionOutputVariant,
  StillOutputVariant,
} from "@/lib/domain/generation";

export function exportStillVariant(
  variant: StillOutputVariant | null,
): ApiResponse<{ fileName: string }> {
  if (!variant) {
    return apiFailure(
      "still_export_missing",
      "Generate or favorite a still output before exporting.",
    );
  }

  try {
    if (variant.downloadUrl ?? variant.imageUrl) {
      const fileName = `${slugify(variant.title)}-${variant.variantId}.png`;
      downloadUrlFile(fileName, variant.downloadUrl ?? variant.imageUrl ?? "");
      return apiSuccess({ fileName });
    }

    const fileName = `${slugify(variant.title)}-${variant.variantId}.svg`;
    downloadTextFile(fileName, "image/svg+xml", buildStillSvg(variant));
    return apiSuccess({ fileName });
  } catch {
    return apiFailure(
      "still_export_failed",
      "The still output could not be exported. Try again.",
    );
  }
}

function downloadUrlFile(fileName: string, url: string) {
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
}

export function exportMotionVariant(
  variant: MotionOutputVariant | null,
): ApiResponse<{ fileName: string }> {
  if (!variant) {
    return apiFailure(
      "motion_export_missing",
      "Generate or favorite a motion output before exporting.",
    );
  }

  try {
    if (variant.downloadUrl ?? variant.videoUrl) {
      const fileName = `${slugify(variant.title)}-${variant.variantId}.mp4`;
      downloadUrlFile(fileName, variant.downloadUrl ?? variant.videoUrl ?? "");
      return apiSuccess({ fileName });
    }

    const fileName = `${slugify(variant.title)}-${variant.variantId}.svg`;
    downloadTextFile(fileName, "image/svg+xml", buildMotionSvg(variant));
    return apiSuccess({ fileName });
  } catch {
    return apiFailure(
      "motion_export_failed",
      "The motion output could not be exported. Try again.",
    );
  }
}

function downloadTextFile(fileName: string, mimeType: string, content: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function buildStillSvg(variant: StillOutputVariant) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#2A1546"/>
      <stop offset="0.52" stop-color="#FF3DA7"/>
      <stop offset="1" stop-color="#FFC857"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="900" fill="url(#bg)"/>
  <circle cx="940" cy="170" r="95" fill="#ffffff" opacity="0.18"/>
  <circle cx="270" cy="710" r="150" fill="#2DD4FF" opacity="0.18"/>
  <text x="80" y="145" fill="#ffffff" font-family="Georgia, serif" font-size="84" font-weight="900">${escapeXml(variant.title)}</text>
  <text x="82" y="220" fill="#ffffff" opacity="0.86" font-family="Arial, sans-serif" font-size="34" font-weight="700">${escapeXml(variant.subtitle)}</text>
  <text x="82" y="795" fill="#ffffff" opacity="0.72" font-family="Arial, sans-serif" font-size="24">${escapeXml(variant.variantId)}</text>
</svg>`;
}

function buildMotionSvg(variant: MotionOutputVariant) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#211344"/>
      <stop offset="0.52" stop-color="#FF3DA7"/>
      <stop offset="1" stop-color="#FFC857"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <circle cx="250" cy="180" r="48" fill="#ffffff" opacity="0.4">
    <animate attributeName="r" values="42;68;42" dur="2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="980" cy="500" r="82" fill="#2DD4FF" opacity="0.22">
    <animate attributeName="opacity" values="0.16;0.38;0.16" dur="2.4s" repeatCount="indefinite"/>
  </circle>
  <text x="80" y="135" fill="#ffffff" font-family="Georgia, serif" font-size="72" font-weight="900">${escapeXml(variant.title)}</text>
  <text x="82" y="205" fill="#ffffff" opacity="0.86" font-family="Arial, sans-serif" font-size="30" font-weight="700">${escapeXml(variant.subtitle)}</text>
  <text x="82" y="640" fill="#ffffff" opacity="0.72" font-family="Arial, sans-serif" font-size="24">${escapeXml(String(variant.durationSeconds))}s muted animated SVG export</text>
</svg>`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
