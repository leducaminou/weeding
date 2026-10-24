import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { GuestsTable } from "@/components/admin/GuestsTable";
import { GuestAdminService } from "@/services/GuestAdminService";
import type { InvitationStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Invités" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

export default async function AdminInvitesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? "1"));
  const status = (sp.status ?? "ALL") as InvitationStatus | "ALL";

  const { items, total, totalPages } = await GuestAdminService.list({
    search: sp.search,
    status,
    page,
    pageSize: 20,
  });

  return (
    <>
      <AdminPageHeader
        title="Invités"
        description={`${total} invité(s) au total`}
      />
      <GuestsTable
        items={items}
        total={total}
        page={page}
        totalPages={totalPages}
        currentSearch={sp.search ?? ""}
        currentStatus={status}
      />
    </>
  );
}