import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { accommodationSchema } from "@/validations/admin.schema";
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
  const parsed = accommodationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation échouée", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const item = await prisma.accommodation.update({
    where: { id },
    data: {
      ...parsed.data,
      description: parsed.data.description ?? null,
      image: parsed.data.image || null,
      link: parsed.data.link || null,
    },
  });
  revalidateTag("accommodations");
  await audit({
    action: "ACCOMMODATION_UPDATED",
    adminId: session.adminId,
    entity: "Accommodation",
    entityId: id,
  });
  return NextResponse.json({ ok: true, item });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  await prisma.accommodation.delete({ where: { id } });
  revalidateTag("accommodations");
  await audit({
    action: "ACCOMMODATION_DELETED",
    adminId: session.adminId,
    entity: "Accommodation",
    entityId: id,
  });
  return NextResponse.json({ ok: true });
}