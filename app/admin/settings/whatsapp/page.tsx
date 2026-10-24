import type { Metadata } from "next";
import { WhatsAppPanel } from "@/components/admin/WhatsAppPanel";
import { WhatsAppAdminService } from "@/services/WhatsAppAdminService";
import { AdminPageHeader } from "../../../../components/admin/AdminPageHeader";

export const metadata: Metadata = { title: "WhatsApp" };
export const dynamic = "force-dynamic";

export default async function AdminWhatsAppPage() {
  const status = await WhatsAppAdminService.getStatus();
  return (
    <>
      <AdminPageHeader
        title="WhatsApp"
        description="Configuration de la connexion Baileys et du numéro administrateur."
      />
      <WhatsAppPanel initialStatus={status} />
    </>
  );
}