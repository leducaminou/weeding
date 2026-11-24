import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { WhatsAppAdminService } from "@/services/WhatsAppAdminService";
import { audit } from "@/lib/audit";
import { cameroonPhoneSchema } from "@/validations/cameroon-phone.schema";

export const dynamic = "force-dynamic";

const schema = z.object({
  phone: cameroonPhoneSchema,
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
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
  return NextResponse.json({ ok: true, phone: parsed.data.phone });
}