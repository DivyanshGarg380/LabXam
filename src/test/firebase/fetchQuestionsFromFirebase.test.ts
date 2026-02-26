jest.mock("@/firebase/config", () => ({
  db: {}
}));

import * as firestore from "firebase/firestore";
import { fetchQuestionsFromFirebase } from "@/firebase/getQuestions";
import { queryCache } from "@/firebase/getQuestions";

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

describe("fetchQuestionsFromFirebase", () => {

  beforeEach(() => {
    queryCache.clear();
  })

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("returns formatted questions", async () => {

    const mockDocs = [
      {
        data: () => ({
          section: "Section A",
          questions: ["Q1", "Q2"]
        })
      }
    ];

    const mockedGetDocs = firestore.getDocs as jest.Mock;

    mockedGetDocs.mockResolvedValue({
      forEach: (callback: (doc: { data: () => { section: string; questions: string[] } }) => void) => {
        mockDocs.forEach(callback);
      }
    });

    const result = await fetchQuestionsFromFirebase(
      "Sem1",
      "OS",
      "Midsem",
      "2024"
    );

    expect(result).toEqual([
      { question: "Q1", section: "Section A" },
      { question: "Q2", section: "Section A" }
    ]);
  });

  test("returns empty array on error", async () => {

    const mockedGetDocs = firestore.getDocs as jest.Mock;

    mockedGetDocs.mockRejectedValue(new Error("Network error"));

    const result = await fetchQuestionsFromFirebase(
      "Sem1",
      "OS",
      "Midsem",
      "2024"
    );

    expect(result).toEqual([]);
  });

});