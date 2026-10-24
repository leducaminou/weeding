import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/wedding/Hero";
import { CouplePresentation } from "@/components/wedding/CouplePresentation";
import { SaveTheDate } from "@/components/wedding/SaveTheDate";
import { ProgramTimeline } from "@/components/wedding/ProgramTimeline";
import { Accommodations } from "@/components/wedding/Accommodations";
import { Wishlist } from "@/components/wedding/Wishlist";
import { FinalMessage } from "@/components/wedding/FinalMessage";
import {
  getWedding,
  getEvents,
  getAccommodations,
  getWishlist,
  getGallery,
  getSetting,
} from "@/services/WeddingService";
import { toDate } from "@/lib/date";

export const revalidate = 3600;

export default async function HomePage() {
  const [wedding, events, accommodations, wishlist, gallery] =
    await Promise.all([
      getWedding(),
      getEvents(),
      getAccommodations(),
      getWishlist(),
      getGallery(),
    ]);

  if (!wedding) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8 text-center">
        <p className="text-royal-800">
          Le site est en cours de préparation. Merci de revenir bientôt.
        </p>
      </main>
    );
  }

  const finalTitle = getSetting(
    wedding.settings,
    "final_message_title",
    "AVEC TOUTE NOTRE AFFECTION"
  );
  const finalBody = getSetting(wedding.settings, "final_message_body", "");

  // Priorité : images de la galerie. Sinon, fallback sur les images locales.
  const galleryImages = gallery.map((g) => g.url);
  const coupleImages =
    galleryImages.length >= 4
      ? galleryImages.slice(0, 4)
      : ["/img1.webp", "/img2.webp", "/img3.webp", "/img4.webp"];

  const targetDate = toDate(wedding.weddingDate);
  const day = String(targetDate.getUTCDate()).padStart(2, "0");
  const month = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    timeZone: "UTC",
  })
    .format(targetDate)
    .toUpperCase();
  const year = String(targetDate.getUTCFullYear());

  return (
    <>
      <Header />
      <main>
        <Hero heroImage={wedding.heroImage ?? "/img1.webp"} />
        <CouplePresentation images={coupleImages} />
        <SaveTheDate
          targetDate={targetDate.toISOString()}
          day={day}
          month={month}
          year={year}
        />
        <ProgramTimeline events={events} ctaToProgram />
        <Accommodations
          accommodations={accommodations.map((a) => ({
            id: a.id,
            name: a.name,
            description: a.description,
            address: a.address,
            phones: a.phones,
          }))}
          limit={3}
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
        <FinalMessage title={finalTitle} body={finalBody} />
      </main>
      <Footer />
    </>
  );
}