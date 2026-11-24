import { InvitationStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { RSVP_RATE_LIMIT } from "@/config/constants";
import { audit } from "@/lib/audit";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { generateUniqueIdentifier } from "@/lib/qr/identifier";
import { getWedding, getSetting } from "@/services/WeddingService";
import { WhatsAppService } from "@/services/WhatsAppService";
import { QRCodeService } from "@/services/QRCodeService";
import { rsvpSchema } from "@/validations/rsvp.schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`rsvp:${ip}`, RSVP_RATE_LIMIT.max, RSVP_RATE_LIMIT.windowMs);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Trop de tentatives. Merci de patienter." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Validation échouée",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const wedding = await getWedding();
  if (!wedding) {
    return NextResponse.json({ error: "Mariage introuvable" }, { status: 500 });
  }

  const guest = await prisma.guest.findFirst({
    where: { id: parsed.data.guestId, weddingId: wedding.id },
    include: { invitation: true },
  });
  if (!guest) {
    return NextResponse.json(
      { error: "Ce nom ne figure pas sur la liste des invités." },
      { status: 404 }
    );
  }
  if (
    guest.invitation?.status === InvitationStatus.REVOKED ||
    guest.invitation?.status === InvitationStatus.EXPIRED
  ) {
    return NextResponse.json(
      { error: "Cette invitation n'est pas valide. Contactez les organisateurs." },
      { status: 409 }
    );
  }
  if (
    guest.invitation?.status === InvitationStatus.CONFIRMED ||
    guest.invitation?.status === InvitationStatus.CHECKED_IN
  ) {
    return NextResponse.json(
      { error: "Votre présence est déjà confirmée." },
      { status: 409 }
    );
  }

  const identifier = guest.invitation
    ? null
    : await generateUniqueIdentifier();
  let invitation;
  try {
    invitation = await prisma.$transaction(async (tx) => {
      let current = await tx.invitation.findUnique({
        where: { guestId: guest.id },
      });

      if (!current) {
        if (!identifier) {
          throw new Error("Impossible de créer l'identifiant de l'invitation.");
        }
        current = await tx.invitation.create({
          data: {
            guestId: guest.id,
            weddingId: wedding.id,
            identifier,
            status: InvitationStatus.PENDING,
          },
        });
      }

      if (current.status !== InvitationStatus.PENDING) return null;

      const updated = await tx.invitation.updateMany({
        where: { id: current.id, status: InvitationStatus.PENDING },
        data: { status: InvitationStatus.CONFIRMED },
      });
      if (updated.count !== 1) return null;

      if (parsed.data.phone) {
        await tx.guest.update({
          where: { id: guest.id },
          data: { phone: parsed.data.phone },
        });
      }

      return tx.invitation.findUnique({ where: { id: current.id } });
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const latest = await prisma.invitation.findUnique({
        where: { guestId: guest.id },
      });
      if (
        latest?.status === InvitationStatus.CONFIRMED ||
        latest?.status === InvitationStatus.CHECKED_IN
      ) {
        return NextResponse.json(
          { error: "Votre présence est déjà confirmée." },
          { status: 409 }
        );
      }
    }
    throw error;
  }

  if (!invitation) {
    return NextResponse.json(
      { error: "Votre présence vient d'être confirmée." },
      { status: 409 }
    );
  }

  const fullName = `${guest.firstName} ${guest.lastName}`.trim();
  await audit({
    action: "RSVP_CONFIRMED",
    entity: "Invitation",
    entityId: invitation.id,
    metadata: {
      identifier: invitation.identifier,
      guestId: guest.id,
      hasPhone: !!(parsed.data.phone ?? guest.phone),
    },
    ip,
  });

  let qrUrl: string | null = null;
  try {
    const qr = await QRCodeService.ensureQrCode(invitation.id, invitation.identifier);
    qrUrl = qr.url;
  } catch (error) {
    await audit({
      action: "QR_GENERATION_FAILED",
      entity: "Invitation",
      entityId: invitation.id,
      metadata: {
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
    });
  }

  let guestWhatsAppSent: boolean | null = null;
  const phone = parsed.data.phone ?? guest.phone;
  if (phone && qrUrl) {
    try {
      const template = getSetting(
        wedding.settings,
        "whatsapp_guest_template",
        "Bonjour {prenom}, votre identifiant est {identifier}. QR : {qr_url}"
      );
      const result = await WhatsAppService.sendGuestInvitation({
        phone,
        firstName: fullName,
        identifier: invitation.identifier,
        qrUrl,
        template,
        invitationId: invitation.id,
      });
      guestWhatsAppSent = result.ok;
    } catch (error) {
      await audit({
        action: "WHATSAPP_GUEST_FAILED",
        entity: "Invitation",
        entityId: invitation.id,
        metadata: {
          error: error instanceof Error ? error.message : "Erreur inconnue",
        },
      });
    }
  }

  let adminWhatsAppSent: boolean | null = null;
  try {
    const config = await prisma.whatsAppConfig.findUnique({
      where: { id: "default" },
    });
    if (config?.adminPhone) {
      const template = getSetting(
        wedding.settings,
        "whatsapp_admin_template",
        "Nouvelle confirmation : {nom} ({identifier})"
      );
      const result = await WhatsAppService.notifyAdmin({
        adminPhone: config.adminPhone,
        fullName,
        identifier: invitation.identifier,
        template,
        invitationId: invitation.id,
      });
      adminWhatsAppSent = result.ok;
    } else {
      await audit({
        action: "WHATSAPP_ADMIN_SKIPPED",
        entity: "Invitation",
        entityId: invitation.id,
        metadata: { reason: "admin_phone_missing" },
      });
    }
  } catch (error) {
    await audit({
      action: "WHATSAPP_ADMIN_FAILED",
      entity: "Invitation",
      entityId: invitation.id,
      metadata: {
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
    });
  }

  return NextResponse.json({
    identifier: invitation.identifier,
    fullName,
    qrUrl,
    whatsapp: {
      guest: guestWhatsAppSent,
      admin: adminWhatsAppSent,
    },
  });
}
