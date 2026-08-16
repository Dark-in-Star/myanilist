import "server-only";
import { requireClientId } from "./malAuth";
import { getValidAccessToken } from "./session";
import type {
  AnimeNode,
  AnimeRankingType,
  AnimeSeason,
  AnimeSeasonSort,
  ListNode,
  MalListResponse,
  MangaNode,
  MangaRankingType,
  MalUser,
  MyListStatus,
  MyMangaListStatusNode,
  RankingNode,
} from "./types";

// Talks to MAL's API directly from Next.js server-side code (Server Components,
// Server Actions) — no separate backend to run or deploy. MAL_API_BASE_URL stays
// overridable so e2e tests can still point this at an in-memory mock (see
// e2e/mock-server.mjs) without touching a real MyAnimeList account.
const BASE_URL = process.env.MAL_API_BASE_URL ?? "https://api.myanimelist.net/v2";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Thrown by authenticated calls when the visitor has no valid MAL session. */
export class AuthRequiredError extends Error {
  constructor() {
    super("Log in with MyAnimeList to see this.");
    this.name = "AuthRequiredError";
  }
}

type QueryValue = string | number | boolean | undefined;

function buildQuery(query?: Record<string, QueryValue>): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

interface FetchOptions {
  query?: Record<string, QueryValue>;
  revalidate?: number | false;
  cache?: RequestCache;
  token?: string;
}

// MAL's public endpoints (search, ranking, season, and detail without a caller
// token) authenticate with the app's own client ID instead of a user's token.
function authHeaders(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : { "X-MAL-CLIENT-ID": requireClientId() };
}

async function apiGet<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { query, revalidate = 300, cache, token } = options;
  const url = `${BASE_URL}${path}${buildQuery(query)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      cache,
      next: cache ? undefined : { revalidate },
      headers: authHeaders(token),
    });
  } catch {
    throw new ApiError(503, "Could not reach the MyAnimeList API.");
  }

  if (!response.ok) {
    if (response.status === 404) throw new ApiError(404, "Not found");
    throw new ApiError(response.status, `Request to ${path} failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

/** For endpoints that must be authenticated: resolves a token or throws AuthRequiredError. */
async function requireToken(): Promise<string> {
  const token = await getValidAccessToken();
  if (!token) throw new AuthRequiredError();
  return token;
}

export const ANIME_LIST_FIELDS =
  "id,title,main_picture,mean,media_type,status,num_episodes,start_season,start_date,genres,rank,popularity";

export const ANIME_DETAIL_FIELDS =
  "id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity," +
  "num_list_users,num_scoring_users,nsfw,media_type,status,genres,num_episodes,start_season," +
  "broadcast,source,average_episode_duration,rating,studios,background,related_anime,related_manga," +
  "recommendations,pictures,my_list_status";

export const MANGA_LIST_FIELDS =
  "id,title,main_picture,mean,media_type,status,num_volumes,num_chapters,start_date,genres,rank,popularity";

// The my-list cards also show an English title alongside the main (Japanese) one, which the
// ranking/search field sets above don't request.
export const MY_ANIME_LIST_FIELDS = `${ANIME_LIST_FIELDS},alternative_titles`;
export const MY_MANGA_LIST_FIELDS = `${MANGA_LIST_FIELDS},alternative_titles`;

export const MANGA_DETAIL_FIELDS =
  "id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity," +
  "num_list_users,num_scoring_users,nsfw,media_type,status,genres,num_volumes,num_chapters,authors{first_name,last_name}," +
  "background,related_anime,related_manga,recommendations,pictures,my_list_status";

// MAL's client-ID-only (no user token) mode appears to always exclude NSFW-flagged
// content (verified: searching a well-known Hentai title returns zero results with just
// a client ID, even though the title and its genre both exist on MAL). Opportunistically
// attaching a logged-in visitor's own token — same as getAnime/getManga already do for
// detail pages — is the only lever this app has to surface it, and still depends on that
// visitor's own MAL account having adult-content display enabled.
export async function searchAnime(q: string, limit = 24, fields = ANIME_LIST_FIELDS, offset = 0) {
  const token = (await getValidAccessToken()) ?? undefined;
  return apiGet<MalListResponse<{ node: AnimeNode }>>("/anime", { query: { q, limit, offset, fields }, token });
}

export async function getAnime(id: number, fields = ANIME_DETAIL_FIELDS) {
  // Optional auth: logged-in visitors get my_list_status back too.
  const token = (await getValidAccessToken()) ?? undefined;
  return apiGet<AnimeNode>(`/anime/${id}`, { query: { fields }, cache: "no-store", token });
}

export async function getAnimeRanking(rankingType: AnimeRankingType, limit = 24, fields = ANIME_LIST_FIELDS, offset = 0) {
  const token = (await getValidAccessToken()) ?? undefined;
  return apiGet<MalListResponse<RankingNode<AnimeNode>>>("/anime/ranking", {
    query: { ranking_type: rankingType, limit, offset, fields },
    token,
  });
}

export async function getSeasonalAnime(
  year: number,
  season: AnimeSeason,
  sort: AnimeSeasonSort = "anime_num_list_users",
  limit = 24,
  fields = ANIME_LIST_FIELDS,
  offset = 0,
) {
  const token = (await getValidAccessToken()) ?? undefined;
  return apiGet<MalListResponse<{ node: AnimeNode }>>(`/anime/season/${year}/${season}`, {
    query: { sort, limit, offset, fields },
    token,
  });
}

export async function searchManga(q: string, limit = 24, fields = MANGA_LIST_FIELDS, offset = 0) {
  const token = (await getValidAccessToken()) ?? undefined;
  return apiGet<MalListResponse<{ node: MangaNode }>>("/manga", { query: { q, limit, offset, fields }, token });
}

export async function getManga(id: number, fields = MANGA_DETAIL_FIELDS) {
  const token = (await getValidAccessToken()) ?? undefined;
  return apiGet<MangaNode>(`/manga/${id}`, { query: { fields }, cache: "no-store", token });
}

export async function getMangaRanking(rankingType: MangaRankingType, limit = 24, fields = MANGA_LIST_FIELDS, offset = 0) {
  const token = (await getValidAccessToken()) ?? undefined;
  return apiGet<MalListResponse<RankingNode<MangaNode>>>("/manga/ranking", {
    query: { ranking_type: rankingType, limit, offset, fields },
    token,
  });
}

export async function getAnimeList(fields = MY_ANIME_LIST_FIELDS, limit = 1000) {
  const token = await requireToken();
  return apiGet<MalListResponse<ListNode<AnimeNode, MyListStatus>>>("/users/@me/animelist", {
    query: { fields: `${fields},list_status`, limit },
    cache: "no-store",
    token,
  });
}

export async function getMangaList(fields = MY_MANGA_LIST_FIELDS, limit = 1000) {
  const token = await requireToken();
  return apiGet<MalListResponse<ListNode<MangaNode, MyMangaListStatusNode>>>("/users/@me/mangalist", {
    query: { fields: `${fields},list_status`, limit },
    cache: "no-store",
    token,
  });
}

export async function getMyUserInfo(fields = "anime_statistics") {
  const token = await requireToken();
  return apiGet<MalUser>("/users/@me", { query: { fields }, cache: "no-store", token });
}

export { BASE_URL };
