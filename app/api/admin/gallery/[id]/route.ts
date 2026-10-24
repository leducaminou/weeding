import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  await prisma.galleryItem.delete({ where: { id } });
  revalidateTag("gallery");
  await audit({
    action: "GALLERY_DELETED",
    adminId: session.adminId,
    entity: "GalleryItem",
    entityId: id,
  });
  return NextResponse.json({ ok: true });
}