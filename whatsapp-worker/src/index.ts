import { randomUUID } from "node:crypto";
import { setTimeout as sleep } from "node:timers/promises";
import makeWASocket, {
  BufferJSON,
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  initAuthCreds,
  proto,
  type AuthenticationState,
  type ConnectionState,
  type SignalDataTypeMap,
  type WASocket,
} from "@whiskeysockets/baileys";
import { PrismaClient, type WhatsAppCommand } from "@prisma/client";
import pino from "pino";
import QRCode from "qrcode";

const prisma = new PrismaClient();
const logger = pino({ level: process.env.WHATSAPP_LOG_LEVEL ?? "warn" });
const sessionId = "wedding";
const workerId = randomUUID();
const leaseDurationMs = 60_000;
const leaseRenewalMs = 20_000;

type ConfigPatch = {
  isConnected?: boolean;
  connectionStatus?: string;
  connectedPhone?: string | null;
  qr?: string | null;
  lastError?: string | null;
  lastConnectedAt?: Date;
};

interface SendPayload {
  recipient: string;
  content: string;
  imageUrl?: string;
}

let socket: WASocket | null = null;
let socketStarting: Promise<void> | null = null;
let credsSaving: Promise<void> = Promise.resolve();
let reconnectTimer: NodeJS.Timeout | null = null;
let reconnectAttempts = 0;
let leaseHeld = false;
let stopping = false;

async function updateConfig(patch: ConfigPatch) {
  await prisma.whatsAppConfig.upsert({
    where: { id: "default" },
    update: patch,
    create: { id: "default", ...patch },
  });
}

async function saveAuthEntries(entries: Array<{ key: string; value: string }>) {
  for (let offset = 0; offset < entries.length; offset += 100) {
    const chunk = entries.slice(offset, offset + 100);
    await prisma.$transaction(
      chunk.map(({ key, value }) =>
        prisma.whatsAppAuthKey.upsert({
          where: { sessionId_key: { sessionId, key } },
          create: { sessionId, key, value },
          update: { value },
        }),
      ),
    );
  }
}

async function loadAuthState() {
  const credsRow = await prisma.whatsAppAuthKey.findUnique({
    where: { sessionId_key: { sessionId, key: "creds" } },
  });
  const creds = credsRow
    ? (JSON.parse(credsRow.value, BufferJSON.reviver) as AuthenticationState["creds"])
    : initAuthCreds();

  const state: AuthenticationState = {
    creds,
    keys: {
      get: async <T extends keyof SignalDataTypeMap>(type: T, ids: string[]) => {
        const rows = await prisma.whatsAppAuthKey.findMany({
          where: {
            sessionId,
            key: { in: ids.map((id) => `${type}-${id}`) },
          },
        });
        const byKey = new Map(rows.map((row) => [row.key, row.value]));
        const data: { [id: string]: SignalDataTypeMap[T] } = {};
        for (const id of ids) {
          const value = byKey.get(`${type}-${id}`);
          if (!value) continue;
          let parsed = JSON.parse(value, BufferJSON.reviver);
          if (type === "app-state-sync-key") {
            parsed = proto.Message.AppStateSyncKeyData.fromObject(parsed);
          }
          data[id] = parsed;
        }
        return data;
      },
      set: async (data) => {
        const writes: Array<{ key: string; value: string }> = [];
        const deletes: string[] = [];
        for (const category of Object.keys(data) as Array<keyof SignalDataTypeMap>) {
          const entries = data[category] ?? {};
          for (const [id, value] of Object.entries(entries)) {
            const key = `${category}-${id}`;
            if (value) {
              writes.push({
                key,
                value: JSON.stringify(value, BufferJSON.replacer),
              });
            } else {
              deletes.push(key);
            }
          }
        }
        if (deletes.length) {
          await prisma.whatsAppAuthKey.deleteMany({
            where: { sessionId, key: { in: deletes } },
          });
        }
        await saveAuthEntries(writes);
      },
    },
  };

  return {
    state,
    saveCreds: () =>
      saveAuthEntries([
        {
          key: "creds",
          value: JSON.stringify(state.creds, BufferJSON.replacer),
        },
      ]),
  };
}

async function startSocket() {
  if (socket || socketStarting || !leaseHeld || stopping) return socketStarting;

  socketStarting = (async () => {
    await credsSaving;
    const { state, saveCreds } = await loadAuthState();
    await updateConfig({
      isConnected: false,
      connectionStatus: "CONNECTING",
      connectedPhone: null,
      qr: null,
      lastError: null,
    });

    let version: [number, number, number] | undefined;
    try {
      ({ version } = await fetchLatestBaileysVersion());
    } catch (error) {
      logger.warn({ error }, "Could not fetch the current WhatsApp Web version");
    }

    const currentSocket = makeWASocket({
      ...(version ? { version } : {}),
      auth: state,
      printQRInTerminal: false,
      browser: Browsers.ubuntu("Loïca & Franck"),
      markOnlineOnConnect: false,
      syncFullHistory: false,
      logger,
    });
    socket = currentSocket;
    currentSocket.ev.on("creds.update", () => {
      credsSaving = credsSaving
        .then(saveCreds)
        .catch((error: unknown) => logger.error({ error }, "Saving WhatsApp credentials failed"));
    });
    currentSocket.ev.on("connection.update", (update) => {
      void handleConnectionUpdate(currentSocket, update, !!state.creds.me?.id).catch(
        (error: unknown) => logger.error({ error }, "WhatsApp connection update failed"),
      );
    });
  })();

  try {
    await socketStarting;
  } finally {
    socketStarting = null;
  }
}

