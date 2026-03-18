import { db } from "./config";
import { collection, addDoc } from "firebase/firestore";
import { questionsDB } from "@/data/questions";
import { queryCache } from "./getQuestions";

export const uploadQuestionsToFirebase = async () => {
  try {
    const questionsCollection = collection(db, "questions");

    for (const semester in questionsDB) {
      const subjects = questionsDB[semester];

      for (const subject in subjects) {
        const evaluations = subjects[subject];

        for (const evaluation in evaluations) {
          const sections = evaluations[evaluation as keyof typeof evaluations];

          if (!sections) continue;

          for (const section in sections) {
            const data = sections[section];

            await addDoc(questionsCollection, {
              semester,
              subject,
              evaluation,
              section,
              year: data.year,
              questions: data.questions,
              uploadedAt: Date.now(),
            });

            console.log(
              `Uploaded: ${semester} | ${subject} | ${evaluation} | ${section}`
            );
          }
        }
      }
    }

    console.log("All questions uploaded successfully!");
    queryCache.clear();
  } catch (error) {
    console.error("Upload failed:", error);
  }
};
