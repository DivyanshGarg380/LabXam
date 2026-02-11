import { useSearchParams, useNavigate } from "react-router-dom";
import { QuestionsPage } from "@/components/QuestionsPage";
import { useEffect, useMemo } from "react"; 
import { toast } from "sonner";
import { normalizeSemester, normalizeEvaluation, normalizeSubject } from "@/utils/normalize";
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
      navigate("/", { replace:true });
    }, 2000);
  }

  const semesterKey = semester ? normalizeSemester(semester) : null;
  const subjectKey = subject ? normalizeSubject(subject) : null;
  const evalKey = evalType ? normalizeEvaluation(evalType) : null;

  const evalData =
    semesterKey && subjectKey && evalKey
      ? questionsDB[semesterKey]?.[subjectKey]?.[evalKey]
      : null;


  useEffect(() => {
    if (!semester || !subject || !year || !evalType) {
      redirectHome("Missing required query parameters.");
      return;
    }

    if (!semesterKey || !subjectKey || !evalKey) {
      redirectHome("Invalid URL parameters.");
      return;
    }

    if (!evalData) {
      redirectHome("Invalid combination of parameters.");
      return;
    }
  }, [ semester, subject, year, evalType, semesterKey, subjectKey, evalKey, evalData]);

  if (!semester || !subject || !year || !evalType || !semesterKey || !subjectKey || !evalKey || !evalData) {
    return null;
  }

  const allQuestions = useMemo(() => {
    const result: { question: string; section: string }[] = [];

    Object.entries(evalData).forEach(([sectionName, data]) => {
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

  useEffect(() => {
    if (allQuestions.length === 0) {
      redirectHome("No data found for selected year.");
    }
  }, [allQuestions]);

  if (allQuestions.length === 0) return null;

  return (
    <QuestionsPage
      semester={semesterKey}
      subject={subjectKey}
      evaluationType={evalKey}
      year={year}
      questions={allQuestions}
      onBack={() => navigate("/", { replace: true })}
    />
  );
};


export default Questions;