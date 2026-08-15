import type { AnimeNode, MangaNode } from "./types";

export interface GridItem {
  id: number;
  href: string;
  title: string;
  imageUrl?: string;
  mean?: number;
  mediaType?: string;
  rank?: number;
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
  };
}
