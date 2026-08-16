import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MediaTypeSelect } from "./MediaTypeSelect";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

beforeEach(() => {
  push.mockClear();
});

describe("MediaTypeSelect", () => {
  it("shows the active media type as the selected value", () => {
    render(<MediaTypeSelect active="manga" />);

    expect(screen.getByRole("combobox", { name: "Media" })).toHaveTextContent("Manga");
  });

  it("navigates to /browse with the selected media type on change", async () => {
    const user = userEvent.setup();
    render(<MediaTypeSelect active="anime" />);

    await user.click(screen.getByRole("combobox", { name: "Media" }));
    await user.click(screen.getByRole("option", { name: "Manga" }));

    expect(push).toHaveBeenCalledWith("/browse?media=manga");
  });
});
