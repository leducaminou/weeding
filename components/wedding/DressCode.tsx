"use client";

import { motion } from "motion/react";
import { Section } from "@/components/ui/Section";
import { CelestialOrnament } from "@/components/ui/CelestialOrnament";

export function DressCode({ code }: { code: string }) {
  const parts = code.split("&").map((p) => p.trim());

  return (
    <Section
      id="dress-code"
      className="relative royal-bg text-ivory-50 overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(220,184,91,0.07) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-6"
        >
          <svg width="48" height="48" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="24" stroke="url(#dcRing)" strokeWidth="1" fill="none" />
            <path
              d="M28 18 L28 24 M20 24 L36 24 M20 24 L14 42 L42 42 L36 24"
              stroke="#dcb85b"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <defs>
              <linearGradient id="dcRing" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#e8ce94" />
                <stop offset="100%" stopColor="#c9a043" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        <span className="text-xs tracking-[0.5em] text-gold-300 uppercase">
          Dress code
        </span>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-6 font-serif text-5xl sm:text-6xl md:text-7xl leading-tight"
        >
          {parts.map((part, i) => (
            <span key={i}>
              <span className="gold-text">{part}</span>
              {i < parts.length - 1 && (
                <span className="text-ivory-100/60 italic font-light mx-4 text-4xl sm:text-5xl">
                  &
                </span>
              )}
            </span>
          ))}
        </motion.h2>

        <CelestialOrnament className="my-8" />

        <p className="max-w-md text-sm sm:text-base text-ivory-100/75 leading-relaxed text-balance">
          Nous vous invitons à porter des tenues élégantes dans ces tons, pour
          une harmonie parfaite sur les photos de ce jour si spécial.
        </p>
      </div>
    </Section>
  );
}