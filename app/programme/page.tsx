import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProgramTimeline } from "@/components/wedding/ProgramTimeline";
import { getEvents } from "@/services/WeddingService";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Programme",
  description:
    "Découvrez le programme des célébrations du mariage de Loïca & Franck les 27 et 29 décembre 2026.",
};

export default async function ProgrammePage() {
  const events = await getEvents();
  return (
    <>
      <Header />
      <main className="pt-24 pb-8">
        <ProgramTimeline events={events} />
      </main>
      <Footer />
    </>
  );
}