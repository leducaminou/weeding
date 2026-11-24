import makeWASocket, {
  useMultiFileAuthState as loadMultiFileAuthState,
  DisconnectReason,
  type ConnectionState,
  type WASocket,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

const AUTH_DIR = "./baileys_auth";

interface Client {
  socket: WASocket;
  isConnected: boolean;
  qr: string | null;
}

let instance: Client | null = null;
let initialization: Promise<Client> | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

export async function getWhatsAppClient(): Promise<Client | null> {
  if (instance) return instance;
  return initWhatsAppClient();
}

export async function initWhatsAppClient(): Promise<Client | null> {
  if (instance) return instance;
  if (initialization) return initialization;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  initialization = (async () => {
    const { state, saveCreds } = await loadMultiFileAuthState(AUTH_DIR);

    const socket = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ["Loïca & Franck", "Chrome", "1.0.0"],
    });

    const client: Client = { socket, isConnected: false, qr: null };
    instance = client;

    socket.ev.on("creds.update", saveCreds);
    socket.ev.on("connection.update", (update) => {
      void handleConnectionUpdate(client, update).catch((error: unknown) => {
        console.error("[WHATSAPP_CONNECTION_UPDATE_FAILED]", error);
      });
    });

    return client;
  })();

  try {
    return await initialization;
  } finally {
    initialization = null;
  }
}

async function handleConnectionUpdate(
  client: Client,
  update: Partial<ConnectionState>
) {
  const { connection, lastDisconnect, qr } = update;

  if (qr) {
    client.qr = await QRCode.toDataURL(qr);
    await audit({ action: "WHATSAPP_QR_GENERATED", entity: "WhatsAppConfig" });
  }

  if (connection === "open") {
    client.isConnected = true;
    client.qr = null;

    await prisma.whatsAppConfig.upsert({
      where: { id: "default" },
      update: { isConnected: true, lastConnectedAt: new Date() },
      create: { id: "default", isConnected: true, lastConnectedAt: new Date() },
    });

    await audit({ action: "WHATSAPP_CONNECTED", entity: "WhatsAppConfig" });
  }

  if (connection === "close") {
    client.isConnected = false;
    if (instance === client) instance = null;
    const code = (lastDisconnect?.error as Boom)?.output?.statusCode;
    const shouldReconnect = code !== DisconnectReason.loggedOut;

    await prisma.whatsAppConfig.upsert({
      where: { id: "default" },
      update: { isConnected: false },
      create: { id: "default", isConnected: false },
    });

    if (shouldReconnect) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        void initWhatsAppClient().catch((error: unknown) => {
          console.error("[WHATSAPP_RECONNECT_FAILED]", error);
        });
      }, 3000);
    } else {
      await audit({
        action: "WHATSAPP_DISCONNECTED",
        entity: "WhatsAppConfig",
        metadata: { reason: "logged_out" },
      });
    }
  }
}

export function getWhatsAppInstance() {
  return instance;
}