import { useEffect, useState } from "react";
import { auth, provider, db } from "@/firebase/config";
import { deleteQuestion } from "@/firebase/deleteQuestion";
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  collection,
  query,
  where,
  getDocs,
  orderBy
} from "firebase/firestore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";


type Subject = {
  value: string;
  label: string;
};

type SubjectsMap = {
  [semester: string]: Subject[];
};

type EvaluationMap = {
  [semester: string]: string[];
};

type QuestionItem = {
  text: string;
  docId: string;
};

const semesters = [
  { value: "1", label: "Semester 1" },
  { value: "2", label: "Semester 2" },
  { value: "3", label: "Semester 3" },
  { value: "4", label: "Semester 4" },
  { value: "5", label: "Semester 5" },
  { value: "6", label: "Semester 6" },
  { value: "7", label: "Semester 7" },
];

const subjectsBySemester: SubjectsMap = {
  "1": [{ value: "pps", label: "Programming for Problem Solving (PPS)" }],
  "2": [
    { value: "ioop", label: "Introduction to OOP (IOOP)" },
    { value: "dav", label: "Data Analysis & Visualization (DAV)" },
  ],
  "3": [
    { value: "dsl", label: "Data Structures Lab (DSL)" },
    { value: "disl", label: "Digital Systems Lab (DISL)" },
  ],
  "4": [
    { value: "dbsl", label: "Database Systems (DBSL)" },
    { value: "osdl", label: "Software Development Lab (OSDL)" },
    { value: "osl", label: "Operating Systems Lab (OSL)" },
  ],
  "5": [],
  "6": [],
};

const evaluationBySemester: EvaluationMap = {
  "1": ["midsem", "eval-1", "eval-2", "endsem"],
  "2": ["midsem", "eval-1", "eval-2", "endsem"],
  "3": ["midsem", "eval-1", "eval-2", "endsem"],
  "4": ["midsem", "eval-1", "eval-2", "endsem"],
  "5": ["midsem", "eval-1", "eval-2", "endsem"],
  "6": ["midsem", "eval-1", "eval-2", "endsem"],
  "7": ["midsem", "eval-1", "eval-2", "endsem"],
};

