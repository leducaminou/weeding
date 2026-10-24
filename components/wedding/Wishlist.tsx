"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Gift, ExternalLink } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";

export interface PublicWishlistItem {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  url: string | null;
  category: string | null;
}

export function Wishlist({ items }: { items: PublicWishlistItem[] }) {
  if (items.length === 0) return null;

  return (
    <Section id="wishlist" className="relative royal-bg overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, #dcb85b 0%, transparent 100%), radial-gradient(1px 1px at 60% 70%, #ffffff 0%, transparent 100%), radial-gradient(1px 1px at 80% 20%, #dcb85b 0%, transparent 100%)",
        }}
      />

      <div className="relative">
        <SectionTitle
          overline="Cadeaux"
          title="Wishlist"
          subtitle="Votre présence est notre plus beau cadeau. Si toutefois vous souhaitez nous gâter, voici quelques idées."
          light
        />

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => {
            const content = (
              <>
                {item.image ? (
                  <div className="relative aspect-[4/3] overflow-hidden bg-royal-700">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-royal-900/60 via-transparent to-transparent" />
                  </div>
                ) : (
                  <div className="aspect-[4/3] flex items-center justify-center bg-royal-700">
                    <Gift size={40} className="text-gold-400/60" />
                  </div>
                )}
                <div className="flex flex-col gap-2 p-6 flex-1">
                  {item.category && (
                    <span className="text-[10px] tracking-[0.3em] text-gold-300 uppercase">
                      {item.category}
                    </span>
                  )}
                  <h3 className="font-serif text-lg text-ivory-50 leading-snug">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-ivory-100/70 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  {item.url && (
                    <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm text-gold-300 group-hover:text-gold-200 transition-colors">
                      Voir le cadeau
                      <ExternalLink size={13} />
                    </span>
                  )}
                </div>
              </>
            );

            const className =
              "group relative flex flex-col bg-royal-700/50 backdrop-blur border border-gold-500/20 rounded-sm overflow-hidden hover:border-gold-500/50 hover:shadow-gold-lg transition-all duration-500 h-full";

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: i * 0.08 }}
              >
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                  >
                    {content}
                  </a>
                ) : (
                  <div className={className}>{content}</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}