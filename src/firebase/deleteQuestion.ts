import { db } from "./config";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export const deleteQuestion = async (
  docId: string,
  questionToDelete: string
) => {
  const docRef = doc(db, "questions", docId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return [];

  const data = docSnap.data();

  const updatedQuestions = data.questions.filter(
    (q: string) => q !== questionToDelete
  );

  await updateDoc(docRef, {
    questions: updatedQuestions, 
  });

  return updatedQuestions;
};