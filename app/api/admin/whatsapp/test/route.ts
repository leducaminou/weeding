import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { WhatsAppService } from "@/services/WhatsAppService";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const config = await prisma.whatsAppConfig.findUnique({
    where: { id: "default" },
  });
  if (!config?.adminPhone) {
    return NextResponse.json(
      { ok: false, error: "Numéro administrateur non configuré" },
      { status: 400 }
    );
  }
  const result = await WhatsAppService.send({
    recipient: config.adminPhone,
    content: `Test de connexion WhatsApp — ${new Date().toLocaleString("fr-FR")}`,
    type: "ADMIN_NOTIFICATION",
  });
  return NextResponse.json({
    ok: result.ok,
    error: result.ok ? null : "Échec de l'envoi",
  });
}