import { useSearchParams, useNavigate } from "react-router-dom";
import { QuestionsPage } from "@/components/QuestionsPage";
import { useEffect } from "react"; 
import { toast } from "sonner";
import { normalizeSemester, normalizeEvaluation, normalizeSubject } from "@/utils/normalize";
import { questionsDB } from "@/data/questions";

const Questions = () => {
  const [searchParams] = useSearchParams();
  const semester = searchParams.get("sem");
  const subject = searchParams.get("subject");
  const year = searchParams.get("year");
  const evalType = searchParams.get("eval");

  const navigate = useNavigate();

  useEffect(() => {
    if(!semester || !subject || !year || !evalType) {
      toast.error("Missing required query parameters. Redirecting to home.");
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);
      return;
    }
  }, [semester, subject, year, evalType, navigate]);

  if(!semester || !subject || !year || !evalType) return null;

  const semesterKey = normalizeSemester(semester);
  const subjectKey = normalizeSubject(subject);
  const evalKey = normalizeEvaluation(evalType);

  const evalData = questionsDB[semesterKey]?.[subjectKey]?.[evalKey];

  if(!evalData || Object.keys(evalData).length === 0) {
    return (
      <QuestionsPage
        semester={semesterKey}
        subject={subjectKey}
        evaluationType={evalKey}
        year={year}
        questions={[]}
        onBack={() => navigate(-1)}
      />
    );
  }

  const allQuestions: { question: string; section: string }[] = [];
  
  Object.entries(evalData).forEach(([sectionData, data]) => {
    if(data.year === year) {
      data.questions.forEach((q) => {
      allQuestions.push({
        question: q,
        section: sectionData,
      });
    });
    }
  })

  return (
    <QuestionsPage
      semester={semesterKey}
      subject={subjectKey}
      evaluationType={evalKey}
      year={year}
      questions={allQuestions}
      onBack={() => navigate(-1)}
    />
  );
}

export default Questions;