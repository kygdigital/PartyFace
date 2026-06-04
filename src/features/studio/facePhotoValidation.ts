import type { FacePhotoUsability } from "./studioTypes";

const CLEAR_FACE_MESSAGE =
  "This photo may be hard to use. Try a clearer face photo with good lighting.";

export async function assessFacePhoto(file: File): Promise<FacePhotoUsability> {
  if (!file.type.startsWith("image/")) {
    return {
      status: "needs-retry",
      message: "Upload an image file with a clear face.",
    };
  }

  try {
    const bitmap = await createImageBitmap(file);
    const isTooSmall = bitmap.width < 240 || bitmap.height < 240 || file.size < 10_000;
    bitmap.close();

    if (isTooSmall) {
      return {
        status: "needs-retry",
        message: CLEAR_FACE_MESSAGE,
      };
    }
  } catch {
    return {
      status: "needs-retry",
      message: CLEAR_FACE_MESSAGE,
    };
  }

  return {
    status: "usable",
    message: "Looks usable for a first pass.",
  };
}
