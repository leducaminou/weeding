import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ContentManager } from "@/components/admin/ContentManager";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata: Metadata = { title: "Contenu" };
export const dynamic = "force-dynamic";

const KNOWN_KEYS = [
  {
    key: "dress_code",
    label: "Dress code",
    hint: "Ex : Bleu & Blanc",
    multiline: false,
  },
  {
    key: "final_message_title",
    label: "Message final — Titre",
    hint: "Ex : AVEC TOUTE NOTRE AFFECTION",
    multiline: false,
  },
  {
    key: "final_message_body",
    label: "Message final — Corps",
    hint: "Utilisez des sauts de ligne pour séparer les paragraphes.",
    multiline: true,
  },
  {
    key: "whatsapp_guest_template",
    label: "Modèle WhatsApp invité",
    hint: "Variables : {prenom}, {identifier}, {qr_url}",
    multiline: true,
  },
  {
    key: "whatsapp_admin_template",
    label: "Modèle WhatsApp admin",
    hint: "Variables : {nom}, {identifier}",
    multiline: true,
  },
] as const;

export default async function AdminContentPage() {
  const wedding = await prisma.wedding.findFirst();
  if (!wedding) return null;
  const settings = await prisma.siteSetting.findMany({
    where: { weddingId: wedding.id },
  });

  const items = KNOWN_KEYS.map((k) => ({
    key: k.key,
    label: k.label,
    hint: k.hint,
    multiline: k.multiline,
    value: settings.find((s) => s.key === k.key)?.value ?? "",
  }));

  return (
    <>
      <AdminPageHeader
        title="Contenu"
        description="Textes configurables du site."
      />
      <ContentManager items={items} />
    </>
  );
}