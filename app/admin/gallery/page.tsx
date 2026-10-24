import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { GalleryManager } from "@/components/admin/GalleryManager";

export const metadata: Metadata = { title: "Galerie" };
export const dynamic = "force-dynamic";

/**
 * Page admin /admin/gallery.
 *
 * Le `export default` est OBLIGATOIRE pour que Next.js reconnaisse
 * ce fichier comme une page. Sans lui, le validateur de types généré
 * dans `.next/types/validator.ts` échoue avec :
 *   "Property 'default' is missing"
 *
 * On type explicitement les items pour refléter la sérialisation
 * des Date en string (les champs `createdAt` / `updatedAt` sont
 * des string côté client après passage par le serveur).
 */
export default async function AdminGalleryPage() {
  const raw = await prisma.galleryItem.findMany({
    orderBy: { position: "asc" },
  });

  const items = raw.map((g) => ({
    id: g.id,
    url: g.url,
    alt: g.alt ?? null,
    position: g.position,
    active: g.active,
  }));

  return (
    <>
      <AdminPageHeader
        title="Galerie"
        description="Photos du couple affichées sur le site."
      />
      <GalleryManager initialItems={items} />
    </>
  );
}