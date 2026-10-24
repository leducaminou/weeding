"use client";

import { motion } from "motion/react";
import { Section } from "@/components/ui/Section";
import { Countdown } from "./Countdown";
import { StarField } from "@/components/ui/StarField";
import { CelestialOrnament } from "@/components/ui/CelestialOrnament";

interface Props {
  targetDate: string;
  day: string;
  month: string;
  year: string;
}

export function SaveTheDate({ targetDate, day, month, year }: Props) {
  return (
    <Section
      id="save-the-date"
      className="relative royal-bg text-ivory-50 overflow-hidden"
    >
      <StarField count={14} />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(220,184,91,0.08) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative flex flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-xs tracking-[0.5em] text-gold-300 uppercase"
        >
          Save the date
        </motion.span>

        <CelestialOrnament className="my-6" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="flex flex-col items-center"
        >
          <span className="font-serif text-8xl sm:text-9xl md:text-[10rem] leading-none gold-text">
            {day}
          </span>
          <span className="mt-3 text-base sm:text-lg tracking-[0.5em] text-gold-300 uppercase">
            {month}
          </span>
          <span className="mt-2 font-display text-4xl sm:text-5xl text-ivory-100/80 italic">
            {year}
          </span>
        </motion.div>

        <CelestialOrnament className="my-6" />

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xs tracking-[0.35em] text-ivory-100/60 uppercase mb-10"
        >
          Plus que
        </motion.p>

        <Countdown targetDate={targetDate} />
      </div>
    </Section>
  );
}