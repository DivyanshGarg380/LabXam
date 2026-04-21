import { supabase } from "@/lib/supabase";

const DEVICE_ID_KEY = "labxam_device";

function getDeviceId(): string {
  let id  = localStorage.getItem(DEVICE_ID_KEY);
  if(!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

type Report = {
  id: string;
  message: string;
  resolved: boolean;
  createdAt: Date | null;
};

export async function sendReport(message: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("reports")
    .insert({ message })
    .select("id")
    .single();


    if(error || !data) {
      return null;
    }

    const existing = getMyReportIds();
    existing.unshift(data.id);
    localStorage.setItem("labxam_report_ids", JSON.stringify(existing));
    return data.id;
}

export async function fetchMyReports(): Promise<Report[]> {
  const ids = getMyReportIds().slice(0, 10);
  if (ids.length === 0) return [];
 
  const { data, error } = await supabase
    .from("reports")
    .select("id, message, resolved, created_at")
    .in("id", ids)
    .order("created_at", { ascending: false });
 
  if (error || !data) {
    return [];
  }
 
  return data.map((r) => ({
    id: r.id,
    message: r.message,
    resolved: r.resolved ?? false,
    createdAt: r.created_at ? new Date(r.created_at) : null,
  }));
}

export async function deleteOldResolvedReports(): Promise<void> {
  const ids = getMyReportIds();
  if (ids.length === 0) return;
 
  const { data, error } = await supabase
    .from("reports")
    .select("id, resolved, created_at")
    .in("id", ids);
 
  if (error || !data) return;
 
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
 
  const toRemove = new Set(
    data
      .filter(
        (r) =>
          r.resolved &&
          r.created_at &&
          new Date(r.created_at) < sevenDaysAgo
      )
      .map((r) => r.id)
  );
 
  if (toRemove.size === 0) return;
 
  const cleaned = ids.filter((id) => !toRemove.has(id));
  localStorage.setItem("labxam_report_ids", JSON.stringify(cleaned));
}
 
function getMyReportIds(): string[] {
  try {
    const raw = localStorage.getItem("labxam_report_ids");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function fetchReports(): Promise<
  { id: string; message: string; resolved: boolean }[]
> {
  const { data, error } = await supabase
    .from("reports")
    .select("id, message, resolved")
    .eq("resolved", false)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("fetchReports error:", error);
    return [];
  }
  return data;
}


export async function resolveReport(id: string): Promise<void> {
  const { error } = await supabase
    .from("reports")
    .update({ resolved: true })
    .eq("id", id);

  if (error) throw error;
}