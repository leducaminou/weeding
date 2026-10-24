import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GuestAdminService } from "@/services/GuestAdminService";
import { QRCodeService } from "@/services/QRCodeService";
import { getSession } from "@/lib/auth/session";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;

  const inv = await prisma.invitation.findUnique({
    where: { guestId: id },
    select: { id: true, identifier: true },
  });
  if (inv) await QRCodeService.deleteQrCode(inv.id);

  await GuestAdminService.deleteGuest(id);

  await audit({
    action: "GUEST_DELETED",
    adminId: session.adminId,
    entity: "Guest",
    entityId: id,
    metadata: { identifier: inv?.identifier },
  });

  return NextResponse.json({ ok: true });
}