import { prisma } from "@/lib/prisma";
import { InvitationStatus, Prisma } from "@prisma/client";

interface ListParams {
  search?: string;
  status?: InvitationStatus | "ALL";
  page?: number;
  pageSize?: number;
}

export const GuestAdminService = {
  async list({ search, status, page = 1, pageSize = 20 }: ListParams) {
    const where: Prisma.GuestWhereInput = {};
    if (search?.trim()) {
      const q = search.trim();
      where.OR = [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
        { invitation: { identifier: { contains: q.toUpperCase() } } },
      ];
    }
    if (status && status !== "ALL") {
      where.invitation = { status };
    }

    const [items, total] = await Promise.all([
      prisma.guest.findMany({
        where,
        include: {
          invitation: {
            include: {
              whatsappMessages: { orderBy: { createdAt: "desc" }, take: 1 },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.guest.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  async getById(id: string) {
    return prisma.guest.findUnique({
      where: { id },
      include: {
        invitation: {
          include: {
            whatsappMessages: { orderBy: { createdAt: "desc" } },
            checkInLogs: { orderBy: { scannedAt: "desc" } },
          },
        },
      },
    });
  },

  async revokeInvitation(guestId: string) {
    return prisma.invitation.update({
      where: { guestId },
      data: { status: InvitationStatus.REVOKED },
    });
  },

  async restoreInvitation(guestId: string) {
    return prisma.invitation.update({
      where: { guestId },
      data: { status: InvitationStatus.CONFIRMED },
    });
  },

  async deleteGuest(guestId: string) {
    return prisma.guest.delete({ where: { id: guestId } });
  },
};