import { prisma } from "@/lib/prisma";
import { generateQrWebp } from "@/lib/qr/generate";
import { uploadQrCode, deleteQrFile } from "@/lib/uploadthing/upload";
import { InvitationService } from "./InvitationService";
import { audit } from "@/lib/audit";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://loica-franck.com";
const qrCreations = new Map<
  string,
  Promise<{ url: string; key: string; reused: boolean }>
>();

export const QRCodeService = {
  async ensureQrCode(invitationId: string, identifier: string) {
    const existing = await InvitationService.getExistingQr(invitationId);
    if (existing) return { ...existing, reused: true };

    const pending = qrCreations.get(invitationId);
    if (pending) {
      const result = await pending;
      return { ...result, reused: true };
    }

    const creation = this.createQrCode(invitationId, identifier);
    qrCreations.set(invitationId, creation);
    try {
      return await creation;
    } finally {
      if (qrCreations.get(invitationId) === creation) {
        qrCreations.delete(invitationId);
      }
    }
  },

  async createQrCode(invitationId: string, identifier: string) {
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