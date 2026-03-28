import { render, screen } from "@testing-library/react";
import { QuestionsPage } from "@/components/QuestionsPage";

describe("QuestionsPage", () => {
  it("renders provided questions", () => {
    render(
      <QuestionsPage
        semester="sem3"
        subject="os"
        evaluationType="midsem"
        questions={[
          {
            question: "What is fork()?",
            section: "SectionA",
            year: "2024",
            uploaded_at: Date.now(),
          },
        ]}
        onBack={() => {}}
      />
    );

    expect(screen.getByText("What is fork()?")).toBeInTheDocument();
  });
});