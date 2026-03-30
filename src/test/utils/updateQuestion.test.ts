import { updateQuestion } from "@/supabase/updateQuestion";
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

describe("updateQuestion", () => {
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

    const res = await updateQuestion("1", "Old", "New");

    expect(res).toEqual([]);
  });

  it("updates the question correctly", async () => {
    mockSelectResponse = {
      data: {
        id: "1",
        questions: ["Q1", "Q2", "Q3"],
      },
      error: null,
    };

    mockUpdateResponse = { error: null };

    const res = await updateQuestion("1", "Q2", "Updated Q2");

    expect(res).toEqual(["Q1", "Updated Q2", "Q3"]);
  });

  it("only replaces the matching question", async () => {
    mockSelectResponse = {
      data: {
        id: "1",
        questions: ["A", "B", "C"],
      },
      error: null,
    };

    mockUpdateResponse = { error: null };

    const res = await updateQuestion("1", "B", "X");

    expect(res).toEqual(["A", "X", "C"]);
  });

  it("returns unchanged array if question not found", async () => {
    mockSelectResponse = {
      data: {
        id: "1",
        questions: ["A", "B", "C"],
      },
      error: null,
    };

    mockUpdateResponse = { error: null };

    const res = await updateQuestion("1", "Z", "X");

    expect(res).toEqual(["A", "B", "C"]);
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

    const res = await updateQuestion("1", "Q1", "New Q1");

    expect(res).toEqual([]);
  });

  it("clears cache on successful update", async () => {
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

    await updateQuestion("1", "Q1", "New Q1");

    expect(queryCache.size).toBe(0);
  });
});