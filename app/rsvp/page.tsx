import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Section } from "@/components/ui/Section";
import { RsvpForm } from "@/components/rsvp/RsvpForm";
import { StarField } from "@/components/ui/StarField";
import { CelestialOrnament } from "@/components/ui/CelestialOrnament";

export const metadata: Metadata = {
  title: "Je serai là",
  description: "Confirmez votre présence au mariage de Loïca & Franck.",
  robots: { index: false, follow: false },
};

export default function RsvpPage() {
  return (
    <>
      <Header />
      <main className="relative min-h-[100svh] pt-24 pb-16 royal-bg overflow-hidden">
        <StarField count={12} />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(220,184,91,0.08) 0%, transparent 70%)",
          }}
          aria-hidden
        />

        <Section className="relative flex flex-col justify-center">
          <div className="flex flex-col items-center text-center mb-10">
            <span className="text-xs tracking-[0.5em] text-gold-300 uppercase">
              RSVP
            </span>
            <h1 className="mt-4 font-serif text-5xl sm:text-6xl text-ivory-50">
              Je serai là
            </h1>
            <CelestialOrnament className="my-6" />
            <p className="max-w-md text-sm sm:text-base text-ivory-100/80 leading-relaxed">
              Remplissez ces quelques informations pour confirmer votre
              présence. Vous recevrez immédiatement votre invitation personnelle
              et votre QR code.
            </p>
          </div>

          <RsvpForm />
        </Section>
      </main>
      <Footer />
    </>
  );
}