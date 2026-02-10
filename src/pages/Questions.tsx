import { useSearchParams, useNavigate } from "react-router-dom";
import { QuestionsPage } from "@/components/QuestionsPage";
import { useEffect } from "react"; 
import { toast } from "sonner";

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

  return (
     <QuestionsPage
      semester={`Semester ${semester}`}
      subject={subject.toUpperCase()}
      evaluationType={evalType}
      year={year}
      onBack={() => navigate(-1)}
    />
  )
}

export default Questions;