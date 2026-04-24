import { supabase } from "@/lib/supabase";

export type AdminQuestionItem = {
  text: string;
  rowId: string;
  section: string;
  year: string;
  evaluation: string;
  uploadedAt: number;
};

export const fetchAdminQuestions = async (
  semester: string,
  subject: string,
  year?: string,
  evaluation?: string
) => {
  let query = supabase
    .from("questions")
    .select("id, questions, section, year, evaluation, uploaded_at")
    .eq("semester", semester)
    .eq("subject", subject);

  if (year) query = query.eq("year", year);
  if (evaluation) query = query.eq("evaluation", evaluation);

  const { data, error } = await query;

  if (error || !data) return [];

  const result: AdminQuestionItem[] = [];

  data.forEach((row) => {
    if (!row.questions || !Array.isArray(row.questions)) return;

    row.questions.forEach((q: string) => {
      result.push({
        text: q,
        rowId: row.id,
        section: row.section ?? "",
        year: row.year ?? "",
        evaluation: row.evaluation ?? "",
        uploadedAt: row.uploaded_at ?? 0,
      });
    });
  });

  return result;
};