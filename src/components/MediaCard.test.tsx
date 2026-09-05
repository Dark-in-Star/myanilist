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

  it("renders genre chips and a +N overflow indicator", () => {
    render(
      <MediaCard
        href="/anime/1"
        title="Show"
        genres={[
          { id: 1, name: "Action" },
          { id: 2, name: "Adventure" },
          { id: 3, name: "Drama" },
          { id: 4, name: "Fantasy" },
        ]}
      />,
    );

    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByText("Drama")).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("offers an add-to-list button only when an id is supplied", () => {
    const { rerender } = render(<MediaCard href="/anime/7" title="Show" />);
    expect(screen.queryByRole("button", { name: /add Show to your list/i })).not.toBeInTheDocument();

    rerender(<MediaCard href="/anime/7" title="Show" id={7} media="anime" />);
    expect(screen.getByRole("button", { name: /add Show to your list/i })).toBeInTheDocument();
  });
});
