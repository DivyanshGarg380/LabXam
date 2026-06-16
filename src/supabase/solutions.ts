export type AiSolutionResponse = {
  solution: string;
  cached: boolean;
  model?: string;
  promptVersion?: string;
};

export const fetchAiSolution = async (
  questionId: string,
): Promise<AiSolutionResponse> => {
  const response = await fetch("/api/solution", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ questionId }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? "Failed to fetch solution");
  }

  if (!data?.solution || typeof data.solution !== "string") {
    throw new Error("No solution returned");
  }

  return data;
};
