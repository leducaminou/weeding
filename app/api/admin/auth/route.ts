import { NextResponse } from "next/server";
import { adminLoginSchema } from "@/validations/admin.schema";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { LOGIN_RATE_LIMIT } from "@/config/constants";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(
    `login:${ip}`,
    LOGIN_RATE_LIMIT.max,
    LOGIN_RATE_LIMIT.windowMs
  );
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez plus tard." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Identifiants invalides" },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;
  const admin = await prisma.admin.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!admin || !admin.active) {
    await audit({
      action: "ADMIN_LOGIN_FAILED",
      metadata: { email, reason: "not_found" },
      ip,
    });
    return NextResponse.json(
      { error: "Identifiants invalides" },
      { status: 401 }
    );
  }

  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) {
    await audit({
      action: "ADMIN_LOGIN_FAILED",
      metadata: { email, reason: "bad_password" },
      ip,
    });
    return NextResponse.json(
      { error: "Identifiants invalides" },
      { status: 401 }
    );
  }

  await createSession({
    adminId: admin.id,
    email: admin.email,
    name: admin.name,
  });
  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });
  await audit({ action: "ADMIN_LOGIN", adminId: admin.id, ip });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await destroySession();
  return NextResponse.json({ ok: true });
}