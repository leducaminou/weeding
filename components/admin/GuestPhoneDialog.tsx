"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

interface Guest {
  id: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
}

interface Props {
  guest: Guest | null;
  onClose: () => void;
  onSent: (message: string) => void;
}

function toLocalPhone(phone: string | null) {
  const digits = phone?.replace(/\D/g, "") ?? "";
  return digits.startsWith("237") ? digits.slice(3) : digits;
}

export function GuestPhoneDialog({ guest, onClose, onSent }: Props) {
  const [phone, setPhone] = useState(toLocalPhone(guest?.phone ?? null));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!guest) return null;
  const selectedGuest = guest;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/guests/${selectedGuest.id}/resend-whatsapp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "L'envoi du QR code a échoué.");
        setSubmitting(false);
        return;
      }
      onSent("QR code envoyé par WhatsApp.");
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
          <h2 className="text-lg font-semibold text-slate-900">
            Envoyer le QR code
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {guest.firstName} {guest.lastName}
          </p>
          <div className="mt-5">
            <label
              htmlFor="qr-guest-phone"
              className="text-xs text-slate-500 uppercase tracking-wide"
            >
              Numéro WhatsApp camerounais
            </label>
            <input
              id="qr-guest-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="6XX XXX XXX"
              required
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500">
              9 chiffres sans indicatif (+237 sera ajouté automatiquement).
            </p>
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
              Envoyer le QR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
