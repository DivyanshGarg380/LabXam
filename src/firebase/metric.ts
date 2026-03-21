import { db } from "./config";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

const STATS_REF = () => doc(db, "counters", "stats");
const UNIQUE_KEY = "visitorId";

const ensureStatsDoc = async () => {
  await setDoc(
    STATS_REF(),
    { totalViews: 0, uniqueUsers: 0},
    { merge: true }
  );
};

export const incrementQuestionCount = async () => {
  try {
    await ensureStatsDoc();
    await updateDoc(STATS_REF(), { totalQuestions: increment(1) });
  } catch { /* Never breaks the production */ }
};

export const decrementQuestionCount = async () => {
  try {
    await ensureStatsDoc();
    await updateDoc(STATS_REF(), { totalQuestions: increment(-1) });
  } catch { /* Never breaks the production */ }
};

export const trackPageView = async () => {
  try {
    await ensureStatsDoc();

    await updateDoc(STATS_REF(), { totalViews: increment(1) });

    const isNew = !localStorage.getItem(UNIQUE_KEY);
    if (isNew) {
      localStorage.setItem(UNIQUE_KEY, crypto.randomUUID());
      await updateDoc(STATS_REF(), { uniqueUsers: increment(1) });
    }
  } catch { /* Never breaks the production */ }
};

export const fetchActualQuestionCount = async (): Promise<number> => {
  try {
    const snap = await getDocs(collection(db, "questions"));
    let count = 0;
    snap.forEach((d) => {
      const data = d.data();
      const qs = data.questions;
      if (Array.isArray(qs)) count += qs.length;
    });
    return count;
  } catch {
    return 0;
  }
};

export const fetchActiveEvaluatorCount = async (): Promise<number> => {
  try {
    const snap = await getDocs(collection(db, "questions"));
    const seen = new Set<string>();
    snap.forEach((d) => {
      const ev = d.data().evaluation;
      if (ev) seen.add(ev);
    });
    return seen.size;
  } catch {
    return 0;
  }
};

export type DashboardStats = {
  totalQuestions: number;
  totalViews:     number;
  uniqueUsers:    number;
  activeEvals:    number;
};

export const cleanUpEmptyDocs = async (): Promise<number> => {
  try {
   const snap = await getDocs(collection(db, "questions"));
    const deletes: Promise<void>[] = [];
    snap.forEach((d) => {
      const qs = d.data().questions;
      if (!Array.isArray(qs) || qs.length === 0) {
        deletes.push(deleteDoc(doc(db, "questions", d.id)));
      }
    });
    await Promise.all(deletes);
    return deletes.length;
  } catch {
    return 0;
  }
};

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  await ensureStatsDoc();
  const [snap, activeEvals, totalQuestions] = await Promise.all([
    getDoc(STATS_REF()),
    fetchActiveEvaluatorCount(),
    fetchActualQuestionCount(),
  ]);

  await cleanUpEmptyDocs();

  const data = snap.exists() ? snap.data() : {};
  await updateDoc(STATS_REF(), { totalQuestions });
  return {
    totalQuestions,
    totalViews: data.totalViews ?? 0,
    uniqueUsers: data.uniqueUsers ?? 0,
    activeEvals,
  };
};