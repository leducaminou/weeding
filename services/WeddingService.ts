import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export interface CachedWedding {
  id: string;
  slug: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  tagline: string | null;
  heroImage: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  settings: { id: string; weddingId: string; key: string; value: string; updatedAt: string }[];
}

export interface CachedEvent {
  id: string;
  weddingId: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  endTime: string | null;
  location: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  mapsUrl: string | null;
  position: number;
  active: boolean;
  dressCode: string | null;
  dressCodeNote: string | null;
  photoSession: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CachedAccommodation {
  id: string;
  weddingId: string;
  name: string;
  description: string | null;
  address: string;
  phones: string[];
  image: string | null;
  link: string | null;
  position: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CachedWishlistItem {
  id: string;
  weddingId: string;
  title: string;
  description: string | null;
  image: string | null;
  url: string | null;
  category: string | null;
  priority: number;
  position: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CachedGalleryItem {
  id: string;
  weddingId: string;
  url: string;
  alt: string | null;
  position: number;
  active: boolean;
  createdAt: string;
}

export const getWedding = unstable_cache(
  async (): Promise<CachedWedding | null> => {
    const w = await prisma.wedding.findFirst({
      where: { active: true },
      include: { settings: true },
    });
    if (!w) return null;

    return {
      ...w,
      weddingDate: w.weddingDate.toISOString(),
      createdAt: w.createdAt.toISOString(),
      updatedAt: w.updatedAt.toISOString(),
      settings: w.settings.map((s) => ({
        ...s,
        updatedAt: s.updatedAt.toISOString(),
      })),
    };
  },
  ["wedding"],
  { tags: ["wedding"], revalidate: 3600 }
);

export const getEvents = unstable_cache(
  async (): Promise<CachedEvent[]> => {
    const w = await getWedding();
    if (!w) return [];

    const items = await prisma.event.findMany({
      where: { weddingId: w.id, active: true },
      orderBy: { position: "asc" },
    });

    return items.map((e) => ({
      ...e,
      date: e.date.toISOString(),
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    }));
  },
  ["events"],
  { tags: ["events"], revalidate: 3600 }
);

export const getAccommodations = unstable_cache(
  async (): Promise<CachedAccommodation[]> => {
    const w = await getWedding();
    if (!w) return [];

    const items = await prisma.accommodation.findMany({
      where: { weddingId: w.id, active: true },
      orderBy: { position: "asc" },
    });

    return items.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }));
  },
  ["accommodations"],
  { tags: ["accommodations"], revalidate: 3600 }
);

export const getWishlist = unstable_cache(
  async (): Promise<CachedWishlistItem[]> => {
    const w = await getWedding();
    if (!w) return [];

    const items = await prisma.wishlistItem.findMany({
      where: { weddingId: w.id, active: true },
      orderBy: [{ position: "asc" }, { priority: "desc" }],
    });

    return items.map((wi) => ({
      ...wi,
      createdAt: wi.createdAt.toISOString(),
      updatedAt: wi.updatedAt.toISOString(),
    }));
  },
  ["wishlist"],
  { tags: ["wishlist"], revalidate: 3600 }
);

export const getGallery = unstable_cache(
  async (): Promise<CachedGalleryItem[]> => {
    const w = await getWedding();
    if (!w) return [];

    const items = await prisma.galleryItem.findMany({
      where: { weddingId: w.id, active: true },
      orderBy: { position: "asc" },
    });

    return items.map((g) => ({
      ...g,
      createdAt: g.createdAt.toISOString(),
    }));
  },
  ["gallery"],
  { tags: ["gallery"], revalidate: 3600 }
);

export function getSetting(
  settings: { key: string; value: string }[],
  key: string,
  fallback = ""
): string {
  return settings.find((s) => s.key === key)?.value ?? fallback;
}