import { supabase } from "@/lib/supabase";

export type ActivityEntry = {
  id: string;
  message: string;
  timestamp: Date | null;
};

export const logActivity = async (message: string) => {
  try {
    await supabase
      .from("activity_log")
      .insert({ message });
  } catch { /* Never breaks production */ }
};

export const fetchActivityLog = async (): Promise<ActivityEntry[]> => {
  const { data, error } = await supabase
    .from("activity_log")
    .select("id, message, created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  if (error || !data) return [];

  return data.map((row) => ({
    id:        row.id,
    message:   row.message,
    timestamp: row.created_at ? new Date(row.created_at) : null,
  }));
};