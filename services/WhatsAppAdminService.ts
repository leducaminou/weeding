import { prisma } from "@/lib/prisma";
import { enqueueWhatsAppConnect } from "@/services/WhatsAppCommandService";

export const WhatsAppAdminService = {
  async getStatus() {
    const config = await prisma.whatsAppConfig.findUnique({
      where: { id: "default" },
    });
    const workerOnline = Boolean(
      config?.workerLeaseExpiresAt &&
        config.workerLeaseExpiresAt > new Date(),
    );
    return {
      adminPhone: config?.adminPhone ?? null,
      isConnected: Boolean(config?.isConnected && workerOnline),
      connectionStatus: config?.connectionStatus ?? "DISCONNECTED",
      connectedPhone: config?.connectedPhone ?? null,
      qr: config?.qr ?? null,
      lastConnectedAt: config?.lastConnectedAt ?? null,
      lastError: config?.lastError ?? null,
      workerOnline,
    };
  },

  async connect() {
    await enqueueWhatsAppConnect();
  },

  async updateAdminPhone(phone: string | null) {
    return prisma.whatsAppConfig.upsert({
      where: { id: "default" },
      update: { adminPhone: phone },
      create: { id: "default", adminPhone: phone },
    });
  },
};