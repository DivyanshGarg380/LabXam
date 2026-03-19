import { db } from "./config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { queryCache } from "./getQuestions";

export const updateQuestion = async (
  docId: string,
  oldQuestion: string,
  newQuestion: string
) => {
  const docRef = doc(db, "questions", docId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return [];

  const data = docSnap.data();

  const updatedQuestions = data.questions.map((q: string) =>
    q === oldQuestion ? newQuestion : q
  );

  await updateDoc(docRef, {
    questions: updatedQuestions,
  });
  queryCache.clear();
  return updatedQuestions;
};