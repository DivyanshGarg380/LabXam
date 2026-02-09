import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectionCardProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function SelectionCard({
  label,
  selected = false,
  onClick,
  className,
}: SelectionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "selection-card flex items-center justify-between gap-3 text-left w-full",
        selected && "selected",
        className
      )}
    >
      <span className={cn(
        "font-medium text-sm",
        selected ? "text-primary" : "text-foreground"
      )}>
        {label}
      </span>
      {selected && (
        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}
