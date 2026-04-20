import { supabase } from "@/lib/supabase"

export type FeedbackItem = {
    id: string;
    rating: number;
    note: string;
    created_at: string;
};

export async function fetchFeedback(): Promise<FeedbackItem[]> {
    const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(15);

    if(error) throw error;
    return data;
}

export async function fetchAvgRating(): Promise<number> {
  const { data, error } = await supabase
    .from("feedback")
    .select("avg_rating:avg(rating)");

  if (error) throw error;

  const avg = data?.[0]?.avg_rating;

  return typeof avg === "number" ? avg : 0;
}