"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { SITE } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { StarField } from "@/components/ui/StarField";

export function Hero({ heroImage }: { heroImage?: string | null }) {
  const src = heroImage ?? "/img1.webp";

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-royal-600">
      <div className="absolute inset-0">
        <Image
          src={src}
          alt={`${SITE.couple.bride} & ${SITE.couple.groom}`}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-royal-900/85 via-royal-800/70 to-royal-900/95" />
      </div>

      <StarField count={16} />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 45%, rgba(220,184,91,0.08) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center text-center px-5 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-8"
        >
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
            <path
              d="M20 4 L22.5 17.5 L36 20 L22.5 22.5 L20 36 L17.5 22.5 L4 20 L17.5 17.5 Z"
              fill="url(#heroStarGrad)"
            />
            <defs>
              <linearGradient id="heroStarGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#e8ce94" />
                <stop offset="50%" stopColor="#dcb85b" />
                <stop offset="100%" stopColor="#c9a043" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-[10px] sm:text-xs tracking-[0.5em] text-gold-300 uppercase mb-8"
        >
          Mariage
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.3 }}
          className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-[1.05] text-balance"
        >
          <span className="text-ivory-50">{SITE.couple.bride}</span>
          <span className="gold-text italic font-light mx-3 sm:mx-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl align-middle">
            &
          </span>
          <span className="text-ivory-50">{SITE.couple.groom}</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.9, delay: 0.7 }}
          className="my-8 flex items-center gap-3"
        >
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold-400" />
          <span className="text-gold-400 text-sm">✦</span>
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold-400" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="font-display text-lg sm:text-2xl md:text-3xl text-ivory-100/90 italic max-w-xl text-balance leading-relaxed"
        >
          {SITE.tagline}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.95 }}
          className="mt-10 text-sm sm:text-base tracking-[0.4em] text-gold-300 uppercase"
        >
          {SITE.dates.label}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="mt-12"
        >
          <ButtonLink href="/rsvp" variant="gold" size="lg">
            Je serai là
          </ButtonLink>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        aria-hidden
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[9px] tracking-[0.4em] text-gold-300 uppercase">
            Découvrir
          </span>
          <div className="h-10 w-px bg-gradient-to-b from-gold-400 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
}