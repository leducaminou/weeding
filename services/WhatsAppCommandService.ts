import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const commandTimeoutMs = 30_000;

const delay = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function ensureWorkerOnline() {
  const config = await prisma.whatsAppConfig.findUnique({
    where: { id: "default" },
    select: { workerLeaseExpiresAt: true },
  });
  if (!config?.workerLeaseExpiresAt || config.workerLeaseExpiresAt <= new Date()) {
    throw new Error("Le service WhatsApp Vercel n’est pas actif.");
  }
}

export async function enqueueWhatsAppConnect() {
  await ensureWorkerOnline();
  await prisma.whatsAppConfig.upsert({
    where: { id: "default" },
    update: {
      isConnected: false,
      connectionStatus: "CONNECTING",
      connectedPhone: null,
      qr: null,
      lastError: null,
    },
    create: {
      id: "default",
      connectionStatus: "CONNECTING",
    },
  });
  await prisma.whatsAppCommand.create({
    data: { command: "CONNECT", payload: {} },
  });
}

export async function sendWhatsAppCommand(payload: Prisma.InputJsonValue) {
  await ensureWorkerOnline();
  const config = await prisma.whatsAppConfig.findUnique({
    where: { id: "default" },
    select: { isConnected: true },
  });
  if (!config?.isConnected) throw new Error("WhatsApp non connecté.");

  const command = await prisma.whatsAppCommand.create({
    data: { command: "SEND", payload },
  });
  const deadline = Date.now() + commandTimeoutMs;

  while (Date.now() < deadline) {
    const current = await prisma.whatsAppCommand.findUnique({
      where: { id: command.id },
      select: { status: true, result: true, error: true },
    });
    if (current?.status === "COMPLETED") {
      return current.result ? JSON.parse(current.result) : {};
    }
    if (current?.status === "FAILED") {
      throw new Error(current.error ?? "Échec de la commande WhatsApp.");
    }
    await delay(500);
  }

  await prisma.whatsAppCommand.updateMany({
    where: { id: command.id, status: "PENDING" },
    data: {
      status: "FAILED",
      error: "Le service WhatsApp n’a pas répondu à temps.",
    },
  });
  throw new Error("Le service WhatsApp n’a pas répondu à temps.");
}
