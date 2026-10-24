"use client";

import { motion } from "motion/react";
import { MapPin, Clock, Calendar, Camera, Shirt } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ButtonLink } from "@/components/ui/Button";
import { formatDayNumber, formatMonthFR } from "@/lib/utils";
import { toDate } from "@/lib/date";

export interface PublicEvent {
  id: string;
  title: string;
  description: string | null;
  date: string | Date;
  time: string;
  endTime: string | null;
  location: string;
  address: string | null;
  mapsUrl: string | null;
  dressCode: string | null;
  dressCodeNote: string | null;
  photoSession: string | null;
}

interface Props {
  events: PublicEvent[];
  showHeader?: boolean;
  ctaToProgram?: boolean;
}

export function ProgramTimeline({
  events,
  showHeader = true,
  ctaToProgram = false,
}: Props) {
  if (events.length === 0) return null;

  return (
    <Section id="programme" className="relative bg-ivory-100">
      {showHeader && (
        <SectionTitle
          overline="Programme"
          title="Les célébrations"
          subtitle="Les dates, heures et lieux arrêtés pour les différents évènements."
        />
      )}

      <div className="mt-16 relative">
        <div
          className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-1/2 bg-gradient-to-b from-transparent via-gold-400/50 to-transparent"
          aria-hidden
        />

        <div className="flex flex-col gap-14 md:gap-20">
          {events.map((event, index) => {
            const isLeft = index % 2 === 0;
            const date = toDate(event.date);
            const timeLabel = event.endTime
              ? `${event.time} – ${event.endTime}`
              : event.time;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="relative pl-14 md:pl-0 md:grid md:grid-cols-2 md:gap-14 md:items-start"
              >
                <span
                  className="absolute left-4 md:left-1/2 top-4 md:top-6 -translate-x-1/2 z-10 flex items-center justify-center"
                  aria-hidden
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#c9a043">
                    <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" />
                  </svg>
                </span>

                <div
                  className={
                    isLeft
                      ? "md:pr-14 md:text-right md:col-start-1"
                      : "md:pl-14 md:col-start-2"
                  }
                >
                  <div
                    className={`inline-flex items-center gap-3 px-4 py-2 bg-ivory-50 border border-gold-500/30 rounded-full ${
                      isLeft ? "md:ml-auto" : ""
                    }`}
                  >
                    <Calendar size={13} className="text-gold-600" />
                    <span className="text-xs tracking-[0.25em] text-gold-700 uppercase font-medium">
                      {formatDayNumber(date)} {formatMonthFR(date)}
                    </span>
                  </div>

                  <h3 className="mt-4 font-serif text-2xl sm:text-3xl text-royal-800 leading-tight">
                    {event.title}
                  </h3>

                  <div
                    className={`mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-royal-800/75 ${
                      isLeft ? "md:justify-end" : ""
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={14} className="text-gold-500" />
                      {timeLabel}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={14} className="text-gold-500" />
                      {event.location}
                    </span>
                  </div>

                  {event.description && (
                    <p className="mt-3 text-sm text-royal-800/70 italic max-w-sm md:max-w-none leading-relaxed">
                      {event.description}
                    </p>
                  )}

                  {event.photoSession && (
                    <div
                      className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-ivory-50 border border-gold-500/25 rounded-full text-xs text-gold-700 ${
                        isLeft ? "md:ml-auto" : ""
                      }`}
                    >
                      <Camera size={12} />
                      {event.photoSession}
                    </div>
                  )}

                  {event.dressCode && (
                    <div
                      className={`mt-4 p-4 bg-ivory-50 border border-gold-500/25 rounded-sm ${
                        isLeft ? "md:text-right" : ""
                      }`}
                    >
                      <div
                        className={`flex items-center gap-2 ${
                          isLeft ? "md:justify-end" : ""
                        }`}
                      >
                        <Shirt size={14} className="text-gold-600 shrink-0" />
                        <span className="text-[10px] tracking-[0.3em] text-gold-600 uppercase">
                          Dress code
                        </span>
                      </div>
                      <p className="mt-1 font-serif text-lg gold-text">
                        {event.dressCode}
                      </p>
                      {event.dressCodeNote && (
                        <p className="mt-1 text-xs text-royal-800/65 leading-relaxed">
                          {event.dressCodeNote}
                        </p>
                      )}
                    </div>
                  )}

                  {event.mapsUrl && (
                    <div
                      className={`mt-5 ${isLeft ? "md:flex md:justify-end" : ""}`}
                    >
                      <a
                        href={event.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-gold-700 border-b border-gold-500/40 hover:border-gold-500 hover:text-gold-600 transition-colors pb-0.5"
                      >
                        Voir l'itinéraire
                        <span aria-hidden>→</span>
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {ctaToProgram && (
        <div className="mt-16 flex justify-center">
          <ButtonLink href="/programme" variant="ghost" size="lg">
            Voir le programme complet
          </ButtonLink>
        </div>
      )}
    </Section>
  );
}