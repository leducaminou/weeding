import { InvitationStatus } from "@prisma/client";

const MAP = {
  CONFIRMED: { label: "Confirmé", class: "bg-emerald-50 text-emerald-700" },
  REVOKED: { label: "Révoqué", class: "bg-red-50 text-red-700" },
  EXPIRED: { label: "Expiré", class: "bg-amber-50 text-amber-700" },
  CHECKED_IN: { label: "Check-in", class: "bg-blue-50 text-blue-700" },
} as const;

export function GuestStatusBadge({ status }: { status: InvitationStatus }) {
  const entry = MAP[status];
  return (
    <span
      className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-medium ${entry.class}`}
    >
      {entry.label}
    </span>
  );
}