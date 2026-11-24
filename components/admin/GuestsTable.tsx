"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Eye,
  Download,
  Send,
  Ban,
  RotateCcw,
  Trash2,
  Loader2,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { GuestStatusBadge } from "./GuestStatusBadge";
import { AdminCard } from "./AdminCard";
import { ConfirmAttendanceDialog } from "./ConfirmAttendanceDialog";
import { GuestFormDialog } from "./GuestFormDialog";
import { GuestPhoneDialog } from "./GuestPhoneDialog";
import { formatDateFR, cn } from "@/lib/utils";
import type {  InvitationStatus } from "@prisma/client";
// import { InvitesFormDialog } from "./InvitesFormDialog";

interface GuestRow {
  id: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  createdAt: Date;
  invitation: {
    id: string;
    identifier: string;
    status: InvitationStatus;
    qrCodeUrl: string | null;
    whatsappMessages: { status: string; error: string | null }[];
  } | null;
}

interface Props {
  items: GuestRow[];
  total: number;
  page: number;
  totalPages: number;
  currentSearch: string;
  currentStatus: string;
}

interface BulkSendResponse {
  sent: number;
  failed: number;
  skipped: number;
  withoutPhone: number;
  hasMore: boolean;
  nextCursor: string | null;
}

export function GuestsTable({
  items,
  total,
  page,
  totalPages,
  currentSearch,
  currentStatus,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(currentSearch);
  const [busyId, setBusyId] = useState<string | null>();
  const [creatingGuest, setCreatingGuest] = useState(false);
  const [confirmingGuest, setConfirmingGuest] = useState<GuestRow | null>(null);
  const [sendingQrGuest, setSendingQrGuest] = useState<GuestRow | null>(null);
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkResult, setBulkResult] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (search === currentSearch) return;
      const params = new URLSearchParams(searchParams.toString());
      if (search) params.set("search", search);
      else params.delete("search");
      params.set("page", "1");
      startTransition(() => {
        router.push(`/admin/invites?${params.toString()}`);
      });
    }, 350);
    return () => clearTimeout(t);
  }, [search, currentSearch, router, searchParams]);

  function setStatus(status: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "ALL") params.delete("status");
    else params.set("status", status);
    params.set("page", "1");
    startTransition(() => router.push(`/admin/invites?${params.toString()}`));
  }

  function setPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    startTransition(() => router.push(`/admin/invites?${params.toString()}`));
  }

  async function action(id: string, path: string) {
    setBusyId(id);
    try {
      const res = await fetch(path, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        window.alert(data.error ?? "Impossible d'effectuer cette action.");
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function sendBulkQr() {
    if (
      !window.confirm(
        "Envoyer le QR code par WhatsApp à tous les invités ayant confirmé et renseigné un numéro ?"
      )
    ) {
      return;
    }

    setBulkSending(true);
    setBulkResult(null);
    let cursor: string | null = null;
    let sent = 0;
    let failed = 0;
    let skipped = 0;
    let withoutPhone = 0;
    let firstBatch = true;

    try {
      let hasMore = false;
      do {
        const res: Response = await fetch("/api/admin/guests/bulk-send-qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cursor }),
        });
        const data: BulkSendResponse & { error?: string } = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "L'envoi groupé a échoué.");
        }

        sent += data.sent;
        failed += data.failed;
        skipped += data.skipped;
        if (firstBatch) {
          withoutPhone = data.withoutPhone;
          firstBatch = false;
        }
        cursor = data.nextCursor;
        hasMore = data.hasMore;
      } while (hasMore);

      setBulkResult(
        `${sent} envoyé(s), ${failed} échec(s), ${withoutPhone} confirmé(s) sans numéro${
          skipped ? `, ${skipped} ignoré(s)` : ""
        }.`
      );
      router.refresh();
    } catch (error) {
      setBulkResult(
        error instanceof Error ? error.message : "L'envoi groupé a échoué."
      );
    } finally {
      setBulkSending(false);
    }
  }

  async function downloadQr(qrUrl: string, identifier: string) {
    try {
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invitation-${identifier}.webp`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(qrUrl, "_blank");
    }
  }

  async function deleteGuest(id: string, name: string) {
    if (!confirm(`Supprimer définitivement ${name} ? Action irréversible.`))
      return;
    setBusyId(id);
    try {
      await fetch(`/api/admin/guests/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  const STATUS_TABS = [
    { value: "ALL", label: "Tous" },
    { value: "PENDING", label: "À confirmer" },
    { value: "CONFIRMED", label: "Confirmés" },
    { value: "REVOKED", label: "Révoqués" },
    { value: "EXPIRED", label: "Expirés" },
    { value: "CHECKED_IN", label: "Check-in" },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un invité, un identifiant, un téléphone..."
            className="w-full h-10 pl-9 pr-3 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={cn(
                "px-3 py-2 text-xs rounded-md whitespace-nowrap transition-colors",
                currentStatus === tab.value ||
                  (!currentStatus && tab.value === "ALL")
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <div className="flex gap-2">
            <button
              onClick={sendBulkQr}
              disabled={bulkSending}
              className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-emerald-700 text-white text-sm rounded-md hover:bg-emerald-800 disabled:opacity-50"
            >
              {bulkSending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              {bulkSending ? "Envoi en cours..." : "Envoyer les QR confirmés"}
            </button>
            <button
              onClick={() => setCreatingGuest(true)}
              className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-slate-900 text-white text-sm rounded-md hover:bg-slate-800"
            >
              <Plus size={14} />
              Nouvel invité
            </button>
          </div>
          {bulkResult && (
            <p className="text-xs text-slate-600" role="status">
              {bulkResult}
            </p>
          )}
        </div>
      </div>

      <AdminCard className="overflow-hidden">
        {items.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-400">
            Aucun invité trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-3 font-medium">Invité</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">
                    Téléphone
                  </th>
                  <th className="px-4 py-3 font-medium">Identifiant</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">
                    WhatsApp
                  </th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">
                    Date
                  </th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((g) => {
                  const lastMsg = g.invitation?.whatsappMessages[0];
                  const busy = busyId === g.id;
                  return (
                    <tr key={g.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">
                         {g.firstName} {g.lastName }
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-slate-600">
                        {g.phone ?? <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {g.invitation ? (
                          <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 rounded">
                            {g.invitation.identifier}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {g.invitation ? (
                          <GuestStatusBadge status={g.invitation.status} />
                        ) : (
                          <GuestStatusBadge status="PENDING" />
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {lastMsg ? (
                          <span
                            className={cn(
                              "text-xs",
                              lastMsg.status === "SENT" && "text-emerald-600",
                              lastMsg.status === "PENDING" && "text-amber-600",
                              lastMsg.status === "FAILED" && "text-red-600"
                            )}
                          >
                            {lastMsg.status === "SENT"
                              ? "Envoyé"
                              : lastMsg.status === "PENDING"
                                ? "En attente"
                                : "Échec"}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-slate-500 text-xs">
                        {formatDateFR(g.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {busy ? (
                            <Loader2 size={14} className="animate-spin text-slate-400" />
                          ) : (
                            <>
                              <Link
                                href={`/admin/invites/${g.id}`}
                                className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                                title="Détail"
                              >
                                <Eye size={14} />
                              </Link>
                              {g.invitation?.qrCodeUrl && (
                                <button
                                  onClick={() =>
                                    downloadQr(
                                      g.invitation!.qrCodeUrl!,
                                      g.invitation!.identifier
                                    )
                                  }
                                  className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                                  title="Télécharger QR"
                                >
                                  <Download size={14} />
                                </button>
                              )}
                              {g.invitation?.status === "CONFIRMED" && (
                                <button
                                  onClick={() => setSendingQrGuest(g)}
                                  className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                                  title="Envoyer le QR code par WhatsApp"
                                >
                                  <Send size={14} />
                                </button>
                              )}
                              {(!g.invitation ||
                                g.invitation.status === "PENDING") && (
                                <button
                                  onClick={() => setConfirmingGuest(g)}
                                  className="p-1.5 rounded hover:bg-emerald-50 text-slate-500 hover:text-emerald-700"
                                  title="Confirmer la présence"
                                >
                                  <CheckCircle2 size={14} />
                                </button>
                              )}
                              {(g.invitation?.status === "CONFIRMED" ||
                                g.invitation?.status === "PENDING") && (
                                <button
                                  onClick={() =>
                                    action(g.id, `/api/admin/guests/${g.id}/revoke`)
                                  }
                                  className="p-1.5 rounded hover:bg-red-50 text-slate-500 hover:text-red-600"
                                  title="Révoquer"
                                >
                                  <Ban size={14} />
                                </button>
                              )}
                              {g.invitation?.status === "REVOKED" && (
                                <button
                                  onClick={() =>
                                    action(g.id, `/api/admin/guests/${g.id}/restore`)
                                  }
                                  className="p-1.5 rounded hover:bg-emerald-50 text-slate-500 hover:text-emerald-600"
                                  title="Restaurer"
                                >
                                  <RotateCcw size={14} />
                                </button>
                              )}
                              <button
                                onClick={() =>
                                  deleteGuest(
                                    g.id,
                                    `${g.firstName} ${g.lastName}`
                                  )
                                }
                                className="p-1.5 rounded hover:bg-red-50 text-slate-500 hover:text-red-600"
                                title="Supprimer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Page {page} sur {totalPages} — {total} invité(s)
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="px-2.5 py-1 border border-slate-200 rounded disabled:opacity-40 hover:border-slate-300"
              >
                Précédent
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="px-2.5 py-1 border border-slate-200 rounded disabled:opacity-40 hover:border-slate-300"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </AdminCard>

      <GuestFormDialog
        open={creatingGuest}
        onClose={() => setCreatingGuest(false)}
        onSaved={() => {
          setCreatingGuest(false);
          router.refresh();
        }}
      />
      <ConfirmAttendanceDialog
        key={confirmingGuest?.id ?? "none"}
        guest={confirmingGuest}
        onClose={() => setConfirmingGuest(null)}
        onSaved={(whatsappSent) => {
          setConfirmingGuest(null);
          router.refresh();
          if (whatsappSent === false) {
            window.alert(
              "Présence confirmée, mais l'envoi WhatsApp a échoué. Vérifiez la connexion puis renvoyez le QR."
            );
          } else if (whatsappSent === null) {
            window.alert(
              "Présence confirmée. Aucun numéro WhatsApp n'est renseigné ; le QR n'a pas été envoyé."
            );
          }
        }}
      />
      <GuestPhoneDialog
        key={sendingQrGuest?.id ?? "none"}
        guest={sendingQrGuest}
        onClose={() => setSendingQrGuest(null)}
        onSent={(message) => {
          setSendingQrGuest(null);
          router.refresh();
          window.alert(message);
        }}
      />
    </>
  );
}