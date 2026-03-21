import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { db } from "@/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const subject_sem: Record<string, string[]> = {
  "1": ["PPS"],
  "2": ["IOOP", "DAV"],
  "3": ["DSL", "DISL"],
  "4": ["DBSL", "OSDL", "OSL"],
  "5": ["ESDL", "ISL"],
  "6": ["MADL", "NDLP"],
};

const evaluationLabels = {
  midsem: "Midsem",
  "eval-1": "Internal Evaluation 1",
  "eval-2": "Internal Evaluation 2",
  endsem: "Endsem",
};

const years = ["2024", "2025", "2026"];
const COOLDOWN_TIME = 2 * 60 * 1000;

const validateWithAI = async (
  question: string,
): Promise<{ valid: boolean; reason: string }> => {
  let response : Response;
    try {
      response = await fetch("/api/nvidia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta/llama3-70b-instruct",
          max_tokens: 256,
          messages: [
            {
              role: "user",
              content: `You are a STRICT validator for a university lab exam question submission portal for MIT Manipal students.
  
      Your job is to REJECT anything that is not clearly a proper lab exam question.
  
      A submission is VALID ONLY IF ALL of the following are true:
      - It is a clear programming/technical lab question from fields like:
        C, C++, Java, Python, SQL, Data Structures, Operating Systems, DBMS
      - It explicitly asks to:
        write a program, implement, design, develop, simulate, or solve something
      - It contains meaningful technical detail (inputs, outputs, constraints, logic, or description)
      - It is at least 40+ characters and clearly understandable
      - It looks like something that could appear in a real lab exam
  
      STRICT REJECTION RULES (very important):
      Mark as INVALID if ANY of the following is true:
      - Too short, vague, or incomplete
      - Does NOT contain an action (write/implement/design/etc.)
      - Is theoretical only (like definitions or explanations)
      - Is random text, spam, or copied garbage
      - Is conversational (e.g., "hi", "hello", "pls help")
      - Is not related to programming/technical lab work
      - Contains abusive or irrelevant content
      - Looks AI-generated but lacks concrete task details
      - Missing key structure (no clear task or objective)
  
      Be EXTREMELY STRICT. When in doubt, REJECT.
  
      Submitted text:
      "${question}"
  
      Respond ONLY in this exact JSON format, no extra text:
  
      {"valid": true, "reason": "Valid lab question"}
  
      OR
  
    {"valid": false, "reason": "Clear reason why it is invalid"}`,
            },
          ],
        }),
      });
    } catch (error) {
      console.log("Network error calling /api/nvidia:", error);
      return { valid: false, reason: "Validation service unavailable, please try again."};
    }

  if (!response.ok) {
    const text = await response.text();
    console.error("API error:", response.status, text);
    return { valid: false, reason: "Validation service unavailable, please try again." };
  }

  const text = await response.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("Invalid JSON from API:", text);
    throw new Error("Invalid JSON response");
  }

  if (!data.choices?.[0]?.message?.content) {
    console.error("Unexpected API response shape:", data);
    return { valid: false, reason: "Validation failed, please try again." };
  }

  try {
    const clean = data.choices[0].message.content.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return { valid: false, reason: "Validation failed, please try again." };
  }
};

