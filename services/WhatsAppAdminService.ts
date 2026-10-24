import { prisma } from "@/lib/prisma";
import { getWhatsAppInstance } from "@/lib/whatsapp/client";

export const WhatsAppAdminService = {
  async getStatus() {
    const config = await prisma.whatsAppConfig.findUnique({
      where: { id: "default" },
    });
    const instance = getWhatsAppInstance();
    return {
      adminPhone: config?.adminPhone ?? null,
      isConnected: instance?.isConnected ?? config?.isConnected ?? false,
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