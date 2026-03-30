import { supabase } from "@/lib/supabase";

export const addQuestion = async (
  semester: string,
  subject: string,
  evaluation: string,
  section: string,
  year: string,
  question: string
) => {
  const { data, error } = await supabase
    .from("questions")
    .select("id, questions")
    .eq("semester", semester)
    .eq("subject", subject)
    .eq("evaluation", evaluation)
    .eq("section", section)
    .eq("year", year)
    .single();

  if (error && error.code !== "PGRST116") return false;

  if (data) {
    const { error: updateError } = await supabase
      .from("questions")
      .update({ questions: [...data.questions, question] })
      .eq("id", data.id);

    return !updateError;
  } else {
    const { error: insertError } = await supabase
      .from("questions")
      .insert({
        semester,
        subject,
        evaluation,
        section,
        year,
        questions: [question],
        uploaded_at: Date.now(),
      });

    return !insertError;
  }
};


