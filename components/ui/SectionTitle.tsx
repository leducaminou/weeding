import { cn } from "@/lib/utils";

interface Props {
  overline?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  light?: boolean;
}

export function SectionTitle({
  overline,
  title,
  subtitle,
  align = "center",
  className,
  light = false,
}: Props) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {overline && (
        <div className="flex items-center gap-3">
          <span className="h-px w-6 bg-gradient-to-r from-transparent to-gold-500" />
          <span
            className={cn(
              "text-[11px] tracking-[0.3em] uppercase font-medium",
              light ? "text-gold-300" : "text-gold-600"
            )}
          >
            {overline}
          </span>
          <span className="h-px w-6 bg-gradient-to-l from-transparent to-gold-500" />
        </div>
      )}
      <h2
        className={cn(
          "font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight text-balance",
          light ? "text-ivory-50" : "gold-text"
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "max-w-xl text-sm sm:text-base leading-relaxed text-balance",
            light ? "text-ivory-100/75" : "text-royal-800/70"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}