import { supabase } from "@/lib/supabase";

export type Report = {
  id: string;
  message: string;
  resolved: boolean;
  createdAt: Date | null;
};

export const fetchReports = async (): Promise<Report[]> => {
  const { data, error } = await supabase
    .from("reports")
    .select("id, message, resolved, created_at")
    .eq("resolved", false)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id:        row.id,
    message:   row.message,
    resolved:  row.resolved,
    createdAt: row.created_at ? new Date(row.created_at) : null,
  }));
};

export const resolveReport = async (id: string) => {
  const { error } = await supabase
    .from("reports")
    .update({ resolved: true })
    .eq("id", id);

  return !error;
};

export const submitReport = async (message: string) => {
  const { error } = await supabase
    .from("reports")
    .insert({ message });

  return !error;
};

export const sendReport = async (message: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from("reports")
    .insert({ message })
    .select("id")
    .single();

  if (error || !data) return null;

  const existing = JSON.parse(localStorage.getItem("myReportIds") || "[]");
  localStorage.setItem("myReportIds", JSON.stringify([...existing, data.id]));

  return data.id;
};

export const fetchMyReports = async (): Promise<Report[]> => {
  const ids: string[] = JSON.parse(localStorage.getItem("myReportIds") || "[]");
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("reports")
    .select("id, message, resolved, created_at")
    .in("id", ids)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id:        row.id,
    message:   row.message,
    resolved:  row.resolved,
    createdAt: row.created_at ? new Date(row.created_at) : null,
  }));
};

export const deleteOldResolvedReports = async () => {
  const ids: string[] = JSON.parse(localStorage.getItem("myReportIds") || "[]");
  if (ids.length === 0) return;

  const { data } = await supabase
    .from("reports")
    .select("id, resolved, created_at")
    .in("id", ids);

  if (!data) return;

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const toRemove = data
    .filter((r) => r.resolved && new Date(r.created_at).getTime() < sevenDaysAgo)
    .map((r) => r.id);

  if (toRemove.length === 0) return;

  const remaining = ids.filter((id) => !toRemove.includes(id));
  localStorage.setItem("myReportIds", JSON.stringify(remaining));
};