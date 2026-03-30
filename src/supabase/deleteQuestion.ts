import { supabase } from "@/lib/supabase";
import { queryCache } from "./getQuestions";

export const deleteQuestion = async (
  rowId: string,
  questionToDelete: string
) => {
  const { data, error } = await supabase
    .from("questions")
    .select("id, questions")
    .eq("id", rowId)
    .single();

  if (error || !data) return [];

  const updatedQuestions = data.questions.filter(
    (q: string) => q !== questionToDelete
  );

  const { error: updateError } = await supabase
    .from("questions")
    .update({ questions: updatedQuestions })
    .eq("id", rowId);

  if (updateError) return [];

  queryCache.clear();
  return updatedQuestions;
};