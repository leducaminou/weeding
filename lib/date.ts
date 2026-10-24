/**
 * Helpers de conversion sûrs pour les dates.
 *
 * Contexte : Next.js `unstable_cache` sérialise les valeurs retournées en
 * JSON, ce qui transforme les `Date` en `string` ISO. Toute date lue depuis
 * un service caché doit donc être reconvertie avant tout appel à une méthode
 * `Date` (ex. `.toISOString()`).
 */

export function toDate(value: Date | string | number): Date {
  if (value instanceof Date) return value;
  return new Date(value);
}

export function toIso(value: Date | string | number): string {
  return toDate(value).toISOString();
}