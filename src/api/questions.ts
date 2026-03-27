import { apiFetch } from "./config";
import { queryCache } from "./getQuestions";
import { toast } from "sonner";

export type QuestionSet = {
  id: number;
  semester: string;
  subject: string;
  evaluation: string;
  section: string;
  year: string;
  created_at: string;
  questions: { id: number; question_text: string; order_index: number }[];
};

// Fetch question sets with optional filters (used in Manage Questions)
export const fetchQuestionSets = async (filters: {
  semester?: string;
  subject?: string;
  evaluation?: string;
  year?: string;
}): Promise<QuestionSet[]> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });

  const res = await fetch(
    `${import.meta.env.VITE_API_URL ?? "http://localhost:5000/api"}/questions?${params}`
  );
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

// Add a new question to an existing set, or create a new set if none exists
export const addQuestion = async (params: {
  semester: string;
  subject: string;
  evaluation: string;
  section: string;
  year: string;
  question: string;
}): Promise<boolean> => {
  try {
    // Check if a set already exists for this combination
    const sets = await fetchQuestionSets({
      semester:   params.semester,
      subject:    params.subject,
      evaluation: params.evaluation,
    });

    const existing = sets.find(
      (s) => s.section === params.section && s.year === params.year
    );

    if (existing) {
      // Append the new question to the existing set
      const currentTexts = existing.questions.map((q) => q.question_text);
      const res = await apiFetch(`/questions/${existing.id}`, {
        method: "PUT",
        body: JSON.stringify({ questions: [...currentTexts, params.question] }),
      });
      if (!res.ok) throw new Error("Update failed");
    } else {
      // Create a new set
      const res = await apiFetch("/questions/", {
        method: "POST",
        body: JSON.stringify({
          semester:   params.semester,
          subject:    params.subject,
          evaluation: params.evaluation,
          section:    params.section,
          year:       params.year,
          questions:  [params.question],
        }),
      });
      if (!res.ok) throw new Error("Create failed");
    }

    queryCache.clear();
    return true;
  } catch {
    toast.error("Failed to add question");
    return false;
  }
};

// Delete a single question from a set
export const deleteQuestion = async (
  setId: number,
  questionText: string,
  allQuestions: { question_text: string }[]
): Promise<boolean> => {
  try {
    const remaining = allQuestions
      .map((q) => q.question_text)
      .filter((t) => t !== questionText);

    if (remaining.length === 0) {
      // Delete the whole set if no questions remain
      const res = await apiFetch(`/questions/${setId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    } else {
      const res = await apiFetch(`/questions/${setId}`, {
        method: "PUT",
        body: JSON.stringify({ questions: remaining }),
      });
      if (!res.ok) throw new Error("Update failed");
    }

    queryCache.clear();
    return true;
  } catch {
    toast.error("Delete failed");
    return false;
  }
};

// Edit a single question in a set
export const editQuestion = async (
  setId: number,
  oldText: string,
  newText: string,
  allQuestions: { question_text: string }[]
): Promise<boolean> => {
  try {
    const updated = allQuestions.map((q) =>
      q.question_text === oldText ? newText : q.question_text
    );
    const res = await apiFetch(`/questions/${setId}`, {
      method: "PUT",
      body: JSON.stringify({ questions: updated }),
    });
    if (!res.ok) throw new Error("Edit failed");
    queryCache.clear();
    return true;
  } catch {
    toast.error("Edit failed");
    return false;
  }
};