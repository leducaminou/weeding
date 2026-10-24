"use client";

import { motion } from "motion/react";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { StarField } from "@/components/ui/StarField";
import { CelestialOrnament } from "@/components/ui/CelestialOrnament";
import { SITE } from "@/config/site";

interface Props {
  title: string;
  body: string;
}

export function FinalMessage({ title, body }: Props) {
  const lines = body.split("\n").filter((l) => l.trim().length > 0);

  return (
    <Section className="relative royal-bg text-ivory-50 text-center overflow-hidden">
      <StarField count={18} />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(220,184,91,0.12) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative flex flex-col items-center max-w-2xl mx-auto">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-xs tracking-[0.5em] text-gold-300 uppercase"
        >
          {title}
        </motion.span>

        <CelestialOrnament className="my-8" />

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="font-serif text-5xl sm:text-6xl md:text-7xl leading-tight"
        >
          <span className="text-ivory-50">{SITE.couple.bride}</span>
          <span className="gold-text italic font-light mx-3 sm:mx-5">&</span>
          <span className="text-ivory-50">{SITE.couple.groom}</span>
        </motion.h2>

        <div className="mt-10 flex flex-col gap-2 text-base sm:text-lg text-ivory-100/85 leading-relaxed">
          {lines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
            >
              {line}
            </motion.p>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="mt-12"
        >
          <ButtonLink href="/rsvp" variant="gold" size="lg">
            Je serai là
          </ButtonLink>
        </motion.div>

        <CelestialOrnament className="mt-12" />
      </div>
    </Section>
  );
}