async function handleConnectionUpdate(
  currentSocket: WASocket,
  update: Partial<ConnectionState>,
  wasLinkedAtStart: boolean,
) {
  if (currentSocket !== socket || !leaseHeld) return;
  const { connection, lastDisconnect, qr } = update;

  if (qr) {
    const qrDataUrl = await QRCode.toDataURL(qr, { margin: 1, width: 320 });
    await updateConfig({
      connectionStatus: "QR_PENDING",
      qr: qrDataUrl,
      lastError: null,
    });
  }

  if (connection === "open") {
    reconnectAttempts = 0;
    const jid = currentSocket.user?.id ?? "";
    await updateConfig({
      isConnected: true,
      connectionStatus: "CONNECTED",
      connectedPhone: jid ? `+${jid.split("@")[0].split(":")[0]}` : null,
      qr: null,
      lastError: null,
      lastConnectedAt: new Date(),
    });
    return;
  }

  if (connection !== "close") return;
  socket = null;
  if (!leaseHeld || stopping) return;

  const code = (lastDisconnect?.error as { output?: { statusCode?: number } } | undefined)
    ?.output?.statusCode;
  const reason =
    lastDisconnect?.error instanceof Error
      ? lastDisconnect.error.message
      : "Aucun détail fourni par Baileys.";
  const linked = wasLinkedAtStart || !!currentSocket.authState?.creds?.me?.id;
  logger.warn({ code, reason }, "WhatsApp connection closed");

  if (code === DisconnectReason.loggedOut) {
    await credsSaving;
    await prisma.whatsAppAuthKey.deleteMany({ where: { sessionId } });
    await updateConfig({
      isConnected: false,
      connectionStatus: "LOGGED_OUT",
      connectedPhone: null,
      qr: null,
      lastError: "Le numéro a été délié depuis le téléphone. Générez un nouveau QR code.",
    });
    return;
  }

  if (code === DisconnectReason.badSession) {
    await credsSaving;
    await prisma.whatsAppAuthKey.deleteMany({ where: { sessionId } });
    await updateConfig({
      isConnected: false,
      connectionStatus: "DISCONNECTED",
      connectedPhone: null,
      qr: null,
      lastError:
        "La session Baileys est invalide. Les identifiants ont été réinitialisés ; générez un nouveau QR code.",
    });
    return;
  }

  if (code === DisconnectReason.restartRequired) {
    scheduleReconnect(0);
    return;
  }

  if (code === DisconnectReason.forbidden) {
    await updateConfig({
      isConnected: false,
      connectionStatus: "DISCONNECTED",
      qr: null,
      lastError: "WhatsApp a refusé la connexion (403). Vérifiez le numéro dédié.",
    });
    return;
  }

  if (code === DisconnectReason.connectionReplaced) {
    await updateConfig({
      isConnected: false,
      connectionStatus: "DISCONNECTED",
      qr: null,
      lastError:
        "Cette session WhatsApp est ouverte dans un autre processus. Fermez l’autre connexion avant de réessayer.",
    });
    return;
  }

  if (!linked) {
    await updateConfig({
      isConnected: false,
      connectionStatus: "DISCONNECTED",
      qr: null,
      lastError:
        code === DisconnectReason.timedOut
          ? "La connexion a expiré avant le scan. Si le QR n’est pas apparu, vérifiez les logs du daemon ; sinon générez-en un nouveau."
          : `WhatsApp a fermé la connexion (${code ?? "cause inconnue"}): ${reason}`,
    });
    return;
  }

  const delay = Math.min(2_000 * 2 ** reconnectAttempts, 60_000);
  reconnectAttempts += 1;
  scheduleReconnect(delay);
}

function scheduleReconnect(delayMs: number) {
  if (!leaseHeld || stopping) return;
  if (reconnectTimer) clearTimeout(reconnectTimer);
  void updateConfig({
    isConnected: false,
    connectionStatus: "CONNECTING",
    qr: null,
  }).catch((error: unknown) =>
    logger.error({ error }, "Failed to update WhatsApp reconnect status"),
  );
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    void startSocket().catch((error: unknown) => {
      logger.error({ error }, "WhatsApp reconnect failed");
      scheduleReconnect(Math.min(delayMs * 2 || 2_000, 60_000));
    });
  }, delayMs);
}

