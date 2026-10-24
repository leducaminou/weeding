import { prisma } from "@/lib/prisma";
import type { RsvpInput } from "@/validations/rsvp.schema";

export const GuestService = {
  async findRecentDuplicate(input: RsvpInput, windowMs: number) {
    const since = new Date(Date.now() - windowMs);
    return prisma.guest.findFirst({
      where: {
        firstName: { equals: input.firstName, mode: "insensitive" },
        lastName: { equals: input.lastName, mode: "insensitive" },
        phone: input.phone ?? null,
        createdAt: { gte: since },
      },
      include: { invitation: true },
      orderBy: { createdAt: "desc" },
    });
  },
};