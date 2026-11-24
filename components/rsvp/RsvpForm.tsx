"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { AlertCircle, CheckCircle2, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface GuestOption {
  id: string;
  fullName: string;
  alreadyConfirmed: boolean;
}

export function RsvpForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [guests, setGuests] = useState<GuestOption[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<GuestOption | null>(null);
  const [phone, setPhone] = useState("");
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    const search = query.trim();
    if (selectedGuest || search.length < 2) {
      setGuests([]);
      setSearching(false);
      setSearchError(null);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setSearching(true);
      setSearchError(null);
      try {
        const res = await fetch(
          `/api/rsvp/search?q=${encodeURIComponent(search)}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Recherche impossible.");
        setGuests(data.guests);
      } catch (error) {
        if (!controller.signal.aborted) {
          setGuests([]);
          setSearchError(
            error instanceof Error ? error.message : "Recherche impossible."
          );
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query, selectedGuest]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting || !selectedGuest || selectedGuest.alreadyConfirmed) return;
    setSubmitting(true);
    setGlobalError(null);

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId: selectedGuest.id,
          phone: phone.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setGlobalError(data.error ?? "Une erreur est survenue.");
        setSubmitting(false);
        return;
      }

      router.push(`/invitation/${data.identifier}?new=1`);
    } catch {
      setGlobalError("Impossible de contacter le serveur. Réessayez.");
      setSubmitting(false);
    }
  }

  const inputClass = cn(
    "h-12 w-full px-4 bg-ivory-100 border rounded-sm text-royal-900 placeholder:text-royal-300 transition-all",
    "focus:outline-none focus:ring-2 focus:ring-gold-400/40 focus:border-gold-500 focus:bg-ivory-50",
    "border-royal-200"
  );

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="relative flex flex-col gap-6 w-full max-w-md mx-auto p-8 bg-ivory-50 border border-gold-500/25 rounded-sm shadow-gold-lg"
      noValidate
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold-500" />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#c9a043" aria-hidden>
          <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" />
        </svg>
        <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold-500" />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="guest-search"
          className="text-[10px] tracking-[0.25em] text-royal-800/70 uppercase font-medium"
        >
          Rechercher votre nom
        </label>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-royal-400"
          />
          <input
            id="guest-search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={guests.length > 0}
            aria-controls="guest-search-results"
            autoComplete="off"
            maxLength={100}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedGuest(null);
              setPhone("");
              setGlobalError(null);
            }}
            placeholder="Saisissez votre prénom ou votre nom"
            className={cn(inputClass, "pl-11")}
          />
          {searching && (
            <Loader2
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-royal-400"
            />
          )}
          {guests.length > 0 && (
            <ul
              id="guest-search-results"
              role="listbox"
              className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto rounded-sm border border-gold-500/30 bg-ivory-50 shadow-lg"
            >
              {guests.map((guest) => (
                <li key={guest.id} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedGuest?.id === guest.id}
                    onClick={() => {
                      setSelectedGuest(guest);
                      setQuery(guest.fullName);
                      setGuests([]);
                    }}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm text-royal-900 hover:bg-gold-50"
                  >
                    <span>{guest.fullName}</span>
                    {guest.alreadyConfirmed && (
                      <span className="shrink-0 text-[10px] text-emerald-700">
                        Déjà confirmé
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {searchError ? (
          <span className="text-xs text-red-600">{searchError}</span>
        ) : query.trim().length >= 2 && !searching && guests.length === 0 && !selectedGuest ? (
          <span className="text-xs text-royal-800/50">
            Aucun invité trouvé. Vérifiez l&apos;orthographe ou contactez les organisateurs.
          </span>
        ) : (
          <span className="text-xs text-royal-800/50">
            Choisissez votre nom dans la liste des invités.
          </span>
        )}
      </div>

      {selectedGuest && (
        <div className="flex items-center justify-between gap-3 rounded-sm border border-gold-500/30 bg-gold-50/50 px-4 py-3">
          <span className="inline-flex items-center gap-2 text-sm text-royal-900">
            <CheckCircle2 size={16} className="text-gold-600" />
            {selectedGuest.fullName}
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedGuest(null);
              setQuery("");
              setPhone("");
            }}
            className="text-xs text-royal-700 underline underline-offset-2"
          >
            Modifier
          </button>
        </div>
      )}

      {selectedGuest?.alreadyConfirmed ? (
        <p className="text-sm text-emerald-700">
          Votre présence est déjà confirmée. Merci !
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="phone"
            className="text-[10px] tracking-[0.25em] text-royal-800/70 uppercase font-medium"
          >
            Téléphone WhatsApp <span className="normal-case">(facultatif)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="6XX XXX XXX"
            className={inputClass}
          />
          <span className="text-xs text-royal-800/50">
            9 chiffres sans indicatif (+237 sera ajouté automatiquement) pour recevoir votre QR code par WhatsApp.
          </span>
        </div>
      )}

      {globalError && (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm p-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{globalError}</span>
        </div>
      )}

      <Button
        type="submit"
        variant="gold"
        size="lg"
        disabled={submitting || !selectedGuest || selectedGuest.alreadyConfirmed}
        className="mt-2"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Confirmation...
          </>
        ) : (
          "Confirmer ma présence"
        )}
      </Button>

      <p className="text-xs text-royal-800/50 text-center leading-relaxed">
        Votre numéro WhatsApp est facultatif et ne sera jamais affiché publiquement.
      </p>
    </motion.form>
  );
}