function parseSendPayload(payload: unknown): SendPayload {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Invalid WhatsApp send payload");
  }
  const value = payload as Record<string, unknown>;
  if (typeof value.recipient !== "string" || typeof value.content !== "string") {
    throw new Error("Invalid WhatsApp recipient or message");
  }
  if (value.imageUrl !== undefined && typeof value.imageUrl !== "string") {
    throw new Error("Invalid WhatsApp image URL");
  }
  return {
    recipient: value.recipient,
    content: value.content,
    imageUrl: value.imageUrl as string | undefined,
  };
}

async function processCommand(command: WhatsAppCommand) {
  try {
    if (command.command === "CONNECT") {
      await startSocket();
      await prisma.whatsAppCommand.update({
        where: { id: command.id },
        data: { status: "COMPLETED", payload: {} },
      });
      return;
    }

    if (command.command !== "SEND") {
      throw new Error(`Unknown WhatsApp command: ${command.command}`);
    }
    if (!socket?.user) throw new Error("WhatsApp non connecté");

    const { recipient, content, imageUrl } = parseSendPayload(command.payload);
    const result = await socket.sendMessage(
      recipient,
      imageUrl ? { image: { url: imageUrl }, caption: content } : { text: content },
    );
    await prisma.whatsAppCommand.update({
      where: { id: command.id },
      data: {
        status: "COMPLETED",
        payload: {},
        result: JSON.stringify({ messageId: result?.key?.id ?? null }),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "WhatsApp command failed";
    await prisma.whatsAppCommand.update({
      where: { id: command.id },
      data: { status: "FAILED", error: message, payload: {} },
    });
  }
}

async function processNextCommand() {
  const command = await prisma.whatsAppCommand.findFirst({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });
  if (!command) return false;

  const claimed = await prisma.whatsAppCommand.updateMany({
    where: { id: command.id, status: "PENDING" },
    data: { status: "PROCESSING" },
  });
  if (claimed.count !== 1) return true;
  await processCommand(command);
  return true;
}

async function acquireLease() {
  await prisma.whatsAppConfig.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
  const now = new Date();
  const result = await prisma.whatsAppConfig.updateMany({
    where: {
      id: "default",
      OR: [
        { workerLeaseExpiresAt: null },
        { workerLeaseExpiresAt: { lt: now } },
        { workerId },
      ],
    },
    data: {
      workerId,
      workerLeaseExpiresAt: new Date(now.getTime() + leaseDurationMs),
    },
  });
  return result.count === 1;
}

async function runWithLease() {
  leaseHeld = true;
  const renewal = setInterval(() => {
    void prisma.whatsAppConfig
      .updateMany({
        where: { id: "default", workerId },
        data: { workerLeaseExpiresAt: new Date(Date.now() + leaseDurationMs) },
      })
      .then((result) => {
        if (result.count === 0) {
          leaseHeld = false;
          socket?.end(new Error("WhatsApp worker lease lost"));
          socket = null;
        }
      })
      .catch((error: unknown) => logger.error({ error }, "WhatsApp lease renewal failed"));
  }, leaseRenewalMs);

  try {
    await prisma.whatsAppCommand.updateMany({
      where: { status: "PROCESSING" },
      data: {
        status: "FAILED",
        payload: {},
        error:
          "Le worker a redémarré pendant le traitement. Vérifiez l’envoi avant de réessayer.",
      },
    });

    const config = await prisma.whatsAppConfig.findUnique({
      where: { id: "default" },
    });
    const { state } = await loadAuthState();
    if (
      state.creds.me?.id ||
      config?.connectionStatus === "CONNECTING" ||
      config?.connectionStatus === "QR_PENDING"
    ) {
      await startSocket();
    } else if (config?.isConnected || config?.connectionStatus === "CONNECTED") {
      await updateConfig({
        isConnected: false,
        connectionStatus: "DISCONNECTED",
        connectedPhone: null,
        qr: null,
        lastError: "La session Baileys doit être associée à ce service. Générez un nouveau QR code.",
      });
    }

    while (leaseHeld && !stopping) {
      if (!(await processNextCommand())) await sleep(1_000);
    }
  } finally {
    clearInterval(renewal);
    leaseHeld = false;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = null;
    socket?.end(undefined);
    socket = null;
    await prisma.whatsAppConfig.updateMany({
      where: { id: "default", workerId },
      data: { workerId: null, workerLeaseExpiresAt: null, isConnected: false },
    });
  }
}

async function main() {
  logger.info("Starting WhatsApp daemon");
  while (!stopping) {
    try {
      if (await acquireLease()) {
        await runWithLease();
      } else {
        await sleep(5_000);
      }
    } catch (error) {
      logger.error({ error }, "WhatsApp daemon loop failed");
      await sleep(5_000);
    }
  }
}

function shutdown() {
  stopping = true;
  socket?.end(undefined);
  socket = null;
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

void main()
  .catch((error: unknown) => {
    logger.error({ error }, "WhatsApp daemon stopped unexpectedly");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
