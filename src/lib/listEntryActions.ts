"use server";

import { getAnime, getManga } from "./api";
import type { AnimeNode, MangaNode, MyListStatus, MyMangaListStatusNode } from "./types";

// A card only knows a title's *status*, not the score or progress behind it. The edit modal
// needs those real values, so it fetches them on open rather than the grid pre-loading a
// full detail payload for every card it renders.
const ANIME_ENTRY_FIELDS =
  "id,title,main_picture,media_type,status,num_episodes,alternative_titles,start_date,end_date,my_list_status";

const MANGA_ENTRY_FIELDS =
  "id,title,main_picture,media_type,status,num_volumes,num_chapters,alternative_titles,start_date,end_date,my_list_status";

export interface AnimeListEntry {
  node: AnimeNode;
  listStatus: MyListStatus;
}

export interface MangaListEntry {
  node: MangaNode;
  listStatus: MyMangaListStatusNode;
}

export async function getAnimeListEntryAction(id: number): Promise<AnimeListEntry> {
  const node = await getAnime(id, ANIME_ENTRY_FIELDS);
  return { node, listStatus: node.my_list_status ?? { score: 0 } };
}

export async function getMangaListEntryAction(id: number): Promise<MangaListEntry> {
  const node = await getManga(id, MANGA_ENTRY_FIELDS);
  return { node, listStatus: node.my_list_status ?? { score: 0 } };
}
