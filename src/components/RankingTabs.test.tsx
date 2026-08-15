import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RankingTabs } from "./RankingTabs";

const TABS = [
  { value: "all", label: "Top Anime" },
  { value: "airing", label: "Airing Now" },
] as const;

describe("RankingTabs", () => {
  it("links each tab to the base path with its type query param", () => {
    render(<RankingTabs basePath="/anime" tabs={[...TABS]} active="all" />);

    expect(screen.getByRole("link", { name: "Top Anime" })).toHaveAttribute("href", "/anime?type=all");
    expect(screen.getByRole("link", { name: "Airing Now" })).toHaveAttribute("href", "/anime?type=airing");
  });

  it("marks the active tab distinctly from inactive tabs", () => {
    render(<RankingTabs basePath="/anime" tabs={[...TABS]} active="airing" />);

    const active = screen.getByRole("link", { name: "Airing Now" });
    const inactive = screen.getByRole("link", { name: "Top Anime" });
    expect(active.className).toContain("bg-accent");
    expect(inactive.className).not.toContain("bg-accent");
  });
});
