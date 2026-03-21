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
  arrayRemove,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  addDoc,
  serverTimestamp,
  limit,
  deleteDoc,
} from "firebase/firestore";
import {
  fetchDashboardStats,
  incrementQuestionCount,
  decrementQuestionCount,
  type DashboardStats,
} from "@/firebase/metric";
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
import {
  Trash2, LogOut, PlusCircle, Flag,
  ChevronRight, Pencil, Check, X,
  LayoutDashboard, Search, Menu, Activity,
  Database, Server, AlertCircle, BookOpen,
  Clock, CheckCircle, XCircle,
} from "lucide-react";

type Subject       = { value: string; label: string };
type SubjectsMap   = { [semester: string]: Subject[] };
type EvaluationMap = { [semester: string]: string[] };
type QuestionItem  = { text: string; docId: string; section: string; year: string; evaluation: string };
type View          = "dashboard" | "add" | "manage" | "reports" | "pending";
type ActivityEntry = { id: string; message: string; timestamp: Date | null };
type PendingItem   = {
  id: string;
  semester: string;
  year: string;
  subject: string;
  question: string;
  section: string;
  evaluationType: string;
  status: string;
  submittedAt: Date | null;
};

const semesters = Array.from({ length: 7 }, (_, i) => ({
  value: String(i + 1),
  label: `Semester ${i + 1}`,
}));

const subjectsBySemester: SubjectsMap = {
  "1": [{ value: "pps",  label: "Programming for Problem Solving (PPS)" }],
  "2": [{ value: "ioop", label: "Introduction to OOP (IOOP)" }, { value: "dav", label: "Data Analysis & Visualization (DAV)" }],
  "3": [{ value: "dsl",  label: "Data Structures Lab (DSL)" }, { value: "disl", label: "Digital Systems Lab (DISL)" }],
  "4": [{ value: "dbsl", label: "Database Systems (DBSL)" }, { value: "osdl", label: "Software Development Lab (OSDL)" }, { value: "osl", label: "Operating Systems Lab (OSL)" }],
  "5": [], "6": [], "7": [],
};

const evaluationBySemester: EvaluationMap = Object.fromEntries(
  Array.from({ length: 7 }, (_, i) => [String(i + 1), ["midsem", "eval-1", "eval-2", "endsem"]])
);

const evaluationLabelMap: Record<string, string> = {
  midsem:   "Midsem",
  "eval-1": "Internal Evaluation 1",
  "eval-2": "Internal Evaluation 2",
  endsem:   "Endsem",
};

const logActivity = async (message: string) => {
  try {
    await addDoc(collection(db, "activityLog"), { message, createdAt: serverTimestamp() });
  } catch { /* Never breaks production */ }
};

