import { useEffect, useState } from "react";
import { login, logout, getMe, type AdminUser } from "@/api/auth";
import { fetchDashboardStats, type DashboardStats } from "@/api/metric";
import { fetchActivity, type ActivityEntry } from "@/api/activity";
import { fetchQuestionSets, addQuestion, deleteQuestion, editQuestion, type QuestionSet } from "@/api/questions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Trash2, LogOut, PlusCircle, Flag,
  ChevronRight, Pencil, Check, X,
  LayoutDashboard, Search, Menu, Activity,
  Database, Server, AlertCircle, BookOpen,
  Clock, CheckCircle, XCircle,
} from "lucide-react";

type View = "dashboard" | "add" | "manage" | "reports" | "pending";

type QuestionItem = {
  text:       string;
  setId:      number;
  section:    string;
  year:       string;
  evaluation: string;
  allInSet:   { question_text: string }[];
};

const semesters = Array.from({ length: 6 }, (_, i) => ({
  value: String(i + 1),
  label: `Semester ${i + 1}`,
}));

const subjectsBySemester: Record<string, { value: string; label: string }[]> = {
  "1": [{ value: "pps",  label: "Programming for Problem Solving (PPS)" }],
  "2": [{ value: "ioop", label: "Introduction to OOP (IOOP)" }, { value: "dav", label: "Data Analysis & Visualization (DAV)" }],
  "3": [{ value: "dsl",  label: "Data Structures Lab (DSL)" }, { value: "disl", label: "Digital Systems Lab (DISL)" }],
  "4": [{ value: "dbsl", label: "Database Systems (DBSL)" }, { value: "osdl", label: "Software Development Lab (OSDL)" }, { value: "osl", label: "Operating Systems Lab (OSL)" }],
  "5": [{ value: "isl",  label: "Information Security Lab (ISL)" }, { value: "esdl", label: "Embedded Systems Design Lab (ESDL)" }],
  "6": [{ value: "madl", label: "Mobile Application Development Lab (MADL)" }, { value: "ndlp", label: "Network Design and Programming Lab (NDLP)" }, { value: "cd", label: "Compiler Design Lab (CDL)" }, { value: "wp", label: "Web Programming Lab (WPL)" }],
};

const evaluationBySemester: Record<string, string[]> = Object.fromEntries(
  Array.from({ length: 7 }, (_, i) => [String(i + 1), ["midsem", "eval-1", "eval-2", "endsem"]])
);

const evaluationLabelMap: Record<string, string> = {
  midsem:   "Midsem",
  "eval-1": "Internal Evaluation 1",
  "eval-2": "Internal Evaluation 2",
  endsem:   "Endsem",
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
          <SelectItem value="2024">2024</SelectItem>
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

// ─── Login Screen ────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (user: AdminUser) => void }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { toast.error("Enter email and password"); return; }
    setLoading(true);
    const user = await login(email, password);
    setLoading(false);
    if (user) onLogin(user);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background">
      <h2 className="absolute top-20 text-4xl md:text-6xl font-black tracking-[0.5em] uppercase text-red-600 animate-pulse drop-shadow-[0_0_30px_rgba(255,0,0,1)] text-center px-4">
        YOU THOUGHT THAT WOULD WORK? 😼
      </h2>
      <div className="w-[380px] bg-card border border-border shadow-sm rounded-2xl p-8 space-y-5 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Admin Portal</h1>
          <p className="text-sm text-muted-foreground">Sign in to continue</p>
        </div>
        <div className="space-y-3 text-left">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button className="w-full h-11" onClick={handleLogin} disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing in…
            </span>
          ) : "Sign In"}
        </Button>
        <p className="text-xs text-muted-foreground">Access is restricted to authorized admins only.</p>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground pt-2 block">← Back to Home</Link>
      </div>
    </div>
  );
}

