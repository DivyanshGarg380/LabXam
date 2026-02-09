import { useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { QuestionsPage } from "@/components/QuestionsPage";
import { questionsDB } from "@/data/questions";
import { semesters, subjectMap, evalMap } from "@/data/mapping";

const Questions = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const semId = params.get("sem");
  const subjectId = params.get("subject");
  const evalId = params.get("eval");

  if (!semId || !subjectId || !evalId) {
    return <Navigate to="/empty" replace />;
  }

  const semester = semesters[semId];
  const subject = subjectMap[semId]?.[subjectId];
  const evaluationType = evalMap[evalId];

  if (!semester || !subject || !evaluationType) {
    return <Navigate to="/empty" replace />;
  }

  const data = questionsDB[semester]?.[subject]?.[evaluationType];

  if (!data) {
    return <Navigate to="/empty" replace />;
  }

  return (
    <QuestionsPage
      semester={semester}
      subject={subject}
      evaluationType={evaluationType}
      section={data.section}
      date={data.date}
      questions={data.questions}
      onBack={() => navigate(-1)}
    />
  );
};

export default Questions;
