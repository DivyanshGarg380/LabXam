import { deleteQuestion } from "@/supabase/deleteQuestion";
import { supabase } from "@/lib/supabase";
import { queryCache } from "@/supabase/getQuestions";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

type SelectResponse = {
  data: {
    id: string;
    questions: string[];
  } | null;
  error: { message: string } | null;
};

type UpdateResponse = {
  error: { message: string } | null;
};

describe("deleteQuestion", () => {
  let mockSelectResponse: SelectResponse;
  let mockUpdateResponse: UpdateResponse;

  beforeEach(() => {
    jest.clearAllMocks();
    queryCache.clear();

    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          single: async (): Promise<SelectResponse> => mockSelectResponse,
        }),
      }),
      update: () => ({
        eq: async (): Promise<UpdateResponse> => mockUpdateResponse,
      }),
    }));
  });

  it("returns empty array if fetch fails", async () => {
    mockSelectResponse = {
      data: null,
      error: { message: "error" },
    };

    const res = await deleteQuestion("1", "Q1");

    expect(res).toEqual([]);
  });

  it("deletes question and updates DB", async () => {
    mockSelectResponse = {
      data: {
        id: "1",
        questions: ["Q1", "Q2", "Q3"],
      },
      error: null,
    };

    mockUpdateResponse = { error: null };

    const res = await deleteQuestion("1", "Q2");

    expect(res).toEqual(["Q1", "Q3"]);
  });

  it("removes only the specified question", async () => {
    mockSelectResponse = {
      data: {
        id: "1",
        questions: ["A", "B", "C"],
      },
      error: null,
    };

    mockUpdateResponse = { error: null };

    const res = await deleteQuestion("1", "B");

    expect(res).toEqual(["A", "C"]);
  });

  it("returns empty array if update fails", async () => {
    mockSelectResponse = {
      data: {
        id: "1",
        questions: ["Q1", "Q2"],
      },
      error: null,
    };

    mockUpdateResponse = {
      error: { message: "Update failed" },
    };

    const res = await deleteQuestion("1", "Q1");

    expect(res).toEqual([]);
  });

  it("clears cache on successful delete", async () => {
    queryCache.set("test", {
      data: [],
      timestamp: Date.now(),
    });

    mockSelectResponse = {
      data: {
        id: "1",
        questions: ["Q1", "Q2"],
      },
      error: null,
    };

    mockUpdateResponse = { error: null };

    await deleteQuestion("1", "Q1");

    expect(queryCache.size).toBe(0);
  });
});