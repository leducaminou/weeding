"use client";

import { useMemo } from "react";

interface SparklesProps {
  count?: number;
  className?: string;
  color?: "gold" | "white";
}

/**
 * Petites étincelles en forme de 4-points (✨) dispersées.
 * Utiliser pour accentuer une zone (Hero, SaveTheDate, etc.)
 */
export function Sparkles({
  count = 12,
  className = "",
  color = "gold",
}: SparklesProps) {
  const sparkles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const seed = i * 7919 + 104729;
        return {
          x: (seed % 97) / 97 * 100,
          y: ((seed * 13) % 97) / 97 * 100,
          size: (seed % 8) + 8,
          delay: ((seed * 5) % 40) / 10,
          i,
        };
      }),
    [count]
  );

  const fill = color === "gold" ? "#f2cd48" : "#ffffff";

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      {sparkles.map(({ x, y, size, delay, i }) => (
        <svg
          key={i}
          className="absolute animate-twinkle"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: size,
            height: size,
            animationDelay: `${delay}s`,
            filter: `drop-shadow(0 0 ${size / 2}px ${fill})`,
          }}
          viewBox="0 0 24 24"
          fill={fill}
        >
          <path d="M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z" />
        </svg>
      ))}
    </div>
  );
}