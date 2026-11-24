import { InvitationStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { QRCodeService } from "@/services/QRCodeService";
import { getSetting, getWedding } from "@/services/WeddingService";
import { WhatsAppService } from "@/services/WhatsAppService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BATCH_SIZE = 3;
const schema = z.object({ cursor: z.string().nullable().optional() });

export async function POST(req: Request) {
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
    return NextResponse.json({ error: "Curseur invalide" }, { status: 400 });
  }

  const wedding = await getWedding();
  if (!wedding) {
    return NextResponse.json({ error: "Mariage introuvable" }, { status: 500 });
  }

  const confirmedGuests = {
    weddingId: wedding.id,
    phone: { not: null },
    invitation: { is: { status: InvitationStatus.CONFIRMED } },
  };
  const [guests, withoutPhone] = await Promise.all([
    prisma.guest.findMany({
      where: confirmedGuests,
      include: { invitation: true },
      orderBy: { id: "asc" },
      ...(parsed.data.cursor
        ? { cursor: { id: parsed.data.cursor }, skip: 1 }
        : {}),
      take: BATCH_SIZE,
    }),
    prisma.guest.count({
      where: {
        weddingId: wedding.id,
        phone: null,
        invitation: { is: { status: InvitationStatus.CONFIRMED } },
      },
    }),
  ]);

  let sent = 0;
  let failed = 0;
  let skipped = 0;
  const template = getSetting(
    wedding.settings,
    "whatsapp_guest_template",
    "Bonjour {prenom}, votre identifiant est {identifier}. QR : {qr_url}"
  );

  for (const guest of guests) {
    const invitation = guest.invitation;
    if (!invitation || !guest.phone) {
      skipped++;
      continue;
    }

    const stillConfirmed = await prisma.invitation.findFirst({
      where: { id: invitation.id, status: InvitationStatus.CONFIRMED },
      select: { id: true },
    });
    if (!stillConfirmed) {
      skipped++;
      continue;
    }

    try {
      const qr = await QRCodeService.ensureQrCode(
        invitation.id,
        invitation.identifier
      );
      const confirmedBeforeSend = await prisma.invitation.findFirst({
        where: {
          id: invitation.id,
          status: InvitationStatus.CONFIRMED,
        },
        select: { id: true },
      });
      if (!confirmedBeforeSend) {
        skipped++;
        continue;
      }
      const result = await WhatsAppService.sendGuestInvitation({
        phone: guest.phone,
        firstName: `${guest.firstName} ${guest.lastName}`.trim(),
        identifier: invitation.identifier,
        qrUrl: qr.url,
        template,
        invitationId: invitation.id,
      });
      if (result.ok) sent++;
      else failed++;
    } catch (error) {
      failed++;
      await audit({
        action: "WHATSAPP_BULK_QR_FAILED",
        adminId: session.adminId,
        entity: "Invitation",
        entityId: invitation.id,
        metadata: {
          error: error instanceof Error ? error.message : "Erreur inconnue",
        },
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  await audit({
    action: "WHATSAPP_BULK_QR_COMPLETED",
    adminId: session.adminId,
    entity: "Wedding",
    entityId: wedding.id,
    metadata: { sent, failed, skipped },
  });

  const hasMore = guests.length === BATCH_SIZE;
  return NextResponse.json({
    sent,
    failed,
    skipped,
    withoutPhone,
    hasMore,
    nextCursor: hasMore ? guests[guests.length - 1].id : null,
  });
}
