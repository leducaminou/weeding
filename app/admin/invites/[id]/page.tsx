import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail, QrCode } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { GuestStatusBadge } from "@/components/admin/GuestStatusBadge";
import { GuestAdminService } from "@/services/GuestAdminService";
import { formatDateFR } from "@/lib/utils";

export const metadata: Metadata = { title: "Détail invité" };
export const dynamic = "force-dynamic";

export default async function AdminGuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guest = await GuestAdminService.getById(id);
  if (!guest) notFound();

  const inv = guest.invitation;

  return (
    <>
      <Link
        href="/admin/invites"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-4"
      >
        <ArrowLeft size={12} />
        Retour aux invités
      </Link>
      <AdminPageHeader
        title={`${guest.firstName} ${guest.lastName}`}
        description={`Inscrit le ${formatDateFR(guest.createdAt)}`}
        actions={inv ? <GuestStatusBadge status={inv.status} /> : undefined}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AdminCard className="p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">
            Informations
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs text-slate-500 uppercase tracking-wide">
                Prénom
              </dt>
              <dd className="mt-1 text-slate-900">{guest.firstName}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 uppercase tracking-wide">
                Nom
              </dt>
              <dd className="mt-1 text-slate-900">{guest.lastName}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 uppercase tracking-wide">
                Téléphone
              </dt>
              <dd className="mt-1 text-slate-900 inline-flex items-center gap-2">
                {guest.phone ? (
                  <>
                    <Phone size={12} className="text-slate-400" />
                    {guest.phone}
                  </>
                ) : (
                  <span className="text-slate-400">Non renseigné</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 uppercase tracking-wide">
                Email
              </dt>
              <dd className="mt-1 text-slate-900 inline-flex items-center gap-2">
                {guest.email ? (
                  <>
                    <Mail size={12} className="text-slate-400" />
                    {guest.email}
                  </>
                ) : (
                  <span className="text-slate-400">Non renseigné</span>
                )}
              </dd>
            </div>
          </dl>
        </AdminCard>

        <AdminCard className="p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4 inline-flex items-center gap-2">
            <QrCode size={14} />
            Invitation
          </h2>
          {inv ? (
            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] tracking-[0.3em] text-slate-500 uppercase">
                Identifiant
              </span>
              <p className="mt-1 font-mono text-xl tracking-[0.2em] text-slate-900">
                {inv.identifier}
              </p>
              {inv.qrCodeUrl && (
                <div className="mt-4 p-2 bg-white border border-slate-200 rounded">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={inv.qrCodeUrl}
                    alt={`QR ${inv.identifier}`}
                    width={180}
                    height={180}
                    className="block"
                  />
                </div>
              )}
              <div className="mt-4 text-xs text-slate-500">
                Généré le{" "}
                {inv.qrGeneratedAt ? formatDateFR(inv.qrGeneratedAt) : "—"}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Aucune invitation associée.</p>
          )}
        </AdminCard>

        {inv && inv.whatsappMessages.length > 0 && (
          <AdminCard className="p-6 lg:col-span-2">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">
              Messages WhatsApp
            </h2>
            <ul className="divide-y divide-slate-100 -mx-2">
              {inv.whatsappMessages.map((m) => (
                <li key={m.id} className="px-2 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">
                        {m.type === "GUEST_INVITATION"
                          ? "Invitation invité"
                          : "Notification admin"}{" "}
                        → {m.recipient}
                      </p>
                      <p className="mt-1 text-sm text-slate-700 whitespace-pre-line line-clamp-3">
                        {m.content}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        m.status === "SENT"
                          ? "bg-emerald-50 text-emerald-700"
                          : m.status === "PENDING"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                  {m.error && (
                    <p className="mt-1 text-xs text-red-600">{m.error}</p>
                  )}
                </li>
              ))}
            </ul>
          </AdminCard>
        )}
      </div>
    </>
  );
}