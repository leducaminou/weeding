import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/validations/admin.schema";
import { getSession } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation échouée", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const event = await prisma.event.update({
    where: { id },
    data: {
      ...parsed.data,
      date: new Date(parsed.data.date),
      description: parsed.data.description ?? null,
      address: parsed.data.address ?? null,
      mapsUrl: parsed.data.mapsUrl || null,
    },
  });
  revalidateTag("events");
  await audit({
    action: "EVENT_UPDATED",
    adminId: session.adminId,
    entity: "Event",
    entityId: id,
  });
  return NextResponse.json({ ok: true, event });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  await prisma.event.delete({ where: { id } });
  revalidateTag("events");
  await audit({
    action: "EVENT_DELETED",
    adminId: session.adminId,
    entity: "Event",
    entityId: id,
  });
  return NextResponse.json({ ok: true });
}