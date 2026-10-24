import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/validations/admin.schema";
import { getSession } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const body = await req.json();
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation échouée", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const wedding = await prisma.wedding.findFirst();
  if (!wedding) return NextResponse.json({ error: "Mariage introuvable" }, { status: 500 });

  const event = await prisma.event.create({
    data: {
      ...parsed.data,
      date: new Date(parsed.data.date),
      description: parsed.data.description ?? null,
      address: parsed.data.address ?? null,
      mapsUrl: parsed.data.mapsUrl || null,
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
      weddingId: wedding.id,
    },
  });

  revalidateTag("events");
  await audit({
    action: "EVENT_CREATED",
    adminId: session.adminId,
    entity: "Event",
    entityId: event.id,
  });
  return NextResponse.json({ ok: true, event });
}