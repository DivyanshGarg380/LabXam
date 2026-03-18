import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./config";
import { toast } from "sonner";

export const queryCache = new Map<string, { data: { question: string; section: string; year: string, uploadedAt: number }[]; timestamp: number }>(); 

export const fetchQuestionsFromFirebase = async (
  semester: string,
  subject: string,
  evaluation: string,
) => {
  try {
    const cacheKey = `${semester}_${subject}_${evaluation}`;

    const cached = queryCache.get(cacheKey);
    if(cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
      return cached.data;
    }

    const q = query(
      collection(db, "questions"),
      where("semester", "==", semester),
      where("subject", "==", subject),
      where("evaluation", "==", evaluation),
    );

    const snapshot = await getDocs(q);

    const result: { question: string; section: string; year: string; uploadedAt: number }[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();

      if(!data.questions || !Array.isArray(data.questions)) return;

      data.questions.forEach((q: string) => {
        result.push({
          question: q,
          section: data.section,
          year: data.year,
          uploadedAt: data.createdAt?.seconds ?
            data.createdAt.seconds * 1000 : 0,
        });
      });
    });

    const isRecent = (t: number) =>
      Date.now() - t < 24 * 60 * 60 * 1000;

    result.sort((a, b) => {
      const rA = isRecent(a.uploadedAt);
      const rB = isRecent(b.uploadedAt);

      if (rA !== rB) return rB ? 1 : -1;

      return Number(b.year) - Number(a.year);
    });

    queryCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    return result;
  } catch (error) {
    toast.error("Error fetching questions");
    return [];
  }
};
