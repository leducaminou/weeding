import QRCode from "qrcode";
import { QR_SIZE } from "@/config/constants";

/**
 * Génère un QR code en WebP (320×320), prêt à être uploadé.
 */
export async function generateQrWebp(url: string): Promise<Buffer> {
  const dataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "H",
    type: "image/webp",
    width: QR_SIZE,
    margin: 2,
    color: { dark: "#1D4079", light: "#FFFFFF" },
  });

  const base64 = dataUrl.split(",")[1];
  return Buffer.from(base64, "base64");
}