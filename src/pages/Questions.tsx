import { useSearchParams, useNavigate } from "react-router-dom";
import { QuestionsPage } from "@/components/QuestionsPage";
import { useEffect, useCallback, useState } from "react";
import { toast } from "sonner";
import { QuestionCardSkeleton } from "@/components/QuestionCardSkeleton";

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
  <div className="min-h-screen max-w-2xl mx-auto px-4 py-8 flex flex-col gap-3">
    {/* mimics the header area above cards */}
    <div className="flex gap-2 mb-1">
      <div className="skeleton h-[14px] w-28 rounded" />
      <div className="skeleton h-[14px] w-20 rounded" />
    </div>
    {Array.from({ length: 5 }).map((_, i) => (
      <QuestionCardSkeleton key={i} />
    ))}
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
