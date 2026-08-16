import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RankingTabs } from "./RankingTabs";

const TABS = [
  { value: "all", label: "Top Anime" },
  { value: "airing", label: "Airing Now" },
] as const;

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

beforeEach(() => {
  push.mockClear();
});

describe("RankingTabs", () => {
  it("shows the active tab's label as the selected value", () => {
    render(<RankingTabs basePath="/anime" tabs={[...TABS]} active="airing" />);

    expect(screen.getByRole("combobox", { name: "Ranking" })).toHaveTextContent("Airing Now");
  });

  it("navigates to the base path with the selected type on change", async () => {
    const user = userEvent.setup();
    render(<RankingTabs basePath="/anime" tabs={[...TABS]} active="all" />);

    await user.click(screen.getByRole("combobox", { name: "Ranking" }));
    await user.click(screen.getByRole("option", { name: "Airing Now" }));

    expect(push).toHaveBeenCalledWith("/anime?type=airing");
  });
});
