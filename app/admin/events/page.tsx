import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EventsManager } from "@/components/admin/EventsManager";
import type { AdminEvent } from "@/lib/types/event";

export const metadata: Metadata = { title: "Programme" };
export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { position: "asc" },
  });

  // Mapping explicite → AdminEvent (les Date deviennent string)
  const items: AdminEvent[] = events.map((e) => ({
    id: e.id,
    weddingId: e.weddingId,
    title: e.title,
    description: e.description ?? null,
    date: e.date.toISOString(),
    time: e.time,
    endTime: e.endTime ?? null,
    location: e.location,
    address: e.address ?? null,
    latitude: e.latitude ?? null,
    longitude: e.longitude ?? null,
    mapsUrl: e.mapsUrl ?? null,
    position: e.position,
    active: e.active,
    dressCode: e.dressCode ?? null,
    dressCodeNote: e.dressCodeNote ?? null,
    photoSession: e.photoSession ?? null,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }));

  return (
    <>
      <AdminPageHeader
        title="Programme"
        description="Gérez les événements du mariage."
      />
      <EventsManager initialItems={items} />
    </>
  );
}