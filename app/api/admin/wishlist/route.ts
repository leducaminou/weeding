import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { wishlistSchema } from "@/validations/admin.schema";
import { getSession } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const body = await req.json();
  const parsed = wishlistSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation échouée", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const wedding = await prisma.wedding.findFirst();
  if (!wedding) return NextResponse.json({ error: "Mariage introuvable" }, { status: 500 });
  const item = await prisma.wishlistItem.create({
    data: {
      ...parsed.data,
      description: parsed.data.description ?? null,
      image: parsed.data.image || null,
      url: parsed.data.url || null,
      category: parsed.data.category ?? null,
      weddingId: wedding.id,
    },
  });
  revalidateTag("wishlist");
  await audit({
    action: "WISHLIST_CREATED",
    adminId: session.adminId,
    entity: "WishlistItem",
    entityId: item.id,
  });
  return NextResponse.json({ ok: true, item });
}