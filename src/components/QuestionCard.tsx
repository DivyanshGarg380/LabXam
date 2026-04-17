import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

interface QuestionCardProps {
  number: number;
  question: string;
  section: string;
  year: string;
  uploadedAt: number;
}

export function QuestionCard({ number, question, section, year, uploadedAt }: QuestionCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isRecent = (uploadedAt: number) => {
    return Date.now() - uploadedAt < 24 * 60 * 60 * 1000;
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(question);
      setCopied(true);
      toast.success("Question copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy question");
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;
    if (isLongQuestion) setExpanded(!expanded);
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;
    setExpanded(!expanded);
  };

  const isLongQuestion = question.length > 150;

  return (
    <div
      className="question-card animate-fade-in"
      onClick={handleCardClick}
      style={{ cursor: isLongQuestion ? "pointer" : "default" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4 flex-1 min-w-0">
          {/* Number Badge */}
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-badge-bg flex items-center justify-center">
            <span className="text-sm font-semibold text-badge-text">
              {number}
            </span>
          </div>

          {/* Section + Question */}
          <div className="flex flex-col gap-1 pt-1">
            {isRecent(uploadedAt) && (
              <span className="text-xs text-green-500 font-semibold">
                Recently Uploaded
              </span>
            )}
            <span className="text-xs font-bold text-muted-foreground">
              {year} • {section}
            </span>
            <p
              className={`
                text-foreground text-sm sm:text-base leading-relaxed whitespace-pre-line
                ${expanded ? "" : "line-clamp-3"}
              `}
            >
              {question}
            </p>
            {isLongQuestion && (
              <button
                onClick={handleToggleExpand}
                className="text-xs font-medium text-primary hover:underline mt-1 w-fit"
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        </div>

        {/* Copy Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="flex-shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
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