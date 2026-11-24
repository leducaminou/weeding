"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function GuestFormDialog({ open, onClose, onSaved }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const formData = new FormData(event.currentTarget);

    try {
      const res = await fetch("/api/admin/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: String(formData.get("firstName") ?? ""),
          lastName: String(formData.get("lastName") ?? ""),
          phone: String(formData.get("phone") ?? "") || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Impossible d'ajouter cet invité.");
        setSubmitting(false);
        return;
      }
      onSaved();
    } catch {
      setError("Impossible de contacter le serveur. Réessayez.");
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-1 w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
        <form onSubmit={onSubmit} className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-5">
            Ajouter un invité
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="guest-first-name" className="text-xs text-slate-500 uppercase tracking-wide">
                Nom affiché / prénom *
              </label>
              <input
                id="guest-first-name"
                name="firstName"
                required
                maxLength={60}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="guest-last-name" className="text-xs text-slate-500 uppercase tracking-wide">
                Nom de famille
              </label>
              <input
                id="guest-last-name"
                name="lastName"
                maxLength={60}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="guest-phone" className="text-xs text-slate-500 uppercase tracking-wide">
                Numéro WhatsApp camerounais (facultatif)
              </label>
              <input
                id="guest-phone"
                name="phone"
                type="tel"
                placeholder="6XX XXX XXX"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500">
                9 chiffres sans indicatif (+237 sera ajouté automatiquement).
              </p>
            </div>
          </div>
          {error && <p className="mt-4 text-xs text-red-600">{error}</p>}
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
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
