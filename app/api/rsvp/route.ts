import { NextResponse } from "next/server";
import { rsvpSchema } from "@/validations/rsvp.schema";
import { GuestService } from "@/services/GuestService";
import { QRCodeService } from "@/services/QRCodeService";
import { WhatsAppService } from "@/services/WhatsAppService";
import { getWedding, getSetting } from "@/services/WeddingService";
import { prisma } from "@/lib/prisma";
import { generateUniqueIdentifier } from "@/lib/qr/identifier";
import { audit } from "@/lib/audit";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  RSVP_DUPLICATE_WINDOW_MS,
  RSVP_RATE_LIMIT,
} from "@/config/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(
    `rsvp:${ip}`,
    RSVP_RATE_LIMIT.max,
    RSVP_RATE_LIMIT.windowMs
  );
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
      { error: "Validation échouée", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const input = parsed.data;

  const wedding = await getWedding();
  if (!wedding) {
    return NextResponse.json({ error: "Mariage introuvable" }, { status: 500 });
  }

  // Idempotence : double-clic / retry réseau
  const duplicate = await GuestService.findRecentDuplicate(
    input,
    RSVP_DUPLICATE_WINDOW_MS
  );
  if (duplicate?.invitation) {
    return NextResponse.json({
      identifier: duplicate.invitation.identifier,
      fullName: `${duplicate.firstName} ${duplicate.lastName}`,
      reused: true,
    });
  }

  // Création Guest + Invitation en transaction
  const identifier = await generateUniqueIdentifier();
  const { guest, invitation } = await prisma.$transaction(async (tx) => {
    const guest = await tx.guest.create({
      data: {
        weddingId: wedding.id,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone ?? null,
      },
    });
    const invitation = await tx.invitation.create({
      data: {
        guestId: guest.id,
        weddingId: wedding.id,
        identifier,
      },
    });
    return { guest, invitation };
  });

  await audit({
    action: "RSVP_CREATED",
    entity: "Invitation",
    entityId: invitation.id,
    metadata: { identifier, hasPhone: !!input.phone },
    ip,
  });

  // QR (décorrélé : ne casse pas le RSVP)
  let qrUrl: string | null = null;
  try {
    const qr = await QRCodeService.ensureQrCode(invitation.id, identifier);
    qrUrl = qr.url;
  } catch (err) {
    await audit({
      action: "QR_GENERATION_FAILED",
      entity: "Invitation",
      entityId: invitation.id,
      metadata: { error: err instanceof Error ? err.message : "unknown" },
    });
  }

  // WhatsApp invité (décorrélé)
  if (input.phone && qrUrl) {
    try {
      const tpl = getSetting(
        wedding.settings,
        "whatsapp_guest_template",
        "Bonjour {prenom}, votre identifiant est {identifier}. QR : {qr_url}"
      );
      await WhatsAppService.sendGuestInvitation({
        phone: input.phone,
        firstName: input.firstName,
        identifier,
        qrUrl,
        template: tpl,
        invitationId: invitation.id,
      });
    } catch {
      /* silencieux */
    }
  }

  // WhatsApp admin (décorrélé)
  try {
    const config = await prisma.whatsAppConfig.findUnique({
      where: { id: "default" },
    });
    if (config?.adminPhone) {
      const tpl = getSetting(
        wedding.settings,
        "whatsapp_admin_template",
        "Nouvelle confirmation : {nom} ({identifier})"
      );
      await WhatsAppService.notifyAdmin({
        adminPhone: config.adminPhone,
        fullName: `${input.firstName} ${input.lastName}`,
        identifier,
        template: tpl,
        invitationId: invitation.id,
      });
    }
  } catch {
    /* silencieux */
  }

  return NextResponse.json({
    identifier,
    fullName: `${input.firstName} ${input.lastName}`,
    qrUrl,
    reused: false,
  });
}