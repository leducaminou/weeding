interface FloralCornerProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
  color?: string;
}

export function FloralCorner({
  position = "top-left",
  className = "",
  color = "#c9a043",
}: FloralCornerProps) {
  const rotations = {
    "top-left": "rotate(0deg)",
    "top-right": "rotate(90deg)",
    "bottom-right": "rotate(180deg)",
    "bottom-left": "rotate(270deg)",
  };

  const positions = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-right": "bottom-0 right-0",
    "bottom-left": "bottom-0 left-0",
  };

  return (
    <svg
      className={`pointer-events-none absolute h-16 w-16 sm:h-20 sm:w-20 opacity-60 ${positions[position]} ${className}`}
      style={{ transform: rotations[position] }}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden
    >
      <path
        d="M10 10 Q 30 15, 40 30 Q 45 45, 35 55 Q 25 65, 15 60"
        stroke={color}
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      />
      <g transform="translate(25, 25)">
        <ellipse cx="0" cy="-8" rx="3.5" ry="6" fill={color} opacity="0.4" transform="rotate(0)" />
        <ellipse cx="0" cy="-8" rx="3.5" ry="6" fill={color} opacity="0.4" transform="rotate(72)" />
        <ellipse cx="0" cy="-8" rx="3.5" ry="6" fill={color} opacity="0.4" transform="rotate(144)" />
        <ellipse cx="0" cy="-8" rx="3.5" ry="6" fill={color} opacity="0.4" transform="rotate(216)" />
        <ellipse cx="0" cy="-8" rx="3.5" ry="6" fill={color} opacity="0.4" transform="rotate(288)" />
        <circle r="2.5" fill={color} />
      </g>
      <path d="M35 15 Q 42 12, 45 18 Q 40 22, 35 20 Z" fill={color} opacity="0.35" />
      <path d="M20 45 Q 15 52, 22 55 Q 28 50, 26 44 Z" fill={color} opacity="0.35" />
      <circle cx="45" cy="35" r="1.2" fill={color} opacity="0.6" />
      <circle cx="30" cy="48" r="1" fill={color} opacity="0.5" />
    </svg>
  );
}