import type { Metadata } from "next";
import { AuthRequiredError, getAnimeList, getMangaList } from "@/lib/api";
import { AnimeListBrowser } from "@/components/AnimeListBrowser";
import { MangaListBrowser } from "@/components/MangaListBrowser";
import { LoginPrompt } from "@/components/LoginPrompt";
import { MediaTypeToggle } from "@/components/MediaTypeToggle";
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
        return <LoginPrompt description="Log in to see and manage your manga list." />;
      }
      throw error;
    }

    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <h1 className="text-xl font-bold sm:text-2xl">My Manga List</h1>
          <MediaTypeToggle active="manga" />
        </div>

        <MangaListBrowser entries={entries} initialStatus={(params.status ?? "all") as MangaListStatus | "all"} />
      </div>
    );
  }

  let entries;
  try {
    const result = await getAnimeList();
    entries = result.data;
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return <LoginPrompt description="Log in to see and manage your anime list." />;
    }
    throw error;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <h1 className="text-xl font-bold sm:text-2xl">My Anime List</h1>
        <MediaTypeToggle active="anime" />
      </div>

      <AnimeListBrowser entries={entries} initialStatus={(params.status ?? "all") as ListStatus | "all"} />
    </div>
  );
}
