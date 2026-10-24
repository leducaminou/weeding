/**
 * Type partagé pour les événements côté admin.
 * Doit refléter exactement la forme retournée par Prisma après
 * sérialisation des Date en string (via unstable_cache ou .toISOString()).
 */
export interface AdminEvent {
  id: string;
  weddingId: string;
  title: string;
  description: string | null;
  date: string | Date;
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
  createdAt: string | Date;
  updatedAt: string | Date;
}