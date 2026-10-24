import { cn } from "@/lib/utils";

export function AdminCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white border border-slate-200 rounded-lg shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}