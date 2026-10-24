import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { siteSettingSchema } from "@/validations/admin.schema";
import { getSession } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const body = await req.json();
  const parsed = siteSettingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation échouée" }, { status: 400 });
  }
  const wedding = await prisma.wedding.findFirst();
  if (!wedding) return NextResponse.json({ error: "Mariage introuvable" }, { status: 500 });

  await prisma.siteSetting.upsert({
    where: {
      weddingId_key: { weddingId: wedding.id, key: parsed.data.key },
    },
    update: { value: parsed.data.value },
    create: {
      weddingId: wedding.id,
      key: parsed.data.key,
      value: parsed.data.value,
    },
  });

  revalidateTag("wedding");
  await audit({
    action: "CONTENT_UPDATED",
    adminId: session.adminId,
    entity: "SiteSetting",
    metadata: { key: parsed.data.key },
  });
  return NextResponse.json({ ok: true });
}