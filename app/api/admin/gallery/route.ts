import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

const schema = z.object({
  url: z.string().min(1),
  alt: z.string().nullable().optional(),
  position: z.number().int().default(0),
  active: z.boolean().default(true),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation échouée" }, { status: 400 });
  }
  const wedding = await prisma.wedding.findFirst();
  if (!wedding) return NextResponse.json({ error: "Mariage introuvable" }, { status: 500 });
  const item = await prisma.galleryItem.create({
    data: {
      url: parsed.data.url,
      alt: parsed.data.alt ?? null,
      position: parsed.data.position,
      active: parsed.data.active,
      weddingId: wedding.id,
    },
  });
  revalidateTag("gallery");
  await audit({
    action: "GALLERY_CREATED",
    adminId: session.adminId,
    entity: "GalleryItem",
    entityId: item.id,
  });
  return NextResponse.json({ ok: true, item });
}