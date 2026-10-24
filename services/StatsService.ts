import { prisma } from "@/lib/prisma";
import { InvitationStatus, MessageStatus } from "@prisma/client";

export const StatsService = {
  async getOverview() {
    const [
      totalGuests,
      confirmed,
      revoked,
      expired,
      checkedIn,
      qrGenerated,
      whatsappSent,
      whatsappPending,
      whatsappFailed,
    ] = await Promise.all([
      prisma.guest.count(),
      prisma.invitation.count({ where: { status: InvitationStatus.CONFIRMED } }),
      prisma.invitation.count({ where: { status: InvitationStatus.REVOKED } }),
      prisma.invitation.count({ where: { status: InvitationStatus.EXPIRED } }),
      prisma.invitation.count({
        where: { status: InvitationStatus.CHECKED_IN },
      }),
      prisma.invitation.count({ where: { qrCodeUrl: { not: null } } }),
      prisma.whatsAppMessage.count({ where: { status: MessageStatus.SENT } }),
      prisma.whatsAppMessage.count({ where: { status: MessageStatus.PENDING } }),
      prisma.whatsAppMessage.count({ where: { status: MessageStatus.FAILED } }),
    ]);

    return {
      guests: { total: totalGuests, confirmed, revoked, expired, checkedIn },
      qr: { generated: qrGenerated, scanned: checkedIn },
      whatsapp: {
        sent: whatsappSent,
        pending: whatsappPending,
        failed: whatsappFailed,
      },
    };
  },

  async getRecentGuests(limit = 8) {
    return prisma.guest.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { invitation: true },
    });
  },

  async getRecentErrors(limit = 5) {
    return prisma.whatsAppMessage.findMany({
      where: { status: MessageStatus.FAILED },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { invitation: { include: { guest: true } } },
    });
  },
};