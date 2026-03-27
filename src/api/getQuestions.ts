import { API_BASE } from "./config";
import { toast } from "sonner";

export type QuestionResult = {
  question: string;
  section: string;
  year: string;
  uploadedAt: number;
};

// Simple in-memory cache (same behaviour as the old Firebase version)
export const queryCache = new Map<string, { data: QuestionResult[]; timestamp: number }>();

export const fetchQuestions = async (
  semester: string,
  subject: string,
  evaluation: string
): Promise<QuestionResult[]> => {
  try {
    const cacheKey = `${semester}_${subject}_${evaluation}`;
    const cached = queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
      return cached.data;
    }

    const params = new URLSearchParams({ semester, subject, evaluation });
    const res = await fetch(`${API_BASE}/questions?${params}`);

    if (!res.ok) throw new Error("Failed to fetch questions");

    const sets: {
      questions: { question_text: string; order_index: number }[];
      section: string;
      year: string;
      created_at: string;
    }[] = await res.json();

    const result: QuestionResult[] = [];

    sets.forEach((s) => {
      s.questions.forEach((q) => {
        result.push({
          question:   q.question_text,
          section:    s.section,
          year:       s.year,
          uploadedAt: new Date(s.created_at).getTime(),
        });
      });
    });

    // Same sort logic as original: recent first, then by year desc
    const isRecent = (t: number) => Date.now() - t < 24 * 60 * 60 * 1000;
    result.sort((a, b) => {
      const rA = isRecent(a.uploadedAt);
      const rB = isRecent(b.uploadedAt);
      if (rA !== rB) return rB ? 1 : -1;
      return Number(b.year) - Number(a.year);
    });

    queryCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch {
    toast.error("Error fetching questions");
    return [];
  }
};