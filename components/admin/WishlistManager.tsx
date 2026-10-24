"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, ExternalLink } from "lucide-react";
import { AdminCard } from "./AdminCard";
import { WishlistFormDialog } from "./WishlistFormDialog";

interface Item {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  url: string | null;
  category: string | null;
  priority: number;
  position: number;
  active: boolean;
}

export function WishlistManager({ initialItems }: { initialItems: Item[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Item | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  async function remove(id: string, title: string) {
    if (!confirm(`Supprimer "${title}" ?`)) return;
    setBusy(id);
    try {
      await fetch(`/api/admin/wishlist/${id}`, { method: "DELETE" });
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
          Nouvel élément
        </button>
      </div>
      {initialItems.length === 0 ? (
        <AdminCard className="p-10 text-center text-sm text-slate-400">
          Aucun élément.
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {initialItems.map((item) => (
            <AdminCard key={item.id} className="p-4 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {item.category && (
                    <span className="text-[10px] uppercase tracking-wide text-slate-400">
                      {item.category}
                    </span>
                  )}
                  <h3 className="font-medium text-slate-900 text-sm leading-snug">
                    {item.title}
                  </h3>
                </div>
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
                        onClick={() => remove(item.id, item.title)}
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
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1"
                >
                  Voir le lien
                  <ExternalLink size={11} />
                </a>
              )}
              {!item.active && (
                <span className="mt-3 self-start text-[10px] uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  Inactif
                </span>
              )}
            </AdminCard>
          ))}
        </div>
      )}
      <WishlistFormDialog
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={() => {
          setCreating(false);
          router.refresh();
        }}
      />
      <WishlistFormDialog
        open={!!editing}
        item={editing ?? undefined}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          router.refresh();
        }}
      />
    </>
  );
}