"use server";

import { getAnimeRanking, getMangaRanking, getSeasonalAnime, searchAnime, searchManga } from "./api";
import { toAnimeGridItem, toMangaGridItem, type GridItem } from "./gridItems";
import type { AnimeRankingType, AnimeSeason, MangaRankingType } from "./types";

export interface LoadMoreResult {
  items: GridItem[];
  hasMore: boolean;
}

export async function loadMoreAnimeRanking(type: AnimeRankingType, offset: number, limit: number): Promise<LoadMoreResult> {
  const result = await getAnimeRanking(type, limit, undefined, offset);
  return {
    items: result.data.map(({ node, ranking }) => toAnimeGridItem(node, ranking.rank)),
    hasMore: Boolean(result.paging?.next),
  };
}

export async function loadMoreMangaRanking(type: MangaRankingType, offset: number, limit: number): Promise<LoadMoreResult> {
  const result = await getMangaRanking(type, limit, undefined, offset);
  return {
    items: result.data.map(({ node, ranking }) => toMangaGridItem(node, ranking.rank)),
    hasMore: Boolean(result.paging?.next),
  };
}

export async function loadMoreAnimeSearch(q: string, offset: number, limit: number): Promise<LoadMoreResult> {
  const result = await searchAnime(q, limit, undefined, offset);
  return {
    items: result.data.map(({ node }) => toAnimeGridItem(node)),
    hasMore: Boolean(result.paging?.next),
  };
}

export async function loadMoreMangaSearch(q: string, offset: number, limit: number): Promise<LoadMoreResult> {
  const result = await searchManga(q, limit, undefined, offset);
  return {
    items: result.data.map(({ node }) => toMangaGridItem(node)),
    hasMore: Boolean(result.paging?.next),
  };
}

export async function loadMoreSeasonalAnime(
  year: number,
  season: AnimeSeason,
  offset: number,
  limit: number,
): Promise<LoadMoreResult> {
  const result = await getSeasonalAnime(year, season, "anime_num_list_users", limit, undefined, offset);
  return {
    items: result.data.map(({ node }) => toAnimeGridItem(node)),
    hasMore: Boolean(result.paging?.next),
  };
}
