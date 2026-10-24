import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Accommodations } from "@/components/wedding/Accommodations";
import { Wishlist } from "@/components/wedding/Wishlist";
import { PracticalInfo } from "@/components/wedding/PracticalInfo";
import {
  getAccommodations,
  getWishlist,
} from "@/services/WeddingService";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Informations pratiques",
  description:
    "Hébergements, wishlist et informations pratiques pour le mariage de Loïca & Franck.",
};

export default async function InfosPage() {
  const [accommodations, wishlist] = await Promise.all([
    getAccommodations(),
    getWishlist(),
  ]);

  return (
    <>
      <Header />
      <main className="pt-24">
        <Section>
          <SectionTitle
            overline="Tout savoir"
            title="Informations pratiques"
            subtitle="Tout ce dont vous avez besoin pour profiter pleinement de ces célébrations."
          />
        </Section>
        <PracticalInfo
          items={[
            { icon: "calendar", label: "Dates", value: "27 & 29 Décembre 2026" },
            { icon: "clock", label: "Horaires", value: "10h00 – 18h00" },
            { icon: "location", label: "Lieux", value: "Dschang · Bafou · Bangou" },
            { icon: "info", label: "Dress code", value: "Voir programme" },
          ]}
        />
        <Accommodations
          accommodations={accommodations.map((a) => ({
            id: a.id,
            name: a.name,
            description: a.description,
            address: a.address,
            phones: a.phones,
          }))}
        />
        <Wishlist
          items={wishlist.map((w) => ({
            id: w.id,
            title: w.title,
            description: w.description,
            image: w.image,
            url: w.url,
            category: w.category,
          }))}
        />
      </main>
      <Footer />
    </>
  );
}