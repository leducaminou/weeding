import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  type WASocket,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

const AUTH_DIR = "./baileys_auth";

interface Client {
  socket: WASocket;
  isConnected: boolean;
  qr: string | null;
}

let instance: Client | null = null;

export async function getWhatsAppClient(): Promise<Client | null> {
  if (instance?.isConnected) return instance;
  return initWhatsAppClient();
}

export async function initWhatsAppClient(): Promise<Client | null> {
  if (instance?.isConnected) return instance;

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  const socket = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ["Loïca & Franck", "Chrome", "1.0.0"],
  });

  const client: Client = { socket, isConnected: false, qr: null };
  instance = client;

  socket.ev.on("creds.update", saveCreds);

  socket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      client.qr = qr;
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
      const code = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = code !== DisconnectReason.loggedOut;

      await prisma.whatsAppConfig.upsert({
        where: { id: "default" },
        update: { isConnected: false },
        create: { id: "default", isConnected: false },
      });

      if (shouldReconnect) {
        setTimeout(() => {
          instance = null;
          initWhatsAppClient().catch(() => {});
        }, 3000);
      } else {
        instance = null;
        await audit({
          action: "WHATSAPP_DISCONNECTED",
          entity: "WhatsAppConfig",
          metadata: { reason: "logged_out" },
        });
      }
    }
  });

  return client;
}

export function getWhatsAppInstance() {
  return instance;
}