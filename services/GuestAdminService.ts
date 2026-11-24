import { prisma } from "@/lib/prisma";
import { InvitationStatus, Prisma } from "@prisma/client";
import { generateUniqueIdentifier } from "@/lib/qr/identifier";

interface ListParams {
  search?: string;
  status?: InvitationStatus | "ALL";
  page?: number;
  pageSize?: number;
}

export const GuestAdminService = {
  async create(params: {
    weddingId: string;
    firstName: string;
    lastName: string;
    phone: string | null;
  }) {
    const identifier = await generateUniqueIdentifier();
    return prisma.$transaction(async (tx) => {
      const guest = await tx.guest.create({
        data: {
          weddingId: params.weddingId,
          firstName: params.firstName,
          lastName: params.lastName,
          phone: params.phone,
        },
      });
      const invitation = await tx.invitation.create({
        data: {
          guestId: guest.id,
          weddingId: params.weddingId,
          identifier,
          status: InvitationStatus.PENDING,
        },
      });
      return { ...guest, invitation };
    });
  },

  async confirmInvitation(guestId: string, weddingId: string) {
    const existing = await prisma.invitation.findUnique({
      where: { guestId },
      select: { id: true },
    });
    const identifier = existing ? null : await generateUniqueIdentifier();

    return prisma.$transaction(async (tx) => {
      let invitation = await tx.invitation.findUnique({ where: { guestId } });
      if (!invitation) {
        if (!identifier) {
          throw new Error("Impossible de créer l'identifiant de l'invitation.");
        }
        invitation = await tx.invitation.create({
          data: {
            guestId,
            weddingId,
            identifier,
            status: InvitationStatus.PENDING,
          },
        });
      }

      if (invitation.status !== InvitationStatus.PENDING) {
        return { invitation, confirmed: false };
      }

      const updated = await tx.invitation.updateMany({
        where: { id: invitation.id, status: InvitationStatus.PENDING },
        data: { status: InvitationStatus.CONFIRMED },
      });
      const confirmedInvitation = await tx.invitation.findUnique({
        where: { id: invitation.id },
      });

      return {
        invitation: confirmedInvitation ?? invitation,
        confirmed: updated.count === 1,
      };
    });
  },

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
      data: { status: InvitationStatus.PENDING },
    });
  },

  async deleteGuest(guestId: string) {
    return prisma.guest.delete({ where: { id: guestId } });
  },
};