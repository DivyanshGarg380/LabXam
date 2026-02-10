import { Copy,Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react"; 
interface QuestionCardProps {
  number: number;
  question: string;
  section: string;
}

export function QuestionCard({ number, question, section }: QuestionCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(question);
      setCopied(true);
      toast.success("Question copied to clipboard");

      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy question");
    }
  };

  return (
    <div className="question-card animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4 flex-1 min-w-0">
          {/* Number */}
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-badge-bg flex items-center justify-center">
            <span className="text-sm font-semibold text-badge-text">
              {number}
            </span>
          </div>

          {/* Section + Question */}
          <div className="flex flex-col gap-1 pt-1">
            <span className="text-xs font-bold text-muted-foreground">
              {section}
            </span>

            <p className="text-foreground text-sm sm:text-base leading-relaxed">
              {question}
            </p>
          </div>
        </div>

        {/* Copy button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="
            flex-shrink-0
            text-muted-foreground
            hover:text-primary
            hover:bg-primary/10
            transition-colors
          "
        >
          {copied ? (
            <Check className="w-4 h-4 text-primary" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <span className="sr-only">Copy question</span>
        </Button>
      </div>
    </div>
  );
}