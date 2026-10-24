"use client";

import { motion } from "motion/react";
import { Calendar, MapPin, Clock, Info } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";

export interface PracticalInfoItem {
  icon: "calendar" | "location" | "clock" | "info";
  label: string;
  value: string;
}

const ICONS = {
  calendar: Calendar,
  location: MapPin,
  clock: Clock,
  info: Info,
} as const;

export function PracticalInfo({ items }: { items: PracticalInfoItem[] }) {
  if (items.length === 0) return null;

  return (
    <Section id="infos" className="bg-ivory-50">
      <SectionTitle overline="Bon à savoir" title="Informations pratiques" />

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((item, i) => {
          const Icon = ICONS[item.icon];
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="group relative flex flex-col gap-3 p-6 bg-ivory-100 border border-gold-500/25 rounded-sm text-center hover:border-gold-500/50 hover:shadow-gold transition-all duration-300"
            >
              <div className="mx-auto h-12 w-12 rounded-full border border-gold-500/40 bg-ivory-50 flex items-center justify-center text-gold-600 group-hover:bg-gold-50 transition-colors">
                <Icon size={18} />
              </div>
              <span className="text-[10px] tracking-[0.3em] text-royal-800/60 uppercase">
                {item.label}
              </span>
              <span className="font-serif text-lg text-royal-800 leading-snug">
                {item.value}
              </span>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}