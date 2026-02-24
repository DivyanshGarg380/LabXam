import { useEffect, useState } from "react";
import { auth, provider, db } from "@/firebase/config";
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
} from "firebase/firestore";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


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

const semesters = [
  { value: "1", label: "Semester 1" },
  { value: "2", label: "Semester 2" },
  { value: "3", label: "Semester 3" },
  { value: "4", label: "Semester 4" },
  { value: "5", label: "Semester 5" },
  { value: "6", label: "Semester 6" },
  { value: "7", label: "Semester 7" },
  { value: "8", label: "Semester 8" },
];

const subjectsBySemester: SubjectsMap = {
  "1": [
    { value: "pps", label: "Programming for Problem Solving (PPS)" },
  ],
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
  "8": ["midsem", "eval-1", "eval-2", "endsem"],
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

  // Form states
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [evalType, setEvalType] = useState("");
  const [section, setSection] = useState("");
  const [question, setQuestion] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (u?.email) {
        const adminRef = doc(db, "admins", u.email);
        const adminSnap = await getDoc(adminRef);
        setIsAdmin(adminSnap.exists());
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
      console.error(error);
      toast.error("Permission denied");
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
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
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
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>

          {/* Evaluation */}
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
        </div>
      </div>
    </div>
  );
}
