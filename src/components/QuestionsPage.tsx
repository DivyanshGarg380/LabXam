import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/QuestionCard";
import { EmptyState } from "@/components/EmptyState";
import { ExternalLink } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
interface QuestionsPageProps {
  semester: string;
  subject: string;
  evaluationType: string;
  questions?: {
    id: string;
    question: string;
    section: string;
    year: string;
    uploaded_at: number;
  }[];
  onBack?: () => void;
}

export function QuestionsPage({
  semester,
  subject,
  evaluationType,
  questions = [],
  onBack,
}: QuestionsPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="
                mb-4 -ml-2
                flex items-center gap-2
                text-muted-foreground
                rounded-full
                px-3 py-2
                transition-all
                hover:bg-primary/10
                hover:text-primary
                group
              "
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium">Back</span>
            </Button>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {subject.toUpperCase()}
              </h1>
              {/* To remove after 23/04/2026 */}
              <div className="flex items-center gap-2">
                {subject?.toLowerCase() === "osdl" && evaluationType === "Endsem" && (
                  <>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button asChild size="sm" className="flex items-center gap-2">
                            <a
                              href="/OSDL_Practice.html"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              OSDL Practice Q's
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Made by Vidhan</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {semester}
              <span className="mx-2">•</span>
              <span className="font-medium text-foreground">
                {evaluationType}
              </span>
            </p>

            <div className="text-xs text-amber-400/80 bg-amber-400/10 border border-amber-400/20 px-3 py-2 rounded-md w-fit">
              Section tags are automatically assigned and may vary from the original exam.
            </div>
          </div>
        </div>

        {/* Questions List */}
        {questions.length > 0 ? (
          <div className="space-y-4 pt-2">
            {[...questions]
              .sort((a, b) => {
                const parse = (d: string) => { const [dd, mm, yyyy] = d.split("/"); return new Date(`${yyyy}-${mm}-${dd}`).getTime(); };
                return parse(b.year) - parse(a.year);
              })
              .map(({ id, question, section, year, uploaded_at }, index) => (
              <div
                key={id}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <QuestionCard
                  questionId={id}
                  number={index + 1}
                  question={question}
                  section={section}
                  year={year}
                  uploadedAt={uploaded_at}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No questions available"
            description="Questions for this evaluation will be added soon."
          />
        )}
      </div>
    </div>
  );
}
