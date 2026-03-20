import { db } from "./config";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
  where,
} from "firebase/firestore";
import { toast } from "sonner";


/*
    |----------------------------------------------------------------------------------------------|
    | Clients dont have access to write to our firebase database -> so giving error on client side |
    |----------------------------------------------------------------------------------------------|
*/

export const getReporterId = (): string => {
  const key = "reporterId";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
};

export const deleteOldResolvedReports = async () => {
  try {
    const now = new Date();
    const cutoff = new Date(now.setDate(now.getDate() - 5));

    const q = query(
      collection(db, "reports"),
      where("resolved", "==", true),
      where("createdAt", "<", Timestamp.fromDate(cutoff))
    );

    const snapshot = await getDocs(q);
    const deletes = snapshot.docs.map((d) =>
      deleteDoc(doc(db, "reports", d.id))
    );
    await Promise.all(deletes);
  } catch {
    toast.error("Error deleting old reports");
  }
};

export const sendReport = async (message: string): Promise<string | null> => {
  if (!message.trim()) return null;

  try {
    const reporterId = getReporterId();
    const ref = await addDoc(collection(db, "reports"), {
      message,
      reporterId,
      createdAt: serverTimestamp(),
      resolved: false,
    });
    return ref.id;
  } catch (err) {
    toast.error("Server error while sending report. Please try again later.");
    return null;
  }
};

export const fetchMyReports = async (): Promise<
  { id: string; message: string; resolved: boolean; createdAt: Date | null }[]
> => {
  try {
    const reporterId = getReporterId();
    const q = query(
      collection(db, "reports"),
      where("reporterId", "==", reporterId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => ({
        id: d.id,
        message: d.data().message,
        resolved: d.data().resolved ?? false,
        createdAt: d.data().createdAt?.toDate?.() ?? null,
      }))
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  } catch {
    return [];
  }
};
