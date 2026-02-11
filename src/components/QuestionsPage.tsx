import { ArrowLeft, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/QuestionCard";
import { EmptyState } from "@/components/EmptyState";

interface QuestionsPageProps {
  semester: string;
  subject: string;
  evaluationType: string;
  year: string;
  questions?: {
    question: string;
    section: string;
  }[];
  onBack?: () => void;
}

export function QuestionsPage({
  semester,
  subject,
  evaluationType,
  year,
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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {subject.toUpperCase()}
            </h1>

            <p className="text-sm text-muted-foreground">
              {semester}
              <span className="mx-2">•</span>
              <span className="font-medium text-foreground">
                {evaluationType}
              </span>
            </p>
          </div>
        </div>

        {/* Questions List */}
        {questions.length > 0 ? (
          <div className="space-y-4 pt-2">
           {questions.map(({ question, section }, index) => (
              <div
                key={`${index}-${question.slice(0, 20)}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <QuestionCard
                  number={index + 1}
                  question={question}
                  section={section}
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
