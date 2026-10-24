"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, MapPin, Phone } from "lucide-react";
import { AdminCard } from "./AdminCard";
import { AccommodationFormDialog } from "./AccommodationFormDialog";

interface Accommodation {
  id: string;
  name: string;
  description: string | null;
  address: string;
  phones: string[];
  image: string | null;
  link: string | null;
  position: number;
  active: boolean;
}

export function AccommodationsManager({
  initialItems,
}: {
  initialItems: Accommodation[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Accommodation | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  async function remove(id: string, name: string) {
    if (!confirm(`Supprimer "${name}" ?`)) return;
    setBusy(id);
    try {
      await fetch(`/api/admin/accommodations/${id}`, { method: "DELETE" });
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
          Nouvel hébergement
        </button>
      </div>
      {initialItems.length === 0 ? (
        <AdminCard className="p-10 text-center text-sm text-slate-400">
          Aucun hébergement.
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {initialItems.map((item) => (
            <AdminCard key={item.id} className="p-4 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-slate-900 text-sm leading-snug pr-2">
                  {item.name}
                </h3>
                <div className="flex items-center gap-0.5 shrink-0">
                  {busy === item.id ? (
                    <Loader2 size={14} className="animate-spin text-slate-400" />
                  ) : (
                    <>
                      <button
                        onClick={() => setEditing(item)}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => remove(item.id, item.name)}
                        className="p-1.5 rounded hover:bg-red-50 text-slate-500 hover:text-red-600"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              {item.description && (
                <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                  {item.description}
                </p>
              )}
              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <p className="flex items-start gap-1.5">
                  <MapPin size={11} className="text-slate-400 mt-0.5 shrink-0" />
                  {item.address}
                </p>
                {item.phones.length > 0 && (
                  <p className="flex items-start gap-1.5">
                    <Phone size={11} className="text-slate-400 mt-0.5 shrink-0" />
                    <span>{item.phones.join(" · ")}</span>
                  </p>
                )}
              </div>
              {!item.active && (
                <span className="mt-3 self-start text-[10px] uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  Inactif
                </span>
              )}
            </AdminCard>
          ))}
        </div>
      )}
      <AccommodationFormDialog
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={() => {
          setCreating(false);
          router.refresh();
        }}
      />
      <AccommodationFormDialog
        open={!!editing}
        accommodation={editing ?? undefined}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          router.refresh();
        }}
      />
    </>
  );
}