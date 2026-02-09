import { useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { QuestionsPage } from "@/components/QuestionsPage";
import { questionsDB } from "@/data/questions";

const Questions = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const semester = params.get("sem");
  const subject = params.get("subject");
  const evaluationType = params.get("eval");

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
