import type { Metadata } from "next";
import { AuthRequiredError, getAnimeList, getMangaList } from "@/lib/api";
import { AnimeListBrowser } from "@/components/AnimeListBrowser";
import { MangaListBrowser } from "@/components/MangaListBrowser";
import { LoginPrompt } from "@/components/LoginPrompt";
import type { ListStatus, MangaListStatus } from "@/lib/types";

export const metadata: Metadata = { title: "My List" };

export default async function MyListPage({
  searchParams,
}: {
  searchParams: Promise<{ media?: string; status?: string }>;
}) {
  const params = await searchParams;
  const media: "anime" | "manga" = params.media === "manga" ? "manga" : "anime";

  if (media === "manga") {
    let entries;
    try {
      const result = await getMangaList();
      entries = result.data;
    } catch (error) {
      if (error instanceof AuthRequiredError) {
        return <LoginPrompt description="Log in to see and manage your manga list." returnTo="/mylist?media=manga" />;
      }
      throw error;
    }

    return <MangaListBrowser entries={entries} initialStatus={(params.status ?? "all") as MangaListStatus | "all"} />;
  }

  let entries;
  try {
    const result = await getAnimeList();
    entries = result.data;
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return <LoginPrompt description="Log in to see and manage your anime list." returnTo="/mylist" />;
    }
    throw error;
  }

  return <AnimeListBrowser entries={entries} initialStatus={(params.status ?? "all") as ListStatus | "all"} />;
}
