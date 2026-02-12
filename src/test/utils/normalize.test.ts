import {
  normalizeSemester,
  normalizeSubject,
  normalizeEvaluation,
} from "@/utils/normalize";

describe("normalize utilities", () => {
  it("formats semester correctly", () => {
    expect(normalizeSemester("4")).toBe("Semester 4");
  });

  it("formats subject correctly", () => {
    expect(normalizeSubject("Software Development Lab (OSDL)"))
      .toBe("Software Development Lab (OSDL)");
  });

  it("formats evaluation correctly", () => {
    expect(normalizeEvaluation("midsem")).toBe("Midsem");
    expect(normalizeEvaluation("endsem")).toBe("Endsem");
  });

  it("handles internal evaluation", () => {
    expect(normalizeEvaluation("eval-2")).toBe("Internal Evaluation 2");
  });
});