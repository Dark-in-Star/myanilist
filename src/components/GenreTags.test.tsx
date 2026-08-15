import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GenreTags } from "./GenreTags";

describe("GenreTags", () => {
  it("renders a tag for each genre", () => {
    render(
      <GenreTags
        genres={[
          { id: 1, name: "Action" },
          { id: 2, name: "Fantasy" },
        ]}
      />,
    );
    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByText("Fantasy")).toBeInTheDocument();
  });

  it("renders nothing when there are no genres", () => {
    const { container } = render(<GenreTags genres={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when genres is undefined", () => {
    const { container } = render(<GenreTags genres={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });
});