// ─── Main Admin Component ─────────────────────────────────────────────────────
export default function Admin() {
  const [user, setUser]           = useState<AdminUser | null>(null);
  const [checking, setChecking]   = useState(true);
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [stats, setStats]   = useState<DashboardStats | null>(null);
  const [dbOk,  setDbOk]   = useState(true);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);

  const [semester, setSemester] = useState("");
  const [subject,  setSubject]  = useState("");
  const [year,     setYear]     = useState("");
  const [evalType, setEvalType] = useState("");
  const [section,  setSection]  = useState("");
  const [question, setQuestion] = useState("");

  const [openDialog,    setOpenDialog]    = useState(false);
  const [questionsList, setQuestionsList] = useState<QuestionItem[]>([]);
  const [editingIndex,  setEditingIndex]  = useState<number | null>(null);
  const [editText,      setEditText]      = useState("");
  const [searchSection, setSearchSection] = useState("");
  const [searchYear,    setSearchYear]    = useState("");
  const [searchEval,    setSearchEval]    = useState("");

  // Check if already logged in on mount
  useEffect(() => {
    getMe().then((u) => {
      setUser(u);
      setChecking(false);
      if (u) {
        loadStats();
        loadActivity();
      }
    });
  }, []);

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
    const entries = await fetchActivity(8);
    setActivity(entries);
  };

  const handleLogin = (u: AdminUser) => {
    setUser(u);
    loadStats();
    loadActivity();
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setStats(null);
    setActivity([]);
  };

  const handleAddQuestion = async () => {
    if (!semester || !subject || !year || !evalType || !section || !question) {
      toast.error("Please fill all fields"); return;
    }
    const evalLabel = evaluationLabelMap[evalType];
    const ok = await addQuestion({
      semester: `Semester ${semester}`,
      subject,
      evaluation: evalLabel,
      section,
      year,
      question,
    });
    if (ok) {
      setQuestion("");
      toast.success("Question added successfully!");
      loadStats();
      loadActivity();
    }
  };

  const fetchQuestionsForManage = async () => {
    if (!semester || !subject) { toast.error("Select at least semester and subject"); return; }
    try {
      const evalLabel = evalType ? evaluationLabelMap[evalType] : undefined;
      const sets: QuestionSet[] = await fetchQuestionSets({
        semester: `Semester ${semester}`,
        subject,
        ...(evalLabel ? { evaluation: evalLabel } : {}),
        ...(year ? { year } : {}),
      });

      const all: QuestionItem[] = [];
      sets.forEach((s) => {
        s.questions.forEach((q) => {
          all.push({
            text:       q.question_text,
            setId:      s.id,
            section:    s.section,
            year:       s.year,
            evaluation: s.evaluation,
            allInSet:   s.questions,
          });
        });
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
    const ok = await deleteQuestion(item.setId, item.text, item.allInSet);
    if (ok) {
      setQuestionsList((prev) =>
        prev.filter((q) => !(q.text === item.text && q.setId === item.setId))
      );
      toast.success("Question deleted");
      loadStats();
      loadActivity();
    }
  };

  const handleEditSave = async (item: QuestionItem, index: number) => {
    if (!editText.trim()) { toast.error("Question cannot be empty"); return; }
    if (editText.trim() === item.text) { setEditingIndex(null); return; }
    const ok = await editQuestion(item.setId, item.text, editText.trim(), item.allInSet);
    if (ok) {
      setQuestionsList((prev) =>
        prev.map((q, i) => i === index ? { ...q, text: editText.trim() } : q)
      );
      setEditingIndex(null);
      toast.success("Question updated");
      loadActivity();
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  // ── Auth states ──────────────────────────────────────────────────────────
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground text-sm">
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Checking access…
        </div>
      </div>
    );
  }

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  // ── Nav ──────────────────────────────────────────────────────────────────
  const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard",       icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: "add",       label: "Add Data",         icon: <PlusCircle      className="h-4 w-4" /> },
    { id: "manage",    label: "Manage Questions", icon: <BookOpen        className="h-4 w-4" /> },
    { id: "pending",   label: "Pending",          icon: <Clock           className="h-4 w-4" /> },
    { id: "reports",   label: "Reports",          icon: <Flag            className="h-4 w-4" /> },
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
                  { label: "Total Questions",     value: stats?.totalQuestions     ?? "—", sub: "across all semesters" },
                  { label: "Active Evaluators",   value: stats?.active_evaluators  ?? "—", sub: "evals with questions" },
                  { label: "Pending Submissions", value: stats?.pending_submissions ?? "—", sub: "awaiting your review" },
                  { label: "Open Reports",        value: stats?.open_reports       ?? "—", sub: "unresolved issues"    },
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
                  <p className="text-xs text-muted-foreground py-6 text-center">No recent activity yet</p>
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
                  placeholder="Section (e.g. CCE-A, IT-B)"
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
                <Button variant="secondary" className="w-full mt-1" onClick={fetchQuestionsForManage}>
                  Load Questions
                </Button>
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
                        <SelectItem value="2024">2024</SelectItem>
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
                                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-muted-foreground" onClick={() => setEditingIndex(null)}>
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
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                                      onClick={() => { setEditingIndex(questionsList.indexOf(item)); setEditText(item.text); }}>
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                                      onClick={() => handleDeleteQuestion(item)}>
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

          {/* PENDING — not in MySQL backend yet, show placeholder */}
          {activeView === "pending" && (
            <>
              <div>
                <h1 className="text-xl font-bold">Pending Questions</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Review and approve or reject student submissions</p>
              </div>
              <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
                <span className="text-3xl">✅</span>
                <p className="text-sm font-medium">All clear</p>
                <p className="text-xs text-muted-foreground">Pending submissions feature coming soon</p>
              </div>
            </>
          )}

          {/* REPORTS — not in MySQL backend yet, show placeholder */}
          {activeView === "reports" && (
            <>
              <div>
                <h1 className="text-xl font-bold">Reports</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Unresolved issues submitted by users</p>
              </div>
              <SectionCard title="User Reports" action={<span className="text-xs text-muted-foreground">0 active</span>}>
                <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                  <span className="text-2xl">✅</span>
                  <p className="text-sm font-medium">All clear</p>
                  <p className="text-xs text-muted-foreground">Reports feature coming soon</p>
                </div>
              </SectionCard>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
