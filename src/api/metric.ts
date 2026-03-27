import { API_BASE } from "./config";

export type DashboardStats = {
  totalQuestions:     number;
  active_evaluators:  number;
  pending_submissions: number;
  open_reports:       number;
};

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const res = await fetch(`${API_BASE}/counters/`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  const data = await res.json();
  return {
    totalQuestions:      data.total_questions,
    active_evaluators:   data.active_evaluators,
    pending_submissions: data.pending_submissions,
    open_reports:        data.open_reports,
  };
};

// Page view tracking — kept client-side with localStorage (no backend needed)
const UNIQUE_KEY = "visitorId";
export const trackPageView = () => {
  const isNew = !localStorage.getItem(UNIQUE_KEY);
  if (isNew) {
    localStorage.setItem(UNIQUE_KEY, crypto.randomUUID());
  }
};