import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Questions from "@/pages/Questions";

describe("Questions page", () => {
  it("does not crash without query params", () => {
    render(
      <MemoryRouter initialEntries={["/questions"]}>
        <Routes>
          <Route path="/questions" element={<Questions />} />
        </Routes>
      </MemoryRouter>
    );
  });
});