import { render, screen, waitFor } from "@testing-library/react";
import Questions from "../../pages/Questions";

global.fetch = jest.fn();

describe("Questions Page", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Shows loading text initially", () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<Questions />);

    expect(
      screen.getByText(/fetching questions/i)
    ).toBeInTheDocument();
  });

  test("Renders QuestionsPage after data loads", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      json: async () => ([
        { question_text: "Q1", section: "Section A" }
      ])
    });

    render(<Questions />);

    await waitFor(() =>
      expect(screen.getByText("Q1")).toBeInTheDocument()
    );
  });

});