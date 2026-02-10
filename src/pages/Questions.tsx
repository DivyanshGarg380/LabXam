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

  const questionSet = questionsDB[semesterKey]?.[subjectKey]?.[evalKey];

  if(!questionSet) {
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

  return (
     <QuestionsPage
      semester={semesterKey}
      subject={subjectKey}
      evaluationType={evalKey}
      section={questionSet.section}
      year={year}
      questions={questionSet.questions}
      onBack={() => navigate(-1)}
    />
  )
}

export default Questions;