const SubmitQuestion = () => {
  const [semester, setSemester] = useState("");
  const [year, setYear] = useState("");
  const [subject, setSubject] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const navigate = useNavigate();
  const [cooldown, setCoolDown] = useState<number | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const subjects = subject_sem[semester] || [];

  const [section, setSection] = useState("");
  const [evaluationType, setEvaluationType] = useState("");

  const MAX_VALIDATION_ATTEMPTS = 3;
  const VALIDATION_WINDOW = 60 * 1000;

  const checkValidationRateLimit = (): { allowed: boolean; waitSeconds: number } => {
    const raw = localStorage.getItem("validationAttempts");
    const now = Date.now();

    let attempts: number[] = raw ? JSON.parse(raw) : [];

    attempts = attempts.filter((t) => now - t < VALIDATION_WINDOW);

    if (attempts.length >= MAX_VALIDATION_ATTEMPTS) {
      const oldest = attempts[0];
      const waitSeconds = Math.ceil((VALIDATION_WINDOW - (now - oldest)) / 1000);
      return { allowed: false, waitSeconds };
    }

    attempts.push(now);
    localStorage.setItem("validationAttempts", JSON.stringify(attempts));
    return { allowed: true, waitSeconds: 0 };
  };

  useEffect(() => {
    if (cooldown === null) return;
    if (cooldown <= 0) {
      setCoolDown(null);
      return;
    }
    const timer = setTimeout(() => {
      setCoolDown((prev) => (prev ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    const lastSubmission = localStorage.getItem("lastSubmissionTime");
    if (lastSubmission) {
      const timePassed = Date.now() - parseInt(lastSubmission);
      if (timePassed < COOLDOWN_TIME) {
        const remaining = Math.ceil((COOLDOWN_TIME - timePassed) / 1000);
        setCoolDown(remaining);
      }
    }
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "lastSubmissionTime" && event.newValue) {
        const timePassed = Date.now() - parseInt(event.newValue);
        if (timePassed < COOLDOWN_TIME) {
          const remaining = Math.ceil((COOLDOWN_TIME - timePassed) / 1000);
          setCoolDown(remaining);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const sendQuestion = async () => {
    const lastSubmission = localStorage.getItem("lastSubmissionTime");
    if (lastSubmission) {
      const timePassed = Date.now() - parseInt(lastSubmission);
      if (timePassed < COOLDOWN_TIME) {
        const remaining = Math.ceil((COOLDOWN_TIME - timePassed) / 1000);
        setCoolDown(remaining);
        toast.error(`Please wait ${remaining}s before submitting again.`);
        return;
      }
    }

    if (!semester || !year || !subject || !question || !section || !evaluationType) {
      toast.error("Please fill all fields");
      return;
    }

    if (question.length < 40) {
      toast.error(
        "Please enter the complete lab question (min 40 characters).",
      );
      return;
    }

    const {allowed, waitSeconds } = checkValidationRateLimit();
    if(!allowed) {
      toast.error(`Too many attempts. Please wait ${waitSeconds}s before trying again.`);
      return;
    }

    setValidating(true);

    try {
      const { valid, reason } = await validateWithAI(question);
      if (!valid) {
        toast.error(`Invalid submission: ${reason}`);
        return;
      }
    } catch (err) {
      toast.error("Validation failed, please try again.");
      return;
    } finally {
      setValidating(false);
    }

    setLoading(true);
    try {
      const normalizedQuestion = question.trim().replace(/\s+/g, " ");
      await addDoc(collection(db, "pending"), {
        semester: `Semester ${semester}`,
        year,
        subject: subject.toLowerCase(),
        section: section.trim().toUpperCase(),
        evaluationType,
        question: normalizedQuestion,
        submittedAt: serverTimestamp(),
        status: "pending",
      });

      toast.success(
        "Question submitted! It will be reviewed before publishing.",
      );
      localStorage.setItem("lastSubmissionTime", Date.now().toString());
      setCoolDown(COOLDOWN_TIME / 1000);

      setSemester("");
      setYear("");
      setSubject("");
      setQuestion("");
      setSection("");
      setEvaluationType("");
    } catch {
      toast.error("Failed to submit, try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">
            Loading submission form...
          </p>
        </div>
      </div>
    );
  }

  const isSubmitting = validating || loading;

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
                <SelectItem value="5">Semester 5</SelectItem>
                <SelectItem value="6">Semester 6</SelectItem>
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

          {/* Section */}
          <div className="space-y-2">
              <label className="text-sm font-medium">Section</label>
              <input
                type="text"
                className="w-full h-11 rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your section"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                maxLength={7}
              />
          </div>

          {/* Evaluation Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Evaluation Type</label>
            <Select value={evaluationType} onValueChange={setEvaluationType}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select Evaluation Type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-lg">
                {Object.entries(evaluationLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
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
              placeholder="Enter the complete Lab Question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          {/* Send Question */}
          <button
            onClick={sendQuestion}
            disabled={isSubmitting || cooldown !== null}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium transition hover:opacity-90 disabled:opacity-50"
          >
            {validating
              ? "Validating question..."
              : loading
                ? "Submitting..."
                : cooldown
                  ? `Thank you, Wait ${cooldown}s`
                  : "Send Question"}
          </button>
        </div>
        
        {/* Footer */}
        <div className="mt-14 border-t border-border pt-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            For the students of{" "}
            <span className="font-medium text-foreground">MIT Manipal</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Built by{" "}
            <a
              href="https://github.com/Vidhan-152"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline underline-offset-4 transition"
            >
              Vidhan
            </a>
            {" & "}
            <a
              href="https://github.com/DivyanshGarg380"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline underline-offset-4 transition"
            >
              Divyansh
            </a>
            {" • "}
            <Link
              to="/report"
              className="hover:text-foreground transition underline-offset-4 hover:underline"
            >
              Report an issue
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubmitQuestion;
