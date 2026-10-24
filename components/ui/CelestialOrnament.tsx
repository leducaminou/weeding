export function CelestialOrnament({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-4 ${className}`}
      aria-hidden
    >
      <span className="h-px w-14 bg-gradient-to-r from-transparent to-gold-400" />
      <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
        {/* Croissant central */}
        <path
          d="M12 4 Q 16 10, 12 16 Q 13 10, 12 4 Z"
          fill="#c9a043"
          opacity="0.9"
        />
        <circle cx="13.5" cy="7" r="0.8" fill="#dcb85b" />
      </svg>
      <span className="h-px w-14 bg-gradient-to-l from-transparent to-gold-400" />
    </div>
  );
}