import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-badge-bg text-badge-text",
        className
      )}
    >
      {children}
    </span>
  );
}
