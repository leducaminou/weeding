"use client";

import { useMemo } from "react";

interface StarFieldProps {
  count?: number;
  className?: string;
}

/**
 * Champ d'étoiles TRÈS discret.
 * Par défaut : 12 étoiles, opacité faible, scintillement lent.
 */
export function StarField({ count = 12, className = "" }: StarFieldProps) {
  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const seed = i * 9301 + 49297;
      const x = (seed % 233) / 233 * 100;
      const y = ((seed * 7) % 233) / 233 * 100;
      const size = (seed % 2) + 1; // 1-2px
      const delay = ((seed * 3) % 50) / 10; // 0-5s
      const isGold = seed % 5 === 0; // 20% doré, 80% blanc
      return { x, y, size, delay, isGold, i };
    });
  }, [count]);

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      {stars.map(({ x, y, size, delay, isGold, i }) => (
        <span
          key={i}
          className="absolute rounded-full animate-twinkle"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: isGold
              ? "rgba(220, 184, 91, 0.7)"
              : "rgba(255, 255, 255, 0.5)",
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  );
}