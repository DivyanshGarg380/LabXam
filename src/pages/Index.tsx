import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const semesters = [
  { value: "sem-1", label: "Semester 1" },
  { value: "sem-2", label: "Semester 2" },
  { value: "sem-3", label: "Semester 3" },
  { value: "sem-4", label: "Semester 4" },
  { value: "sem-5", label: "Semester 5" },
  { value: "sem-6", label: "Semester 6" },
  { value: "sem-7", label: "Semester 7" },
  { value: "sem-8", label: "Semester 8" },
];

const subjects = [
  { value: "dbms", label: "Database Management Systems (DBMS)" },
  { value: "oops", label: "Object Oriented Programming (OOPS)" },
  { value: "os", label: "Operating Systems (OS)" },
  { value: "cn", label: "Computer Networks (CN)" },
  { value: "dsa", label: "Data Structures & Algorithms (DSA)" },
  { value: "web", label: "Web Technologies" },
  { value: "ai", label: "Artificial Intelligence (AI)" },
  { value: "ml", label: "Machine Learning (ML)" },
];

const evaluationTypes = [
  { value: "midsem", label: "Midsem" },
  { value: "eval-1", label: "Eval 1" },
  { value: "eval-2", label: "Eval 2" },
  { value: "endsem", label: "Endsem" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-6">
            <GraduationCap className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Lab Exam Questions Hub
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Find previous lab exam questions easily
          </p>
        </div>

        {/* Selection Panel */}
        <div className="max-w-xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-card">
            {/* Step 1: Semester */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                  1
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  Select Semester
                </h2>
              </div>
              <Select>
                <SelectTrigger className="w-full h-12 rounded-xl bg-background">
                  <SelectValue placeholder="Choose a semester" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {semesters.map((semester) => (
                    <SelectItem key={semester.value} value={semester.value}>
                      {semester.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 2: Subject */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                  2
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  Select Subject
                </h2>
              </div>
              <Select>
                <SelectTrigger className="w-full h-12 rounded-xl bg-background">
                  <SelectValue placeholder="Choose a subject" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {subjects.map((subject) => (
                    <SelectItem key={subject.value} value={subject.value}>
                      {subject.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 3: Evaluation Type */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                  3
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  Select Evaluation Type
                </h2>
              </div>
              <Select>
                <SelectTrigger className="w-full h-12 rounded-xl bg-background">
                  <SelectValue placeholder="Choose evaluation type" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {evaluationTypes.map((evalType) => (
                    <SelectItem key={evalType.value} value={evalType.value}>
                      {evalType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Button */}
            <Button className="w-full h-12 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90">
              View Questions
            </Button>
          </div>

          {/* Footer hint */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Select your preferences above to view lab exam questions
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