const evaluationLabelMap: Record<string, string> = {
  midsem: "Midsem",
  "eval-1": "Evaluation 1",
  "eval-2": "Evaluation 2",
  endsem: "Endsem",
};

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const [reports, setReports] = useState<
    { id: string; message: string; resolved: boolean }[]
  >([]);
  const [loadingReports, setLoadingReports] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);

  // Form states
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [evalType, setEvalType] = useState("");
  const [section, setSection] = useState("");
  const [question, setQuestion] = useState("");
  const [questionsList, setQuestionsList] = useState<QuestionItem[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (u?.email) {
        const adminRef = doc(db, "admins", u.email);
        const adminSnap = await getDoc(adminRef);
        const adminAcess = adminSnap.exists();
        setIsAdmin(adminAcess);

        // if(adminAcess) {
        //   loadReports();
        // }
      } else {
        setIsAdmin(false);
      }
    });

    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    if (!auth || !provider) {
      toast.error("Firebase is not configured properly.");
      return;
    }

    await signInWithPopup(auth, provider);
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const handleDeleteQuestion = async (item: QuestionItem) => {
    try {
      await deleteQuestion(item.docId, item.text);

      const newList = questionsList.filter(
        (q) => !(q.text === item.text && q.docId === item.docId)
      );

      setQuestionsList(newList);

      toast.success("Question deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const fetchQuestions = async () => {
    if (!semester || !subject || !year || !evalType) {
      toast.error("Select necessary fields");
      return;
    }

    try {
      const semesterLabel = `Semester ${semester}`;
      const evaluationLabel = evaluationLabelMap[evalType];

      const q = query(
        collection(db, "questions"),
        where("semester", "==", semesterLabel),
        where("subject", "==", subject),
        where("year", "==", year),
        where("evaluation", "==", evaluationLabel)
      );

      const snapshot = await getDocs(q);

      const allQuestions: QuestionItem[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();

        if (data.questions) {
          data.questions.forEach((question: string) => {
            allQuestions.push({
              text: question,
              docId: docSnap.id,
            });
          });
        }
      });

      setQuestionsList(allQuestions);

      if (allQuestions.length === 0) {
        toast.error("No questions found");
      } else {
        setOpenDialog(true);
      }
    } catch (error) {
      toast.error("Failed to load questions");
    }
  };

  const handleAddQuestion = async () => {
    if (!semester || !subject || !year || !evalType || !section || !question) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const semesterLabel = `Semester ${semester}`;
      const evaluationLabel = evaluationLabelMap[evalType];

      const docId = `${semesterLabel}_${subject}_${year}_${evaluationLabel}_${section}`;

      const docRef = doc(db, "questions", docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          questions: arrayUnion(question),
        });
      } else {
        await setDoc(docRef, {
          semester: semesterLabel,
          subject,
          year,
          evaluation: evaluationLabel,
          section,
          questions: [question],
          createdAt: new Date(),
        });
      }

      setQuestion("");
      toast.success("Question added successfully!");
    } catch (error) {
      toast.error("Permission denied");
    }
  };

  const loadReports = async () => {
    try {
      const q = query(
        collection(db, "reports"),
        where("resolved", "==", false),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);

      const data: { id: string; message: string; resolved: boolean }[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();

        data.push({
          id: docSnap.id,
          message: d.message,
          resolved: d.resolved ?? false,
        });
      });

      setReports(data);
    } catch (err) {
      toast.error("Failed to load reports");
    } finally {
      setLoadingReports(false);
    }
  };

  const resolveReport = async (id: string) => {
    try {
      const ref = doc(db, "reports", id);

      await updateDoc(ref, { resolved: true });

      setReports((prev) => prev.filter((r) => r.id !== id));

      toast.success("Report resolved");
    } catch (err) {
      toast.error("Failed to resolve report");
    }
  };

  if (!user) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-background">
        <h2 className="absolute top-20 text-4xl md:text-6xl font-black tracking-[0.5em] uppercase text-red-600 animate-pulse drop-shadow-[0_0_30px_rgba(255,0,0,1)] text-center">
          YOU THOUGHT THAT WOULD WORK? 😼
        </h2>

        <div className="w-[380px] bg-card border border-border shadow-sm rounded-2xl p-8 space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Admin Portal
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in with your Google account to continue
            </p>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full h-11 flex items-center justify-center gap-3"
          >
            <img
              src="/google.webp"
              className="w-5 h-5"
              alt="Google"
            />
            Continue with Google   
          </Button>

          <p className="text-xs text-muted-foreground">
            Access is restricted to authorized admins only.
          </p>
        </div>
      </div>
    );
  }

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Checking access...</p>
      </div>
    );
  } 

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Access Denied </h2>
        <Link to="/" className="text-sm text-white-500 hover:text-white-700">
          Redirect back to Home 😂
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-xl py-10">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>

            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          {/* Semester */}
          <Select
            value={semester}
            onValueChange={(value) => {
              setSemester(value);
              setSubject("");
              setEvalType("");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Subject */}
          <Select
            value={subject}
            onValueChange={setSubject}
            disabled={!semester}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              {subjectsBySemester[semester]?.map((sub) => (
                <SelectItem key={sub.value} value={sub.value}>
                  {sub.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Year */}
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Evaluation Type */}
          <Select
            value={evalType}
            onValueChange={setEvalType}
            disabled={!semester}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Evaluation Type" />
            </SelectTrigger>
            <SelectContent>
              {evaluationBySemester[semester]?.map((e) => (
                <SelectItem key={e} value={e}>
                  {evaluationLabelMap[e]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Section */}
          <input
            className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm"
            placeholder="Section"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          />

          {/* Question */}
          <textarea
            className="w-full rounded-xl border border-input bg-background p-3 text-sm"
            placeholder="Enter Question"
            rows={4}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <Button className="w-full h-11" onClick={handleAddQuestion}>
            Add Question
          </Button>
          

          <Button variant="secondary" className="w-full" onClick={fetchQuestions}>
            Load Questions
          </Button>
          
          {/* Load prev questions (Deletion purposes) */}
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Existing Questions</DialogTitle>
              </DialogHeader>

              <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                {questionsList.map((item, index) => (
                  <div
                    key={index}
                    className="border border-border rounded-xl p-3 flex justify-between gap-3"
                  >
                    <p className="text-sm flex-1">{item.text}</p>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                      onClick={() => handleDeleteQuestion(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}