import type { Metadata } from "next";
import { Suspense } from "react";
import { getAnimeRanking, getMangaRanking } from "@/lib/api";
import { loadMoreAnimeRanking, loadMoreMangaRanking } from "@/lib/browseActions";
import { toAnimeGridItem, toMangaGridItem } from "@/lib/gridItems";
import { MediaLoadMoreGrid } from "@/components/MediaLoadMoreGrid";
import { RankingTabs } from "@/components/RankingTabs";
import { MediaTypeSelect } from "@/components/MediaTypeSelect";
import { GridSkeleton } from "@/components/GridSkeleton";
import { ANIME_RANKING_TABS, MANGA_RANKING_TABS } from "@/lib/format";
import type { AnimeRankingType, MangaRankingType } from "@/lib/types";

export const metadata: Metadata = { title: "Browse" };

const PAGE_SIZE = 24;

function isAnimeRankingType(value: string | undefined): value is AnimeRankingType {
  return ANIME_RANKING_TABS.some((tab) => tab.value === value);
}

function isMangaRankingType(value: string | undefined): value is MangaRankingType {
  return MANGA_RANKING_TABS.some((tab) => tab.value === value);
}

async function AnimeResults({ type }: { type: AnimeRankingType }) {
  const result = await getAnimeRanking(type, PAGE_SIZE);
  const items = result.data.map(({ node, ranking }) => toAnimeGridItem(node, ranking.rank));

  return (
    <MediaLoadMoreGrid
      initialItems={items}
      initialHasMore={Boolean(result.paging?.next)}
      loadMoreAction={loadMoreAnimeRanking.bind(null, type)}
      pageSize={PAGE_SIZE}
    />
  );
}

async function MangaResults({ type }: { type: MangaRankingType }) {
  const result = await getMangaRanking(type, PAGE_SIZE);
  const items = result.data.map(({ node, ranking }) => toMangaGridItem(node, ranking.rank));

  return (
    <MediaLoadMoreGrid
      initialItems={items}
      initialHasMore={Boolean(result.paging?.next)}
      loadMoreAction={loadMoreMangaRanking.bind(null, type)}
      pageSize={PAGE_SIZE}
    />
  );
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ media?: string; type?: string }>;
}) {
  const params = await searchParams;

  if (params.media === "manga") {
    const type: MangaRankingType = isMangaRankingType(params.type) ? params.type : "all";
    return (
      <div className="flex flex-col gap-5">
        <h1 className="text-xl font-bold sm:text-2xl">Manga Rankings</h1>
        <div className="flex flex-wrap items-center gap-2">
          <MediaTypeSelect active="manga" />
          <RankingTabs basePath="/browse" tabs={MANGA_RANKING_TABS} active={type} extraParams={{ media: "manga" }} />
        </div>
        <Suspense key={type} fallback={<GridSkeleton />}>
          <MangaResults type={type} />
        </Suspense>
      </div>
    );
  }

  const type: AnimeRankingType = isAnimeRankingType(params.type) ? params.type : "all";
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold sm:text-2xl">Anime Rankings</h1>
      <div className="flex flex-wrap items-center gap-2">
        <MediaTypeSelect active="anime" />
        <RankingTabs basePath="/browse" tabs={ANIME_RANKING_TABS} active={type} extraParams={{ media: "anime" }} />
      </div>
      <Suspense key={type} fallback={<GridSkeleton />}>
        <AnimeResults type={type} />
      </Suspense>
    </div>
  );
}
