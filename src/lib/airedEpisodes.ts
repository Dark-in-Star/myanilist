import type { AnimeStatus, NextAiringEpisode } from "./types";

/**
 * How many episodes a viewer can actually watch right now.
 *
 * MAL's `num_episodes` is the *planned* total for the season, so a currently-airing show
 * reports its full run from day one — listing all of them offers episodes that cannot
 * resolve to a source yet. AniList's `nextAiringEpisode.episode` is the episode about to
 * air, so everything below it has aired.
 */
export function airedEpisodeCount(
  totalEpisodes: number | undefined,
  status: AnimeStatus | undefined,
  schedule: NextAiringEpisode | null,
): number {
  const planned = totalEpisodes && totalEpisodes > 0 ? totalEpisodes : 0;

  if (status === "not_yet_aired") return 0;

  if (schedule && schedule.episode > 0) {
    const aired = schedule.episode - 1;
    // A stale or mid-break schedule can point past the planned run (and, for a finished
    // show that AniList still lists a sequel slot for, well past it), so never exceed it.
    return planned > 0 ? Math.min(aired, planned) : Math.max(aired, 0);
  }

  // No schedule: either the show has finished (planned count is correct and complete) or
  // AniList has nothing for it. Airing shows with no schedule are the one genuinely
  // ambiguous case — prefer the planned count over hiding episodes that do exist.
  return planned;
}
