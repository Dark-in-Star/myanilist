import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MediaTypeToggle } from "./MediaTypeToggle";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

beforeEach(() => {
  push.mockClear();
});

describe("MediaTypeToggle", () => {
  it("marks the active media type distinctly from the inactive one", () => {
    render(<MediaTypeToggle active="manga" />);

    expect(screen.getByRole("button", { name: "Manga" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Anime" })).toHaveAttribute("aria-pressed", "false");
  });

  it("navigates to /mylist with the selected media type", async () => {
    const user = userEvent.setup();
    render(<MediaTypeToggle active="anime" />);

    await user.click(screen.getByRole("button", { name: "Manga" }));

    expect(push).toHaveBeenCalledWith("/mylist?media=manga");
  });

  it("navigates to a custom base path with extra params preserved", async () => {
    const user = userEvent.setup();
    render(<MediaTypeToggle active="anime" basePath="/browse" extraParams={{ q: "frieren" }} />);

    await user.click(screen.getByRole("button", { name: "Manga" }));

    expect(push).toHaveBeenCalledWith("/browse?q=frieren&media=manga");
  });
});
