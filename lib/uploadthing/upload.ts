import { utapi } from "./core";

export async function uploadQrCode(
  buffer: Buffer,
  identifier: string
): Promise<{ url: string; key: string }> {
  const file = new File([new Uint8Array(buffer)], `qr-${identifier}.webp`, {
    type: "image/webp",
  });

  const response = await utapi.uploadFiles(file);
  if (response.error || !response.data) {
    throw new Error(
      `UploadThing error: ${response.error?.message ?? "unknown"}`
    );
  }
  return { url: response.data.url, key: response.data.key };
}

export async function deleteQrFile(key: string): Promise<boolean> {
  try {
    const result = await utapi.deleteFiles(key);
    return result.success;
  } catch {
    return false;
  }
}