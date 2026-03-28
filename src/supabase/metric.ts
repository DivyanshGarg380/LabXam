import { supabase } from "@/lib/supabase";

export type DashboardStats = {
  totalQuestions: number;
  activeEvals: number;
  totalViews: number;
};

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const [questionsRes, viewsRes] = await Promise.all([
    supabase.from("questions").select("evaluation, questions"),
    supabase.from("page_views").select("id", { count: "exact", head: true }),
  ]);

  if (questionsRes.error) throw new Error("Failed to fetch stats");

  const totalQuestions = questionsRes.data.reduce(
    (acc, row) => acc + (row.questions?.length ?? 0), 0
  );
  const activeEvals = new Set(questionsRes.data.map((row) => row.evaluation)).size;
  const totalViews  = viewsRes.count ?? 0;

  return { totalQuestions, activeEvals, totalViews };
};

export const trackPageView = async () => {
  await supabase.from("page_views").insert({});
};

