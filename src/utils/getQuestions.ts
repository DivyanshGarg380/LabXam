type SectionData = {
  year: string;
  questions: string[];
};

type EvaluationData = Record<string, SectionData>;

export function getQuestions(
  evalData: EvaluationData | null,
  year: string | null
) {
  if (!evalData || !year) return [];

  const result: { question: string; section: string }[] = [];

  Object.entries(evalData).forEach(([sectionName, data]) => {
    if (data.year === String(year)) {
      data.questions.forEach((q) => {
        result.push({
          question: q,
          section: sectionName,
        });
      });
    }
  });

  return result;
}