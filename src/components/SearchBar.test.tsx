import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SearchBar } from "./SearchBar";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(),
}));

beforeEach(() => {
  push.mockClear();
});

describe("SearchBar", () => {
  it("navigates to the browse page with the entered query", async () => {
    const user = userEvent.setup();
    render(<SearchBar />);

    const input = screen.getByPlaceholderText("Search anime or manga...");
    await user.type(input, "one piece");
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(push).toHaveBeenCalledWith("/browse?q=one%20piece");
  });

  it("does not navigate for an empty or whitespace-only query", async () => {
    const user = userEvent.setup();
    render(<SearchBar />);

    await user.type(screen.getByPlaceholderText("Search anime or manga..."), "   ");
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(push).not.toHaveBeenCalled();
  });

  it("calls onNavigate after a successful search", async () => {
    const onNavigate = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar onNavigate={onNavigate} />);

    await user.type(screen.getByPlaceholderText("Search anime or manga..."), "bleach");
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(onNavigate).toHaveBeenCalledOnce();
  });
});
