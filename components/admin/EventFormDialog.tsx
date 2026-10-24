"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toDate } from "@/lib/date";
import type { AdminEvent } from "@/lib/types/event";

interface EventFormDialogProps {
  open: boolean;
  event?: AdminEvent;
  onClose: () => void;
  onSaved: () => void;
}

export function EventFormDialog({
  open,
  event,
  onClose,
  onSaved,
}: EventFormDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!open) return null;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: String(fd.get("title") ?? ""),
      description: String(fd.get("description") ?? "") || null,
      date: new Date(String(fd.get("date") ?? "")).toISOString(),
      time: String(fd.get("time") ?? ""),
      endTime: String(fd.get("endTime") ?? "") || null,
      location: String(fd.get("location") ?? ""),
      address: String(fd.get("address") ?? "") || null,
      mapsUrl: String(fd.get("mapsUrl") ?? "") || null,
      position: Number(fd.get("position") ?? 0),
      active: fd.get("active") === "on",
      dressCode: String(fd.get("dressCode") ?? "") || null,
      dressCodeNote: String(fd.get("dressCodeNote") ?? "") || null,
      photoSession: String(fd.get("photoSession") ?? "") || null,
    };
    try {
      const url = event
        ? `/api/admin/events/${event.id}`
        : "/api/admin/events";
      const method = event ? "PATCH" : "POST";
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
  const dateValue = event
    ? toDate(event.date).toISOString().slice(0, 10)
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={onSubmit} className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-5">
            {event ? "Modifier l'événement" : "Nouvel événement"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide">
                Titre *
              </label>
              <input
                name="title"
                defaultValue={event?.title}
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
                defaultValue={event?.description ?? ""}
                rows={3}
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wide">
                  Date *
                </label>
                <input
                  name="date"
                  type="date"
                  defaultValue={dateValue}
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wide">
                  Heure début *
                </label>
                <input
                  name="time"
                  defaultValue={event?.time}
                  placeholder="10h00"
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wide">
                  Heure fin
                </label>
                <input
                  name="endTime"
                  defaultValue={event?.endTime ?? ""}
                  placeholder="18h00"
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide">
                Lieu *
              </label>
              <input
                name="location"
                defaultValue={event?.location}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide">
                Adresse
              </label>
              <input
                name="address"
                defaultValue={event?.address ?? ""}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide">
                Lien Google Maps
              </label>
              <input
                name="mapsUrl"
                type="url"
                defaultValue={event?.mapsUrl ?? ""}
                className={inputCls}
              />
            </div>

            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                Dress code (optionnel)
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500">Dress code</label>
                  <input
                    name="dressCode"
                    defaultValue={event?.dressCode ?? ""}
                    placeholder="Ex : Bleu & Blanc"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">
                    Note dress code
                  </label>
                  <textarea
                    name="dressCodeNote"
                    defaultValue={event?.dressCodeNote ?? ""}
                    rows={2}
                    placeholder="Explication du dress code"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide">
                Séance photo (optionnel)
              </label>
              <input
                name="photoSession"
                defaultValue={event?.photoSession ?? ""}
                placeholder="Ex : 1h de séance photo"
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
                  defaultValue={String(event?.position ?? 0)}
                  className={inputCls}
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  defaultChecked={event?.active ?? true}
                  className="h-4 w-4"
                />
                <label htmlFor="active" className="text-sm text-slate-700">
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