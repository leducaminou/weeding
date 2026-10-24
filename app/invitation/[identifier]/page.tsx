import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Section } from "@/components/ui/Section";
import { InvitationCard } from "@/components/invitation/InvitationCard";
import { InvitationService } from "@/services/InvitationService";
import { isValidIdentifier } from "@/lib/qr/identifier";
import { InvitationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mon invitation",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ identifier: string }>;
  searchParams: Promise<{ new?: string }>;
}

export default async function InvitationPage({
  params,
  searchParams,
}: PageProps) {
  const { identifier } = await params;
  const { new: isNew } = await searchParams;

  if (!isValidIdentifier(identifier)) notFound();

  const invitation = await InvitationService.findByIdentifier(identifier);
  if (!invitation) notFound();

  if (invitation.status === InvitationStatus.REVOKED) {
    return (
      <>
        <Header />
        <main className="pt-24">
          <Section className="min-h-[60svh] flex flex-col items-center justify-center text-center">
            <h1 className="font-serif text-3xl text-night-800">
              Invitation révoquée
            </h1>
            <p className="mt-4 text-sm text-night-700/70 max-w-md">
              Cette invitation n'est plus valide. Merci de contacter
              l'organisateur.
            </p>
          </Section>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="relative min-h-[100svh] pt-24 pb-16 bg-ivory-100 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          aria-hidden
          style={{
            background:
              "radial-gradient(circle at 30% 20%, rgba(242,205,72,0.08) 0%, transparent 40%), radial-gradient(circle at 70% 80%, rgba(250,234,228,0.4) 0%, transparent 40%)",
          }}
        />
        <Section className="relative">
          <InvitationCard
            firstName={invitation.guest.firstName}
            lastName={invitation.guest.lastName}
            identifier={invitation.identifier}
            qrUrl={invitation.qrCodeUrl}
            isNew={isNew === "1"}
          />
        </Section>
      </main>
      <Footer />
    </>
  );
}