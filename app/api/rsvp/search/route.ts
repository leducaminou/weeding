import { InvitationStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { RSVP_SEARCH_RATE_LIMIT } from "@/config/constants";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { GuestService } from "@/services/GuestService";
import { getWedding } from "@/services/WeddingService";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(
    `rsvp-search:${ip}`,
    RSVP_SEARCH_RATE_LIMIT.max,
    RSVP_SEARCH_RATE_LIMIT.windowMs
  );
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Trop de recherches. Merci de patienter." },
      { status: 429 }
    );
  }

  const query = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return NextResponse.json({ guests: [] });
  if (query.length > 100) {
    return NextResponse.json({ error: "Recherche trop longue." }, { status: 400 });
  }

  const wedding = await getWedding();
  if (!wedding) {
    return NextResponse.json({ error: "Mariage introuvable" }, { status: 500 });
  }

  const guests = await GuestService.search(wedding.id, query);
  return NextResponse.json({
    guests: guests.map((guest) => ({
      id: guest.id,
      fullName: `${guest.firstName} ${guest.lastName}`.trim(),
      alreadyConfirmed:
        guest.invitation?.status === InvitationStatus.CONFIRMED ||
        guest.invitation?.status === InvitationStatus.CHECKED_IN,
    })),
  });
}
