import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWedding, getSetting } from "@/services/WeddingService";
import { getSession } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { WhatsAppService } from "@/services/WhatsAppService";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;

  const guest = await prisma.guest.findUnique({
    where: { id },
    include: { invitation: true },
  });

  if (!guest || !guest.invitation || !guest.phone) {
    return NextResponse.json(
      { error: "Invité, invitation ou téléphone manquant" },
      { status: 400 }
    );
  }
  if (!guest.invitation.qrCodeUrl) {
    return NextResponse.json(
      { error: "Aucun QR code associé" },
      { status: 400 }
    );
  }

  const wedding = await getWedding();
  if (!wedding) return NextResponse.json({ error: "Mariage introuvable" }, { status: 500 });

  const template = getSetting(
    wedding.settings,
    "whatsapp_guest_template",
    "Bonjour {prenom}, votre identifiant est {identifier}. QR : {qr_url}"
  );

  const result = await WhatsAppService.sendGuestInvitation({
    phone: guest.phone,
    firstName: guest.firstName,
    identifier: guest.invitation.identifier,
    qrUrl: guest.invitation.qrCodeUrl,
    template,
    invitationId: guest.invitation.id,
  });

  await audit({
    action: "WHATSAPP_RESENT",
    adminId: session.adminId,
    entity: "Guest",
    entityId: guest.id,
    metadata: { ok: result.ok },
  });

  return NextResponse.json({ ok: result.ok });
}