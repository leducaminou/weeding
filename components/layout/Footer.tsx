import Link from "next/link";
import { SITE } from "@/config/site";
import { StarField } from "@/components/ui/StarField";
import { CelestialOrnament } from "@/components/ui/CelestialOrnament";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative royal-bg text-ivory-100/80 overflow-hidden">
      <StarField count={10} />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 py-16">
        <CelestialOrnament className="mb-8" />

        <div className="flex flex-col items-center gap-4 text-center">
          <p className="font-serif text-3xl sm:text-4xl text-ivory-50">
            {SITE.couple.bride}{" "}
            <span className="gold-text italic">&</span>{" "}
            {SITE.couple.groom}
          </p>
          <p className="text-xs sm:text-sm tracking-[0.35em] text-gold-300 uppercase">
            {SITE.dates.label}
          </p>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 text-xs text-ivory-100/60">
            <Link href="/" className="hover:text-gold-300 transition-colors">
              Accueil
            </Link>
            <Link href="/programme" className="hover:text-gold-300 transition-colors">
              Programme
            </Link>
            <Link href="/infos" className="hover:text-gold-300 transition-colors">
              Infos
            </Link>
            <Link href="/rsvp" className="hover:text-gold-300 transition-colors">
              Je serai là
            </Link>
          </div>

          <p className="text-xs text-ivory-100/30 mt-8">
            © {year} {SITE.couple.bride} & {SITE.couple.groom} — Fait avec amour
          </p>
        </div>
      </div>
    </footer>
  );
}