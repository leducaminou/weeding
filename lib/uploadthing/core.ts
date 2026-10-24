import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UTApi } from "uploadthing/server";

const f = createUploadthing();

export const utapi = new UTApi();

export const ourFileRouter = {
  qrCode: f({
    image: { maxFileSize: "256KB", maxFileCount: 1 },
  }).middleware(async () => ({})),
} as unknown as FileRouter;

export type OurFileRouter = typeof ourFileRouter;