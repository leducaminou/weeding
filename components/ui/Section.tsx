import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  narrow?: boolean;
}

export function Section({ children, className, id, narrow }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-20 md:py-28 lg:py-32",
        narrow
          ? "mx-auto w-full max-w-3xl px-5 sm:px-6"
          : "mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </section>
  );
}