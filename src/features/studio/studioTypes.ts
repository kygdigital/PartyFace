export type PersonSlotId = "person-1" | "person-2";

export type FacePhotoUsabilityStatus = "usable" | "needs-retry";

export type FacePhotoUsability = {
  status: FacePhotoUsabilityStatus;
  message: string;
};

export type PersonPhoto = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  previewUrl: string;
  uploadRef: string;
  usability: FacePhotoUsability;
};

export type PersonSlot = {
  id: PersonSlotId;
  label: string;
  optional: boolean;
  photo: PersonPhoto | null;
};
