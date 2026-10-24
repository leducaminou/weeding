import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { InvitationService } from "@/services/InvitationService";
import { isValidIdentifier } from "@/lib/qr/identifier";
import { InvitationStatus } from "@prisma/client";
import { SITE } from "@/config/site";
import { StarField } from "@/components/ui/StarField";
import { CelestialOrnament } from "@/components/ui/CelestialOrnament";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vérification d'invitation",
  robots: { index: false, follow: false, nocache: true },
};

interface PageProps {
  params: Promise<{ identifier: string }>;
}

export default async function QrPage({ params }: PageProps) {
  const { identifier } = await params;
  if (!isValidIdentifier(identifier)) notFound();

  const invitation = await InvitationService.findByIdentifier(identifier);

  if (!invitation) {
    return (
      <StatusScreen
        icon="error"
        title="Invitation introuvable"
        subtitle="Cet identifiant ne correspond à aucune invitation."
      />
    );
  }

  if (invitation.status === InvitationStatus.REVOKED) {
    return (
      <StatusScreen
        icon="error"
        title="Invitation révoquée"
        subtitle="Cette invitation n'est plus valide."
      />
    );
  }

  if (invitation.status === InvitationStatus.EXPIRED) {
    return (
      <StatusScreen
        icon="warning"
        title="Invitation expirée"
        subtitle="Cette invitation n'est plus valide."
      />
    );
  }

  return (
    <StatusScreen
      icon="success"
      title="Il est invité"
      name={`${invitation.guest.firstName} ${invitation.guest.lastName}`}
      identifier={invitation.identifier}
      subtitle="Nous sommes heureux de vous compter parmi nous pour célébrer cette union."
    />
  );
}

interface StatusScreenProps {
  icon: "success" | "error" | "warning";
  title: string;
  subtitle: string;
  name?: string;
  identifier?: string;
}

function StatusScreen({
  icon,
  title,
  subtitle,
  name,
  identifier,
}: StatusScreenProps) {
  const Icon =
    icon === "success" ? CheckCircle2 : icon === "warning" ? Clock : XCircle;

  const color =
    icon === "success"
      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
      : icon === "warning"
        ? "text-amber-600 bg-amber-50 border-amber-200"
        : "text-red-600 bg-red-50 border-red-200";

  return (
    <main className="relative min-h-[100svh] royal-bg text-ivory-50 flex items-center justify-center p-5 overflow-hidden">
      <StarField count={14} />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(220,184,91,0.1) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative w-full max-w-sm bg-ivory-50 text-royal-900 rounded-sm overflow-hidden shadow-gold-lg border border-gold-500/30">
        <div className="relative bg-royal-600 text-ivory-50 text-center px-6 py-6 overflow-hidden">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#dcb85b" className="mx-auto mb-2">
            <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" />
          </svg>
          <p className="font-serif text-2xl">
            {SITE.couple.bride}{" "}
            <span className="gold-text italic font-light">&</span>{" "}
            {SITE.couple.groom}
          </p>
          <p className="mt-2 text-[10px] tracking-[0.4em] text-gold-300 uppercase">
            Invitation
          </p>
        </div>

        <div className="p-8 flex flex-col items-center text-center">
          <div
            className={`h-16 w-16 rounded-full border flex items-center justify-center ${color}`}
          >
            <Icon size={28} />
          </div>

          {name && (
            <h1 className="mt-6 font-serif text-2xl text-royal-800">{name}</h1>
          )}

          {identifier && (
            <p className="mt-1 font-mono text-sm tracking-[0.3em] text-gold-600">
              {identifier}
            </p>
          )}

          <CelestialOrnament className="my-5" />

          <p className="text-lg font-medium text-royal-800">{title}</p>

          <p className="mt-3 text-sm text-royal-800/70 leading-relaxed max-w-xs">
            {subtitle}
          </p>
        </div>
      </div>
    </main>
  );
}