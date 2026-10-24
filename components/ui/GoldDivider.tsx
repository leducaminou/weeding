import { cn } from "@/lib/utils";

export function GoldDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex items-center justify-center gap-3 py-6", className)}
      aria-hidden
    >
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold-400" />
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#c9a043">
        <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" />
      </svg>
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold-400" />
    </div>
  );
}