import { apiFetch } from "./config";

export type ActivityEntry = {
  id: number;
  message: string;
  timestamp: Date | null;
  admin_name: string;
};

export const fetchActivity = async (limit = 8): Promise<ActivityEntry[]> => {
  try {
    const res = await apiFetch(`/activity/?limit=${limit}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((a: {
      id: number;
      action: string;
      created_at: string;
      admin_name: string;
    }) => ({
      id:        a.id,
      message:   a.action,
      timestamp: a.created_at ? new Date(a.created_at) : null,
      admin_name: a.admin_name,
    }));
  } catch {
    return [];
  }
};