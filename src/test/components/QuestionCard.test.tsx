import { render, screen } from "@testing-library/react";
import { QuestionCard } from "../../components/QuestionCard";

describe("QuestionCard", () => {

  test("renders question number, text and section", () => {
    render(
      <QuestionCard
        number={3}
        question="Explain Deadlock"
        section="Section B"
      />
    );

    expect(screen.getByText("Explain Deadlock")).toBeInTheDocument();
    expect(screen.getByText(/section b/i)).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

});