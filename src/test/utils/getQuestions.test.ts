import { getQuestions } from "@/utils/getQuestions";

describe("getQuestions utility", () => {

  test("returns empty array if evalData is null", () => {
    const result = getQuestions(null, "2024");
    expect(result).toEqual([]);
  });

  test("returns only matching year questions", () => {
    const mockData = {
      SectionA: {
        year: "2024",
        questions: ["Q1", "Q2"]
      },
      SectionB: {
        year: "2023",
        questions: ["Q3"]
      }
    };

    const result = getQuestions(mockData, "2024");

    expect(result).toEqual([
      { question: "Q1", section: "SectionA" },
      { question: "Q2", section: "SectionA" }
    ]);
  });

});