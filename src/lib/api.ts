import "server-only";
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

const BASE_URL = process.env.MAL_API_BASE_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
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
}

async function apiGet<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { query, revalidate = 300, cache } = options;
  const url = `${BASE_URL}${path}${buildQuery(query)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      cache,
      next: cache ? undefined : { revalidate },
    });
  } catch {
    throw new ApiError(503, "Could not reach myanilist-server. Is it running?");
  }

  if (!response.ok) {
    if (response.status === 404) throw new ApiError(404, "Not found");
    throw new ApiError(response.status, `Request to ${path} failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export const ANIME_LIST_FIELDS =
  "id,title,main_picture,mean,media_type,status,num_episodes,start_season,genres,rank,popularity";

export const ANIME_DETAIL_FIELDS =
  "id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity," +
  "num_list_users,num_scoring_users,nsfw,media_type,status,genres,num_episodes,start_season," +
  "broadcast,source,average_episode_duration,rating,studios,background,related_anime,related_manga," +
  "recommendations,pictures,my_list_status";

export const MANGA_LIST_FIELDS =
  "id,title,main_picture,mean,media_type,status,num_volumes,num_chapters,genres,rank,popularity";

export const MANGA_DETAIL_FIELDS =
  "id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity," +
  "num_list_users,num_scoring_users,nsfw,media_type,status,genres,num_volumes,num_chapters,authors{first_name,last_name}," +
  "background,related_anime,related_manga,recommendations,pictures,my_list_status";

export function searchAnime(q: string, limit = 24, fields = ANIME_LIST_FIELDS, offset = 0) {
  return apiGet<MalListResponse<{ node: AnimeNode }>>("/anime", { query: { q, limit, offset, fields } });
}

export function getAnime(id: number, fields = ANIME_DETAIL_FIELDS) {
  return apiGet<AnimeNode>(`/anime/${id}`, { query: { fields }, cache: "no-store" });
}

export function getAnimeRanking(rankingType: AnimeRankingType, limit = 24, fields = ANIME_LIST_FIELDS, offset = 0) {
  return apiGet<MalListResponse<RankingNode<AnimeNode>>>("/anime/ranking", {
    query: { ranking_type: rankingType, limit, offset, fields },
  });
}

export function getSeasonalAnime(
  year: number,
  season: AnimeSeason,
  sort: AnimeSeasonSort = "anime_num_list_users",
  limit = 24,
  fields = ANIME_LIST_FIELDS,
  offset = 0,
) {
  return apiGet<MalListResponse<{ node: AnimeNode }>>(`/anime/season/${year}/${season}`, {
    query: { sort, limit, offset, fields },
  });
}

export function searchManga(q: string, limit = 24, fields = MANGA_LIST_FIELDS, offset = 0) {
  return apiGet<MalListResponse<{ node: MangaNode }>>("/manga", { query: { q, limit, offset, fields } });
}

export function getManga(id: number, fields = MANGA_DETAIL_FIELDS) {
  return apiGet<MangaNode>(`/manga/${id}`, { query: { fields }, cache: "no-store" });
}

export function getMangaRanking(rankingType: MangaRankingType, limit = 24, fields = MANGA_LIST_FIELDS, offset = 0) {
  return apiGet<MalListResponse<RankingNode<MangaNode>>>("/manga/ranking", {
    query: { ranking_type: rankingType, limit, offset, fields },
  });
}

export function getAnimeList(fields = ANIME_LIST_FIELDS, limit = 1000) {
  return apiGet<MalListResponse<ListNode<AnimeNode, MyListStatus>>>("/users/@me/animelist", {
    query: { fields: `${fields},list_status`, limit },
    cache: "no-store",
  });
}

export function getMangaList(fields = MANGA_LIST_FIELDS, limit = 1000) {
  return apiGet<MalListResponse<ListNode<MangaNode, MyMangaListStatusNode>>>("/users/@me/mangalist", {
    query: { fields: `${fields},list_status`, limit },
    cache: "no-store",
  });
}

export function getMyUserInfo(fields = "anime_statistics") {
  return apiGet<MalUser>("/users/@me", { query: { fields }, cache: "no-store" });
}

export { BASE_URL };
