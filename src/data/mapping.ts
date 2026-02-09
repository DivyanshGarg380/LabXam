export const semesters = [
  { value: "1", label: "Semester 1" },
  { value: "2", label: "Semester 2" },
  { value: "3", label: "Semester 3" },
  { value: "4", label: "Semester 4" },
  { value: "5", label: "Semester 5" },
  { value: "6", label: "Semester 6" },
  { value: "7", label: "Semester 7" },
  { value: "8", label: "Semester 8" },
];


export const subjectMap: Record<string, Record<string, string>> = {
  "4": {
    dbsl: "Database Systems (DBSL)",
  },
};

export const evalMap: Record<string, string> = {
  midsem: "Midsem",
  "eval-1": "Internal Evaluation 1",
  "eval-2": "Internal Evaluation 2",
  endsem: "Endsem",
};
