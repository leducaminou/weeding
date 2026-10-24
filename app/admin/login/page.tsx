"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * La page utilise `useSearchParams()`.
 * Dans Next.js 15, cet hook DOIT être sous un `<Suspense>` boundary,
 * sinon Next suspend le rendu à l'infini et déclenche des redirections
 * en boucle.
 */

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <main className="min-h-[100svh] bg-royal-600 flex items-center justify-center p-5">
      <div className="w-full max-w-sm bg-white p-8 rounded-sm shadow-2xl flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gold-600" />
      </div>
    </main>
  );
}

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-deprecated
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Identifiants invalides");
        setSubmitting(false);
        return;
      }

      // Sécurité anti-boucle : on n'accepte `next` que si
      // - il commence par /admin
      // - il NE commence PAS par /admin/login
      const rawNext = search.get("next");
      const safeNext =
        rawNext &&
        rawNext.startsWith("/admin") &&
        !rawNext.startsWith("/admin/login")
          ? rawNext
          : "/admin";

      router.push(safeNext);
      router.refresh();
    } catch {
      setError("Erreur serveur. Réessayez.");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[100svh] bg-royal-600 flex items-center justify-center p-5">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-white p-8 rounded-sm shadow-2xl"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 rounded-full bg-royal-50 border border-gold-500/40 flex items-center justify-center text-gold-600">
            <Lock size={20} />
          </div>
          <h1 className="mt-4 font-serif text-2xl text-royal-700">
            Administration
          </h1>
          <p className="mt-1 text-xs tracking-[0.3em] text-gold-600 uppercase">
            Loïca & Franck
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="text-xs tracking-[0.15em] text-royal-800/70 uppercase"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1.5 w-full h-11 px-3 bg-white border border-royal-200 rounded-sm text-royal-900 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-500"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-xs tracking-[0.15em] text-royal-800/70 uppercase"
            >
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1.5 w-full h-11 px-3 bg-white border border-royal-200 rounded-sm text-royal-900 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-500"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 text-center">{error}</p>
          )}

          <Button
            type="submit"
            variant="gold"
            size="lg"
            disabled={submitting}
            className="mt-2"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Se connecter"
            )}
          </Button>
        </div>
      </form>
    </main>
  );
}