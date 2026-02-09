import { cn } from "@/lib/utils";

interface SegmentedButtonProps {
  options: string[];
  selected?: string;
  onSelect?: (value: string) => void;
}

export function SegmentedButton({
  options,
  selected,
  onSelect,
}: SegmentedButtonProps) {
  return (
    <div className="flex rounded-xl bg-secondary p-1 gap-1">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSelect?.(option)}
          className={cn(
            "flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
            selected === option
              ? "bg-card text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
