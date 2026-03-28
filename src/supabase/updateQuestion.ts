import { supabase } from "@/lib/supabase";
import { queryCache } from "./getQuestions";

export const updateQuestion = async (
  rowId: string,
  oldQuestion: string,
  newQuestion: string
) => {
  const { data, error } = await supabase
    .from("questions")
    .select("id, questions")
    .eq("id", rowId)
    .single();

  if (error || !data) return [];

  const updatedQuestions = data.questions.map((q: string) =>
    q === oldQuestion ? newQuestion : q
  );

  const { error: updateError } = await supabase
    .from("questions")
    .update({ questions: updatedQuestions })
    .eq("id", rowId);

  if (updateError) return [];

  queryCache.clear();
  return updatedQuestions;
};