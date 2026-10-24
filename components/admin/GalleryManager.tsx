"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminCard";

export interface GalleryItem {
  id: string;
  url: string;
  alt: string | null;
  position: number;
  active: boolean;
}

interface GalleryManagerProps {
  initialItems: GalleryItem[];
}

export function GalleryManager({ initialItems }: GalleryManagerProps) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!url.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          alt: alt.trim() || null,
          position: initialItems.length,
          active: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Impossible d'ajouter l'image");
        return;
      }

      setUrl("");
      setAlt("");
      router.refresh();
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette photo ?")) return;

    setBusy(id);
    setError(null);

    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Impossible de supprimer l'image");
        return;
      }
      router.refresh();
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setBusy(null);
    }
  }

  const inputCls =
    "w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-600/10 focus:border-royal-400";

  return (
    <>
      <AdminCard className="p-4 mb-4">
        <form onSubmit={add} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="URL de l'image (ex. /principal.jpeg)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className={inputCls}
          />
          <input
            type="text"
            placeholder="Texte alternatif (optionnel)"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            className={inputCls}
          />
          <button
            type="submit"
            disabled={submitting}
            className="h-10 px-4 bg-royal-600 text-white text-sm rounded-md hover:bg-royal-700 disabled:opacity-50 inline-flex items-center justify-center gap-2 shrink-0"
          >
            {submitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <Plus size={14} />
                Ajouter
              </>
            )}
          </button>
        </form>
        <p className="mt-2 text-xs text-slate-500">
          Astuce : les images du dossier <code>/public</code> peuvent être
          référencées directement (ex. <code>/principal.jpeg</code>,{" "}
          <code>/img2.jpeg</code>).
        </p>
      </AdminCard>

      {error && (
        <div className="mb-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {initialItems.length === 0 ? (
        <AdminCard className="p-10 text-center text-sm text-slate-400">
          Aucune photo.
        </AdminCard>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {initialItems.map((item) => (
            <AdminCard
              key={item.id}
              className="overflow-hidden relative group"
            >
              <div className="relative aspect-square bg-slate-100">
                <Image
                  src={item.url}
                  alt={item.alt ?? ""}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                  unoptimized={!item.url.startsWith("/")}
                />
              </div>
              <button
                onClick={() => remove(item.id)}
                disabled={busy === item.id}
                className="absolute top-2 right-2 h-8 w-8 rounded-md bg-white/90 backdrop-blur flex items-center justify-center text-slate-600 hover:text-red-600 hover:bg-white transition-colors shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Supprimer"
                aria-label="Supprimer l'image"
              >
                {busy === item.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            </AdminCard>
          ))}
        </div>
      )}
    </>
  );
}