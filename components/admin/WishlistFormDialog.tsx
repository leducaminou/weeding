"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

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

interface Props {
  open: boolean;
  item?: Item;
  onClose: () => void;
  onSaved: () => void;
}

export function WishlistFormDialog({ open, item, onClose, onSaved }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? "") || null,
      image: String(formData.get("image") ?? "") || null,
      url: String(formData.get("url") ?? "") || null,
      category: String(formData.get("category") ?? "") || null,
      priority: Number(formData.get("priority") ?? 0),
      position: Number(formData.get("position") ?? 0),
      active: formData.get("active") === "on",
    };

    try {
      const url = item
        ? `/api/admin/wishlist/${item.id}`
        : "/api/admin/wishlist";
      const method = item ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur");
        setSubmitting(false);
        return;
      }

      onSaved();
    } catch {
      setError("Erreur serveur");
      setSubmitting(false);
    }
  }

  const inputCls =
    "mt-1 w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={onSubmit} className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-5">
            {item ? "Modifier" : "Nouvel élément"}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide">
                Titre *
              </label>
              <input name="title" defaultValue={item?.title} required className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide">
                Description
              </label>
              <textarea
                name="description"
                defaultValue={item?.description ?? ""}
                rows={3}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide">
                Catégorie
              </label>
              <input name="category" defaultValue={item?.category ?? ""} className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide">
                Image (URL)
              </label>
              <input name="image" type="url" defaultValue={item?.image ?? ""} className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide">
                Lien (URL)
              </label>
              <input name="url" type="url" defaultValue={item?.url ?? ""} className={inputCls} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wide">
                  Position
                </label>
                <input
                  name="position"
                  type="number"
                  defaultValue={String(item?.position ?? 0)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wide">
                  Priorité
                </label>
                <input
                  name="priority"
                  type="number"
                  defaultValue={String(item?.priority ?? 0)}
                  className={inputCls}
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  id="active-wish"
                  name="active"
                  defaultChecked={item?.active ?? true}
                  className="h-4 w-4"
                />
                <label htmlFor="active-wish" className="text-sm text-slate-700">
                  Actif
                </label>
              </div>
            </div>
          </div>

          {error && <p className="mt-4 text-xs text-red-600 text-center">{error}</p>}

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 text-sm text-slate-600 hover:text-slate-900"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-10 px-4 bg-slate-900 text-white text-sm rounded-md hover:bg-slate-800 disabled:opacity-50 inline-flex items-center gap-2"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}