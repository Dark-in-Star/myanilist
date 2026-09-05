import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { SequelPromo } from "./SequelPromo";

describe("SequelPromo", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stays hidden until the user has enough watch history", () => {
    render(<SequelPromo scannableCount={4} />);
    expect(screen.queryByRole("link", { name: /find them/i })).not.toBeInTheDocument();
  });

  it("invites the user to scan once they have enough entries", () => {
    render(<SequelPromo scannableCount={12} />);
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /find them/i })).toHaveAttribute("href", "/mylist/sequels");
  });

  it("hides for the rest of the view when dismissed", () => {
    render(<SequelPromo scannableCount={12} />);
    fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(screen.queryByRole("link", { name: /find them/i })).not.toBeInTheDocument();
  });

  it("comes back on the next visit — dismissal is never persisted", () => {
    const { unmount } = render(<SequelPromo scannableCount={12} />);
    fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));
    unmount();

    render(<SequelPromo scannableCount={12} />);
    expect(screen.getByRole("link", { name: /find them/i })).toBeInTheDocument();
    expect(localStorage.length).toBe(0);
  });
});
