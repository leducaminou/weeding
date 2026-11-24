import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { WhatsAppAdminService } from "@/services/WhatsAppAdminService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    await WhatsAppAdminService.connect();
    return NextResponse.json({ ok: true }, { status: 202 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Impossible de démarrer WhatsApp.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
