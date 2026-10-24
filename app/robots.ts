// app/sitemap.ts
import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://loica-franck.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${APP_URL}/`, lastModified: now, priority: 1 },
    { url: `${APP_URL}/programme`, lastModified: now, priority: 0.8 },
    { url: `${APP_URL}/infos`, lastModified: now, priority: 0.8 },
    { url: `${APP_URL}/rsvp`, lastModified: now, priority: 0.9 },
  ];
}