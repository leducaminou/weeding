// ─── QR ───
export const QR_SIZE = 320;
export const QR_FORMAT = "webp" as const;

// ─── Identifiant ───
export const IDENTIFIER_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const IDENTIFIER_REGEX = /^[A-Z]{2}[0-9]{2}$/;
export const IDENTIFIER_MAX_ATTEMPTS = 10;

// ─── Cleanup QR ───
// Après le 15 janvier 2027 → 16 janvier 2027 à 00:00 UTC.
export const QR_CLEANUP_DATE = new Date("2027-01-16T00:00:00Z");

// ─── RSVP ───
export const RSVP_RATE_LIMIT = { max: 5, windowMs: 60_000 };
export const RSVP_DUPLICATE_WINDOW_MS = 5 * 60_000;

// ─── Auth ───
export const SESSION_COOKIE_NAME = "lf_session";
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
export const LOGIN_RATE_LIMIT = { max: 5, windowMs: 15 * 60_000 };