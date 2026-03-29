import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const queryCache = new Map<
  string,
  {
    data: {
      question: string;
      section: string;
      year: string;
      uploaded_at: number;
    }[];
    timestamp: number;
  }
>();

export const fetchQuestions = async (
  semester: string,
  subject: string,
  evaluation: string
) => {
  try {
    const cacheKey = `${semester}_${subject}_${evaluation}`;
    const cached = queryCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
      return cached.data;
    }

    const { data, error } = await supabase
      .from("questions")
      .select("section, year, questions, uploaded_at")
      .eq("semester", semester)
      .eq("subject", subject)
      .eq("evaluation", evaluation);

    console.log("Supabase response:", JSON.stringify(error));

    if (error) {
      toast.error("Error fetching questions");
      return [];
    }

    const result: {
      question: string;
      section: string;
      year: string;
      uploaded_at: number;
    }[] = [];

    data.forEach((row) => {
      if (!row.questions) return;

      if (Array.isArray(row.questions)) {
        row.questions.forEach((q: string) => {
          result.push({
            question: q,
            section: row.section,
            year: row.year,
            uploaded_at: row.uploaded_at || 0,
          });
        });
      } else {
        result.push({
          question: row.questions,
          section: row.section,
          year: row.year,
          uploaded_at: row.uploaded_at || 0,
        });
      }
    });

    const isRecent = (t: number) =>
      Date.now() - t < 24 * 60 * 60 * 1000;

    result.sort((a, b) => {
      const rA = isRecent(a.uploaded_at);
      const rB = isRecent(b.uploaded_at);

      if (rA !== rB) return rB ? 1 : -1;

      return Number(b.year) - Number(a.year);
    });

    queryCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    return result;
  } catch (error) {
    toast.error("Error fetching questions");
    return [];
  }
};