import { useSearchParams, useNavigate } from "react-router-dom";
import { QuestionsPage } from "@/components/QuestionsPage";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  normalizeSemester,
  normalizeEvaluation,
  normalizeSubject,
} from "@/utils/normalize";
import { questionsDB } from "@/data/questions";

const Questions = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const semester = searchParams.get("sem");
  const subject = searchParams.get("subject");
  const year = searchParams.get("year");
  const evalType = searchParams.get("eval");

  const redirectHome = (message: string) => {
    toast.error(message);
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 2000);
  };

  useEffect(() => {
    if (!semester || !subject || !year || !evalType) {
      redirectHome("Missing required query parameters.");
    }
  }, [semester, subject, year, evalType]);

  const semesterKey = semester ? normalizeSemester(semester) : "";
  const subjectKey = subject ? normalizeSubject(subject) : "";
  const evalKey = evalType ? normalizeEvaluation(evalType) : "";

  const evalData =
    semesterKey && subjectKey && evalKey
      ? questionsDB[semesterKey]?.[subjectKey]?.[evalKey]
      : null;

  const allQuestions = useMemo(() => {
    if (!evalData) return [];

    const result: { question: string; section: string }[] = [];

    Object.entries(evalData).forEach(([sectionName, data]: any) => {
      if (data.year === year) {
        data.questions.forEach((q: string) => {
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