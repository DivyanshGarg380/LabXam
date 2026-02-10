import { EvaluationType } from "@/data/questions";

export const normalizeSemester = (sem: string) => `Semester ${sem}`;

export const normalizeEvaluation = (evalType: string) => {
    if(evalType === "midsem") return "Midsem";
    if(evalType === "endsem") return "Endsem";

    const match = evalType.match(/^eval-(\d+)$/);
    if (match) {
        return `Internal Evaluation ${match[1]}` as EvaluationType;
    }

    throw new Error(`Unknown evaluation type: ${evalType}`);
};

export const normalizeSubject = (subject: string): string => {
  return subject;
};