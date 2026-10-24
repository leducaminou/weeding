"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, GripVertical } from "lucide-react";
import { formatDateFR } from "@/lib/utils";
import { AdminCard } from "./AdminCard";
import { EventFormDialog } from "./EventFormDialog";
import type { AdminEvent } from "@/lib/types/event";

interface EventsManagerProps {
  initialItems: AdminEvent[];
}

export function EventsManager({ initialItems }: EventsManagerProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<AdminEvent | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  async function remove(id: string, title: string) {
    if (!confirm(`Supprimer "${title}" ?`)) return;
    setBusy(id);
    try {
      await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 h-10 px-4 bg-slate-900 text-white text-sm rounded-md hover:bg-slate-800"
        >
          <Plus size={14} />
          Nouvel événement
        </button>
      </div>

      {initialItems.length === 0 ? (
        <AdminCard className="p-10 text-center text-sm text-slate-400">
          Aucun événement.
        </AdminCard>
      ) : (
        <div className="space-y-3">
          {initialItems.map((item) => (
            <AdminCard key={item.id} className="p-4 flex items-start gap-4">
              <GripVertical size={16} className="text-slate-300 mt-1 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-slate-900">{item.title}</h3>
                  {!item.active && (
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      Inactif
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDateFR(item.date)} — {item.time}
                  {item.endTime ? ` – ${item.endTime}` : ""} — {item.location}
                </p>
                {item.description && (
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                    {item.description}
                  </p>
                )}
                {item.dressCode && (
                  <p className="mt-1 text-xs text-amber-700">
                    Dress code : {item.dressCode}
                  </p>
                )}
                {item.photoSession && (
                  <p className="mt-1 text-xs text-blue-700">
                    {item.photoSession}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {busy === item.id ? (
                  <Loader2 size={14} className="animate-spin text-slate-400" />
                ) : (
                  <>
                    <button
                      onClick={() => setEditing(item)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => remove(item.id, item.title)}
                      className="p-1.5 rounded hover:bg-red-50 text-slate-500 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      <EventFormDialog
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={() => {
          setCreating(false);
          router.refresh();
        }}
      />
      <EventFormDialog
        open={!!editing}
        event={editing ?? undefined}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          router.refresh();
        }}
      />
    </>
  );
}