import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { QRCodeService } from "@/services/QRCodeService";
import { audit } from "@/lib/audit";
import { QR_CLEANUP_DATE } from "@/config/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (new Date() < QR_CLEANUP_DATE) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      message: `Cleanup prévu après ${QR_CLEANUP_DATE.toISOString()}`,
    });
  }

  const targets = await prisma.invitation.findMany({
    where: { qrCodeKey: { not: null } },
    select: { id: true, identifier: true },
  });

  let success = 0;
  let failed = 0;
  for (const t of targets) {
    const ok = await QRCodeService.deleteQrCode(t.id);
    if (ok) success++;
    else failed++;
  }

  await audit({
    action: "QR_CLEANUP_RUN",
    metadata: { total: targets.length, success, failed },
  });

  return NextResponse.json({
    ok: true,
    total: targets.length,
    success,
    failed,
  });
}