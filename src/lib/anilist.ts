import "server-only";
import type { NextAiringEpisode } from "./types";

const ANILIST_API_URL = "https://graphql.anilist.co";

const NEXT_AIRING_EPISODE_QUERY = `
  query ($malId: Int) {
    Media(idMal: $malId, type: ANIME) {
      nextAiringEpisode {
        airingAt
        timeUntilAiring
        episode
      }
    }
  }
`;

interface AniListNextAiringResponse {
  data?: {
    Media?: {
      nextAiringEpisode?: {
        airingAt: number;
        timeUntilAiring: number;
        episode: number;
      } | null;
    } | null;
  };
  errors?: { message: string }[];
}

/**
 * Looks up the next airing episode for a MAL anime id via AniList's GraphQL API.
 * MAL's own API only exposes a weekly broadcast slot (day + local time), not a
 * concrete next-episode date, so this is the only source for a real countdown.
 * Returns null for anime AniList doesn't know about, has finished airing, or on any
 * fetch/API error — this is a supplementary enhancement, never worth failing the page for.
 */
export async function getNextAiringEpisode(malId: number, revalidate = 300): Promise<NextAiringEpisode | null> {
  let response: Response;
  try {
    response = await fetch(ANILIST_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: NEXT_AIRING_EPISODE_QUERY, variables: { malId } }),
      next: { revalidate },
    });
  } catch {
    return null;
  }

  if (!response.ok) return null;

  const json = (await response.json()) as AniListNextAiringResponse;
  const next = json.data?.Media?.nextAiringEpisode;
  if (!next) return null;

  return {
    episode: next.episode,
    airingAt: new Date(next.airingAt * 1000).toISOString(),
    timeUntilAiring: next.timeUntilAiring,
  };
}
