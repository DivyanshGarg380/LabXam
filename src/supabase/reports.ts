import { supabase } from "@/lib/supabase";

export type ReportStatus = "pending" | "in_review" | "resolved" | "declined";

export type Report = {
  id: string;
  message: string;
  status: ReportStatus;
  createdAt: Date | null;
};

type ReportRow = {
  id: string;
  message: string;
  status: ReportStatus;
  created_at: string | null;
};

const mapRow = (row: ReportRow): Report => ({
  id: row.id,
  message: row.message,
  status: row.status,
  createdAt: row.created_at ? new Date(row.created_at) : null,
});

export const fetchReports = async (): Promise<Report[]> => {
  const { data, error } = await supabase
    .from("reports")
    .select("id, message, status, created_at")
    .order("created_at", { ascending: false })
    .limit(15);

  if (error || !data) return [];
  return data.map(mapRow);
};

export const updateReportStatus = async (id: string, status: ReportStatus) => {
  const { error } = await supabase.from("reports").update({ status }).eq("id", id);
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
    .select("id, message, status, created_at")
    .in("id", ids)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapRow);
};

const CLOSED_STATUSES: ReportStatus[] = ["resolved", "declined"];

export const deleteOldResolvedReports = async () => {
  const ids: string[] = JSON.parse(localStorage.getItem("myReportIds") || "[]");
  if (ids.length === 0) return;

  const { data } = await supabase
    .from("reports")
    .select("id, status, created_at")
    .in("id", ids);

  if (!data) return;

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const toRemove = data
    .filter(
      (r) =>
        CLOSED_STATUSES.includes(r.status) &&
        new Date(r.created_at).getTime() < sevenDaysAgo,
    )
    .map((r) => r.id);

  if (toRemove.length === 0) return;

  const remaining = ids.filter((id) => !toRemove.includes(id));
  localStorage.setItem("myReportIds", JSON.stringify(remaining));
};