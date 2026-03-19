import { useEffect, useState } from "react";
import { auth, provider, db } from "@/firebase/config";
import { deleteQuestion } from "@/firebase/deleteQuestion";
import { updateQuestion } from "@/firebase/updateQuestion";
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
import { Trash2, Pencil } from "lucide-react";


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
  section: string;         // fix #5
  id: string;              // fix #6
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
  "eval-1": "Internal Evaluation 1",
  "eval-2": "Internal Evaluation 2",
  endsem: "Endsem",
};

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const [reports, setReports] = useState<{ id: string; message: string; resolved: boolean }[]>([]);
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

  // Edit states
  const [editingItem, setEditingItem] = useState<QuestionItem | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (u?.email) {
        const adminRef = doc(db, "admins", u.email);
        const adminSnap = await getDoc(adminRef);
        const adminAcess = adminSnap.exists();
        setIsAdmin(adminAcess);

        if(adminAcess) {
          loadReports();
        }
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

      const newList = questionsList.filter((q) => q.id !== item.id); // fix #6

      setQuestionsList(newList);

      toast.success("Question deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingItem || !editText.trim()) return;
    try {
      await updateQuestion(editingItem.docId, editingItem.text, editText);
      setQuestionsList((prev) =>
        prev.map((q) =>
          q.id === editingItem.id // fix #6
            ? { ...q, text: editText }
            : q
        )
      );
      setEditingItem(null);
      setEditText("");
      toast.success("Question updated");
    } catch {
      toast.error("Update failed");
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
          data.questions.forEach((question: string, index: number) => {
            allQuestions.push({
              text: question,
              docId: docSnap.id,
              section: data.section,             // fix #5
              id: `${docSnap.id}_${index}`,      // fix #6
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
      const normalizedQuestion = question.trim().replace(/\s+/g, " "); // fix #3

      const docId = `${semesterLabel}_${subject}_${year}_${evaluationLabel}_${section}`;

      const docRef = doc(db, "questions", docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          questions: arrayUnion(normalizedQuestion), // fix #3
        });
      } else {
        await setDoc(docRef, {
          semester: semesterLabel,
          subject,
          year,
          evaluation: evaluationLabel,
          section,
          questions: [normalizedQuestion], // fix #3
          createdAt: new Date(),
        });
      }

      setQuestion("");
      toast.success("Question added successfully!");
      await fetchQuestions(); // fix #7
    } catch (error) {
      toast.error("Permission denied");
    }
  };

  const loadReports = async () => {
    try {
      const q = query(
        collection(db, "reports"),
        where("resolved", "==", false),
        orderBy("createdAt", "desc") // requires composite index in Firestore console (fix #2)
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

          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground pt-10"
          >
              ← Back to Home
          </Link>
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
            {/* System Status */}
            <div className="flex items-center gap-2">
              <Link to="/admin/status">
                <Button variant="secondary" size="sm">
                  System Status
                </Button>
              </Link>

              {/* Logout */}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
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
              {questionsList.map((item) => (
                <div
                  key={item.id}
                  className="border border-border rounded-xl p-4 flex flex-col gap-3 bg-muted/20"
                >
                  {editingItem?.id === item.id ? (
                    <>
                      <textarea
                        className="w-full rounded-xl border border-input bg-background p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                        rows={4}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-4"
                          onClick={() => setEditingItem(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 px-4"
                          onClick={handleUpdateQuestion}
                        >
                          Save
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between gap-3">
                      <p className="text-sm flex-1 leading-relaxed pt-1">{item.text}</p>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-lg"
                          onClick={() => { setEditingItem(item); setEditText(item.text); }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                          onClick={() => handleDeleteQuestion(item)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

          {/* Reports Section */}
          <div className="bg-card border border-border rounded-2xl shadow-card mt-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="space-y-0.5">
                <h2 className="text-lg font-semibold tracking-tight">
                  User Reports
                </h2>
                <p className="text-xs text-muted-foreground">
                  Issues submitted by users
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {reports.length} active
              </div>
            </div>
            <div className="p-4">
              {loadingReports ? (
                <div className="flex items-center justify-center py-10">
                  <div className="h-6 w-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm font-medium">
                    No active reports
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    All issues have been resolved
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {reports.map((r) => (
                    <div
                      key={r.id}
                      className="group flex items-start gap-4 border border-border rounded-xl p-4 transition-colors hover:bg-muted/40"
                    >
                      <div className="w-1.5 h-8 bg-muted rounded-full mt-1" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm leading-relaxed">
                          {r.message}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Report ID: {r.id.slice(0, 6)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 opacity-70 group-hover:opacity-100 transition"
                        onClick={() => resolveReport(r.id)}
                      >
                        Resolve
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}