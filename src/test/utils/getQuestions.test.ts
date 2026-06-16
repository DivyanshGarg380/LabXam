import { fetchQuestions, queryCache } from "@/supabase/getQuestions";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
  },
}));

type MockQuery = {
  select: jest.Mock,
  eq: jest.Mock;
};

describe("fetchQuestions", () => {
  let mockQuery: MockQuery;

  beforeEach(() => {
    jest.clearAllMocks();
    queryCache.clear();

    mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn(),
    };

    mockQuery.eq
      .mockReturnValueOnce(mockQuery)
      .mockReturnValueOnce(mockQuery);

    (supabase.from as jest.Mock).mockReturnValue(mockQuery);
  });

  it("fetches and transforms data correctly", async () => {
    const now = Date.now();

    mockQuery.eq.mockResolvedValueOnce({
      data: [
        {
          id: "row-a",
          section: "A",
          year: "2023",
          questions: ["Q1", "Q2"],
          uploaded_at: now,
        },
        {
          id: "row-b",
          section: "B",
          year: "2022",
          questions: "Q3",
          uploaded_at: now - 2 * 24 * 60 * 60 * 1000,
        },
      ],
      error: null,
    });

    const res = await fetchQuestions("sem1", "os", "midsem");

    expect(res.length).toBe(3);
    expect(res[0]).toHaveProperty("question");
    expect(res[0].section).toBe("A");
  });

  it("uses cache if data is fresh", async () => {
    const key = "sem1_os_midsem";

    queryCache.set(key, {
      data: [
        {
          id: "cached-row:0",
          question: "Cached Q",
          section: "A",
          year: "2023",
          uploaded_at: 0,
        },
      ],
      timestamp: Date.now(),
    });

    const res = await fetchQuestions("sem1", "os", "midsem");

    expect(res[0].question).toBe("Cached Q");
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("ignores expired cache", async () => {
    const key = "sem1_os_midsem";

    queryCache.set(key, {
      data: [],
      timestamp: Date.now() - 11 * 60 * 1000,
    });

    mockQuery.eq.mockResolvedValueOnce({ data: [], error: null });

    await fetchQuestions("sem1", "os", "midsem");

    expect(supabase.from).toHaveBeenCalled();
  });

  it("handles supabase error", async () => {
    mockQuery.eq.mockResolvedValueOnce({
      data: null,
      error: { message: "DB error" },
    });

    const res = await fetchQuestions("sem1", "os", "midsem");

    expect(res).toEqual([]);
    expect(toast.error).toHaveBeenCalled();
  });

  it("handles missing questions field", async () => {
    mockQuery.eq.mockResolvedValueOnce({
      data: [
        {
          id: "row-a",
          section: "A",
          year: "2023",
          questions: null,
          uploaded_at: 0,
        },
      ],
      error: null,
    });

    const res = await fetchQuestions("sem1", "os", "midsem");

    expect(res).toEqual([]);
  });

  it("sorts recent questions first (within 2 days)", async () => {
    const now = Date.now();

    mockQuery.eq.mockResolvedValueOnce({
      data: [
        {
          id: "row-a",
          section: "A",
          year: "2020",
          questions: "Old",
          uploaded_at: now - 3 * 24 * 60 * 60 * 1000,
        },
        {
          id: "row-b",
          section: "B",
          year: "2021",
          questions: "Recent",
          uploaded_at: now,
        },
      ],
      error: null,
    });

    const res = await fetchQuestions("sem1", "os", "midsem");

    expect(res[0].question).toBe("Recent");
  });

  it("sorts by year if both not recent", async () => {
    const old = Date.now() - 3 * 24 * 60 * 60 * 1000;

    mockQuery.eq.mockResolvedValueOnce({
      data: [
        {
          id: "row-a",
          section: "A",
          year: "2020",
          questions: "Q1",
          uploaded_at: old,
        },
        {
          id: "row-b",
          section: "B",
          year: "2022",
          questions: "Q2",
          uploaded_at: old,
        },
      ],
      error: null,
    });

    const res = await fetchQuestions("sem1", "os", "midsem");

    expect(res[0].year).toBe("2022");
  });

  it("stores result in cache", async () => {
    mockQuery.eq.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    await fetchQuestions("sem1", "os", "midsem");

    const key = "sem1_os_midsem";
    expect(queryCache.has(key)).toBe(true);
  });

  it("handles unexpected exception", async () => {
    (supabase.from as jest.Mock).mockImplementation(() => {
      throw new Error("Crash");
    });

    const res = await fetchQuestions("sem1", "os", "midsem");

    expect(res).toEqual([]);
    expect(toast.error).toHaveBeenCalled();
  });
});
