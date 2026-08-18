import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextEpisodeCountdown } from "./NextEpisodeCountdown";

describe("NextEpisodeCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-16T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the episode number and a countdown", () => {
    render(
      <NextEpisodeCountdown
        schedule={{ episode: 44, airingAt: "2026-08-23T03:00:00Z", timeUntilAiring: 604800, anilistId: 101922 }}
      />,
    );
    expect(screen.getByText("Episode 44 airs")).toBeInTheDocument();
    expect(screen.getByText(/7 days/)).toBeInTheDocument();
  });

  it("counts down as time passes", () => {
    render(
      <NextEpisodeCountdown
        schedule={{ episode: 44, airingAt: "2026-08-16T00:01:00Z", timeUntilAiring: 60, anilistId: 101922 }}
      />,
    );
    expect(screen.getByText(/1 minute/)).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(screen.getByText(/30 seconds/)).toBeInTheDocument();
  });

  it("shows 'Airing now' once the countdown reaches zero", () => {
    render(
      <NextEpisodeCountdown
        schedule={{ episode: 44, airingAt: "2026-08-16T00:00:05Z", timeUntilAiring: 5, anilistId: 101922 }}
      />,
    );
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(screen.getByText("Airing now")).toBeInTheDocument();
  });
});
