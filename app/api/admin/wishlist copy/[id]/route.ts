import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { wishlistSchema } from "@/validations/admin.schema";
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
  const parsed = wishlistSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation échouée", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const item = await prisma.wishlistItem.update({
    where: { id },
    data: {
      ...parsed.data,
      description: parsed.data.description ?? null,
      image: parsed.data.image || null,
      url: parsed.data.url || null,
      category: parsed.data.category ?? null,
    },
  });
  revalidateTag("wishlist");
  await audit({
    action: "WISHLIST_UPDATED",
    adminId: session.adminId,
    entity: "WishlistItem",
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
  await prisma.wishlistItem.delete({ where: { id } });
  revalidateTag("wishlist");
  await audit({
    action: "WISHLIST_DELETED",
    adminId: session.adminId,
    entity: "WishlistItem",
    entityId: id,
  });
  return NextResponse.json({ ok: true });
}