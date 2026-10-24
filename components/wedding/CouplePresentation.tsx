"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { FloralCorner } from "@/components/ui/FloralCorner";
import { SITE } from "@/config/site";

export function CouplePresentation({ images }: { images: string[] }) {
  const [img1, img2, img3, img4] = images;

  return (
    <Section id="couple" className="relative bg-ivory-50">
      <SectionTitle
        overline="Le couple"
        title={`${SITE.couple.bride} & ${SITE.couple.groom}`}
        subtitle="Deux âmes, une histoire, un avenir à écrire ensemble."
      />

      <div className="mt-16 grid grid-cols-12 gap-4 md:gap-6 items-stretch">
        {/* Colonne gauche : grande image principale + petite en dessous */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9 }}
          className="col-span-12 md:col-span-7 flex flex-col gap-4 md:gap-6"
        >
          {/* Image principale */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm shadow-gold-lg">
            <Image
              src="/img0.webp"
              alt={`${SITE.couple.bride} & ${SITE.couple.groom}`}
              fill
              sizes="(max-width: 768px) 100vw, 58vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-3 ring-1 ring-gold-400/40 pointer-events-none" />
            <FloralCorner position="top-left" />
            <FloralCorner position="bottom-right" />
          </div>

          {/* Image secondaire */}
          {img2 && (
            <div className="relative aspect-[3/2] overflow-hidden rounded-sm shadow-gold-lg">
              <Image
                src="/img2.webp"
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 58vw"
                className="object-cover"
              />
              <div className="absolute inset-3 ring-1 ring-gold-400/40 pointer-events-none" />
            </div>
          )}
        </motion.div>

        {/* Colonne droite : 2 petites images + citation */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="col-span-12 md:col-span-5 flex flex-col gap-4 md:gap-6"
        >
          {img3 && (
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm shadow-gold-lg">
              <Image
                src={"/img3.webp"}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 42vw"
                className="object-cover"
              />
              <div className="absolute inset-3 ring-1 ring-gold-400/40 pointer-events-none" />
            </div>
          )}

          {img4 && (
            <div className="relative aspect-square overflow-hidden rounded-sm shadow-gold-lg">
              <Image
                src={"/img4.webp"}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 42vw"
                className="object-cover"
              />
              <div className="absolute inset-3 ring-1 ring-gold-400/40 pointer-events-none" />
            </div>
          )}

          {/* Citation */}
          <div className="relative px-6 py-6 bg-ivory-100 border border-gold-500/25 rounded-sm">
            <span className="absolute top-2 left-3 text-4xl text-gold-400/40 font-serif leading-none">
              «
            </span>
            <p className="relative font-display text-base sm:text-lg text-royal-800 leading-relaxed italic text-center">
              L'amour ne consiste pas à se regarder l'un l'autre, mais à
              regarder ensemble dans la même direction.
            </p>
            <span className="absolute bottom-1 right-3 text-4xl text-gold-400/40 font-serif leading-none">
              »
            </span>
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="h-px w-6 bg-gold-500/40" />
              <p className="text-[9px] tracking-[0.25em] text-gold-600 uppercase">
                Antoine de Saint-Exupéry
              </p>
              <span className="h-px w-6 bg-gold-500/40" />
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}