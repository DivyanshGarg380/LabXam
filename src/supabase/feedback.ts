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
    .select("rating")
    .order("created_at", { ascending: false })
    .limit(15);

  if (error) throw error;

  if (!data || data.length === 0) return 0;

  return (
    data.reduce((acc, f) => acc + f.rating, 0) / data.length
  );
}