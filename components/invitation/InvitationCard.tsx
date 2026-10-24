"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Download, CheckCircle2 } from "lucide-react";
import { SITE } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { CelestialOrnament } from "@/components/ui/CelestialOrnament";
import { FloralCorner } from "@/components/ui/FloralCorner";

interface Props {
  firstName: string;
  lastName: string;
  identifier: string;
  qrUrl: string | null;
  isNew?: boolean;
}

export function InvitationCard({
  firstName,
  lastName,
  identifier,
  qrUrl,
  isNew,
}: Props) {
  async function downloadQr() {
    if (!qrUrl) return;
    try {
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invitation-${identifier}.webp`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(qrUrl, "_blank");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-md mx-auto bg-ivory-50 border border-gold-500/30 rounded-sm overflow-hidden shadow-gold-lg"
    >
      <FloralCorner position="top-left" />
      <FloralCorner position="bottom-right" />

      <div className="relative bg-royal-600 text-ivory-50 text-center px-6 py-10 overflow-hidden">
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(1px 1px at 20% 30%, #dcb85b 0%, transparent 100%), radial-gradient(1px 1px at 70% 60%, #ffffff 0%, transparent 100%)",
          }}
        />
        <div className="relative">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="#dcb85b" className="mx-auto mb-4">
            <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" />
          </svg>
          <p className="font-serif text-3xl sm:text-4xl">
            {SITE.couple.bride}{" "}
            <span className="gold-text italic font-light">&</span>{" "}
            {SITE.couple.groom}
          </p>
          <p className="mt-3 text-[10px] tracking-[0.5em] text-gold-300 uppercase">
            {SITE.dates.label}
          </p>
        </div>
      </div>

      <div className="relative p-8 flex flex-col items-center text-center">
        {isNew && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-1.5 text-xs text-gold-700 bg-gold-50 border border-gold-300 rounded-full px-4 py-1.5 mb-6"
          >
            <CheckCircle2 size={13} />
            Présence confirmée
          </motion.div>
        )}

        <span className="text-[10px] tracking-[0.5em] text-gold-600 uppercase">
          Invité
        </span>
        <h2 className="mt-3 font-serif text-3xl text-royal-800">
          {firstName} {lastName}
        </h2>

        <CelestialOrnament className="my-4" />

        <span className="text-[10px] tracking-[0.5em] text-gold-600 uppercase">
          Identifiant
        </span>
        <p className="mt-2 font-mono text-2xl tracking-[0.3em] text-royal-800">
          {identifier}
        </p>

        {qrUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="mt-8 p-4 bg-ivory-100 border border-gold-500/30 rounded-sm shadow-gold"
          >
            <Image
              src={qrUrl}
              alt={`QR Code ${identifier}`}
              width={240}
              height={240}
              className="block w-[240px] h-[240px]"
              unoptimized
            />
          </motion.div>
        )}

        {qrUrl && (
          <Button
            onClick={downloadQr}
            variant="ghost"
            size="md"
            className="mt-6"
          >
            <Download size={16} />
            Télécharger mon QR Code
          </Button>
        )}

        <p className="mt-6 text-xs text-royal-800/60 leading-relaxed max-w-xs italic">
          Présentez ce QR code le jour du mariage. Conservez-le précieusement.
        </p>
      </div>
    </motion.div>
  );
}