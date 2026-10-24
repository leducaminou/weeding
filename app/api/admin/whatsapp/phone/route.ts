import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { WhatsAppAdminService } from "@/services/WhatsAppAdminService";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const schema = z.object({
  phone: z
    .string()
    .nullable()
    .refine(
      (v) => v === null || /^\+?[0-9\s().-]{6,25}$/.test(v),
      "Numéro invalide"
    ),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Numéro invalide" }, { status: 400 });
  }
  await WhatsAppAdminService.updateAdminPhone(parsed.data.phone);
  await audit({
    action: "WHATSAPP_ADMIN_PHONE_UPDATED",
    adminId: session.adminId,
    entity: "WhatsAppConfig",
    metadata: { phone: parsed.data.phone },
  });
  return NextResponse.json({ ok: true });
}