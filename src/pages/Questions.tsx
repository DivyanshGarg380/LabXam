import { useSearchParams, useNavigate } from "react-router-dom";
import { QuestionsPage } from "@/components/QuestionsPage";
import { useEffect, useCallback, useState } from "react";
import { toast } from "sonner";
import {
  normalizeSemester,
  normalizeEvaluation,
  normalizeSubject,
} from "@/utils/normalize";
import { fetchQuestions } from "@/supabase/getQuestions";

const Questions = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [allQuestions, setAllQuestions] = useState<
    { question: string; section: string; year: string, uploaded_at: number }[]
  >([]);

  const navigate = useNavigate();

  const semester = searchParams.get("sem");
  const subject = searchParams.get("subject");
  const evalType = searchParams.get("eval");

  const redirectHome = useCallback(
    (message: string) => {
      toast.error(message);
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 5500);
    },
    [navigate]
  );

  useEffect(() => {
    if (!semester || !subject || !evalType) {
      redirectHome("Missing required query parameters.");
    }
  }, [semester, subject, evalType, redirectHome]);

  const semesterKey = semester ? normalizeSemester(semester) : "";
  const subjectKey = subject ? normalizeSubject(subject) : "";
  const evalKey = evalType ? normalizeEvaluation(evalType) : "";

  console.log("Params:", { semester, subject, evalType });
  console.log("Normalized:", { semesterKey, subjectKey, evalKey });

  useEffect(() => {
    if (!semesterKey || !subjectKey || !evalKey) {
      redirectHome("Invalid parameters. Redirecting to home...");
    }
  }, [semesterKey, subjectKey, evalKey, redirectHome]);

  useEffect(() => {
    const loadQuestions = async () => {
      if (!semesterKey || !subjectKey || !evalKey) return;

      setIsLoading(true);

      const data = await fetchQuestions(
        semesterKey,
        subjectKey,
        evalKey,
      );

      if(!data || data.length === 0) {
        setIsLoading(false);
        redirectHome("Questions not found. Redirecting to home...");
        return;
      }

      setAllQuestions(data);

      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    loadQuestions();
  }, [semesterKey, subjectKey, evalKey, redirectHome]);

  return isLoading ? (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">
          Fetching questions...
        </p>
      </div>
    </div>
  ) : (
    <QuestionsPage
      semester={semesterKey}
      subject={subjectKey}
      evaluationType={evalKey}
      questions={allQuestions}
      onBack={() => navigate("/", { replace: true })}
    />
  );
};

export default Questions;
