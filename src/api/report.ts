// Report feature is coming soon — these are stubs so the app compiles

export type Report = {
  id: string;
  message: string;
  resolved: boolean;
  createdAt: Date | null;
};

export const getReporterId = (): string => {
  const key = "reporterId";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
};

export const sendReport = async (_message: string): Promise<string | null> => {
  return null; // not implemented yet
};

export const fetchMyReports = async (): Promise<Report[]> => {
  return []; // not implemented yet
};

export const deleteOldResolvedReports = async (): Promise<void> => {
  // not implemented yet
};