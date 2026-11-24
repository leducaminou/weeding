import { prisma } from "@/lib/prisma";
import { InvitationStatus, Prisma } from "@prisma/client";

export const GuestService = {
  async search(weddingId: string, query: string) {
    const terms = query.trim().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];

    const where: Prisma.GuestWhereInput = {
      weddingId,
      AND: [
        ...terms.map((term) => ({
          OR: [
            { firstName: { contains: term, mode: "insensitive" as const } },
            { lastName: { contains: term, mode: "insensitive" as const } },
          ],
        })),
        {
          invitation: {
            is: {
              status: {
                notIn: [InvitationStatus.REVOKED, InvitationStatus.EXPIRED],
              },
            },
          },
        },
      ],
    };

    return prisma.guest.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        invitation: { select: { status: true } },
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      take: 8,
    });
  },
};