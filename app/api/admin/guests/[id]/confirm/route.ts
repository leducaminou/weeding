import { InvitationStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { QRCodeService } from "@/services/QRCodeService";
import { GuestAdminService } from "@/services/GuestAdminService";
import { getSetting, getWedding } from "@/services/WeddingService";
import { WhatsAppService } from "@/services/WhatsAppService";
import { cameroonPhoneSchema } from "@/validations/cameroon-phone.schema";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const schema = z.object({ phone: cameroonPhoneSchema });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Numéro invalide" },
      { status: 400 }
    );
  }

  const wedding = await getWedding();
  if (!wedding) {
    return NextResponse.json({ error: "Mariage introuvable" }, { status: 500 });
  }

  const { id } = await params;
  const guest = await prisma.guest.findFirst({
    where: { id, weddingId: wedding.id },
    include: { invitation: true },
  });
  if (!guest) {
    return NextResponse.json({ error: "Invité introuvable" }, { status: 404 });
  }
  if (
    guest.invitation &&
    guest.invitation.status !== InvitationStatus.PENDING
  ) {
    return NextResponse.json(
      { error: "Cette invitation n'est pas en attente de confirmation." },
      { status: 409 }
    );
  }

  const result = await GuestAdminService.confirmInvitation(guest.id, wedding.id);
  if (!result.confirmed) {
    return NextResponse.json(
      { error: "Cette invitation vient d'être confirmée ou n'est plus valide." },
      { status: 409 }
    );
  }

  if (parsed.data.phone && parsed.data.phone !== guest.phone) {
    await prisma.guest.update({
      where: { id: guest.id },
      data: { phone: parsed.data.phone },
    });
  }
  const phone = parsed.data.phone ?? guest.phone;

  await audit({
    action: "INVITATION_ADMIN_CONFIRMED",
    adminId: session.adminId,
    entity: "Invitation",
    entityId: result.invitation.id,
    metadata: {
      identifier: result.invitation.identifier,
      guestId: guest.id,
      hasPhone: !!phone,
    },
  });

  let qrUrl: string | null = null;
  try {
    const qr = await QRCodeService.ensureQrCode(
      result.invitation.id,
      result.invitation.identifier
    );
    qrUrl = qr.url;
  } catch (error) {
    await audit({
      action: "QR_GENERATION_FAILED",
      adminId: session.adminId,
      entity: "Invitation",
      entityId: result.invitation.id,
      metadata: {
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
    });
  }

  let whatsappSent: boolean | null = null;
  if (phone) {
    whatsappSent = false;
    if (qrUrl) {
      try {
        const template = getSetting(
          wedding.settings,
          "whatsapp_guest_template",
          "Bonjour {prenom}, votre identifiant est {identifier}. QR : {qr_url}"
        );
        const sent = await WhatsAppService.sendGuestInvitation({
          phone,
          firstName: `${guest.firstName} ${guest.lastName}`.trim(),
          identifier: result.invitation.identifier,
          qrUrl,
          template,
          invitationId: result.invitation.id,
        });
        whatsappSent = sent.ok;
      } catch (error) {
        await audit({
          action: "WHATSAPP_GUEST_FAILED",
          adminId: session.adminId,
          entity: "Invitation",
          entityId: result.invitation.id,
          metadata: {
            error: error instanceof Error ? error.message : "Erreur inconnue",
          },
        });
      }
    }
  }

  return NextResponse.json({ ok: true, whatsappSent });
}
