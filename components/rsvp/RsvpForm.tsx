"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface FieldErrors {
  firstName?: string[];
  lastName?: string[];
  phone?: string[];
}

export function RsvpForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setGlobalError(null);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const payload = {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      phone: String(formData.get("phone") ?? ""),
    };

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.details) setErrors(data.details);
        else setGlobalError(data.error ?? "Une erreur est survenue");
        setSubmitting(false);
        return;
      }

      router.push(`/invitation/${data.identifier}?new=1`);
    } catch {
      setGlobalError("Impossible de contacter le serveur. Réessayez.");
      setSubmitting(false);
    }
  }

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
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#c9a043">
          <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" />
        </svg>
        <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold-500" />
      </div>

      <Field name="firstName" label="Prénom" required autoComplete="given-name" errors={errors.firstName} />
      <Field name="lastName" label="Nom" required autoComplete="family-name" errors={errors.lastName} />
      <Field
        name="phone"
        label="Téléphone"
        hint="Facultatif — pour recevoir votre QR par WhatsApp"
        autoComplete="tel"
        type="tel"
        errors={errors.phone}
      />

      {globalError && (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm p-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{globalError}</span>
        </div>
      )}

      <Button type="submit" variant="gold" size="lg" disabled={submitting} className="mt-2">
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
        Vos informations restent confidentielles. Le numéro de téléphone n'est
        jamais affiché publiquement.
      </p>
    </motion.form>
  );
}

interface FieldProps {
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
  type?: string;
  autoComplete?: string;
  errors?: string[];
}

function Field({
  name,
  label,
  required,
  hint,
  type = "text",
  autoComplete,
  errors,
}: FieldProps) {
  const hasError = errors && errors.length > 0;
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="text-[10px] tracking-[0.25em] text-royal-800/70 uppercase font-medium"
      >
        {label}
        {required && <span className="text-gold-600 ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className={cn(
          "h-12 px-4 bg-ivory-100 border rounded-sm text-royal-900 placeholder:text-royal-300 transition-all",
          "focus:outline-none focus:ring-2 focus:ring-gold-400/40 focus:border-gold-500 focus:bg-ivory-50",
          hasError ? "border-red-400 focus:ring-red-300" : "border-royal-200"
        )}
      />
      {hint && !hasError && (
        <span className="text-xs text-royal-800/50">{hint}</span>
      )}
      {hasError && <span className="text-xs text-red-600">{errors[0]}</span>}
    </div>
  );
}