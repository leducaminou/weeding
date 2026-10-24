"use client";

import { motion } from "motion/react";
import { MapPin, Phone } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { FloralCorner } from "@/components/ui/FloralCorner";

export interface PublicAccommodation {
  id: string;
  name: string;
  description: string | null;
  address: string;
  phones: string[];
}

interface Props {
  accommodations: PublicAccommodation[];
  intro?: string;
  limit?: number;
}

export function Accommodations({ accommodations, intro, limit }: Props) {
  const list = limit ? accommodations.slice(0, limit) : accommodations;
  if (list.length === 0) return null;

  return (
    <Section id="hebergements" className="bg-ivory-50">
      <SectionTitle
        overline="Séjour"
        title="Hébergements"
        subtitle={
          intro ??
          "Pour faciliter votre séjour et votre participation aux différentes célébrations, plusieurs possibilités d'hébergement sont disponibles à Dschang, Bafou et Bangou."
        }
      />

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((acc, i) => (
          <motion.article
            key={acc.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.08 }}
            className="group relative flex flex-col gap-4 p-7 bg-ivory-100 border border-gold-500/25 rounded-sm hover:border-gold-500/50 hover:shadow-gold-lg hover:-translate-y-1 transition-all duration-500"
          >
            <FloralCorner position="top-right" className="opacity-30" />

            <h3 className="font-serif text-xl text-royal-800 leading-snug pr-8">
              {acc.name}
            </h3>

            {acc.description && (
              <p className="text-sm text-royal-800/70 leading-relaxed">
                {acc.description}
              </p>
            )}

            <div className="flex flex-col gap-2.5 mt-auto pt-2 text-sm text-royal-800/80">
              <div className="flex items-start gap-2">
                <MapPin size={15} className="text-gold-600 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{acc.address}</span>
              </div>

              {acc.phones.length > 0 && (
                <div className="flex items-start gap-2">
                  <Phone size={15} className="text-gold-600 mt-0.5 shrink-0" />
                  <div className="flex flex-col">
                    {acc.phones.map((phone) => (
                      <a
                        key={phone}
                        href={`tel:${phone.replace(/\s/g, "")}`}
                        className="hover:text-gold-700 transition-colors"
                      >
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </Section>
  );
}