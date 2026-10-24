import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { WishlistManager } from "@/components/admin/WishlistManager";

export const metadata: Metadata = { title: "Wishlist" };
export const dynamic = "force-dynamic";

export default async function AdminWishlistPage() {
  const items = await prisma.wishlistItem.findMany({
    orderBy: [{ position: "asc" }, { priority: "desc" }],
  });
  return (
    <>
      <AdminPageHeader title="Wishlist" description="Gérez les cadeaux souhaités." />
      <WishlistManager initialItems={items} />
    </>
  );
}