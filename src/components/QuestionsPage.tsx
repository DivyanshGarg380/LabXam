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
  date?: string;
  questions?: string[];
  onBack?: () => void;
}

export function QuestionsPage({
  semester,
  subject,
  evaluationType,
  section = "Section A",
  date = "Dec 2024",
  questions = [],
  onBack,
}: QuestionsPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {subject}
            </h1>
            <p className="text-muted-foreground">
              {semester} · {evaluationType}
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <Badge>
                <Users className="w-3 h-3 mr-1.5" />
                {section}
              </Badge>
              <Badge>
                <Calendar className="w-3 h-3 mr-1.5" />
                {date}
              </Badge>
            </div>
          </div>
        </div>

        {/* Questions List */}
        {questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <QuestionCard
                key={index}
                number={index + 1}
                question={question}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
