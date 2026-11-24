import { InvitationStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { QRCodeService } from "@/services/QRCodeService";
import { getWedding, getSetting } from "@/services/WeddingService";
import { getSession } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
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
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;

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

  const guest = await prisma.guest.findUnique({
    where: { id },
    include: { invitation: true },
  });

  if (!guest || !guest.invitation) {
    return NextResponse.json(
      { error: "Invité ou invitation manquant" },
      { status: 400 }
    );
  }
  if (guest.invitation.status !== InvitationStatus.CONFIRMED) {
    return NextResponse.json(
      { error: "Le QR ne peut être envoyé qu'après confirmation de présence." },
      { status: 409 }
    );
  }

  const wedding = await getWedding();
  if (!wedding) return NextResponse.json({ error: "Mariage introuvable" }, { status: 500 });

  const qr = await QRCodeService.ensureQrCode(
    guest.invitation.id,
    guest.invitation.identifier
  );
  const stillConfirmed = await prisma.invitation.findFirst({
    where: {
      id: guest.invitation.id,
      status: InvitationStatus.CONFIRMED,
    },
    select: { id: true },
  });
  if (!stillConfirmed) {
    return NextResponse.json(
      { error: "L'invitation n'est plus confirmée ; le QR n'a pas été envoyé." },
      { status: 409 }
    );
  }
  const phone = parsed.data.phone ?? guest.phone;
  if (!phone) {
    return NextResponse.json(
      { error: "Saisissez un numéro WhatsApp pour envoyer le QR." },
      { status: 400 }
    );
  }
  if (parsed.data.phone && parsed.data.phone !== guest.phone) {
    await prisma.guest.update({
      where: { id: guest.id },
      data: { phone: parsed.data.phone },
    });
  }
  const template = getSetting(
    wedding.settings,
    "whatsapp_guest_template",
    "Bonjour {prenom}, votre identifiant est {identifier}. QR : {qr_url}"
  );

  const result = await WhatsAppService.sendGuestInvitation({
    phone,
    firstName: guest.firstName+" "+guest.lastName,
    identifier: guest.invitation.identifier,
    qrUrl: qr.url,
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

  return NextResponse.json(
    {
      ok: result.ok,
      error: result.ok ? null : "L'envoi WhatsApp a échoué. Vérifiez la connexion.",
    },
    { status: result.ok ? 200 : 502 }
  );
}