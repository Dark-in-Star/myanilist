import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MediaCard } from "./MediaCard";

describe("MediaCard", () => {
  it("renders the title, rank badge, and links to the detail page", () => {
    render(
      <MediaCard
        href="/anime/123"
        title="Sousou no Frieren"
        imageUrl="https://cdn.myanimelist.net/images/anime/1015/138006.jpg"
        mean={9.3}
        mediaType="tv"
        rank={1}
      />,
    );

    expect(screen.getByText("Sousou no Frieren")).toBeInTheDocument();
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("9.30")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Sousou no Frieren/ })).toHaveAttribute("href", "/anime/123");
  });

  it("shows a placeholder when there is no image", () => {
    render(<MediaCard href="/anime/1" title="Untitled" />);
    expect(screen.getByText("No image")).toBeInTheDocument();
  });

  it("falls back to a formatted media type when no subtitle is given", () => {
    render(<MediaCard href="/manga/1" title="Monster" mediaType="manga" />);
    expect(screen.getByText("MANGA")).toBeInTheDocument();
  });
});
