import { ArrowLeft, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/Badge";
import { QuestionCard } from "@/components/QuestionCard";
import { EmptyState } from "@/components/EmptyState";

interface QuestionsPageProps {
  semester: string;
  subject: string;
  evaluationType: string;
  section?: string;
  year: string;
  questions?: string[];
  onBack?: () => void;
}

export function QuestionsPage({
  semester,
  subject,
  evaluationType,
  section,
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
              {subject}
            </h1>

            <p className="text-sm text-muted-foreground">
              {semester} &nbsp;•&nbsp; {evaluationType}
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {section && (
                <Badge>
                  <Users className="w-3 h-3 mr-1.5" />
                  {section}
                </Badge>
              )}

              <Badge>
                <Calendar className="w-3 h-3 mr-1.5" />
                {year}
              </Badge>
            </div>
          </div>
        </div>

        {/* Questions List */}
        {questions.length > 0 ? (
          <div className="space-y-4 pt-2">
            {questions.map((question, index) => (
              <QuestionCard
                key={index}
                number={index + 1}
                question={question}
              />
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
