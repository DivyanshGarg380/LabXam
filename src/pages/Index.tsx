import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectionCard } from "@/components/SelectionCard";
import { SegmentedButton } from "@/components/SegmentedButton";

const semesters = [
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
  "Semester 7",
  "Semester 8",
];

const subjects = [
  "Database Management Systems (DBMS)",
  "Object Oriented Programming (OOPS)",
  "Operating Systems (OS)",
  "Computer Networks (CN)",
  "Data Structures & Algorithms (DSA)",
  "Web Technologies",
];

const evaluationTypes = ["Midsem", "Eval 1", "Endsem"];

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
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                  1
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  Select Semester
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {semesters.map((semester) => (
                  <SelectionCard
                    key={semester}
                    label={semester.replace("Semester ", "Sem ")}
                    selected={semester === "Semester 3"}
                  />
                ))}
              </div>
            </div>

            {/* Step 2: Subject */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                  2
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  Select Subject
                </h2>
              </div>
              <div className="space-y-2">
                {subjects.map((subject) => (
                  <SelectionCard
                    key={subject}
                    label={subject}
                    selected={subject === "Database Management Systems (DBMS)"}
                  />
                ))}
              </div>
            </div>

            {/* Step 3: Evaluation Type */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                  3
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  Select Evaluation Type
                </h2>
              </div>
              <SegmentedButton
                options={evaluationTypes}
                selected="Midsem"
              />
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
