jest.mock("@/firebase/config", () => ({
  db: {}
}));

jest.mock("@/firebase/getQuestions", () => ({
  fetchQuestionsFromFirebase: jest.fn()
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
import { fetchQuestionsFromFirebase } from "@/firebase/getQuestions";

describe("Questions Page", () => {
  const mockedFetch = fetchQuestionsFromFirebase as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test("Shows loading text initially", () => {
    mockedFetch.mockImplementation(() => new Promise(() => {}));

    render(<Questions />);

    expect(
      screen.getByText(/fetching questions/i)
    ).toBeInTheDocument();
  });

  test("Renders QuestionsPage after data loads", async () => {
    mockedFetch.mockResolvedValue([
      { question: "Q1", section: "Section A" }
    ]);

    render(<Questions />);

    await waitFor(() =>
      expect(screen.getByText("Q1")).toBeInTheDocument()
    );
  });

  
});