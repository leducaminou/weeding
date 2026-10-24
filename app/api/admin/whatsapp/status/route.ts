import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { WhatsAppAdminService } from "@/services/WhatsAppAdminService";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const status = await WhatsAppAdminService.getStatus();
  return NextResponse.json(status);
}