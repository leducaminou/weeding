import { NextResponse } from "next/server";
import { GuestAdminService } from "@/services/GuestAdminService";
import { getSession } from "@/lib/auth/session";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const inv = await GuestAdminService.revokeInvitation(id);
  await audit({
    action: "INVITATION_REVOKED",
    adminId: session.adminId,
    entity: "Invitation",
    entityId: inv.id,
    metadata: { identifier: inv.identifier },
  });
  return NextResponse.json({ ok: true });
}