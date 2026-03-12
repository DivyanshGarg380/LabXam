import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./config";
import { toast } from "sonner";

export const queryCache = new Map<string, { question: string; section: string }[]>(); 

export const fetchQuestionsFromFirebase = async (
  semester: string,
  subject: string,
  evaluation: string,
  year: string
) => {
  try {
    const cacheKey = `${semester}_${subject}_${evaluation}_${year}`;

    if(queryCache.has(cacheKey)) {
      return queryCache.get(cacheKey)!;
    }

    const q = query(
      collection(db, "questions"),
      where("semester", "==", semester),
      where("subject", "==", subject),
      where("evaluation", "==", evaluation),
      where("year", "==", year)
    );

    const snapshot = await getDocs(q);

    const result: { question: string; section: string }[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();

      data.questions.forEach((q: string) => {
        result.push({
          question: q,
          section: data.section,
        });
      });
    });

    queryCache.set(cacheKey, result);

    return result;
  } catch (error) {
    toast.error("Error fetching questions");
    return [];
  }
};
