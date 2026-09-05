import type { AnimeNode, Genre, MangaNode, MyListEntryStatus } from "./types";

export interface GridItem {
  id: number;
  href: string;
  title: string;
  imageUrl?: string;
  mean?: number;
  mediaType?: string;
  rank?: number;
  genres?: Genre[];
  startDate?: string;
  /** The visitor's own list status for this title, when they're logged in and tracking it. */
  listStatus?: MyListEntryStatus;
}

export function toAnimeGridItem(node: AnimeNode, rank?: number): GridItem {
  return {
    id: node.id,
    href: `/anime/${node.id}`,
    title: node.title,
    imageUrl: node.main_picture?.large ?? node.main_picture?.medium,
    mean: node.mean,
    mediaType: node.media_type,
    rank,
    genres: node.genres,
    startDate: node.start_date,
    listStatus: node.my_list_status?.status,
  };
}

export function toMangaGridItem(node: MangaNode, rank?: number): GridItem {
  return {
    id: node.id,
    href: `/manga/${node.id}`,
    title: node.title,
    imageUrl: node.main_picture?.large ?? node.main_picture?.medium,
    mean: node.mean,
    mediaType: node.media_type,
    rank,
    genres: node.genres,
    startDate: node.start_date,
    listStatus: node.my_list_status?.status,
  };
}
