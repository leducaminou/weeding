import Link from "next/link";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  QrCode,
  MessageCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { StatsService } from "@/services/StatsService";
import { formatDateFR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, recentGuests, recentErrors] = await Promise.all([
    StatsService.getOverview(),
    StatsService.getRecentGuests(6),
    StatsService.getRecentErrors(4),
  ]);

  return (
    <>
      <AdminPageHeader
        title="Tableau de bord"
        description="Vue d'ensemble des invités, QR codes et messages WhatsApp."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard label="Invités" value={stats.guests.total} icon={<Users size={18} />} tone="slate" />
        <StatCard label="Confirmés" value={stats.guests.confirmed} icon={<CheckCircle2 size={18} />} tone="green" />
        <StatCard label="Révoqués" value={stats.guests.revoked} icon={<XCircle size={18} />} tone="red" />
        <StatCard label="Check-in" value={stats.guests.checkedIn} icon={<Clock size={18} />} tone="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="QR générés" value={stats.qr.generated} icon={<QrCode size={18} />} tone="slate" />
        <StatCard label="QR scannés" value={stats.qr.scanned} icon={<QrCode size={18} />} tone="green" />
        <StatCard
          label="WhatsApp envoyés"
          value={stats.whatsapp.sent}
          icon={<MessageCircle size={18} />}
          tone="green"
          secondary={
            stats.whatsapp.failed > 0
              ? `${stats.whatsapp.failed} échec(s)`
              : `${stats.whatsapp.pending} en attente`
          }
          secondaryTone={stats.whatsapp.failed > 0 ? "red" : "slate"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AdminCard className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">
              Derniers invités
            </h2>
            <Link
              href="/admin/invites"
              className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 transition-colors"
            >
              Voir tout
              <ArrowRight size={12} />
            </Link>
          </div>
          {recentGuests.length === 0 ? (
            <EmptyState message="Aucun invité pour le moment." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentGuests.map((guest) => (
                <li key={guest.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {guest.firstName} {guest.lastName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDateFR(guest.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {guest.invitation && (
                      <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                        {guest.invitation.identifier}
                      </span>
                    )}
                    {guest.invitation && (
                      <span
                        className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-medium ${
                          guest.invitation.status === "CONFIRMED"
                            ? "bg-emerald-50 text-emerald-700"
                            : guest.invitation.status === "REVOKED"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {guest.invitation.status}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard className="overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900 inline-flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-500" />
              Échecs WhatsApp
            </h2>
          </div>
          {recentErrors.length === 0 ? (
            <EmptyState message="Aucun échec." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentErrors.map((err) => (
                <li key={err.id} className="px-4 py-3">
                  <p className="text-xs font-medium text-slate-900 truncate">
                    {err.invitation?.guest.firstName}{" "}
                    {err.invitation?.guest.lastName ?? err.recipient}
                  </p>
                  <p className="text-xs text-red-600 mt-1 line-clamp-2">
                    {err.error ?? "Erreur inconnue"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
  secondary,
  secondaryTone = "slate",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "slate" | "green" | "red" | "blue";
  secondary?: string;
  secondaryTone?: "slate" | "red";
}) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
  };
  return (
    <AdminCard className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-500 uppercase tracking-wide">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 tabular-nums">
            {value}
          </p>
          {secondary && (
            <p
              className={`mt-1 text-xs ${
                secondaryTone === "red" ? "text-red-600" : "text-slate-500"
              }`}
            >
              {secondary}
            </p>
          )}
        </div>
        <div
          className={`h-9 w-9 rounded-md flex items-center justify-center shrink-0 ${tones[tone]}`}
        >
          {icon}
        </div>
      </div>
    </AdminCard>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="text-xs text-slate-400">{message}</p>
    </div>
  );
}