export type EvaluationType = "Midsem" | "Internal Evaluation 1" | "Internal Evaluation 2" | "Endsem";

export interface QuestionSet {
  section: string;
  year: string;
  questions: string[];
}

export interface SubjectQuestions {
  [evaluationType: string]: QuestionSet;
}

export interface SemesterQuestions {
  [subject: string]: SubjectQuestions;
}

export interface QuestionsDB {
  [semester: string]: SemesterQuestions;
}

export const questionsDB: QuestionsDB = {
  "Semester 4": {
    "Database Systems (DBSL)": {
      Midsem: {
        section: "CCE C",
        year: "2025",
        questions: [
          "Write a PL/SQL block to find the factorial of a given number using a loop. Include proper exception handling.",
          "Create a trigger that automatically updates the 'last_modified' column whenever a row in the 'employees' table is updated.",
          "Explain the difference between implicit and explicit cursors in PL/SQL with examples.",
        ],
      },

      Endsem: {
        section: "AIML B",
        year: "2025",
        questions: [
          "Design a database schema for a library management system with at least 5 tables and proper normalization.",
          "Write a stored procedure to transfer funds between two accounts ensuring transaction safety.",
        ],
      },
    },
  },
};
