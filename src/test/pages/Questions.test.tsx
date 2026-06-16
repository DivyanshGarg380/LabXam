jest.mock("@/supabase/getQuestions", () => ({
  fetchQuestions: jest.fn()
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  }
}));

jest.mock("@/utils/normalize", () => ({
  normalizeSemester: jest.fn(() => "Semester 3"),
  normalizeSubject: jest.fn(() => "os"),
  normalizeEvaluation: jest.fn(() => "Midsem"),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useSearchParams: () => [
    new URLSearchParams({
      sem: "3",
      subject: "os",
      year: "2024",
      eval: "midsem"
    })
  ],
  useNavigate: () => jest.fn()
}));

import { render, screen, waitFor } from "@testing-library/react";
import Questions from "../../pages/Questions";
import { fetchQuestions } from "@/supabase/getQuestions"; 

describe("Questions Page", () => {
  const mockedFetch = fetchQuestions as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test("Shows loading text initially", () => {
    mockedFetch.mockImplementation(() => new Promise(() => {}));
    render(<Questions />);
    expect(screen.getByText(/fetching questions/i)).toBeInTheDocument();
  });

  test("Renders QuestionsPage after data loads", async () => {
    mockedFetch.mockResolvedValue([
      {
        id: "row-a:0",
        question: "Q1",
        section: "Section A",
        year: "2024",
        uploaded_at: 0,
      }
    ]);
    render(<Questions />);
    await waitFor(() =>
      expect(screen.getByText("Q1")).toBeInTheDocument()
    );
  });
});
