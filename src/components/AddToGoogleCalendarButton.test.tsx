import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AddToGoogleCalendarButton } from "./AddToGoogleCalendarButton";

const nextEpisode = { episode: 5, airingAt: "2026-08-20T19:00:00Z", timeUntilAiring: 3600, anilistId: 16498 };

function clickButton() {
  return userEvent.setup().click(screen.getByRole("button", { name: "Add to Google Calendar" }));
}

describe("AddToGoogleCalendarButton", () => {
  beforeEach(() => {
    // The component doesn't pass an explicit timezone (by design, it auto-detects the
    // device's), so pin the device timezone here for deterministic UTC assertions below.
    vi.stubEnv("TZ", "UTC");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("opens a Google Calendar TEMPLATE URL in a new tab when clicked", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<AddToGoogleCalendarButton anime={{ title: "Attack on Titan", num_episodes: 12 }} nextEpisode={nextEpisode} />);

    await clickButton();

    expect(openSpy).toHaveBeenCalledTimes(1);
    const [url, target, features] = openSpy.mock.calls[0];
    expect(target).toBe("_blank");
    expect(features).toBe("noopener,noreferrer");

    const params = new URL(url as string).searchParams;
    expect(params.get("action")).toBe("TEMPLATE");
    expect(params.get("text")).toBe("Attack on Titan");
    expect(params.get("dates")).toBe("20260820T190000/20260820T193000");
  });

  it("recurs weekly for the number of episodes remaining", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<AddToGoogleCalendarButton anime={{ title: "Attack on Titan", num_episodes: 12 }} nextEpisode={nextEpisode} />);

    await clickButton();

    const url = openSpy.mock.calls[0][0] as string;
    // 12 total episodes, next is #5 -> 8 episodes remain (5..12 inclusive).
    expect(new URL(url).searchParams.get("recur")).toBe("RRULE:FREQ=WEEKLY;COUNT=8");
  });

  it("assumes 13 total episodes when num_episodes is undefined", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<AddToGoogleCalendarButton anime={{ title: "Attack on Titan" }} nextEpisode={nextEpisode} />);

    await clickButton();

    const url = openSpy.mock.calls[0][0] as string;
    // 13 assumed total episodes, next is #5 -> 9 episodes remain.
    expect(new URL(url).searchParams.get("recur")).toBe("RRULE:FREQ=WEEKLY;COUNT=9");
  });

  it("uses the anime's average episode duration for the event length", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    render(
      <AddToGoogleCalendarButton
        anime={{ title: "Attack on Titan", average_episode_duration: 1500 }}
        nextEpisode={nextEpisode}
      />,
    );

    await clickButton();

    const url = openSpy.mock.calls[0][0] as string;
    expect(new URL(url).searchParams.get("dates")).toBe("20260820T190000/20260820T192500");
  });

  it("prefers the English title for the event title when one is present", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    render(
      <AddToGoogleCalendarButton
        anime={{ title: "Shingeki no Kyojin", alternative_titles: { en: "Attack on Titan" } }}
        nextEpisode={nextEpisode}
      />,
    );

    await clickButton();

    const url = openSpy.mock.calls[0][0] as string;
    expect(new URL(url).searchParams.get("text")).toBe("Attack on Titan");
  });

  it("falls back to the original title when no English title is present", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<AddToGoogleCalendarButton anime={{ title: "Shingeki no Kyojin" }} nextEpisode={nextEpisode} />);

    await clickButton();

    const url = openSpy.mock.calls[0][0] as string;
    expect(new URL(url).searchParams.get("text")).toBe("Shingeki no Kyojin");
  });

  it("includes the title, generic airing details, and an AniList link in the description, without an episode number", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    render(
      <AddToGoogleCalendarButton
        anime={{ title: "Shingeki no Kyojin", alternative_titles: { en: "Attack on Titan" } }}
        nextEpisode={nextEpisode}
      />,
    );

    await clickButton();

    const url = openSpy.mock.calls[0][0] as string;
    const description = new URL(url).searchParams.get("details");
    expect(description).toContain("Attack on Titan");
    expect(description).toContain("New episode airs today.");
    expect(description).toContain("https://anilist.co/anime/16498");
    expect(description).not.toMatch(/Episode \d/);
  });
});
