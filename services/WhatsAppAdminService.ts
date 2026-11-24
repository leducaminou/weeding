import { prisma } from "@/lib/prisma";
import {
  getWhatsAppInstance,
  initWhatsAppClient,
} from "@/lib/whatsapp/client";

export const WhatsAppAdminService = {
  async getStatus() {
    await initWhatsAppClient();
    const config = await prisma.whatsAppConfig.findUnique({
      where: { id: "default" },
    });
    const instance = getWhatsAppInstance();
    const jid = instance?.socket.user?.id;
    return {
      adminPhone: config?.adminPhone ?? null,
      isConnected: instance?.isConnected ?? config?.isConnected ?? false,
      connectedPhone:
        jid?.endsWith("@s.whatsapp.net")
          ? `+${jid.split("@")[0].split(":")[0]}`
          : null,
      qr: instance?.qr ?? null,
      lastConnectedAt: config?.lastConnectedAt ?? null,
    };
  },

  async updateAdminPhone(phone: string | null) {
    return prisma.whatsAppConfig.upsert({
      where: { id: "default" },
      update: { adminPhone: phone },
      create: { id: "default", adminPhone: phone },
    });
  },
};