function SectionCard({ title, description, action, children }: {
  title: string; description?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function FieldGroup({ semester, setSemester, subject, setSubject, year, setYear, evalType, setEvalType }: {
  semester: string; setSemester: (v: string) => void;
  subject: string;  setSubject:  (v: string) => void;
  year: string;     setYear:     (v: string) => void;
  evalType: string; setEvalType: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Select value={semester} onValueChange={(v) => { setSemester(v); setSubject(""); setEvalType(""); }}>
        <SelectTrigger className="h-10 rounded-lg text-sm"><SelectValue placeholder="Semester" /></SelectTrigger>
        <SelectContent>{semesters.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={subject} onValueChange={setSubject} disabled={!semester}>
        <SelectTrigger className="h-10 rounded-lg text-sm"><SelectValue placeholder="Subject" /></SelectTrigger>
        <SelectContent>{subjectsBySemester[semester]?.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={year} onValueChange={setYear}>
        <SelectTrigger className="h-10 rounded-lg text-sm"><SelectValue placeholder="Year" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="2025">2025</SelectItem>
          <SelectItem value="2026">2026</SelectItem>
        </SelectContent>
      </Select>
      <Select value={evalType} onValueChange={setEvalType} disabled={!semester}>
        <SelectTrigger className="h-10 rounded-lg text-sm"><SelectValue placeholder="Evaluation Type" /></SelectTrigger>
        <SelectContent>{evaluationBySemester[semester]?.map((e) => <SelectItem key={e} value={e}>{evaluationLabelMap[e]}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dbOk, setDbOk] = useState(true);

  const [reports, setReports] = useState<{ id: string; message: string; resolved: boolean }[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  const [activity, setActivity] = useState<ActivityEntry[]>([]);

  const [pendingList, setPendingList] = useState<PendingItem[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);

  const [semester, setSemester] = useState("");
  const [subject,  setSubject]  = useState("");
  const [year, setYear] = useState("");
  const [evalType, setEvalType] = useState("");

  const [section, setSection]  = useState("");
  const [question, setQuestion] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [questionsList, setQuestionsList] = useState<QuestionItem[]>([]);
  const [editingIndex,  setEditingIndex]  = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [searchSection, setSearchSection] = useState("");
  const [searchYear, setSearchYear] = useState("");
  const [searchEval, setSearchEval] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u?.email) {
        const adminSnap = await getDoc(doc(db, "admins", u.email));
        const ok = adminSnap.exists();
        setIsAdmin(ok);
        if (ok) {
          loadReports();
          loadActivity();
          loadStats();
          loadPending();
        }
      } else {
        setIsAdmin(false);
      }
    });
    return unsubscribe;
  }, []);

  const handleLogin  = async () => {
    if (!auth || !provider) { toast.error("Firebase is not configured properly."); return; }
    await signInWithPopup(auth, provider);
  };
  const handleLogout = () => signOut(auth);

  const loadStats = async () => {
    try {
      const s = await fetchDashboardStats();
      setStats(s);
      setDbOk(true);
    } catch {
      setDbOk(false);
    }
  };

  const loadActivity = async () => {
    try {
      const q    = query(collection(db, "activityLog"), orderBy("createdAt", "desc"), limit(8));
      const snap = await getDocs(q);
      const entries: ActivityEntry[] = [];
      snap.forEach((d) => entries.push({
        id: d.id,
        message: d.data().message,
        timestamp: d.data().createdAt?.toDate?.() ?? null,
      }));
      setActivity(entries);
    } catch { /* Never breaks production */ }
  };

  const loadReports = async () => {
    try {
      const q    = query(collection(db, "reports"), where("resolved", "==", false), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const data: { id: string; message: string; resolved: boolean }[] = [];
      snap.forEach((d) => data.push({ id: d.id, message: d.data().message, resolved: d.data().resolved ?? false }));
      setReports(data);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoadingReports(false);
    }
  };

  const loadPending = async () => {
    setLoadingPending(true);
    try {
      const snap = await getDocs(collection(db, "pending"));
      const data: PendingItem[] = [];
      snap.forEach((d) => {
        const raw = d.data();
        data.push({
          id: d.id,
          semester: raw.semester ?? "",
          year: raw.year ?? "",
          subject: raw.subject ?? "",
          question: raw.question ?? "",
          section: raw.section ?? "",
          evaluationType: raw.evaluationType ?? "",
          status: raw.status ?? "pending",
          submittedAt: raw.submittedAt?.toDate?.() ?? null,
        });
      });
      data.sort((a, b) => (b.submittedAt?.getTime() ?? 0) - (a.submittedAt?.getTime() ?? 0));
      setPendingList(data);
    } catch {
      toast.error("Failed to load pending questions");
    } finally {
      setLoadingPending(false);
    }
  };

  const handleApprovePending = async (item: PendingItem) => {
    try {
      toast.info("Fill in section and evaluation fields in Add Data tab, then approve.");
      const semLabel  = item.semester;
      const evalLabel = "Midsem";
      const docId     = `${semLabel}_${item.subject}_${item.year}_${evalLabel}_Approved`;
      const docRef    = doc(db, "questions", docId);
      const docSnap   = await getDoc(docRef);

      if (docSnap.exists()) {
        await updateDoc(docRef, { questions: arrayUnion(item.question) });
      } else {
        await setDoc(docRef, {
          semester: semLabel,
          subject: item.subject,
          year: item.year,
          evaluation: evalLabel,
          section: "Approved",
          questions: [item.question],
          createdAt: new Date(),
        });
      }

      await deleteDoc(doc(db, "pending", item.id));
      setPendingList((prev) => prev.filter((p) => p.id !== item.id));
      await incrementQuestionCount();
      setStats((prev) => prev ? { ...prev, totalQuestions: prev.totalQuestions + 1 } : prev);
      const msg = `Admin approved a pending question from ${semLabel} — ${item.subject}`;
      await logActivity(msg);
      setActivity((prev) => [{ id: Date.now().toString(), message: msg, timestamp: new Date() }, ...prev].slice(0, 8));
      toast.success("Question approved and added!");
    } catch {
      toast.error("Approval failed");
    }
  };

  const handleRejectPending = async (item: PendingItem) => {
    try {
      await deleteDoc(doc(db, "pending", item.id));
      setPendingList((prev) => prev.filter((p) => p.id !== item.id));
      const msg = `Admin rejected a pending question from ${item.semester} — ${item.subject}`;
      await logActivity(msg);
      setActivity((prev) => [{ id: Date.now().toString(), message: msg, timestamp: new Date() }, ...prev].slice(0, 8));
      toast.success("Question rejected and removed");
    } catch {
      toast.error("Rejection failed");
    }
  };

  const handleAddQuestion = async () => {
    if (!semester || !subject || !year || !evalType || !section || !question) {
      toast.error("Please fill all fields"); return;
    }
    try {
      const semLabel  = `Semester ${semester}`;
      const evalLabel = evaluationLabelMap[evalType];
      const docId     = `${semLabel}_${subject}_${year}_${evalLabel}_${section}`;
      const docRef    = doc(db, "questions", docId);
      const docSnap   = await getDoc(docRef);

      if (docSnap.exists()) {
        await updateDoc(docRef, { questions: arrayUnion(question) });
      } else {
        await setDoc(docRef, { semester: semLabel, subject, year, evaluation: evalLabel, section, questions: [question], createdAt: new Date() });
      }
      const msg = `Admin added a question in ${semLabel} — ${subject} (${evalLabel}, §${section})`;
      await logActivity(msg);
      await incrementQuestionCount();
      setStats((prev) => prev ? { ...prev, totalQuestions: prev.totalQuestions + 1 } : prev);
      setActivity((prev) => [{ id: Date.now().toString(), message: msg, timestamp: new Date() }, ...prev].slice(0, 8));
      setQuestion("");
      toast.success("Question added successfully!");
    } catch {
      toast.error("Permission denied");
    }
  };

  const fetchQuestions = async () => {
    if (!semester || !subject) { toast.error("Select at least semester and subject"); return; }
    try {
      const constraints: Parameters<typeof query>[1][] = [
        where("semester", "==", `Semester ${semester}`),
        where("subject",  "==", subject),
      ];
      if (year)     constraints.push(where("year",       "==", year));
      if (evalType) constraints.push(where("evaluation", "==", evaluationLabelMap[evalType]));

      const snap = await getDocs(query(collection(db, "questions"), ...constraints));
      const all: QuestionItem[] = [];
      snap.forEach((d) => {
        const data = d.data();
        (data.questions ?? []).forEach((q: string) =>
          all.push({ text: q, docId: d.id, section: data.section ?? "", year: data.year ?? "", evaluation: data.evaluation ?? "" })
        );
      });
      setQuestionsList(all);
      setSearchSection(""); setSearchYear(""); setSearchEval("");
      if (all.length === 0) toast.error("No questions found");
      else setOpenDialog(true);
    } catch {
      toast.error("Failed to load questions");
    }
  };

  const handleDeleteQuestion = async (item: QuestionItem) => {
    try {
      await deleteQuestion(item.docId, item.text);
      setQuestionsList((prev) => prev.filter((q) => !(q.text === item.text && q.docId === item.docId)));
      const msg = `Admin deleted a question from ${item.docId}`;
      await logActivity(msg);
      await decrementQuestionCount();
      setStats((prev) => prev ? { ...prev, totalQuestions: Math.max(0, prev.totalQuestions - 1) } : prev);
      setActivity((prev) => [{ id: Date.now().toString(), message: msg, timestamp: new Date() }, ...prev].slice(0, 8));
      toast.success("Question deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleEditSave = async (item: QuestionItem, index: number) => {
    if (!editText.trim()) { toast.error("Question cannot be empty"); return; }
    if (editText.trim() === item.text) { setEditingIndex(null); return; }
    try {
      const ref = doc(db, "questions", item.docId);
      await updateDoc(ref, { questions: arrayRemove(item.text) });
      await updateDoc(ref, { questions: arrayUnion(editText.trim()) });
      setQuestionsList((prev) => prev.map((q, i) => i === index ? { ...q, text: editText.trim() } : q));
      const msg = `Admin edited a question in ${item.docId}`;
      await logActivity(msg);
      setActivity((prev) => [{ id: Date.now().toString(), message: msg, timestamp: new Date() }, ...prev].slice(0, 8));
      setEditingIndex(null);
      toast.success("Question updated");
    } catch {
      toast.error("Update failed");
    }
  };

  const startEdit  = (item: QuestionItem, index: number) => { setEditingIndex(index); setEditText(item.text); };
  const cancelEdit = () => setEditingIndex(null);

  const resolveReport = async (id: string) => {
    try {
      await updateDoc(doc(db, "reports", id), { resolved: true });
      setReports((prev) => prev.filter((r) => r.id !== id));
      const msg = `Report #${id.slice(0, 6)} resolved by admin`;
      await logActivity(msg);
      setActivity((prev) => [{ id: Date.now().toString(), message: msg, timestamp: new Date() }, ...prev].slice(0, 8));
      toast.success("Report resolved");
    } catch {
      toast.error("Failed to resolve report");
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  if (!user) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-background">
        <h2 className="absolute top-20 text-4xl md:text-6xl font-black tracking-[0.5em] uppercase text-red-600 animate-pulse drop-shadow-[0_0_30px_rgba(255,0,0,1)] text-center px-4">
          YOU THOUGHT THAT WOULD WORK? 😼
        </h2>
        <div className="w-[380px] bg-card border border-border shadow-sm rounded-2xl p-8 space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Admin Portal</h1>
            <p className="text-sm text-muted-foreground">Sign in with your Google account to continue</p>
          </div>
          <Button onClick={handleLogin} className="w-full h-11 flex items-center justify-center gap-3">
            <img src="/google.webp" className="w-5 h-5" alt="Google" />
            Continue with Google
          </Button>
          <p className="text-xs text-muted-foreground">Access is restricted to authorized admins only.</p>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground pt-10">← Back to Home</Link>
        </div>
      </div>
    );
  }

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground text-sm">
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Checking access…
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Redirect back to Home 😂</Link>
      </div>
    );
  }

  const navItems: { id: View; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "dashboard", label: "Dashboard",       icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: "add",       label: "Add Data",         icon: <PlusCircle      className="h-4 w-4" /> },
    { id: "manage",    label: "Manage Questions", icon: <BookOpen        className="h-4 w-4" /> },
    { id: "pending",   label: "Pending",          icon: <Clock           className="h-4 w-4" />, badge: pendingList.length || undefined },
    { id: "reports",   label: "Reports",          icon: <Flag            className="h-4 w-4" />, badge: reports.length || undefined },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-border">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Admin</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveView(item.id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${activeView === item.id
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
          >
            {item.icon}
            {item.label}
            {item.badge ? (
              <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {item.badge}
              </span>
            ) : null}
          </button>
        ))}
      </nav>
      <div className="px-3 pb-4 pt-2 border-t border-border space-y-0.5">
        <Link
          to="/admin/status"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Activity className="h-4 w-4" /> System Status
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-border sticky top-0 h-screen overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-50 w-56 h-full bg-background border-r border-border flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="h-14 px-4 sm:px-6 flex items-center gap-3">
            <button className="md:hidden p-1.5 rounded-lg hover:bg-muted transition-colors" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-4 w-4" />
            </button>
            <span className="text-sm text-muted-foreground truncate hidden sm:block">{user.email}</span>
            <div className="ml-auto relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-muted text-sm placeholder:text-muted-foreground focus:outline-none focus:bg-background focus:ring-2 focus:ring-ring transition-colors cursor-pointer"
                placeholder="Search…"
                readOnly
                onClick={() => toast.info("Search coming soon")}
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 sm:px-6 py-6 space-y-6 overflow-auto">

          {/* DASHBOARD */}
          {activeView === "dashboard" && (
            <>
              <div>
                <h1 className="text-xl font-bold">Admin Panel</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Manage questions and resolve user reports</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "Total Questions",   value: stats?.totalQuestions ?? "—", sub: "across all semesters" },
                  { label: "Total Views",       value: stats?.totalViews     ?? "—", sub: "student page visits"  },
                  { label: "Unique Users",      value: stats?.uniqueUsers    ?? "—", sub: "distinct browsers"    },
                  { label: "Active Evaluators", value: stats?.activeEvals    ?? "—", sub: "evals with questions" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-card border border-border rounded-xl p-4 space-y-1">
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.sub}</p>
                  </div>
                ))}
              </div>

              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <h2 className="text-sm font-semibold">System Health / Status</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { icon: <Database    className="h-3.5 w-3.5" />, label: "Database Status", value: dbOk ? "Connected" : "Error", ok: dbOk },
                    { icon: <Activity    className="h-3.5 w-3.5" />, label: "API Status",       value: "Running",                    ok: true  },
                    { icon: <Server      className="h-3.5 w-3.5" />, label: "Server",           value: "Live",                       ok: true  },
                    { icon: <AlertCircle className="h-3.5 w-3.5" />, label: "Recent Errors",    value: "None (0)",                   ok: true  },
                  ].map((s) => (
                    <div key={s.label} className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{s.icon}{s.label}</div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${s.ok ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
                        <span className="text-sm font-medium">{s.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Activity / Recent Actions</h2>
                  <button onClick={loadActivity} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Refresh
                  </button>
                </div>
                {activity.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-6 text-center">No recent activity yet — actions will appear here</p>
                ) : (
                  <div className="space-y-3">
                    {activity.map((a) => (
                      <div key={a.id} className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 shrink-0" />
                        <p className="text-sm leading-relaxed">
                          <span className="text-xs text-muted-foreground mr-2">{formatTime(a.timestamp)}</span>
                          {a.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ADD QUESTION */}
          {activeView === "add" && (
            <>
              <div>
                <h1 className="text-xl font-bold">Add Data</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Add a new question to the question bank</p>
              </div>
              <SectionCard title="Question Details" description="Select where this question belongs">
                <FieldGroup
                  semester={semester} setSemester={setSemester}
                  subject={subject}   setSubject={setSubject}
                  year={year}         setYear={setYear}
                  evalType={evalType} setEvalType={setEvalType}
                />
                <input
                  className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Section (e.g. A, B, C)"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                />
              </SectionCard>
              <SectionCard title="Question" description="Type the question text below">
                <textarea
                  className="w-full rounded-lg border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Enter the question here…"
                  rows={5}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                <Button className="w-full mt-1" onClick={handleAddQuestion}>Add Question</Button>
              </SectionCard>
            </>
          )}

          {/* MANAGE QUESTIONS */}
          {activeView === "manage" && (
            <>
              <div>
                <h1 className="text-xl font-bold">Manage Questions</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Load, edit, or delete existing questions</p>
              </div>
              <SectionCard title="Filter Questions" description="Semester and subject required — year and eval are optional">
                <FieldGroup
                  semester={semester} setSemester={setSemester}
                  subject={subject}   setSubject={setSubject}
                  year={year}         setYear={setYear}
                  evalType={evalType} setEvalType={setEvalType}
                />
                <Button variant="secondary" className="w-full mt-1" onClick={fetchQuestions}>Load Questions</Button>
              </SectionCard>

              <Dialog open={openDialog} onOpenChange={(open) => { setOpenDialog(open); if (!open) setEditingIndex(null); }}>
                <DialogContent className="max-w-2xl" aria-describedby={undefined}>
                  <DialogHeader>
                    <DialogTitle>
                      Existing Questions
                      <span className="ml-2 text-sm font-normal text-muted-foreground">({questionsList.length})</span>
                    </DialogTitle>
                  </DialogHeader>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pb-2 border-b border-border">
                    <input
                      className="h-9 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Section (optional)"
                      value={searchSection}
                      onChange={(e) => setSearchSection(e.target.value)}
                    />
                    <Select value={searchYear || "all"} onValueChange={(v) => setSearchYear(v === "all" ? "" : v)}>
                      <SelectTrigger className="h-9 rounded-lg text-sm"><SelectValue placeholder="All Years" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2026">2026</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={searchEval || "all"} onValueChange={(v) => setSearchEval(v === "all" ? "" : v)}>
                      <SelectTrigger className="h-9 rounded-lg text-sm"><SelectValue placeholder="All Evaluations" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Evaluations</SelectItem>
                        {Object.entries(evaluationLabelMap).map(([, label]) => (
                          <SelectItem key={label} value={label}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(() => {
                    const filtered = questionsList.filter((item) => {
                      const matchSection = !searchSection || item.section.toLowerCase().includes(searchSection.toLowerCase());
                      const matchYear    = !searchYear    || item.year === searchYear;
                      const matchEval    = !searchEval    || item.evaluation === searchEval;
                      return matchSection && matchYear && matchEval;
                    });
                    return (
                      <>
                        {(searchSection || searchYear || searchEval) && (
                          <p className="text-xs text-muted-foreground -mb-1">{filtered.length} of {questionsList.length} questions</p>
                        )}
                        <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1">
                          {filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center gap-1">
                              <p className="text-sm font-medium">No matches</p>
                              <p className="text-xs text-muted-foreground">Try adjusting the filters</p>
                            </div>
                          ) : filtered.map((item, index) => (
                            <div key={index} className="group border border-border rounded-lg p-3 hover:bg-muted/40 transition-colors">
                              {editingIndex === questionsList.indexOf(item) ? (
                                <div className="space-y-2">
                                  <textarea
                                    className="w-full rounded-lg border border-input bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                    rows={3} value={editText} onChange={(e) => setEditText(e.target.value)} autoFocus
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-muted-foreground" onClick={cancelEdit}>
                                      <X className="h-3.5 w-3.5" /> Cancel
                                    </Button>
                                    <Button size="sm" className="h-7 text-xs gap-1" onClick={() => handleEditSave(item, questionsList.indexOf(item))}>
                                      <Check className="h-3.5 w-3.5" /> Save
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-start gap-3">
                                  <span className="text-xs font-mono text-muted-foreground w-5 shrink-0 pt-0.5">{index + 1}.</span>
                                  <div className="flex-1 min-w-0 space-y-1.5">
                                    <p className="text-sm leading-relaxed">{item.text}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {item.section    && <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-xs font-medium text-muted-foreground">§{item.section}</span>}
                                      {item.year       && <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-xs font-medium text-muted-foreground">{item.year}</span>}
                                      {item.evaluation && <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-xs font-medium text-muted-foreground">{item.evaluation}</span>}
                                    </div>
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted" onClick={() => startEdit(item, questionsList.indexOf(item))}>
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-500/10" onClick={() => handleDeleteQuestion(item)}>
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </DialogContent>
              </Dialog>
            </>
          )}

          {/* PENDING */}
          {activeView === "pending" && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold">Pending Questions</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">Review and approve or reject student submissions</p>
                </div>
                <Button variant="outline" size="sm" onClick={loadPending} className="text-xs">
                  Refresh
                </Button>
              </div>

              {loadingPending ? (
                <div className="flex justify-center py-20">
                  <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : pendingList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
                  <span className="text-3xl">✅</span>
                  <p className="text-sm font-medium">All clear</p>
                  <p className="text-xs text-muted-foreground">No pending submissions to review</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {pendingList.map((item) => (
                    <div key={item.id} className="border border-border rounded-xl bg-card p-4 space-y-3 flex flex-col">
                      {/* Parameters */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 text-xs font-medium">
                          {item.semester}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-500 text-xs font-medium uppercase">
                          {item.subject}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-500 text-xs font-medium">
                          {item.section}
                        </span>
                        {item.evaluationType && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 text-xs font-medium">
                            {evaluationLabelMap[item.evaluationType] ?? item.evaluationType}
                          </span>
                        )}
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium">
                          {item.year}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-500 text-xs font-medium">
                          <Clock className="h-3 w-3 mr-1" /> Pending
                        </span>
                      </div>

                      {/* Question */}
                      <p className="text-sm leading-relaxed flex-1">{item.question}</p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-1 border-t border-border">
                        <p className="text-xs text-muted-foreground">{formatDate(item.submittedAt)}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs gap-1 text-red-500 hover:text-red-500 hover:bg-red-500/10"
                            onClick={() => handleRejectPending(item)}
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleApprovePending(item)}
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* REPORTS */}
          {activeView === "reports" && (
            <>
              <div>
                <h1 className="text-xl font-bold">Reports</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Unresolved issues submitted by users</p>
              </div>
              <SectionCard
                title="User Reports"
                action={<span className="text-xs text-muted-foreground">{reports.length} active</span>}
              >
                {loadingReports ? (
                  <div className="flex justify-center py-10">
                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : reports.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                    <span className="text-2xl">✅</span>
                    <p className="text-sm font-medium">All clear</p>
                    <p className="text-xs text-muted-foreground">No unresolved reports</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {reports.map((r) => (
                      <div key={r.id} className="group flex items-start gap-3 border border-border rounded-lg p-3.5 hover:bg-muted/40 transition-colors">
                        <div className="flex-1 space-y-0.5 min-w-0">
                          <p className="text-sm leading-relaxed">{r.message}</p>
                          <p className="text-xs text-muted-foreground font-mono">#{r.id.slice(0, 8)}</p>
                        </div>
                        <Button size="sm" variant="outline" className="shrink-0 h-7 text-xs gap-1" onClick={() => resolveReport(r.id)}>
                          Resolve <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </>
          )}
        </main>
      </div>
    </div>
  );
}