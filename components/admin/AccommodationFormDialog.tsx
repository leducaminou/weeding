"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

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

export function AccommodationFormDialog({
  open,
  accommodation,
  onClose,
  onSaved,
}: {
  open: boolean;
  accommodation?: Accommodation;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!open) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const phones = String(fd.get("phones") ?? "")
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);
    const payload = {
      name: String(fd.get("name") ?? ""),
      description: String(fd.get("description") ?? "") || null,
      address: String(fd.get("address") ?? ""),
      phones,
      image: String(fd.get("image") ?? "") || null,
      link: String(fd.get("link") ?? "") || null,
      position: Number(fd.get("position") ?? 0),
      active: fd.get("active") === "on",
    };
    try {
      const url = accommodation
        ? `/api/admin/accommodations/${accommodation.id}`
        : "/api/admin/accommodations";
      const method = accommodation ? "PATCH" : "POST";
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
            {accommodation ? "Modifier" : "Nouvel hébergement"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide">
                Nom *
              </label>
              <input
                name="name"
                defaultValue={accommodation?.name}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide">
                Description
              </label>
              <textarea
                name="description"
                defaultValue={accommodation?.description ?? ""}
                rows={3}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide">
                Adresse *
              </label>
              <input
                name="address"
                defaultValue={accommodation?.address}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide">
                Téléphones (un par ligne)
              </label>
              <textarea
                name="phones"
                defaultValue={accommodation?.phones.join("\n") ?? ""}
                rows={3}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide">
                Image (URL)
              </label>
              <input
                name="image"
                type="url"
                defaultValue={accommodation?.image ?? ""}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide">
                Lien (URL)
              </label>
              <input
                name="link"
                type="url"
                defaultValue={accommodation?.link ?? ""}
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wide">
                  Position
                </label>
                <input
                  name="position"
                  type="number"
                  defaultValue={String(accommodation?.position ?? 0)}
                  className={inputCls}
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  id="active-acc"
                  name="active"
                  defaultChecked={accommodation?.active ?? true}
                  className="h-4 w-4"
                />
                <label htmlFor="active-acc" className="text-sm text-slate-700">
                  Actif
                </label>
              </div>
            </div>
          </div>
          {error && (
            <p className="mt-4 text-xs text-red-600 text-center">{error}</p>
          )}
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