import { prisma } from "@/lib/prisma";
import { InvitationStatus } from "@prisma/client";

export const InvitationService = {
  async findByIdentifier(identifier: string) {
    return prisma.invitation.findUnique({
      where: { identifier },
      include: { guest: true },
    });
  },

  async setQrCode(
    invitationId: string,
    qrCodeUrl: string,
    qrCodeKey: string
  ) {
    return prisma.invitation.update({
      where: { id: invitationId },
      data: { qrCodeUrl, qrCodeKey, qrGeneratedAt: new Date() },
    });
  },

  async getExistingQr(invitationId: string) {
    const inv = await prisma.invitation.findUnique({
      where: { id: invitationId },
      select: { qrCodeUrl: true, qrCodeKey: true },
    });
    if (inv?.qrCodeUrl && inv.qrCodeKey) {
      return { url: inv.qrCodeUrl, key: inv.qrCodeKey };
    }
    return null;
  },

  async revoke(invitationId: string) {
    return prisma.invitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.REVOKED },
    });
  },
};