import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuestionCardProps {
  number: number;
  question: string;
  onCopy?: () => void;
}

export function QuestionCard({ number, question, onCopy }: QuestionCardProps) {
  return (
    <div className="question-card animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-badge-bg flex items-center justify-center">
            <span className="text-sm font-semibold text-badge-text">
              {number}
            </span>
          </div>
          <p className="text-foreground text-sm sm:text-base leading-relaxed pt-1">
            {question}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCopy}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-secondary"
        >
          <Copy className="w-4 h-4" />
          <span className="sr-only">Copy question</span>
        </Button>
      </div>
    </div>
  );
}
