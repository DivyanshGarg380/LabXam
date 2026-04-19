import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import BorderGlow from '@/components/BorderGlow';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Monitor, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { trackPageView } from "@/supabase/metric";

const semesters = [
  { value: "1", label: "Semester 1" },
  { value: "2", label: "Semester 2" },
  { value: "3", label: "Semester 3" },
  { value: "4", label: "Semester 4" },
  { value: "5", label: "Semester 5" },
  { value: "6", label: "Semester 6" },
];

const subjectsBySemester = {
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
  "5": [
    { value: "isl", label: "Information Security Lab (ISL)" },
    { value: "esdl", label: "Embedded Systems Design Lab (ESDL)" },
  ],
  "6": [
    { value: "madl", label: "Mobile Application Development Lab (MADL)" },
    { value: "ndlp", label: "Network Design and Programming Lab (NDLP)" },
    { value: "cd", label: "Compiler Design Lab (CDL)" },
    { value: "wp", label: "Web Programming Lab (WPL)" },
  ],
};

const evaluationBySemester = {
  "1": ["midsem", "endsem"],
  "2": ["midsem", "endsem"],
  "3": ["midsem", "endsem"],
  "4": ["midsem", "eval-1", "eval-2", "endsem"],
  "5": ["midsem", "endsem"],
  "6": ["midsem", "eval-1", "endsem"],
};

const evaluationLabels = {
  midsem: "Midsem",
  "eval-1": "Internal Evaluation 1",
  "eval-2": "Internal Evaluation 2",
  endsem: "Endsem",
};

const Index = () => {
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedEval, setSelectedEval] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    trackPageView();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      applySystemTheme();
    }
  }, []);

  const applySystemTheme = () => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <div className="container py-4 sm:py-6">

        {/* Top Bar */}
        <div className="relative flex items-center justify-center mb-4">
          {/* Theme */}
          <div className="absolute right-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl">
                  Theme
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { document.documentElement.classList.remove("dark"); localStorage.setItem("theme", "light"); }}>
                  <Sun className="w-4 h-4 mr-2" /> Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { document.documentElement.classList.add("dark"); localStorage.setItem("theme", "dark"); }}>
                  <Moon className="w-4 h-4 mr-2" /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { localStorage.setItem("theme", "system"); applySystemTheme(); }}>
                  <Monitor className="w-4 h-4 mr-2" /> System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        </div>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Lab Exam Questions Hub
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Find previous lab exam questions easily
          </p>
          <div className="mt-6">
            <p className="text-sm text-muted-foreground">
              Have a new question{" "}
              <span
                onClick={() => navigate("/submit")}
                className="text-primary font-medium cursor-pointer hover:underline"
              >
                Submit it here →
              </span>
            </p>
          </div>
        </div>

        {/* Selection Panel */}
        <div className="max-w-xl mx-auto">
          <div style={{width: '100%'}}>
          <BorderGlow
            edgeSensitivity={30}
            borderRadius={16}
            glowRadius={80}
            glowIntensity={1}
            coneSpread={25}
            animated={false}
            colors={['#c084fc', '#f472b6', '#38bdf8']}
            >
            <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-card">

              {/* Semester */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-base font-semibold text-foreground">
                    Select Semester
                  </h2>
                </div>
                <Select
                  value={selectedSemester}
                  onValueChange={(value) => {
                    setSelectedSemester(value);
                    setSelectedSubject("");
                    setSelectedEval("");
                  }}
                >
                  <SelectTrigger className="w-full h-12 rounded-xl bg-background">
                    <SelectValue placeholder="Choose a semester" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {semesters.map((semester) => (
                      <SelectItem key={semester.value} value={semester.value}>
                        {semester.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-base font-semibold text-foreground">
                    Select Subject
                  </h2>
                </div>
                <Select
                  value={selectedSubject}
                  onValueChange={setSelectedSubject}
                  disabled={!selectedSemester}
                >
                  <SelectTrigger className="w-full h-12 rounded-xl bg-background">
                    <SelectValue
                      placeholder={
                        !selectedSemester
                          ? "Select semester first"
                          : subjectsBySemester[selectedSemester]?.length === 0
                          ? "Coming soon"
                          : "Choose a subject"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {subjectsBySemester[selectedSemester]?.length > 0 ? (
                      subjectsBySemester[selectedSemester].map((subject) => (
                        <SelectItem key={subject.value} value={subject.value}>
                          {subject.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem disabled value="coming-soon">
                        🚧 Coming Soon
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Evaluation Type */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-base font-semibold text-foreground">
                    Select Evaluation Type
                  </h2>
                </div>
                <Select
                  value={selectedEval}
                  onValueChange={setSelectedEval}
                  disabled={!selectedSemester}
                >
                  <SelectTrigger className="w-full h-12 rounded-xl bg-background">
                    <SelectValue
                      placeholder={
                        !selectedSemester
                          ? "Select semester first"
                          : evaluationBySemester[selectedSemester]?.length === 0
                          ? "Coming soon"
                          : "Choose evaluation type"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {evaluationBySemester[selectedSemester]?.length > 0 ? (
                      evaluationBySemester[selectedSemester].map((evalKey) => (
                        <SelectItem key={evalKey} value={evalKey}>
                          {evaluationLabels[evalKey]}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem disabled value="coming-soon">
                        🚧 Coming Soon
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Button */}
              <Button
                disabled={!selectedSemester || !selectedSubject || !selectedEval || isLoading}
                className="w-full h-12 text-base font-semibold rounded-xl"
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    navigate(`/questions?sem=${selectedSemester}&subject=${selectedSubject}&eval=${selectedEval}`);
                  }, 500);
                }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </span>
                ) : (
                  "View Questions"
                )}
              </Button>

            </div>
          </BorderGlow>
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
    </div>
  );
};

export default Index;
