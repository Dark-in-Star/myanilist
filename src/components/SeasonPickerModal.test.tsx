import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SeasonPickerModal } from "./SeasonPickerModal";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

beforeEach(() => {
  push.mockClear();
});

describe("SeasonPickerModal", () => {
  it("shows the current year and season on the trigger", () => {
    render(<SeasonPickerModal year={2023} season="fall" />);

    expect(screen.getByRole("button", { name: "Fall 2023" })).toBeVisible();
  });

  it("shows the current year selected in the dropdown when opened", async () => {
    const user = userEvent.setup();
    render(<SeasonPickerModal year={2023} season="fall" />);

    await user.click(screen.getByRole("button", { name: "Fall 2023" }));

    expect(screen.getByRole("combobox", { name: "Year" })).toHaveTextContent("2023");
  });

  it("navigates to the chosen year and season on Go", async () => {
    const user = userEvent.setup();
    render(<SeasonPickerModal year={2023} season="fall" />);

    await user.click(screen.getByRole("button", { name: "Fall 2023" }));
    await user.click(screen.getByRole("combobox", { name: "Year" }));
    await user.click(screen.getByRole("option", { name: "2019" }));
    await user.click(screen.getByRole("button", { name: "Winter" }));
    await user.click(screen.getByRole("button", { name: "Go" }));

    expect(push).toHaveBeenCalledWith("/archive?year=2019&season=winter");
  });
});
