import { prisma } from "../prisma";


export interface GuestSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
}

export interface GuestSearchResponse {
  data: GuestSearchResult[];
  total: number;
  page: number;
  hasMore: boolean;
}

const PAGE_SIZE = 10;
const MIN_QUERY_LENGTH = 3;


export async function searchGuests(
  query: string,
  page = 1
): Promise<GuestSearchResponse> {

  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) {
    return { data: [], total: 0, page: 1, hasMore: false };
  }

  const where = {
    AND: [
      { user: { status: "active" } },
      {
        OR: [
          { phone: { contains: trimmed, mode: "insensitive" as const } },
          { firstName: { contains: trimmed, mode: "insensitive" as const } },
          { lastName: { contains: trimmed, mode: "insensitive" as const } },
          { email: { contains: trimmed, mode: "insensitive" as const } },
        ],
      },
    ],
  };

  const skip = PAGE_SIZE * (page - 1);

  const [results, total] = await prisma.$transaction([
    prisma.guest.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
      },
      orderBy: { firstName: "asc" },
      take: PAGE_SIZE,
      skip,
    }),
    prisma.guest.count({ where }),
  ]);

  return {
    data: results,
    total,
    page,
    hasMore: skip + results.length < total,
  };
}
