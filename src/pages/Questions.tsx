import { useSearchParams, useNavigate } from "react-router-dom";
import { QuestionsPage } from "@/components/QuestionsPage";
import { useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import {
  normalizeSemester,
  normalizeEvaluation,
  normalizeSubject,
} from "@/utils/normalize";
import { questionsDB } from "@/data/questions";

type SectionData = {
  year: string;
  questions: string[];
};

type EvaluationData = Record<string, SectionData>;

const Questions = () => {
  const [searchParams] = useSearchParams();
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

  const evalData: EvaluationData | null =
    semesterKey && subjectKey && evalKey
      ? (questionsDB[semesterKey]?.[subjectKey]?.[evalKey] as
          | EvaluationData
          | undefined) ?? null
      : null;

  const allQuestions = useMemo(() => {
    if (!evalData) return [];

    const result: { question: string; section: string }[] = [];

    Object.entries(evalData).forEach(([sectionName, data]) => {
      if (data.year === String(year)) {
        data.questions.forEach((q) => {
          result.push({
            question: q,
            section: sectionName,
          });
        });
      }
    });

    return result;
  }, [evalData, year]);

  return (
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