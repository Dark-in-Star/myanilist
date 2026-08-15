"use server";

import { revalidatePath } from "next/cache";
import { BASE_URL } from "./api";
import type { ListStatus, MangaListStatus } from "./types";

type QueryValue = string | number | boolean | undefined;

function buildForm(fields: Record<string, QueryValue>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    params.set(key, String(value));
  }
  return params.toString();
}

export interface UpdateAnimeStatusInput {
  animeId: number;
  status?: ListStatus;
  score?: number;
  num_watched_episodes?: number;
}

export async function updateAnimeStatusAction(input: UpdateAnimeStatusInput) {
  const { animeId, ...update } = input;
  const response = await fetch(`${BASE_URL}/anime/${animeId}/my_list_status`, {
    method: "PUT",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: buildForm(update),
  });

  if (!response.ok) {
    throw new Error(`Failed to update anime list status: ${response.status}`);
  }

  revalidatePath("/mylist/anime");
  revalidatePath(`/anime/${animeId}`);
}

export async function removeAnimeAction(animeId: number) {
  const response = await fetch(`${BASE_URL}/anime/${animeId}/my_list_status`, { method: "DELETE" });

  if (!response.ok && response.status !== 404) {
    throw new Error(`Failed to remove anime from list: ${response.status}`);
  }

  revalidatePath("/mylist/anime");
  revalidatePath(`/anime/${animeId}`);
}

export interface UpdateMangaStatusInput {
  mangaId: number;
  status?: MangaListStatus;
  score?: number;
  num_chapters_read?: number;
  num_volumes_read?: number;
}

export async function updateMangaStatusAction(input: UpdateMangaStatusInput) {
  const { mangaId, ...update } = input;
  const response = await fetch(`${BASE_URL}/manga/${mangaId}/my_list_status`, {
    method: "PUT",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: buildForm(update),
  });

  if (!response.ok) {
    throw new Error(`Failed to update manga list status: ${response.status}`);
  }

  revalidatePath("/mylist/manga");
  revalidatePath(`/manga/${mangaId}`);
}

export async function removeMangaAction(mangaId: number) {
  const response = await fetch(`${BASE_URL}/manga/${mangaId}/my_list_status`, { method: "DELETE" });

  if (!response.ok && response.status !== 404) {
    throw new Error(`Failed to remove manga from list: ${response.status}`);
  }

  revalidatePath("/mylist/manga");
  revalidatePath(`/manga/${mangaId}`);
}
