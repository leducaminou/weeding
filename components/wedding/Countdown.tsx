"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function compute(target: number): TimeLeft {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1_000) % 60),
  };
}

export function Countdown({ targetDate }: { targetDate: string }) {
  const target = new Date(targetDate).getTime();
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTime(compute(target));
    const id = setInterval(() => setTime(compute(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const items = time
    ? [
        { value: time.days, label: "Jours" },
        { value: time.hours, label: "Heures" },
        { value: time.minutes, label: "Min" },
        { value: time.seconds, label: "Sec" },
      ]
    : [
        { value: "--", label: "Jours" },
        { value: "--", label: "Heures" },
        { value: "--", label: "Min" },
        { value: "--", label: "Sec" },
      ];

  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-5 max-w-lg mx-auto">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.6 }}
          className="relative flex flex-col items-center px-2 py-4 rounded border border-gold-400/25 bg-royal-700/40 backdrop-blur"
        >
          <span className="font-serif text-3xl sm:text-4xl gold-text tabular-nums leading-none">
            {typeof item.value === "number"
              ? String(item.value).padStart(2, "0")
              : item.value}
          </span>
          <span className="text-[9px] sm:text-xs tracking-[0.25em] text-gold-300 uppercase mt-3">
            {item.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}