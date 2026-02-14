import { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate} from "react-router-dom";


const subject_sem: Record<string, string[]> = {
  "1": ["PPS"],
  "2": ["IOOP", "DAV"],
  "3": ["DSL", "DISL"],
  "4": ["DBSL", "OSDL", "OSL"],
};

const years = ["2025", "2026"];

const SubmitQuestion = () => {
  const [semester, setSemester] = useState("");
  const [year, setYear] = useState("");
  const [subject, setSubject] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [cooldown, setCoolDown] = useState<number | null>(null);

  useEffect(() => {
    if(cooldown === null) return;
    if(cooldown <= 0) {
      setCoolDown(null);
      return;
    }

    const timer = setTimeout(() => {
      setCoolDown((prev) => (prev ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  const subjects = subject_sem[semester] || [];

  const sendQuestion = async () => {

    const COOLDOWN_TIME = 2*60*1000;

    const lastSubmission = localStorage.getItem("lastSubmissionTime");
    if(lastSubmission) {
      const timePassed = Date.now() - parseInt(lastSubmission);
      if(timePassed < COOLDOWN_TIME) {
        const remaining = Math.ceil((COOLDOWN_TIME - timePassed) / 1000);
        setCoolDown(remaining);
        toast.error(`Please wait ${remaining}s before submitting again.`);
        return;
      }
    }

    if (!semester || !year || !subject || !question) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          semester,
          year,
          subject,
          question,
          submitted_at: new Date().toLocaleString(),
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      toast.success("Question Submitted Successfully");
      localStorage.setItem("lastSubmissionTime", Date.now().toString());
      setCoolDown(120);

      setSemester("");
      setYear("");
      setSubject("");
      setQuestion("");
    } catch (err) {
      console.log(err);
      toast.error("Failed to send, Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="max-w-2xl mx-auto">
          <div className="bg-card border rounded-2xl p-8 shadow-lg space-y-6">
            <button
                onClick={() => navigate("/")}
                className="text-sm text-muted-foreground hover:text-primary transition"
                >
                ← Back to Home
            </button>

            <h1 className="text-3xl font-bold text-center">
            Submit Exam Question
            </h1>

            {/* Semester */}
            <div className="space-y-2">
            <label className="text-sm font-medium">Semester</label>

            <Select
                value={semester}
                onValueChange={(value) => {
                setSemester(value);
                setSubject("");
                }}
            >
                <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select Semester" />
                </SelectTrigger>

                <SelectContent className="rounded-xl shadow-lg">
                <SelectItem value="1">Semester 1</SelectItem>
                <SelectItem value="2">Semester 2</SelectItem>
                <SelectItem value="3">Semester 3</SelectItem>
                <SelectItem value="4">Semester 4</SelectItem>
                </SelectContent>
            </Select>
            </div>

            {/* Year */}
            <div className="space-y-2">
            <label className="text-sm font-medium">Year</label>

            <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select Year" />
                </SelectTrigger>

                <SelectContent className="rounded-xl shadow-lg">
                {years.map((y) => (
                    <SelectItem key={y} value={y}>
                    {y}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>

            <Select
                value={subject}
                onValueChange={setSubject}
                disabled={!semester}
            >
                <SelectTrigger className="rounded-xl">
                <SelectValue
                    placeholder={
                    semester ? "Select Subject" : "Select Semester First"
                    }
                />
                </SelectTrigger>

                <SelectContent className="rounded-xl shadow-lg">
                {subjects.map((sub) => (
                    <SelectItem key={sub} value={sub}>
                    {sub}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>

            {/* Question */}
            <div className="space-y-2">
            <label className="text-sm font-medium">Question</label>
            <textarea
                className="w-full min-h-[150px] rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Enter the exam question with all necessary details and mention your class and section."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
            />
            </div>

            {/* Button */}
            <button
              onClick={sendQuestion}
              disabled={loading || cooldown !== null}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium transition hover:opacity-90 disabled:opacity-50"
            >
              {loading
                ? "Sending..."
                : cooldown
                ? `Wait ${cooldown}s`
                : "Send Question"}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-14 border-t border-border pt-6 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                For the students of <span className="font-medium text-foreground">MIT Manipal</span>
                </p>

                <p className="text-xs text-muted-foreground">
                Built by <span className="font-medium text-foreground">Starman</span>{" "}
                — simplifying LAB EXAM prep
                </p>
          </div>
      </div>
    </div>
  );
};

export default SubmitQuestion;
