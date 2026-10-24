import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AccommodationsManager } from "@/components/admin/AccommodationsManager";

export const metadata: Metadata = { title: "Hébergements" };
export const dynamic = "force-dynamic";

export default async function AdminAccommodationsPage() {
  const items = await prisma.accommodation.findMany({
    orderBy: { position: "asc" },
  });
  return (
    <>
      <AdminPageHeader
        title="Hébergements"
        description="Gérez les lieux d'hébergement pour vos invités."
      />
      <AccommodationsManager initialItems={items} />
    </>
  );
}