import { describe, expect, it } from "vitest";
import { airedEpisodeCount } from "./airedEpisodes";
import type { NextAiringEpisode } from "./types";

function schedule(episode: number): NextAiringEpisode {
  return { episode, airingAt: new Date().toISOString(), timeUntilAiring: 3600, anilistId: 1 };
}

describe("airedEpisodeCount", () => {
  // The reported case: MAL lists 10 episodes, AniList says episode 7 airs next, so only
  // 6 are watchable — the player was offering 10.
  it("counts only aired episodes for a currently-airing show", () => {
    expect(airedEpisodeCount(10, "currently_airing", schedule(7))).toBe(6);
  });

  it("returns the full run once a show has finished airing", () => {
    expect(airedEpisodeCount(12, "finished_airing", null)).toBe(12);
  });

  it("returns nothing for a show that has not started", () => {
    expect(airedEpisodeCount(24, "not_yet_aired", null)).toBe(0);
    expect(airedEpisodeCount(24, "not_yet_aired", schedule(1))).toBe(0);
  });

  it("treats a pending first episode as nothing aired", () => {
    expect(airedEpisodeCount(12, "currently_airing", schedule(1))).toBe(0);
  });

  // AniList can point at a sequel's slot or a stale schedule; that must not invent
  // episodes beyond the planned run.
  it("never exceeds the planned episode count", () => {
    expect(airedEpisodeCount(12, "currently_airing", schedule(99))).toBe(12);
  });

  it("falls back to the planned count when no schedule is available", () => {
    expect(airedEpisodeCount(10, "currently_airing", null)).toBe(10);
  });

  // Long-running shows report num_episodes: 0 until they end.
  it("uses the schedule when the planned count is unknown", () => {
    expect(airedEpisodeCount(0, "currently_airing", schedule(1100))).toBe(1099);
    expect(airedEpisodeCount(undefined, "currently_airing", schedule(5))).toBe(4);
  });

  it("returns zero when neither a count nor a schedule is known", () => {
    expect(airedEpisodeCount(undefined, undefined, null)).toBe(0);
  });
});
