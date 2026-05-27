import { Copy, Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { fetchAiSolution } from "@/supabase/solutions";

interface QuestionCardProps {
  questionId: string;
  number: number;
  question: string;
  section: string;
  year: string;
  uploadedAt: number;
}

export function QuestionCard({
  questionId,
  number,
  question,
  section,
  year,
  uploadedAt,
}: QuestionCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [solution, setSolution] = useState("");
  const [solutionError, setSolutionError] = useState("");
  const [isSolutionOpen, setIsSolutionOpen] = useState(false);
  const [isLoadingSolution, setIsLoadingSolution] = useState(false);

  const isRecent = (year: string) => {
    return Date.now() - uploadedAt < 23 * 60 * 60 * 1000;
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

  const handleSolution = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (solution) {
      setIsSolutionOpen((open) => !open);
      return;
    }

    setIsLoadingSolution(true);
    setIsSolutionOpen(true);
    setSolutionError("");

    try {
      const data = await fetchAiSolution(questionId);
      setSolution(data.solution);
      toast.success(
        data.cached ? "Loaded saved solution" : "Solution generated",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load solution";
      setSolutionError(message);
      toast.error(message);
    } finally {
      setIsLoadingSolution(false);
    }
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
            {isRecent(year) && (
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

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSolution}
            disabled={isLoadingSolution}
            className="h-8 gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            {isLoadingSolution ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {solution && isSolutionOpen ? "Hide" : "Solution"}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
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

      {isSolutionOpen && (
        <div
          className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed"
          onClick={(e) => e.stopPropagation()}
        >
          {isLoadingSolution ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Preparing solution...
            </div>
          ) : solutionError ? (
            <div className="text-destructive">{solutionError}</div>
          ) : (
            <div className="whitespace-pre-line text-foreground">{solution}</div>
          )}
        </div>
      )}
    </div>
  );
}
