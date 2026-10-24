import { prisma } from "@/lib/prisma";
import { generateQrWebp } from "@/lib/qr/generate";
import { uploadQrCode, deleteQrFile } from "@/lib/uploadthing/upload";
import { InvitationService } from "./InvitationService";
import { audit } from "@/lib/audit";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://loica-franck.com";

export const QRCodeService = {
  async ensureQrCode(invitationId: string, identifier: string) {
    const existing = await InvitationService.getExistingQr(invitationId);
    if (existing) return { ...existing, reused: true };

    const targetUrl = `${APP_URL}/qr/${identifier}`;
    const buffer = await generateQrWebp(targetUrl);
    const { url, key } = await uploadQrCode(buffer, identifier);

    await InvitationService.setQrCode(invitationId, url, key);

    await audit({
      action: "QR_GENERATED",
      entity: "Invitation",
      entityId: invitationId,
      metadata: { identifier, key },
    });

    return { url, key, reused: false };
  },

  async deleteQrCode(invitationId: string): Promise<boolean> {
    const inv = await prisma.invitation.findUnique({
      where: { id: invitationId },
      select: { qrCodeKey: true },
    });
    if (!inv?.qrCodeKey) return true;

    const ok = await deleteQrFile(inv.qrCodeKey);

    await prisma.invitation.update({
      where: { id: invitationId },
      data: { qrCodeUrl: null, qrCodeKey: null },
    });

    await audit({
      action: ok ? "QR_DELETED" : "QR_DELETE_FAILED",
      entity: "Invitation",
      entityId: invitationId,
      metadata: { key: inv.qrCodeKey },
    });

    return ok;
  },
};