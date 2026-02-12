import { render, screen } from "@testing-library/react";
import { QuestionCard } from "@/components/QuestionCard";

describe("QuestionCard", () => {
  it("renders question text", () => {
    render(
      <QuestionCard
        question="What is fork()?"
        number={1}
        section="Section A"
      />
    );

    expect(screen.getByText("What is fork()?")).toBeInTheDocument();
  });
});