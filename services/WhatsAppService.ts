import { prisma } from "@/lib/prisma";
import { MessageStatus } from "@prisma/client";
import { getWhatsAppClient } from "@/lib/whatsapp/client";
import { audit } from "@/lib/audit";

interface SendParams {
  recipient: string;
  content: string;
  type: "GUEST_INVITATION" | "ADMIN_NOTIFICATION";
  invitationId?: string;
}

function normalizeJid(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.includes("@") ? digits : `${digits}@s.whatsapp.net`;
}

function renderTemplate(template: string, vars: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

export const WhatsAppService = {
  async send(params: SendParams): Promise<{ ok: boolean; id: string }> {
    const message = await prisma.whatsAppMessage.create({
      data: {
        invitationId: params.invitationId ?? null,
        recipient: params.recipient,
        type: params.type,
        content: params.content,
        status: MessageStatus.PENDING,
      },
    });

    try {
      const client = await getWhatsAppClient();
      if (!client || !client.isConnected) {
        throw new Error("WhatsApp non connecté");
      }
      const jid = normalizeJid(params.recipient);
      await client.socket.sendMessage(jid, { text: params.content });

      await prisma.whatsAppMessage.update({
        where: { id: message.id },
        data: { status: MessageStatus.SENT, sentAt: new Date() },
      });
      await audit({
        action: "WHATSAPP_SENT",
        entity: "WhatsAppMessage",
        entityId: message.id,
        metadata: { recipient: params.recipient, type: params.type },
      });
      return { ok: true, id: message.id };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erreur inconnue";
      await prisma.whatsAppMessage.update({
        where: { id: message.id },
        data: { status: MessageStatus.FAILED, error: errorMsg },
      });
      await audit({
        action: "WHATSAPP_FAILED",
        entity: "WhatsAppMessage",
        entityId: message.id,
        metadata: { recipient: params.recipient, error: errorMsg },
      });
      return { ok: false, id: message.id };
    }
  },

  async sendGuestInvitation(params: {
    phone: string;
    firstName: string;
    identifier: string;
    qrUrl: string;
    template: string;
    invitationId: string;
  }) {
    const content = renderTemplate(params.template, {
      prenom: params.firstName,
      identifier: params.identifier,
      qr_url: params.qrUrl,
    });
    return this.send({
      recipient: params.phone,
      content,
      type: "GUEST_INVITATION",
      invitationId: params.invitationId,
    });
  },

  async notifyAdmin(params: {
    adminPhone: string;
    fullName: string;
    identifier: string;
    template: string;
    invitationId: string;
  }) {
    const content = renderTemplate(params.template, {
      nom: params.fullName,
      identifier: params.identifier,
    });
    return this.send({
      recipient: params.adminPhone,
      content,
      type: "ADMIN_NOTIFICATION",
      invitationId: params.invitationId,
    });
  },
};