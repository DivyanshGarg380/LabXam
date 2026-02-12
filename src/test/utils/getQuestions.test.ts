import { getQuestions } from "@/utils/getQuestions";

describe("getQuestions", () => {
  const mockData = {
    SectionA: {
      year: "2026",
      questions: ["Q1", "Q2"],
    },
    SectionB: {
      year: "2023",
      questions: ["Q3"],
    },
  };

  it("returns questions for matching year", () => {
    const result = getQuestions(mockData, "2026");
    expect(result.length).toBe(2);
    expect(result[0].question).toBe("Q1");
  });

  it("returns empty for non matching year", () => {
    const result = getQuestions(mockData, "2022");
    expect(result).toEqual([]);
  });

  it("returns empty for null data", () => {
    const result = getQuestions(null, "2024");
    expect(result).toEqual([]);
  });
});