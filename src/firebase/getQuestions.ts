import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./config";

export const fetchQuestionsFromFirebase = async (
  semester: string,
  subject: string,
  evaluation: string,
  year: string
) => {
  try {
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

    return result;
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
};
