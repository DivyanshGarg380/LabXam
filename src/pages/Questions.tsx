import { useSearchParams, useNavigate } from "react-router-dom";
import { QuestionsPage } from "@/components/QuestionsPage";
import { useEffect, useCallback, useState } from "react";
import { toast } from "sonner";
import {
  normalizeSemester,
  normalizeEvaluation,
  normalizeSubject,
} from "@/utils/normalize";
import { fetchQuestionsFromFirebase } from "@/firebase/getQuestions";

const Questions = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [allQuestions, setAllQuestions] = useState<
    { question: string; section: string }[]
  >([]);

  const navigate = useNavigate();

  const semester = searchParams.get("sem");
  const subject = searchParams.get("subject");
  const year = searchParams.get("year");
  const evalType = searchParams.get("eval");

  const redirectHome = useCallback(
    (message: string) => {
      toast.error(message);
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);
    },
    [navigate]
  );

  useEffect(() => {
    if (!semester || !subject || !year || !evalType) {
      redirectHome("Missing required query parameters.");
    }
  }, [semester, subject, year, evalType, redirectHome]);

  const semesterKey = semester ? normalizeSemester(semester) : "";
  const subjectKey = subject ? normalizeSubject(subject) : "";
  const evalKey = evalType ? normalizeEvaluation(evalType) : "";

  // Fetch questions from Firebase
  useEffect(() => {
    const loadQuestions = async () => {
      if (!semesterKey || !subjectKey || !evalKey || !year) return;

      setIsLoading(true);

      const data = await fetchQuestionsFromFirebase(
        semesterKey,
        subjectKey,
        evalKey,
        year
      );

      setAllQuestions(data);

      // keep your existing small delay effect feel
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    loadQuestions();
  }, [semesterKey, subjectKey, evalKey, year]);

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
      year={year ?? ""}
      questions={allQuestions}
      onBack={() => navigate("/", { replace: true })}
    />
  );
};

export default Questions;
