export type EvaluationType = "Midsem" | "Internal Evaluation 1" | "Internal Evaluation 2" | "Endsem";

export interface QuestionSet {
  section: string;
  year: string;
  questions: string[];
}

export type SubjectQuestions = Partial<
  Record<EvaluationType, Record<string, Omit<QuestionSet, "section">>>
>;


export type SemesterQuestions = Record<string, SubjectQuestions>;

export type QuestionsDB = Record<string, SemesterQuestions>;

export const questionsDB: QuestionsDB = {
  "Semester 4": {
    dbsl: {
      Midsem: {
        "CCE C": {
          year: "2025",
          questions: [
            "Write a PL/SQL block to find the factorial of a given number using a loop. Include proper exception handling.",
          ],
        },
        "CCE D": {
          year: "2025",
          questions: [
            "Testing New section",
          ],
        },
      },

      Endsem: {
        "AIML B": {
          year: "2025",
          questions: [
            "Design a database schema for a library management system with at least 5 tables and proper normalization.",
            "Write a stored procedure to transfer funds between two accounts ensuring transaction safety.",
          ],
        },
      },
    },
  },
};


