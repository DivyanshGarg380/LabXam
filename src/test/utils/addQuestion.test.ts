type MockFn = jest.Mock;

type MockQuery = {
  select: MockFn;
  eq: MockFn;
  single: MockFn;
  update: MockFn;
  insert: MockFn;
};

import { addQuestion } from "@/supabase/addQuestion";
import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe("addQuestion", () => {
  const mockQuery: MockQuery = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    update: jest.fn().mockReturnThis(),
    insert: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.from as jest.Mock).mockReturnValue(mockQuery);
  });

  const args = ["sem1", "os", "midsem", "A", "2023", "New Question"] as const;

  it("updates existing question list", async () => {
    mockQuery.single.mockResolvedValue({
      data: {
        id: 1,
        questions: ["Old Q"],
      },
      error: null,
    });

    const mockEq = jest.fn().mockResolvedValue({ error: null });

    mockQuery.update.mockReturnValue({
      eq: mockEq,
    });

    const res = await addQuestion(...args);

    expect(res).toBe(true);
    expect(mockQuery.update).toHaveBeenCalledWith({
      questions: ["Old Q", "New Question"],
    });
  });

  it("returns false if update fails", async () => {
    mockQuery.single.mockResolvedValue({
      data: {
        id: 1,
        questions: ["Old Q"],
      },
      error: null,
    });

    mockQuery.update.mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        error: { message: "Update failed" },
      }),
    });

    const res = await addQuestion(...args);

    expect(res).toBe(false);
  });

  it("inserts new row when no existing data (PGRST116)", async () => {
    mockQuery.single.mockResolvedValue({
      data: null,
      error: { code: "PGRST116" },
    });

    mockQuery.insert.mockResolvedValue({ error: null });

    const res = await addQuestion(...args);

    expect(res).toBe(true);
    expect(mockQuery.insert).toHaveBeenCalledWith({
      semester: "sem1",
      subject: "os",
      evaluation: "midsem",
      section: "A",
      year: "2023",
      questions: ["New Question"],
      uploaded_at: expect.any(Number),
    });
  });

  it("returns false if insert fails", async () => {
    mockQuery.single.mockResolvedValue({
      data: null,
      error: { code: "PGRST116" },
    });

    mockQuery.insert.mockResolvedValue({
      error: { message: "Insert failed" },
    });

    const res = await addQuestion(...args);

    expect(res).toBe(false);
  });

  it("returns false on unexpected fetch error", async () => {
    mockQuery.single.mockResolvedValue({
      data: null,
      error: { code: "SOME_OTHER_ERROR" },
    });

    const res = await addQuestion(...args);

    expect(res).toBe(false);
  });
});