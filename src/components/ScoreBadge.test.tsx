import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScoreBadge } from "./ScoreBadge";

describe("ScoreBadge", () => {
  it("renders a formatted score", () => {
    render(<ScoreBadge mean={8.2} />);
    expect(screen.getByText("8.20")).toBeInTheDocument();
  });

  it("renders N/A when there is no score", () => {
    render(<ScoreBadge mean={undefined} />);
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });
});
